function prog(body, sourceLoc = null) {
  console.assert(body instanceof Array);

  return new Program(sourceLoc, body);
}

function def(name, args, body, decoratorList = [], returns = null, sourceLoc = null) {
  console.assert(typeof name === 'string');
  console.assert(args instanceof Arguments || args === null);
  console.assert(body instanceof Array);
  console.assert(decoratorList instanceof Array);
  // console.assert(returns instanceof Array);

  return new FunctionDef(sourceLoc, name, args, body, decoratorList, returns);
}

function ret(value, sourceLoc = null) {
  return new Return(sourceLoc, value);
}

function assign(targets, value, sourceLoc = null) {
  if (!(targets instanceof Array)) {
    targets = [targets];
  }
  console.assert(targets instanceof Array);
  console.assert(value instanceof Expr || value instanceof Identifier);

  return new Assign(sourceLoc,
    targets instanceof Array ? targets : [targets], value);
}

function for_(target, iter, body, orelse = null, sourceLoc = null) {
  console.assert(target instanceof Expr || target instanceof Identifier);
  console.assert(iter instanceof Expr || target instanceof Identifier);
  console.assert(body instanceof Array);
  console.assert(orelse === null || orelse instanceof Array);

  return new For(sourceLoc, target, iter, body, orelse);
}

function exprS(expr, sourceLoc = null) {
  console.assert(expr instanceof Expr);

  return new ExprStmt(sourceLoc, expr);
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
  return new Dict(sourceLoc, keys, values);
}

function list(exprs, sourceLoc = null) {
  return new List(sourceLoc, exprs);
}

function tuple(elts, sourceLoc = null) {
  console.assert(elts instanceof Array);

  return new Tuple(sourceLoc, elts);
}

function call(func, args, keywords = [], sourceLoc = null) {
  console.assert(func instanceof Expr || func instanceof Identifier);
  console.assert(keywords instanceof Array);

  return new Call(sourceLoc, func, args, keywords);
}

function n(value, sourceLoc = null) {
  console.assert(typeof value === 'number' || typeof value === 'string');

  return new Num(sourceLoc, typeof value === 'string' ? value : '' + value.toString() ); // TODO: actual stringify
}

function str(value, sourceLoc = null) {
  console.assert(typeof value === 'string');

  return new Str(sourceLoc, '', '"' + value + '"');
}


function dot(value, attr, sourceLoc = null) {
  console.assert(value instanceof Expr || value instanceof Identifier);
  console.assert(typeof attr === 'string');

  return new Attribute(sourceLoc, value, attr);
}

function sub(value, slice, sourceLoc = null) {
  console.assert(value instanceof Expr || value instanceof Identifier);
  console.assert(slice instanceof Slice || slice instanceof ExtSlice || slice instanceof Index);

  return new Subscript(sourceLoc, value, slice);
}

function none(sourceLoc = null) {
  return new NameConstant(sourceLoc, 'None');
}

function star(value, sourceLoc = null) {
  return new Starred(sourceLoc, value);
}

function id(value, sourceLoc = null) {
  console.assert(typeof value === 'string');

  return new Name(sourceLoc, value);
}

function idx(value, sourceLoc = null) {
  console.assert(value instanceof Expr || value instanceof Identifier);

  return new Index(sourceLoc, value);
}

function args(positional, vararg = null, kwonly = [], kw = null, defaults = null, kwdefaults = null, sourceLoc = null) {
  if (defaults === null) {
    defaults = range(positional.length)
      .map(_ => null);
  }
  if (kwdefaults === null) {
    kwdefaults = range(kwonly.length)
      .map(_ => null);
  }
  return new Arguments(sourceLoc, positional, vararg, kwonly, kw, defaults, kwdefaults);
}