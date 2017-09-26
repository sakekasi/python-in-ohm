class TokenStream {
  constructor(input, lexer) {
    this.tokens = [];
    this.input = input;
    this.lexer = lexer;
    this.inputIdxToTokenIdx = Object.create(null);
    this.currentInputIdx = 0;
    this._output = null;
  }

  add(token) {
    const tokenIdx = this.tokens.length;
    token.tokenIdx = tokenIdx;
    this.tokens.push(token);
    range(this.currentInputIdx, token.startIdx - 1).forEach(idx => 
      this.inputIdxToTokenIdx[idx] = {type: 'before', idx: tokenIdx});
    range(token.startIdx, token.endIdx - 1).forEach(idx => 
      this.inputIdxToTokenIdx[idx] = {type: 'inside', idx: tokenIdx, offset: idx - token.startIdx});
    this.currentInputIdx = token.endIdx;
  }

  tokenIdx(inputIdx) {
    console.assert(inputIdx in this.inputIdxToTokenIdx);
    return this.inputIdxToTokenIdx[inputIdx];
  }

  get output() {
    if (this._output !== null) {
      return this._output;
    }

    let code = '';
    const map = new SourceMap(this.input);
    let newIdx = 0;

    this.tokens.forEach(token => {
      let tokenString = token.toString();
      if (!(token instanceof NewLine)) {
        tokenString += ' ';
      }

      let newStartIdx = newIdx;
      newIdx += token instanceof NewLine ? tokenString.length : tokenString.length - 1;
      let newEndIdx = newIdx;
      if (!(token instanceof NewLine)) {
        newIdx++;
      }

      code += tokenString;
      if (token.startIdx === token.endIdx) {
        map.mapSingle(token.startIdx, newStartIdx, newEndIdx);
      } else {
        map.map(token.startIdx, token.endIdx, newStartIdx, newEndIdx);
      }
      token.newStartIdx = newStartIdx;
      token.newEndIdx = newEndIdx;

      if (!(token instanceof NewLine)) {
        newStartIdx = newEndIdx;
        newEndIdx = newEndIdx + 1;
        map.mapSingle(token.endIdx, newStartIdx, newEndIdx);
      }
    });

    // map the position just after the end of the preprocessed text to 
    // the position just after the end of the original text
    map.mapSingle(this.input.length, 
      code.length, code.length + 1);

    map.new = code;

    this._output = {code, map};
    return this._output;
  }

  get(tokenIdx) {
    if (idx in tokenIdx) {
      return this.tokens[tokenIdx.idx];
    }
    return this.tokens[tokenIdx];
  }

  slice(fromIdx, toIdx) {
    return this.tokens.slice(fromIdx, toIdx);
  }

  clone() {
    const ans = new TokenStream(this.input);
    ans.tokens = this.tokens.slice();
    ans.inputIdxToTokenIdx = this.inputIdxToTokenIdx;
    ans.currentInputIdx = this.currentInputIdx;
    ans._output = this._output;
    return ans;
  }

  splice(from, to, start, end, other) {
    let f = from.idx;
    let ct = to.idx - from.idx;

    // splice to combined with end
    if (to.type === 'inside') {
      ct++;
    }

    // tokens with index [s,e) can be inserted unmodified
    const s = from.type === 'inside' && start.type === 'inside' ? start.idx + 1 : start.idx;
    const e = end.idx;
    const insert = other.slice(s, e);

    if (from.type === 'inside' && start.type === 'inside') {
      const combinedTokens = [];
      const fromToken = this.get(from);
      const startToken = other.get(start);
      const combinedString = this.input.slice(fromToken.startIdx, fromToken.startIdx + from.offset) +
        other.input.slice(startToken.startIdx + start.offset, startToken.endIdx);
      // insert.unshift(combine left of from, right of start); // TODO
    }

    if (to.type === 'inside' && end.type === 'inside') {
      // insert.push(combine left of end and right of to); // TODO
    }

    this.tokens.splice(f, ct, ...insert);
  }

  diff(other) {
    this.output;
    other.output;
    const diffOps = diff(this.tokens, other.tokens, (i, j) => i.equals(j));
    // cluster into add + delete
    const diffObjs = [];
    let currentDiffObj = null;
    let currentAdds = [];
    let lastEndIdx = 0;
    let lastUnchangedToken = null;
    diffOps.forEach(op => {
      if (op.operation === 'none') {
        if (currentDiffObj !== null) {
          currentDiffObj.to = op.atom.newStartIdx;

          // get string value from other
          let startToken = currentAdds.reduce((agg, b) => agg && agg.tokenIdx < b.tokenIdx ? agg : b, null);
          let endToken = currentAdds.reduce((agg, b) => agg && agg.tokenIdx > b.tokenIdx ? agg : b, null);
          if (startToken === null) {
            currentDiffObj.text = '';
            if (!(endToken instanceof NewLine) || !(lastUnchangedToken instanceof NewLine)) {
              currentDiffObj.text += ' ';
            }
          } else {
            currentDiffObj.text = other.output.code.slice(
              startToken.newStartIdx,
              endToken.newEndIdx
            );
            if (!(endToken instanceof NewLine)) {
              currentDiffObj.text += ' ';
            }
            if (!(lastUnchangedToken instanceof NewLine)) {
              currentDiffObj.text = ' ' + currentDiffObj.text;
            }
          }
          // TODO: insert appropriate spaces
          if (currentDiffObj.from > currentDiffObj.to) debugger;
          diffObjs.push(currentDiffObj);

          currentDiffObj = null;
          currentAdds = [];
        }
        lastUnchangedToken = op.atom;
      } else {
        if (currentDiffObj === null) {
          currentDiffObj = Object.create(null);
          currentDiffObj.from = lastUnchangedToken !== null ? lastUnchangedToken.newEndIdx : 0 ;
        }

        if (op.operation === 'add') {
          currentAdds.push(op.atom);
        }
      }
    });
    
    if (currentDiffObj !== null) {
      currentDiffObj.to = this._output.code.length;
      // get string value from other
      let startToken = currentAdds.reduce((agg, b) => agg && agg.tokenIdx < b.tokenIdx ? agg : b, null);
      let endToken = currentAdds.reduce((agg, b) => agg && agg.tokenIdx > b.tokenIdx ? agg : b, null);
      if (startToken === null) {
        currentDiffObj.text = '';
        if (!(lastUnchangedToken instanceof NewLine)) {
          currentDiffObj.text += ' ';
        }
      } else {
        currentDiffObj.text = other.output.code.slice(
          other.output.map.newIdx(startToken.startIdx),
          other.output.map.newIdx(endToken.endIdx)
        );
        if (!(lastUnchangedToken instanceof NewLine)) {
          currentDiffObj.text = ' ' + currentDiffObj.text;
        }
      }
      if (currentDiffObj.from > currentDiffObj.to) debugger;
      diffObjs.push(currentDiffObj);
    }

    return diffObjs;
  }
}