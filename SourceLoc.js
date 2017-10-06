class SourceLoc {
  constructor(startIdx, endIdx) {
    this.startIdx = startIdx;
    this.endIdx = endIdx;
  }

  get startLineNumber() {
    return SourceLoc.codeMap[this.startIdx];
  }

  get endLineNumber() {
    return SourceLoc.codeMap[this.endIdx - 1];
  }

  get startPos() { return this.startIdx; }
  get endPos() { return this.endIdx; }

  get contents() {
    return SourceLoc.code.slice(this.startIdx, this.endIdx);
  }

  equals(sourceLoc) {
    return this.startIdx === sourceLoc.startIdx && this.endIdx === sourceLoc.endIdx;
  }

  contains(sourceLoc) {
    return this.startIdx <= sourceLoc.startIdx && sourceLoc.endIdx <= this.endIdx;
  }

  strictlyContains(sourceLoc) {
    return this.contains(sourceLoc) && !this.equals(sourceLoc);
  }

  containsIdx(pos) {
    return this.startIdx <= pos && pos < this.endIdx;
  }

  join(other) {
    const startIdx = this.startIdx < other.startIdx ? this.startIdx : other.startIdx;
    const endIdx = this.endIdx > other.endIdx ? this.endIdx : other.endIdx;
    return new SourceLoc(startIdx, endIdx);
  }

  toAST() {
    return dict(
      str('startIdx'), this.startIdx,
      str('endIdx'), this.endIdx
    );
  }

  trimmed() {
    const trimmedContents = trimRight(this.contents);
    return new SourceLoc(this.startIdx, this.endIdx - (this.contents.length - trimmedContents.length));
  }

  static setupCodeMap(code) {
    SourceLoc.code = code;
    SourceLoc.codeMap = {};
    let lineNumber = 1;
    range(0, code.length-1).forEach(i => {
      const char = code.charAt(i);
      if (char === '\n') {
        lineNumber++;
      }
      SourceLoc.codeMap[i] = lineNumber;
    });
  }
}
