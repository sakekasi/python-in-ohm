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

  lex(code) {
    const ans = new TokenStream(code, this.lexer);
    this.state.reset();
    this.lexer.setInput(code);
    let token;
    while (token = this.lexer.lex()) {
      this.state.lastToken = token;
      ans.add(token);
    }

    return ans;
  }
}

class PreprocessorState {
  constructor() {
    this.reset('');
  }

  reset() {
    this.parenStack = [];
    this.indentationStack = [''];
    this.origIdx = 0;
  }

  getRange(str) {
    const startIdx = this.origIdx;
    this.origIdx += str.length;
    const endIdx = this.origIdx;
    return [startIdx, endIdx];
  }
}