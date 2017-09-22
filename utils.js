function flatten(arrs) {
  return [].concat.apply([], arrs);
}

function range(from, to, step = 1) {
  const ans = [];
  for (let x = from; x <= to; x+=step) {
    ans.push(x);
  }
  return ans;
}

function last(arr) {
  return arr[arr.length - 1];
}

function repeat(str, n) {
  let ans = '';
  range(1, n).forEach(() => ans += str);
  return ans;
}

function spaces(n) {
  return repeat(' ', n);
}