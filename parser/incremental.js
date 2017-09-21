class IncrementalInstrumenter {
  constructor() {
    this.code = '';
    this.preprocessedCode = '';
    this.preprocessedMap = new SourceMap('');
    this.preprocessedMap.origToNew[0] = 0;
    this.preprocessedMap.newToOrig[0] = 0;
    this.matcher = pythonGrammar.matcher();
    this.preprocessor = new Preprocessor();
  }

  replaceInputRange(fromIdx, toIdx, insertedText) {
    const preprocessedFromIdx = this.preprocessedMap.newIdx(fromIdx);
    const preprocessedToIdx = this.preprocessedMap.newIdx(toIdx);

    this.code = this.code.slice(0, fromIdx) + insertedText + this.code.slice(toIdx);
    ({code: this.preprocessedCode, map: this.preprocessedMap} = this.preprocessor.preprocess(this.code));

    const preprocessedInsertedText = this.preprocessedCode.slice(
      this.preprocessedMap.newIdx(fromIdx), 
      this.preprocessedMap.newIdx(fromIdx + insertedText.length)
    );

    if (preprocessedInsertedText.length === 0 && preprocessedFromIdx === preprocessedToIdx) {
      return;
    }

    this.matcher.replaceInputRange(preprocessedFromIdx, preprocessedToIdx, preprocessedInsertedText);
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