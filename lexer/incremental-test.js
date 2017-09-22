const tests = [
  {
    a: `a = 5`,
    b: `a = 5 +`,
    d: {
      from: 5,
      to: 5,
      text: ' +'
    }
  },
  {
    a: `a + 5`,
    b: `a = 5`,
    d: {
      from: 2,
      to: 3,
      text: '='
    }
  },
  {
    a: `
for i in range(5):
  print(i)`,
    b: `
for  range(5):
  print(i)`,
    d: {
      from: 5,
      to: 9,
      text: ''
    }
  },
  {
    a: `
for i in  range(5):
  print(i)`,
    b: `
for iange(5):
  print(i)`,
    d: {
      from: 6,
      to: 12,
      text: ''
    }
  },
  {
    a: `
for i in range(5):
  print(i)`,
    b: `
for print(i)`,
    d: {
      from: 5,
      to: 22,
      text: ''
    }
  },
];

const preprocessor = new Preprocessor();
console.clear();
tests.forEach(({a, b, d}, idx) => {
  console.log('test', idx + 1);
  let ta = preprocessor.lex(a);
  let tb = preprocessor.lex(b);

  let diffs = ta.diff(tb)
  console.log(diffs);

  // a + diff = b
  console.log('a + diff = b');
  let test = applyDiffs(a, [d]);
  console.log(JSON.stringify(b));
  console.assert(test === b);


  // pa + pDiff = pb
  console.log('pa + pDiff = pb');
  test = applyDiffs(ta.output.code, diffs);
  console.log(JSON.stringify(tb.output.code));
  console.assert(test === tb.output.code);

  // console.assert(
  //   (a.slice(0, diff.from) + diff.text + a.slice(diff.to)) === b
  // );
  // // pa + pDiff = pb
  // console.assert(ta.clone().splice(tFrom, tTo, tStart, tEnd, tb).output.code === tb.output.code);

  // const ans = (pa.slice(0, pDiff.from) + pDiff.text + pa.slice(pDiff.to)).replace('  ', ' ');
  // console.log('pa + pDiff = pb');
  // console.log(pa.slice(0, pDiff.from))
  // console.log(pDiff.text)
  // console.log(pa.slice(pDiff.to))
  // console.log(ans);
  // console.log(pb);
  // console.log('\n');

  // console.assert(
  //   ans === pb
  // );
});

function applyDiffs(a, diffs) {
  console.log(JSON.stringify(a));
  let test = '';
  let from = 0;
  diffs.forEach(diff => {
    test += a.slice(from, diff.from);
    test += diff.text;
    from = diff.to;
  });
  test += a.slice(from);
  console.log(JSON.stringify(test));
  console.log('\n');

  return test;
} 