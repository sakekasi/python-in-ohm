class IncrementalInstrumenter {
  constructor() {
    this.code = null;
    this.tokenStream = null;
    this.matcher = pythonGrammar.matcher();
    this.preprocessor = new Preprocessor();
  }

  replaceInputRange(fromIdx, toIdx, insertedText) {
    let newCode, newTokenStream;
    if (this.code === null) {
      newCode = insertedText;
      newTokenStream = this.preprocessor.lex(this.code);
      const diffs = [{from: fromIdx, to: toIdx, text: this.tokenStream.output.code}];
      diffs.forEach(({from, to, text}) => {
        this.matcher.replaceInputRange(from, to, text);
      });
    } else {
      newCode = this.code.slice(0, fromIdx) + insertedText + this.code.slice(toIdx);
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
    this.code = newCode;
    this.tokenStream = newTokenStream;
  }

  instrument() {
    const result = this.matcher.match();
    if (result.succeeded()) {
      try {
        const ast = semantics(result).toAST(this.tokenStream.output.map);
        const instrumented = ast.instrumented(new InstrumenterState());
        return instrumented.toString();
      } catch (parseError) {
        // TODO: handle parse error with linenos
        console.error(parseError);
        throw new Error('TODO: handle parse error');
      }
    } else {
      // TODO: handle parse error with linenos
      console.log(result.message);
      throw new Error('TODO: handle parse error');
    }
  }
}