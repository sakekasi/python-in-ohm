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

  diff(other) {
    this.output;
    other.output;
    const diffOps = diff(this.tokens, other.tokens, (i, j) => i.equals(j));
    diffOps.forEach(item => {
      if (this.tokens.includes(item.atom)) {
        item.from = 'this';
        item.this = item.atom;
        item.other = other.tokens.find(t => item.atom.equals(t));
      } else {
        item.from = 'other';
        item.this = this.tokens.find(t => item.atom.equals(t));
        item.other = item.atom;
      }
    });
    // cluster into add + delete
    const diffObjs = [];
    let currentDiffObj = null;
    let currentAdds = [];
    let lastEndIdx = 0;
    let lastUnchangedToken = null;
    diffOps.forEach(op => {
      switch (op.operation) {
      case 'add':
        currentAdds.push(op.atom);
      case 'delete':
        if (currentDiffObj === null) {
          currentDiffObj = Object.create(null);
          currentDiffObj.from = lastUnchangedToken !== null ? lastUnchangedToken.newEndIdx : 0;
        }
        break;
      case 'none':
        if (currentDiffObj !== null) {
          // a none after a diff means we close the current diff obj
          currentDiffObj.to = op.this.newStartIdx;

          // get string value from other
          let startToken = currentAdds.reduce((agg, b) => agg && agg.tokenIdx < b.tokenIdx ? agg : b, null);
          let endToken = currentAdds.reduce((agg, b) => agg && agg.tokenIdx > b.tokenIdx ? agg : b, null);
          if (startToken === null) {
            currentDiffObj.text = '';
            if (endToken && !(endToken instanceof NewLine) || 
              lastUnchangedToken && !(lastUnchangedToken instanceof NewLine)) {
              currentDiffObj.text += ' ';
            }
          } else {
            currentDiffObj.text = other.output.code.slice(
              startToken.newStartIdx,
              endToken.newEndIdx
            );
            if (endToken && !(endToken instanceof NewLine)) {
              currentDiffObj.text += ' ';
            }
            if (lastUnchangedToken && !(lastUnchangedToken instanceof NewLine)) {
              currentDiffObj.text = ' ' + currentDiffObj.text;
            }
          }
          // TODO: insert appropriate spaces
          if (currentDiffObj.from > currentDiffObj.to) debugger;
          diffObjs.push(currentDiffObj);

          currentDiffObj = null;
          currentAdds = [];
        }
        lastUnchangedToken = op.this;
        break;
      }
    });
    
    if (currentDiffObj !== null) {
      currentDiffObj.to = this._output.code.length;
      // get string value from other
      let startToken = currentAdds.reduce((agg, b) => agg && agg.tokenIdx < b.tokenIdx ? agg : b, null);
      let endToken = currentAdds.reduce((agg, b) => agg && agg.tokenIdx > b.tokenIdx ? agg : b, null);
      if (startToken === null) {
        currentDiffObj.text = '';
        if (endToken && !(endToken instanceof NewLine) || 
          lastUnchangedToken && !(lastUnchangedToken instanceof NewLine)) {
          currentDiffObj.text += ' ';
        }
      } else {
        currentDiffObj.text = other.output.code.slice(
          startToken.newStartIdx,
          endToken.newEndIdx
        );
        if (endToken && !(endToken instanceof NewLine)) {
          currentDiffObj.text += ' ';
        }
        if (lastUnchangedToken && !(lastUnchangedToken instanceof NewLine)) {
          currentDiffObj.text = ' ' + currentDiffObj.text;
        }
      }
      if (currentDiffObj.from > currentDiffObj.to) debugger;
      diffObjs.push(currentDiffObj);
    }

    return diffObjs;
  }
}