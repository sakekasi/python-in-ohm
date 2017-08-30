function flatten(arrs) {
  return [].concat.apply([], arrs);
}

function range(from, to) {
  const ans = [];
  for (let x = from; x <= to; x++) {
    ans.push(x);
  }
  return ans;
}

function last(arr) {
  return arr[arr.length - 1];
}