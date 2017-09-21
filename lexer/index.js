class Preprocessor {
  constructor() {
    this.lexer = new Lexer();
    this.state = new PreprocessorState();

    this.lexer.addRule(NewLine.regex, _.partial(NewLine.create, this.state));
    this.lexer.addRule(BlankLine.regex, _.partial(BlankLine.create, this.state));
    this.lexer.addRule(WhiteSpace.regex, _.partial(WhiteSpace.create, this.state));
    this.lexer.addRule(Comment.regex, _.partial(Comment.create, this.state));
    this.lexer.addRule(ExplicitLineJoin.regex, _.partial(ExplicitLineJoin.create, this.state));
    this.lexer.addRule(EOF.regex, _.partial(EOF.create, this.state));
    this.lexer.addRule(IdentifierT.regex, _.partial(IdentifierT.create, this.state));
    // TODO: update identifier to handle unicode
    this.lexer.addRule(KeywordT.regex, _.partial(KeywordT.create, this.state));
    this.lexer.addRule(StringLiteral.regex, _.partial(StringLiteral.create, this.state));
    this.lexer.addRule(BytesLiteral.regex, _.partial(BytesLiteral.create, this.state));
    this.lexer.addRule(IntegerLiteral.regex, _.partial(IntegerLiteral.create, this.state));
    this.lexer.addRule(FloatingPointLiteral.regex, _.partial(FloatingPointLiteral.create, this.state));
    // TODO: update string literals to account for escape chars
    this.lexer.addRule(Operator.regex, _.partial(Operator.create, this.state));
    this.lexer.addRule(Delimiter.regex, _.partial(Delimiter.create, this.state));
  }

  preprocess(code) {
    console.debug(code);

    this.state.reset(code);
    this.lexer.setInput(code);
    const tokens = [];
    let token;
    while (token = this.lexer.lex()) {
      tokens.push(token);
      let tokenString = token.toString();
      if (!(token instanceof NewLine)) {
        tokenString += ' '
      }

      let newStartIdx = this.state.newIdx;
      this.state.newIdx += token instanceof NewLine ? tokenString.length : tokenString.length - 1;
      let newEndIdx = this.state.newIdx;
      if (!(token instanceof NewLine)) {
        this.state.newIdx++;
      }
      
      this.state.preprocessedCode += tokenString;
      if (token.startIdx === token.endIdx) {
        this.state.sourceMap.mapSingle(token.startIdx, newStartIdx, newEndIdx);
      } else {
        this.state.sourceMap.map(token.startIdx, token.endIdx, newStartIdx, newEndIdx);
      }

      if (!(token instanceof NewLine)) {
        newStartIdx = newEndIdx;
        newEndIdx = newEndIdx + 1;
        this.state.sourceMap.mapSingle(token.endIdx, newStartIdx, newEndIdx);
      }
    }
    // map the position just after the end of the preprocessed text to 
    // the position just after the end of the original text
    this.state.sourceMap.mapSingle(code.length, 
        this.state.preprocessedCode.length, this.state.preprocessedCode.length + 1);
    
    this.state.sourceMap.new = this.state.preprocessedCode;
        
    return {
      code: this.state.preprocessedCode,
      map: this.state.sourceMap
    };
  }
}

class PreprocessorState {
  constructor() {
    this.reset('');
  }

  reset(code) {
    this.parenStack = [];
    this.indentationStack = [''];
    this.origIdx = 0;
    this.newIdx = 0;
    this.sourceMap = new SourceMap(code);
    this.preprocessedCode = '';
  }

  getRange(str) {
    const startIdx = this.origIdx;
    this.origIdx += str.length;
    const endIdx = this.origIdx;
    return [startIdx, endIdx];
  }
}