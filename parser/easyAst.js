function program(body, sourceLoc = null, id = null) {
  console.assert(body instanceof Array);

  return new Program(sourceLoc, id, body);
}

function def(name, args, body, decoratorList = [], returns = null, sourceLoc = null, id = null) {
  console.assert(typeof name === 'string');
  console.assert(args instanceof Arguments || args === null);
  console.assert(body instanceof Array);
  console.assert(decoratorList instanceof Array);
  // console.assert(returns instanceof Array);

  return new FunctionDef(sourceLoc, id, name, args, body, decoratorList, returns);
}

function ret(value, sourceLoc = null, id = null) {
  return new Return(sourceLoc, id, value);
}

function assign(targets, value, sourceLoc = null, id = null) {
  if (!(targets instanceof Array)) {
    targets = [targets];
  }
  console.assert(targets instanceof Array);
  console.assert(value instanceof Expr);

  return new Assign(sourceLoc, null,
    targets instanceof Array ? targets : [targets], value);
}

function for_(target, iter, body, orelse = null, sourceLoc = null, id = null) {
  console.assert(target instanceof Expr || target instanceof Identifier);
  console.assert(iter instanceof Expr || target instanceof Identifier);
  console.assert(body instanceof Array);
  console.assert(orelse === null || orelse instanceof Array);

  return new For(sourceLoc, id, target, iter, body, orelse);
}

function while_(test, body, orelse = null, sourceLoc = null, id = null) {
  console.assert(test instanceof Expr);
  console.assert(body instanceof Array);
  console.assert(orelse === null || orelse instanceof Array);

  return new While(sourceLoc, id, test, body, orelse);
}

function exprS(expr, sourceLoc = null, id = null) {
  console.assert(expr instanceof Expr);

  return new ExprStmt(sourceLoc, id, expr);
}

// exprs

function dict(...kvPairs) {
  let sourceLoc;
  if (kvPairs.length % 2 === 1) {
    sourceLoc = last(kvPairs);
    kvPairs = kvPairs.slice(0, -1);
  } else {
    sourceLoc = null;
  }

  keys = [];
  values = [];
  kvPairs.forEach((key, idx) => {
    if (idx % 2 == 0) {
      let value = kvPairs[idx + 1];
      keys.push(key);
      values.push(value);
    }
  });
  return new Dict(sourceLoc, id, keys, values);
}

function list(exprs, sourceLoc = null, id = null) {
  return new List(sourceLoc, id, exprs);
}

function tuple(elts, sourceLoc = null, id = null) {
  console.assert(elts instanceof Array);

  return new Tuple(sourceLoc, id, elts);
}

function call(func, args, keywords = [], sourceLoc = null, id = null) {
  console.assert(func instanceof Expr || func instanceof Identifier);
  console.assert(keywords instanceof Array);

  return new Call(sourceLoc, id, func, args, keywords);
}

function slice(lower, upper = null, step = null, sourceLoc = null, id = null) {
  return new Slice(sourceLoc, id, lower, upper, step);
}

function index(value, sourceLoc = null, id = null) {
  return new Index(sourceLoc, id, value);
}

function n(value, sourceLoc = null, id = null) {
  console.assert(typeof value === 'number' || typeof value === 'string');

  return new Num(sourceLoc, id, typeof value === 'string' ? value : '' + value.toString() ); // TODO: actual stringify
}

function str(value, sourceLoc = null, id = null) {
  console.assert(typeof value === 'string');

  return new Str(sourceLoc, id, '', '"' + value + '"');
}


function dot(value, attr, sourceLoc = null, id = null) {
  console.assert(value instanceof Expr || value instanceof Identifier);
  console.assert(typeof attr === 'string');

  return new Attribute(sourceLoc, id, value, attr);
}

function sub(value, slice, sourceLoc = null, id = null) {
  console.assert(value instanceof Expr || value instanceof Identifier);
  console.assert(slice instanceof Slice || slice instanceof ExtSlice || slice instanceof Index);

  return new Subscript(sourceLoc, id, value, slice);
}

function none(sourceLoc = null) {
  return new NameConstant(sourceLoc, id, 'None');
}

function star(value, sourceLoc = null, id = null) {
  return new Starred(sourceLoc, id, value);
}

function doubleStar(value, sourceLoc = null, id = null) {
  return new Keyword(sourceLoc, id, null, value);
}

function id(value, sourceLoc = null, id = null) {
  console.assert(typeof value === 'string');

  return new Name(sourceLoc, id, value);
}


function args(positional, vararg = null, kwonly = [], kw = null, defaults = null, kwdefaults = null, sourceLoc = null, id = null) {
  if (defaults === null) {
    defaults = range(positional.length)
      .map(_ => null);
  }
  if (kwdefaults === null) {
    kwdefaults = range(kwonly.length)
      .map(_ => null);
  }
  return new Arguments(sourceLoc, id, positional, vararg, kwonly, kw, defaults, kwdefaults);
}

function clsDef(name, bases, keywords, body, decoratorList = [], sourceLoc = null, id = null) {
  return new ClassDef(sourceLoc, id, name, bases, keywords, body, decoratorList);
}

function plus(a, b, sourceLoc = null, id = null) {
  return new BinOp(sourceLoc, id, a, '+', b);
}