class SourceMap {
  constructor() {
    this.newToOrig = {};
  }

  map(origStart, origEnd, newStart, newEnd) {
    console.assert((origEnd - origStart) === (newEnd - newStart));
    let currentNewIdx = newStart;
    range(origStart, origEnd - 1).forEach(currentOrigIdx => {
      this.newToOrig[currentNewIdx] = currentOrigIdx;
      currentNewIdx++;
    });
  }

  mapSingle(origIdx, newStart, newEnd) {
    range(newStart, newEnd - 1).forEach(currentNewIdx => {
      this.newToOrig[currentNewIdx] = origIdx;
    });
  }

  originalIdx(newIdx) {
    console.assert(newIdx in this.newToOrig);
    return this.newToOrig[newIdx];
  }
}