
class AST {
  constructor(sourceLoc, id) {
    if (id === null) {
      this.id = AST.id--;
    } else {
      this.id = id;
    }
    this.sourceLoc = sourceLoc;
  }

  toString() {
    throw new Error('this method is abstract! ' + this.constructor.name);
  }

  get children() {
    throw new Error('this method is abstract! ' + this.constructor.name);
  }
}
AST.id = -1;

class Program extends AST {
  constructor(sourceLoc, id, body) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, value) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, type, value) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, value, conversion, formatSpec) {
    super(sourceLoc, id);
    this.value = value;
    this.conversion = conversion;
    this.formatSpec = formatSpec;
  }

  get children() {
    return [];
  }
}

class JoinedStr extends Literal {
  constructor(sourceLoc, id, values) {
    super(sourceLoc, id);
    this.values = values;
  }

  get children() {
    return this.values;
  }
}

class Bytes extends Literal {
  constructor(sourceLoc, id, bytes) {
    super(sourceLoc, id);
    this.bytes = bytes;
  }

  get children() {
    return [];
  }
}

class List extends Literal {
  constructor(sourceLoc, id, elts, ctx=(new Load())) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, elts, ctx=(new Load())) {
    super(sourceLoc, id);
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

class SetAST extends Literal {
  constructor(sourceLoc, id, elts) {
    super(sourceLoc, id);
    this.elts = elts;
  }

  get children() {
    return this.elts;
  }
}

class Dict extends Literal {
  constructor(sourceLoc, id, keys, values) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, type) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, ident, ctx=(new Load())) {
    super(sourceLoc, id);
    this.ident = ident;
    this.ctx = ctx;
  }

  toString() {
    return this.ident;
  }

  get children() {
    return [];
  }
}

class Starred extends Expr {
  constructor(sourceLoc, id, value, ctx=(new Load())) {
    super(sourceLoc, id);
    this.value = value;
    this.ctx = ctx;
  }

  toString() {
    return '* ' + this.value.toString();
  }

  get children() {
    return [this.value];
  }
}

// Expressions
// ---------

class UnaryOp extends Expr {
  constructor(sourceLoc, id, op, expr) {
    super(sourceLoc, id);
    this.op = op;
    this.expr = expr;
  }

  get children() {
    return [this.expr];
  }

  toString() {
    return this.op + '(' + this.expr.toString() + ')';
  }
}

class BinOp extends Expr {
  constructor(sourceLoc, id, left, op, right) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, op, values) {
    super(sourceLoc, id);
    this.op = op;
    this.values = values;
  }

  get children() {
    return this.values;
  }
}

class Compare extends Expr {
  constructor(sourceLoc, id, left, ops, comparators) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, /*Expr*/ func, /*Expr**/ args, /*Keyword**/ keywords) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, arg, value) {
    super(sourceLoc, id);
    this.arg = arg;
    this.value = value;
  }

  toString() {
    if (this.arg === null) {
      return '** ' + this.value.toString();
    } else {
      return this.arg + '=' + ' ( ' + this.value.toString() + ' ) ';
    }
  }

  get children() {
    return [this.arg, this.value];
  }
}

class IfExp extends Expr {
  constructor(sourceLoc, id, test, body, orelse) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, value, attr, ctx=(new Load())) {
    super(sourceLoc, id);
    this.value = value;
    this.attr = attr;
    this.ctx = ctx;
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
  constructor(sourceLoc, id, value, slice, ctx=(new Load())) {
    super(sourceLoc, id);
    this.value = value;
    this.slice = slice;
    if (!(this.slice instanceof Index || this.slice instanceof Slice)) debugger;
    this.ctx = ctx;
  }

  toString() {
    return this.value.toString() + ' [ ' + this.slice.toString() + ' ] ';
  }

  get children() {
    return [this.value, this.slice];
  }
}

class Index extends AST {
  constructor(sourceLoc, id, value) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, lower, upper, step) {
    super(sourceLoc, id);
    this.lower = lower;
    this.upper = upper;
    this.step = step;
  }

  get children() {
    return [this.lower, this.upper, this.step];
  }

  toString() {
    let ans = '';
    if (this.lower !== null) {
      ans += this.lower.toString();
    }
    ans += ':';
    if (this.upper !== null) {
      ans += this.upper.toString();
    }
    if (this.step !== null) {
      ans += ':';
      ans += this.step.toString();
    }
    return ans;
  }
}

class ExtSlice extends AST {
  constructor(sourceLoc, id, dims) {
    super(sourceLoc, id);
    this.dims = dims;
  }

  get children() {
    return this.dims;
  }
}

// Comprehensions
// -----------

class ListComp extends Expr {
  constructor(sourceLoc, id, elt, generators) {
    super(sourceLoc, id);
    this.elt = elt;
    this.generators = generators;
  }

  get children() {
    return [this.elt, ...this.generators];
  }
}

class SetComp extends Expr {
  constructor(sourceLoc, id, elt, generators) {
    super(sourceLoc, id);
    this.elt = elt;
    this.generators = generators;
  }

  get children() {
    return [this.elt, ...this.generators];
  }
}

class DictComp extends Expr {
  constructor(sourceLoc, id, elt, generators) {
    super(sourceLoc, id);
    this.elt = elt;
    this.generators = generators;
  }

  get children() {
    return [this.elt, ...this.generators];
  }
}

class GeneratorExp extends Expr {
  constructor(sourceLoc, id, key, value, generators) {
    super(sourceLoc, id);
    this.key = key;
    this.value = value;
    this.generators = generators;
  }

  get children() {
    return [this.value, this.generators];
  }
}

class Comprehension extends AST {
  constructor(sourceLoc, id, target, iter, ifs, isAsync) {
    super(sourceLoc, id);
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

class Stmt extends AST {
  constructor(sourceLoc, id) {
    super(sourceLoc && sourceLoc.trimmed(), id);
  }
}

class Assign extends Stmt {
  constructor(sourceLoc, id, /*Expr**/ targets, /*Expr*/ value) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, target, op, value) {
    super(sourceLoc, id);
    this.target = target;
    this.op = op;
    this.value = value;
  }

  get children() {
    return [this.target, this.value];
  }
}

class AugAssign extends Stmt {
  constructor(sourceLoc, id, target, op, value) {
    super(sourceLoc, id);
    this.target = target;
    this.op = op;
    this.value = value;
  }

  get children() {
    return [this.target, this.value];
  }

  toString(indentation = 0) {
    return spaces(indentation) + this.target.toString() + ' ' + this.op + ' ' + this.value.toString() + '\n';
  }
}

class Raise extends Stmt {
  constructor(sourceLoc, id, exc, cause) {
    super(sourceLoc, id);
    this.exc = exc;
    this.cause = cause;
  }

  get children() {
    return [this.exc, this.cause];
  }
}

class Assert extends Stmt {
  constructor(sourceLoc, id, test, msg) {
    super(sourceLoc, id);
    this.test = test;
    this.msg = msg;
  }

  get children() {
    return [this.test, this.msg];
  }
}

class Delete extends Stmt {
  constructor(sourceLoc, id, targets) {
    super(sourceLoc, id);
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

  toString(indentation = 0) {
    return spaces(indentation) + 'pass\n';
  }
}

class ExprStmt extends Stmt {
  constructor(sourceLoc, id, expr) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, names) {
    super(sourceLoc, id);
    this.names = names;
  }

  get children() {
    return this.names;
  }
}

class ImportFrom extends Stmt {
  constructor(sourceLoc, id, module, names, level) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, name, asName) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, tests, bodies, orelse) {
    super(sourceLoc, id);
    this.tests = tests;
    this.bodies = bodies;
    this.orelse = orelse;
  }

  get children() {
    return [...this.tests, ...flatten(this.bodies), ...(this.orelse || [])];
  }

  toString(indentation = 0) {
    const test = this.tests[0];
    const body = this.bodies[0];
    const elifTests = this.tests.slice(1);
    const elifBodies = this.bodies.slice(1);
    const i = spaces(indentation);

    let ans = '';
    ans += i + 'if ' + test.toString() + ' :\n';
    ans += body.map(stmt => stmt.toString(indentation + 2)).join('');
    elifTests.forEach((elifTest, j) => {
      const elifBody = elifBodies[j];
      ans += i + 'elif ' + elifTest.toString() + ' :\n';
      ans += elifBody.map(stmt => stmt.toString(indentation + 2)).join('');
    });
    if (this.orelse !== null) {
      ans += i + 'else:\n';
      ans += this.orelse.map(stmt => stmt.toString(indentation + 2)).join('');
    }
    return ans;
  }
}

class For extends Stmt {
  constructor(sourceLoc, id, /*Expr*/ target, /*Expr*/ iter, /*Stmt**/ body, /*Stmt**/ orelse) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, test, body, orelse) {
    super(sourceLoc, id);
    this.test = test;
    this.body = body;
    this.orelse = orelse;
  }

  get children() {
    return [this.test, ...this.body, ...(this.orelse || [])];
  }

  toString(indentation = 0) {
    const i = spaces(indentation);

    let ans = '';
    ans += i + 'while ' + this.test.toString() + ':\n';
    ans += this.body.map(stmt => stmt.toString(indentation + 2)).join('');
    if (this.orelse !== null) {
      ans += 'else:\n';
      ans += this.orelse.map(stmt => stmt.toString(indentation + 2)).join('');
    }
    return ans;
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
  constructor(sourceLoc, id, body, handlers, orelse, finalbody) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, type, name, body) {
    super(sourceLoc, id);
    this.type = type;
    this.name = name;
    this.body = body;
  }

  get children() {
    return [this.type, this.name, ...this.body];
  }
}

class With extends Stmt {
  constructor(sourceLoc, id, items, body) {
    super(sourceLoc, id);
    this.items = items;
    this.body = body;
  }

  get children() {
    return [...this.items, ...this.body];
  }
}

class WithItem extends AST {
  constructor(sourceLoc, id, contextExpr, optionalVars) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, name, args, body, decoratorList, returns) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, args, body) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, args, vararg, kwonlyargs, kwarg, defaults, kwDefaults) {
    super(sourceLoc, id);
    
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
      const default_ =  this.defaults[idx] || null;
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
  constructor(sourceLoc, id, arg, annotation) {
    super(sourceLoc, id);
    this.arg = arg;
    this.annotation = annotation;
  }

  get children() {
    return [this.annotation];
  }

  toString() {
    let ans = this.arg;
    if (this.annotation) {
      ans += ' : ' + this.annotation.toString();
    }
    return ans;
  }
}

class Return extends Stmt {
  constructor(sourceLoc, id, value) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, value) {
    super(sourceLoc, id);
    this.value = value;
  }

  get children() {
    return [this.value];
  }
}

class YieldFrom extends Expr {
  constructor(sourceLoc, id, value) {
    super(sourceLoc, id);
    this.value = value;
  }

  get children() {
    return [this.value];
  }
}

class Global extends Stmt {
  constructor(sourceLoc, id, names) {
    super(sourceLoc, id);
    this.names = names;
  }

  get children() {
    return this.names;
  }
}

class Nonlocal extends Stmt {
  constructor(sourceLoc, id, names) {
    super(sourceLoc, id);
    this.names = names;
  }

  get children() {
    return this.names;
  }
}

class ClassDef extends Stmt {
  constructor(sourceLoc, id, name, bases, keywords, body, decoratorList) {
    super(sourceLoc, id);
    this.name = name;
    this.bases = bases;
    this.keywords = keywords;
    this.body = body;
    this.decoratorList = decoratorList;
  }

  get children() {
    return [
      ...this.bases, ...this.keywords, ...this.body, ...this.decoratorList
    ];
  }

  toString(indentation = 0) {
    const i = spaces(indentation);
    let ans = '';
    if (this.decoratorList.length > 0) {
      ans += i + this.decoratorList.map(decorator => decorator.toString()).join('\n') + '\n';
    }
    ans += i + 'class ' + this.name.toString();
    if (this.args !== null) {
      ans += ' ( ';
      ans += this.bases.map(base => base.toString()).join(',');
      ans += this.keywords.map(kw => kw.toString()).join(',');
      ans += ' ) ';
    }
    ans += ':\n'
    ans += this.body.map(stmt => stmt.toString(indentation + 2)).join('');
    return ans;
  }
}

// Async and Await
// ------------

class AsyncFunctionDef extends Stmt {
  constructor(sourceLoc, id, name, args, body, decoratorList, returns) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, value) {
    super(sourceLoc, id);
    this.value = value;
  }

  get children() {
    return [this.value];
  }
}

class AsyncFor extends Stmt {
  constructor(sourceLoc, id, target, iter, body, orelse) {
    super(sourceLoc, id);
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
  constructor(sourceLoc, id, items, body) {
    super(sourceLoc, id);
    this.items = items;
    this.body = body;
  }
  
  get children() {
    return [...this.items, ...this.body];
  }
}