class IncrementalInstrumenter {
  constructor() {
    this.code = null;
    this.tokenStream = null;
    this.matcher = pythonGrammar.matcher();
    this.preprocessor = new Preprocessor();
    this.cstNodeIds = new WeakMap();
    this.nextCstNodeId = 0;
  }

  replaceInputRange(fromIdx, toIdx, insertedText) {
    let newCode, newTokenStream;
    if (this.code === null) {
      newCode = insertedText;
      this.code = newCode;
      SourceLoc.setupCodeMap(this.code);
      newTokenStream = this.preprocessor.lex(newCode);
      const diffs = [{from: fromIdx, to: toIdx, text: newTokenStream.output.code}];
      diffs.forEach(({from, to, text}) => {
        this.matcher.replaceInputRange(from, to, text);
      });
    } else {
      newCode = this.code.slice(0, fromIdx) + insertedText + this.code.slice(toIdx);
      this.code = newCode;
      SourceLoc.setupCodeMap(this.code);
      newTokenStream = this.preprocessor.lex(newCode);
      const diffs = this.tokenStream.diff(newTokenStream);
      diffs.forEach(({from, to, text}, idx) => {
        this.matcher.replaceInputRange(from, to, text);
        const oldLength = to - from;
        const newLength = text.length;
        diffs.forEach((diff, j) => {
          if (j > idx) {
            diff.from += newLength - oldLength;
            diff.to += newLength - oldLength;
          }
        });
      });
    }
    console.assert(this.matcher.input === newTokenStream.output.code);
    // this.code = newCode;
    this.tokenStream = newTokenStream;
  }

  instrument() {
    const result = this.matcher.match();
    if (result.succeeded()) {
      const ast = semantics(result).toAST(this.tokenStream.output.map, this);
      const instrumented = ast.instrumented(new InstrumenterState());
      return instrumented.toString();
    } else {
      throw new ParseError(
        this.tokenStream.output.map.originalIdx(result.getRightmostFailurePosition()),
        result.getExpectedText()
      );
    }
  }

  id(cstNode) {
    if (this.cstNodeIds.has(cstNode)) {
      console.log('existing cst node');
      return this.cstNodeIds.get(cstNode);
    } else {
      console.log('new cst node', cstNode);
      const id = this.nextCstNodeId++;
      this.cstNodeIds.set(cstNode, id);
      return id;
    }
  }
}