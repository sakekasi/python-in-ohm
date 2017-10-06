semantics.addOperation('id(idContext)', {
  _nonterminal(children) {
    return this.args.idContext.id(this._node);
  },

  _terminal() {
    const sourceMap = this.args.sourceMap;
    return this.args.idContext.id(this._node);
  },
});