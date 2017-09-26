class IncrementalInstrumenter {
  constructor() {
    this.code = null;
    this.tokenStream = null;
    this.matcher = pythonGrammar.matcher();
    this.preprocessor = new Preprocessor();
  }

  replaceInputRange(fromIdx, toIdx, insertedText) {
    if (this.code === null) {
      this.code = insertedText;
      this.tokenStream = this.preprocessor.lex(this.code);
      const diffs = [{from: fromIdx, to: toIdx, text: insertedText}];
      diffs.forEach(({from, to, text}) => {
        this.matcher.replaceInputRange(from, to, text);
      });
    } else {
      const newCode = this.code.slice(0, fromIdx) + insertedText + this.code.slice(toIdx);
      const newTokenStream = this.preprocessor.lex(newCode);
      const diffs = this.tokenStream.diff(newTokenStream);
      diffs.forEach(({from, to, text}) => {
        this.matcher.replaceInputRange(from, to, text);
      });
      this.code = newCode;
      this.tokenStream = newTokenStream;
    }
  }

  instrument() {
    const result = this.matcher.match();
    if (result.succeeded()) {
      try {
        const ast = semantics(result).toAST(this.preprocessedMap);
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