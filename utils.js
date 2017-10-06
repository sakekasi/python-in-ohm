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

function trimRight(str) {
	var tail = str.length;

	while (/[\s\uFEFF\u00A0]/.test(str[tail - 1])) {
		tail--;
	}

	return str.slice(0, tail);
}

class ParseError extends Error {
  constructor(idx, expected, ...params) {
    super(...params);

    Error.captureStackTrace(this, ParseError);

    this.idx = idx;
    this.expected = expected;
  }

  get message() {
    return `^\nExpected: ${this.expected}`;
  }
}

class IndentationError extends Error {
  constructor(idx, ...params) {
    super(...params);

    Error.captureStackTrace(this, IndentationError);

    this.idx = idx;
    this.message = '^\nindentation error'
  }
}

class ParensError extends Error {
  constructor(idx, ...params) {
    super(...params);

    Error.captureStackTrace(this, ParensError);

    this.idx = idx;
  }
}