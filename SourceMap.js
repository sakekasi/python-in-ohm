class SourceMap {
  constructor(old) {
    this.old = old;
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
      if (currentNewIdx === newStart && !(origIdx in this.origToNew)) {
        this.origToNew[origIdx] = currentNewIdx;
      }
      this.newToOrig[currentNewIdx] = origIdx;
    });
  }

  originalIdx(newIdx) {
    if (newIdx >= this.new.length) {
      return this.newToOrig[this.new.length];
    }
    console.assert(newIdx in this.newToOrig);
    return this.newToOrig[newIdx];
  }

  newIdx(originalIdx) {
    while (!(originalIdx in this.origToNew) && originalIdx < this.old.length) {
      originalIdx++;
    }
    if (originalIdx >= this.old.length) {
      return this.origToNew[this.old.length];
    }
    return this.origToNew[originalIdx];
  }
}