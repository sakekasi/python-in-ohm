class SourceLoc {
  constructor(startIdx, endIdx) {
    this.startIdx = startIdx;
    this.endIdx = endIdx;
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
}