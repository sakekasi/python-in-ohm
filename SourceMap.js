class SourceMap {
  constructor() {
    this.newToOrig = {};
    this.origToNew = {};
  }

  map(origStart, origEnd, newStart, newEnd) {
    console.assert((origEnd - origStart) === (newEnd - newStart));
    let currentNewIdx = newStart;
    range(origStart, origEnd - 1).forEach(currentOrigIdx => {
      this.newToOrig[currentNewIdx] = currentOrigIdx;
      this.origToNew[currentOrigIdx] = currentNewIdx;
      currentNewIdx++;
    });
  }

  mapSingle(origIdx, newStart, newEnd) {
    range(newStart, newEnd - 1).forEach(currentNewIdx => {
      if (currentNewIdx === newStart) {
        this.origToNew[origIdx] = currentNewIdx;
      }
      this.newToOrig[currentNewIdx] = origIdx;
    });
  }

  originalIdx(newIdx) {
    console.assert(newIdx in this.newToOrig);
    return this.newToOrig[newIdx];
  }

  newIdx(originalIdx) {
    console.assert(newIdx in this.origToNew);
    return this.origToNew[originalIdx];
  }
}