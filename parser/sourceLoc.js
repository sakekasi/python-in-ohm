semantics.addOperation('sourceLoc(sourceMap)', {
  _nonterminal(children) {
    const sourceMap = this.args.sourceMap;
    return createSourceLoc(this.source.startIdx, this.source.endIdx, sourceMap);
  },

  _terminal() {
    const sourceMap = this.args.sourceMap;
    return createSourceLoc(this.source.startIdx, this.source.endIdx, sourceMap);
  },

  ListOf(x) {
    const sourceMap = this.args.sourceMap;
    return x.sourceLoc(sourceMap);
  },

  NonemptyListOf(_, __, ___) {
    const sourceMap = this.args.sourceMap;
    return this.asIteration().sourceLoc(sourceMap);
  },

  EmptyListOf() {
    return [];
  }
});

function createSourceLoc(startIdx, endIdx, sourceMap) {
  return new SourceLoc(sourceMap.originalIdx(startIdx), sourceMap.originalIdx(endIdx));
}