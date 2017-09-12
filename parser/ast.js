
class AST {
  constructor(sourceLoc) {
    this.id = AST.id++;
    this.sourceLoc = sourceLoc;
  }

  toString() {
    throw new Error('this method is abstract! ' + this.constructor.name);
  }

  get children() {
    throw new Error('this method is abstract! ' + this.constructor.name);
  }
}
AST.id = 0;

class Program extends AST {
  constructor(sourceLoc, body) {
    super(sourceLoc);
    this.body = body;
  }

  toString(indentation = 0) {
    return this.body
      .map(stmt => stmt.toString(indentation))
      .join('');
  }

  get children() {
    return this.body;
  }
}

// Literal
// --------
class Expr extends AST {}

class Literal extends Expr {}

class Num extends Literal {
  constructor(sourceLoc, value) {
    super(sourceLoc);
    this.value = value;
  }

  toString() {
    return this.value;
  }

  get children() {
    return [];
  }
}

class Str extends Literal {
  constructor(sourceLoc, type, value) {
    super(sourceLoc);
    this.type = type;
    this.value = value;
  }

  toString() {
    return this.value; // TODO: value shouldn't require quotes in value
  }

  get children() {
    return [];
  }
}

class FormattedValue extends Literal {
  constructor(sourceLoc, value, conversion, formatSpec) {
    super(sourceLoc);
    this.value = value;
    this.conversion = conversion;
    this.formatSpec = formatSpec;
  }

  get children() {
    return [];
  }
}

class JoinedStr extends Literal {
  constructor(sourceLoc, values) {
    super(sourceLoc);
    this.values = values;
  }

  get children() {
    return this.values;
  }
}

class Bytes extends Literal {
  constructor(sourceLoc, bytes) {
    super(sourceLoc);
    this.bytes = bytes;
  }

  get children() {
    return [];
  }
}

class List extends Literal {
  constructor(sourceLoc, elts, ctx=(new Load())) {
    super(sourceLoc);
    this.elts = elts;
    this.ctx = ctx;
  }

  toString() {
    return '[ ' + this.elts.map(elt => elt.toString()).join(', ') + ' ]';
  }

  get children() {
    return this.elts;
  }
}

class Tuple extends Literal {
  constructor(sourceLoc, elts, ctx=(new Load())) {
    super(sourceLoc);
    this.elts = elts;
    this.ctx = ctx;
  }

  toString() {
    return '( ' + this.elts.map(elt => elt.toString()).join(', ') + ' )';
  }

  get children() {
    return this.elts;
  }
}

class Set extends Literal {
  constructor(sourceLoc, elts) {
    super(sourceLoc);
    this.elts = elts;
  }

  get children() {
    return this.elts;
  }
}

class Dict extends Literal {
  constructor(sourceLoc, keys, values) {
    super(sourceLoc);
    console.assert(keys.length === values.length);
    this.keys = keys;
    this.values = values;
  }

  toString() {
    let ans = '{ ';
    ans += this.keys.map((key, idx) => {
      const value = this.values[idx];
      return key.toString() + ' : ' + value.toString();
    }).join(', ');
    ans += ' }';
    return ans;
  }

  get children() {
    return this.keys.concat(this.values);
  }
}

class Ellipsis extends Literal {
  toString() {
    return '...';
  }

  get children() {
    return [];
  }
}

class NameConstant extends Literal {
  constructor(sourceLoc, type) {
    super(sourceLoc);
    this.type = type;
  }

  toString() {
    return this.type;
  }

  get children() {
    return [];
  }
}

// Variables
// --------------

class Context {}
class Load extends Context {}
class Store extends Context {}
class Del extends Context {}

class Name extends Expr {
  constructor(sourceLoc, id, ctx=(new Load())) {
    super(sourceLoc);
    this.id = id;
    this.ctx = ctx;
  }

  toString() {
    return this.id;
  }

  get children() {
    return [];
  }
}

class Starred extends Expr {
  constructor(sourceLoc, value, ctx=(new Load())) {
    super(sourceLoc);
    this.value = value;
    this.ctx = ctx;
  }

  toString() {
    return '* ( ' + this.value.toString()  + ' )'
  }

  get children() {
    return [this.value];
  }
}

// Expressions
// ---------

class UnaryOp extends Expr {
  constructor(sourceLoc, op, expr) {
    super(sourceLoc);
    this.op = op;
    this.expr = expr;
  }

  get children() {
    return [this.expr];
  }
}

class BinOp extends Expr {
  constructor(sourceLoc, left, op, right) {
    super(sourceLoc);
    this.op = op;
    this.left = left;
    this.right = right;
  }

  toString() {
    return '( ' + this.left.toString() + ' ' + this.op + ' ' + this.right.toString() + ' )';
  }

  get children() {
    return [this.left, this.right];
  }
}

class BoolOp extends Expr {
  constructor(sourceLoc, op, values) {
    super(sourceLoc);
    this.op = op;
    this.values = values;
  }

  get children() {
    return this.values;
  }
}

class Compare extends Expr {
  constructor(sourceLoc, left, ops, comparators) {
    super(sourceLoc);
    this.left = left;
    this.ops = ops;
    this.comparators = comparators;
  }

  toString() {
    let ans = '( ' + this.left.toString();
    this.ops.forEach((op, idx) => {
      const comparator = this.comparators[idx];
      ans += ' ' + op + ' ' + comparator.toString();
    });
    ans += ' )';
    return ans;
  }

  get children() {
    return [this.left, ...this.comparators];
  }
}

class Call extends Expr {
  constructor(sourceLoc, /*Expr*/ func, /*Expr**/ args, /*Keyword**/ keywords) {
    super(sourceLoc);
    this.func = func;
    this.args = args;
    this.keywords = keywords;
  }

  toString() {
    let ans = this.func.toString() + ' ( ';
    ans += this.args.map(arg => arg.toString()).join(', ');
    if (this.keywords.length > 0) {
      ans += ', ';
      ans += this.keywords.map(kw => kw.toString()).join(', ');
    }
    ans += ' ) ';
    return ans;
  }

  get children() {
    return [this.func, ...this.args, ...this.keywords];
  }
}

class Keyword extends AST {
  constructor(sourceLoc, arg, value) {
    super(sourceLoc);
    this.arg = arg;
    this.value = value;
  }

  get children() {
    return [this.arg, this.value];
  }
}

class IfExp extends Expr {
  constructor(sourceLoc, test, body, orelse) {
    super(sourceLoc);
    this.test = test;
    this.body = body;
    this.orelse = orelse;
  }

  toString() {
    return '( ' + this.body.toString() + ' if ' + this.test.toString() + ' else ' + this.orelse.toString() + ' )'
  }

  get children() {
    return [this.test, this.body, ...(this.orelse ? [this.orelse] : [])];
  }
}

class Attribute extends Expr {
  constructor(sourceLoc, value, attr) { // TODO: ctx
    super(sourceLoc);
    this.value = value;
    this.attr = attr;
  }

  toString() {
    return this.value.toString() + ' . ' + this.attr.toString();
  }

  get children() {
    return [this.value];
  }
}

// Subscripting
// ---------------

class Subscript extends Expr {
  constructor(sourceLoc, value, slice) { // TODO: ctx
    super(sourceLoc);
    this.value = value;
    this.slice = slice;
  }

  toString() {
    return this.value.toString() + ' [ ' + this.slice.toString() + ' ] ';
  }

  get children() {
    return [this.value, this.slice];
  }
}

class Index extends AST {
  constructor(sourceLoc, value) {
    super(sourceLoc);
    this.value = value;
  }

  toString() {
    return this.value.toString();
  }

  get children() {
    return [this.value];
  }
}

class Slice extends AST {
  constructor(sourceLoc, lower, upper, step) {
    super(sourceLoc);
    this.lower = lower;
    this.upper = upper;
    this.step = step;
  }

  get children() {
    return [this.lower, this.upper, this.step];
  }
}

class ExtSlice extends AST {
  constructor(sourceLoc, dims) {
    super(sourceLoc);
    this.dims = dims;
  }

  get children() {
    return this.dims;
  }
}

// Comprehensions
// -----------

class ListComp extends Expr {
  constructor(sourceLoc, elt, generators) {
    super(sourceLoc);
    this.elt = elt;
    this.generators = generators;
  }

  get children() {
    return [this.elt, ...this.generators];
  }
}

class SetComp extends Expr {
  constructor(sourceLoc, elt, generators) {
    super(sourceLoc);
    this.elt = elt;
    this.generators = generators;
  }

  get children() {
    return [this.elt, ...this.generators];
  }
}

class DictComp extends Expr {
  constructor(sourceLoc, elt, generators) {
    super(sourceLoc);
    this.elt = elt;
    this.generators = generators;
  }

  get children() {
    return [this.elt, ...this.generators];
  }
}

class GeneratorExp extends Expr {
  constructor(sourceLoc, key, value, generators) {
    super(sourceLoc);
    this.key = key;
    this.value = value;
    this.generators = generators;
  }

  get children() {
    return [this.value, this.generators];
  }
}

class Comprehension extends AST {
  constructor(sourceLoc, target, iter, ifs, isAsync) {
    super(sourceLoc);
    this.target = target;
    this.iter = iter;
    this.ifs = ifs;
    this.isAsync = isAsync;
  }

  get children() {
    return [this.target, this.iter, ...this.ifs];
  }
}

// Statements
// ---------

class Stmt extends AST {}

class Assign extends Stmt {
  constructor(sourceLoc, /*Expr**/ targets, /*Expr*/ value) {
    super(sourceLoc);
    // verify that each target is a target
    this.targets = targets;
    this.value = value;
  }

  toString(indentation = 0) {
    return spaces(indentation) + this.targets.concat(this.value)
      .map(item => item.toString())
      .join(' = ') + '\n';
  }

  get children() {
    return [...this.targets, this.value];
  }
}

class AnnAssign extends Stmt {
  constructor(sourceLoc, target, op, value) {
    super(sourceLoc);
    this.target = target;
    this.op = op;
    this.value = value;
  }

  get children() {
    return [this.target, this.value];
  }
}

class AugAssign extends Stmt {
  constructor(sourceLoc, target, op, value) {
    super(sourceLoc);
    this.target = target;
    this.op = op;
    this.value = value;
  }

  get children() {
    return [this.target, this.value];
  }
}

class Raise extends Stmt {
  constructor(sourceLoc, exc, cause) {
    super(sourceLoc);
    this.exc = exc;
    this.cause = cause;
  }

  get children() {
    return [this.exc, this.cause];
  }
}

class Assert extends Stmt {
  constructor(sourceLoc, test, msg) {
    super(sourceLoc);
    this.test = test;
    this.msg = msg;
  }

  get children() {
    return [this.test, this.msg];
  }
}

class Delete extends Stmt {
  constructor(sourceLoc, targets) {
    super(sourceLoc);
    this.targets = targets;
  }

  get children() {
    return this.targets;
  }
}

class Pass extends Stmt {
  get children() {
    return [];
  }
}

class ExprStmt extends Stmt {
  constructor(sourceLoc, expr) {
    super(sourceLoc);
    this.expr = expr;
  }

  toString(indentation = 0) {
    return spaces(indentation) + this.expr.toString() + '\n';
  }

  get children() {
    return [this.expr];
  }
}

// Imports
// ------

class Import extends Stmt {
  constructor(sourceLoc, names) {
    super(sourceLoc);
    this.names = names;
  }

  get children() {
    return this.names;
  }
}

class ImportFrom extends Stmt {
  constructor(sourceLoc, module, names, level) {
    super(sourceLoc);
    this.module = module;
    this.names = names;
    this.level = level;
  }

  toString(indentation = 0) {
    return spaces(indentation) + 'from ' + 
      repeat('.', this.level) + this.module.toString() + ' import ' + this.names.toString() + '\n';
  }

  get children() {
    return this.names;
  }
}

class Alias extends AST {
  constructor(sourceLoc, name, asName) {
    super(sourceLoc);
    this.name = name;
    this.asName = asName;
  }

  toString() {
    if (this.asName) {
      return this.name + ' as ' + this.asName;
    } else {
      return this.name;
    }
  }

  get children() {
    return [];
  }
}

// Control Flow
// ---------

class If extends Stmt {
  constructor(sourceLoc, test, body, orelse) {
    super(sourceLoc);
    this.test = test;
    this.body = body;
    this.orelse = orelse;
  }

  get children() {
    return [this.test, ...this.body, ...(this.orelse || [])];
  }
}

class For extends Stmt {
  constructor(sourceLoc, /*Expr*/ target, /*Expr*/ iter, /*Stmt**/ body, /*Stmt**/ orelse) {
    super(sourceLoc);
    this.target = target;
    this.iter = iter;
    this.body = body;
    this.orelse = orelse;
  }

  toString(indentation = 0) {
    const i = spaces(indentation);
    let ans = i + 'for ' + this.target.toString() + ' in ' + this.iter.toString() + ':\n';
    ans += this.body.map(stmt => stmt.toString(indentation + 2)).join('');
    if (this.orelse) {
      ans += i + 'else:\n'
      ans += this.orelse.map(stmt => stmt.toString(indentation + 2)).join('');
    }
    return ans;
  }

  get children() {
    return [this.target, this.iter, ...this.body, ...(this.orelse || [])];
  }
}

class While extends Stmt {
  constructor(sourceLoc, test, body, orelse) {
    super(sourceLoc);
    this.test = test;
    this.body = body;
    this.orelse = orelse;
  }

  get children() {
    return [this.test, ...this.body, ...(this.orelse || [])];
  }
}

class Break extends Stmt {
  get children() {
    return [];
  }
}

class Continue extends Stmt {
  get children() {
    return [];
  }
}

class Try extends Stmt {
  constructor(sourceLoc, body, handlers, orelse, finalbody) {
    super(sourceLoc);
    this.body = body;
    this.handlers = handlers;
    this.orelse = orelse;
    this.finalbody = finalbody;
  }

  get children() {
    return [...this.body, ...this.handlers, ...(this.orelse || []), ...(this.finalbody || [])];
  }
}

class ExceptHandler extends AST {
  constructor(sourceLoc, type, name, body) {
    super(sourceLoc);
    this.type = type;
    this.name = name;
    this.body = body;
  }

  get children() {
    return [this.type, this.name, ...this.body];
  }
}

class With extends Stmt {
  constructor(sourceLoc, items, body) {
    super(sourceLoc);
    this.items = items;
    this.body = body;
  }

  get children() {
    return [...this.items, ...this.body];
  }
}

class WithItem extends AST {
  constructor(sourceLoc, contextExpr, optionalVars) {
    super(sourceLoc);
    this.contextExpr = contextExpr;
    this.optionalVars = optionalVars;
  }

  get children() {
    return [];
  }
}

// Function and Class Definitions
// ----------------------

class FunctionDef extends Stmt {
  constructor(sourceLoc, name, args, body, decoratorList, returns) {
    super(sourceLoc);
    this.name = name;
    this.args = args;
    this.body = body;
    this.decoratorList = decoratorList;
    this.returns = returns;
  }

  toString(indentation = 0) {
    const i = spaces(indentation);
    let ans = '';
    if (this.decoratorList.length > 0) {
      ans += i + this.decoratorList.map(decorator => decorator.toString()).join('\n') + '\n';
    }
    ans += i + 'def ' + this.name.toString() + ' ( ';
    if (this.args !== null) {
      ans += this.args.toString();
    }
    ans += ' ) '
    if (this.returns !== null) {
      ans += '-> ' + this.returns.toString();
    }
    ans += ':\n'
    ans += this.body.map(stmt => stmt.toString(indentation + 2)).join('');
    return ans;
  }

  get children() {
    return [
      ...(this.args? [this.args] : []), 
      ...this.body, ...this.decoratorList, 
      ...(this.returns? [this.returns] : []), 
    ];
  }
}

class Lambda extends Expr {
  constructor(sourceLoc, args, body) {
    super(sourceLoc);
    this.args = args;
    this.body = body;
  }

  toString() {
    return 'lambda ' + this.args.toString() + ': ' + this.body.toString();
  }
  
  get children() {
    return [...(this.args? [this.args] : []), this.body];
  }
}

class Arguments extends AST {
  constructor(sourceLoc, args, vararg, kwonlyargs, kwarg, defaults, kwDefaults) {
    super(sourceLoc);
    
    this.args = args;
    this.vararg = vararg;
    this.kwonlyargs = kwonlyargs;
    this.kwarg = kwarg;
    this.defaults = defaults;
    this.kwDefaults = kwDefaults;
  }

  toString() {
    let ans = [];

    this.args.forEach((arg, idx) => {
      const default_ =  this.defaults[idx];
      let argstr = arg.toString();
      if (default_ !== null) {
        argstr += ' = ' + default_.toString();
      }
      ans.push(argstr); 
    });
    if (this.vararg !== null) {
      ans.push(this.vararg.toString());
    }

    this.kwonlyargs.forEach((arg, idx) => {
      const default_ =  this.kwDefaults[idx];
      let argstr = arg.toString();
      if (default_ !== null) {
        argstr += ' = ' + default_.toString();
      }
      ans.push(argstr); 
    });
    if (this.kwarg !== null) {
      ans.push(this.kwarg.toString());
    }

    return ans.join(', ');
  }

  get children() {
    return [
      ...this.args, ...(this.vararg? [this.vararg] : []),
      ...this.kwonlyargs, ...(this.kwarg? [this.kwarg] : []),
      ...this.defaults.filter(d => d !== null), 
      ...this.kwDefaults.filter(d => d !== null)
    ];
  }
}

class Arg extends AST {
  constructor(sourceLoc, arg, annotation) {
    super(sourceLoc);
    this.arg = arg;
    this.annotation = annotation;
  }

  get children() {
    return [this.annotation];
  }
}

class Return extends Stmt {
  constructor(sourceLoc, value) {
    super(sourceLoc);
    this.value = value;
  }

  toString(indentation = 0) {
    return spaces(indentation) + 'return ' + this.value.toString() + '\n';
  }

  get children() {
    return [this.value];
  }
}

class Yield extends Expr {
  constructor(sourceLoc, value) {
    super(sourceLoc);
    this.value = value;
  }

  get children() {
    return [this.value];
  }
}

class YieldFrom extends Expr {
  constructor(sourceLoc, value) {
    super(sourceLoc);
    this.value = value;
  }

  get children() {
    return [this.value];
  }
}

class Global extends Stmt {
  constructor(sourceLoc, names) {
    super(sourceLoc);
    this.names = names;
  }

  get children() {
    return this.names;
  }
}

class Nonlocal extends Stmt {
  constructor(sourceLoc, names) {
    super(sourceLoc);
    this.names = names;
  }

  get children() {
    return this.names;
  }
}

class ClassDef extends Stmt {
  constructor(sourceLoc, name, bases, keywords, starargs, kwargs, body, decoratorList) {
    super(sourceLoc);
    this.name = name;
    this.bases = bases;
    this.keywords = keywords;
    this.starargs = starargs;
    this.kwargs = kwargs;
    this.body = body;
    this.decoratorList = decoratorList;
  }

  get children() {
    return [
      ...this.bases, ...this.keywords, ...this.starargs, ...this.kwargs, ...this.body, ...this.decoratorList
    ];
  }
}

// Async and Await
// ------------

class AsyncFunctionDef extends Stmt {
  constructor(sourceLoc, name, args, body, decoratorList, returns) {
    super(sourceLoc);
    this.name = name;
    this.args = args;
    this.body = body;
    this.decoratorList = decoratorList;
    this.returns = returns;
  }

  get children() {
    return [
      ...(this.args? [this.args] : []), 
      ...this.body, ...this.decoratorList, 
      ...(this.returns? [this.returns] : []), 
    ];
  }
}

class Await extends Expr {
  constructor(sourceLoc, value) {
    super(sourceLoc);
    this.value = value;
  }

  get children() {
    return [this.value];
  }
}

class AsyncFor extends Stmt {
  constructor(sourceLoc, target, iter, body, orelse) {
    super(sourceLoc);
    this.target = target;
    this.iter = iter;
    this.body = body;
    this.orelse = orelse;
  }

  get children() {
    return [this.target, this.iter, ...this.body, ...(this.orelse || [])];
  }
}

class AsyncWith extends Stmt {
  constructor(sourceLoc, items, body) {
    super(sourceLoc);
    this.items = items;
    this.body = body;
  }
  
  get children() {
    return [...this.items, ...this.body];
  }
}