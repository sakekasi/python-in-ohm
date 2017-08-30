/**
 * what does an AST need?
 * 
 */
class AST { //
  constructor(sourceLoc) {
    this.sourceLoc = sourceLoc;
  }

  toString() {
    throw new Error('this method is abstract! ' + this.constructor.name);
  }

  instrumented() {
    throw new Error('this method is abstract! ' + this.constructor.name);
  }
}

class Program extends AST { //
  constructor(sourceLoc, body) {
    super(sourceLoc);
    this.body = body;
  }

  toString() {
    return this.body
      .map(stmt => stmt.toString())
      .join('');
  }
}

class Stmt extends AST {} //

class FunctionDef extends Stmt {} 
class AsyncFunctionDef extends Stmt {}

class ClassDef extends Stmt {}
class Return extends Stmt {}

class Delete extends Stmt {}
class Assign extends Stmt {
  constructor(sourceLoc, /*Expr**/ targets, /*Expr*/ value) {
    super(sourceLoc);
    this.targets = targets;
    this.value = value;
  }

  toString() {
    return this.targets.concat(this.value)
      .map(item => item.toString())
      .join(' = ') + '\n';
  }
} // (with optional var assigning into?)
class AugAssign extends Stmt {}
class AnnAssign extends Stmt {}

class For extends Stmt {
  constructor(sourceLoc, /*Expr*/ target, /*Expr*/ iter, /*Stmt**/ body, /*Stmt**/ orelse) {
    super(sourceLoc);
    this.target = target;
    this.iter = iter;
    this.body = body;
    this.orelse = orelse;
  }

  toString() {
    let ans = 'for ' + this.target.toString() + ' in ' + this.iter.toString() + ':\n';
    ans += this.body.map(stmt => '  ' + stmt.toString()).join('');
    if (this.orelse) {
      ans += 'else:\n'
      ans += this.orelse.map(stmt => '  ' + stmt.toString()).join('');
    }
    return ans;
  }
} //

class AsyncFor extends Stmt {}
class While extends Stmt {}
class If extends Stmt {}
class With extends Stmt {}
class AsyncWith extends Stmt {}

class Raise extends Stmt {}
class Try extends Stmt {}
class Assert extends Stmt {}

class Import extends Stmt {}
class ImportFrom extends Stmt {}

class Global extends Stmt {}
class Nonlocal extends Stmt {}
class ExprStmt extends Stmt {}

class Pass extends Stmt {}
class Break extends Stmt {}
class Continue extends Stmt {}


class Expr extends AST {}

class BoolOp extends Expr {
  constructor(sourceLoc, op, values) {
    super(sourceLoc);
    this.op = op;
    this.values = values;
  }
}

class BinOp extends Expr {
  constructor(sourceLoc, left, op, right) {
    super(sourceLoc);
    this.op = op;
    this.left = left;
    this.right = right;
  }

  toString() { // TODO: may not need this many parens
    return '( ' + this.left.toString() + ' ' + this.op + ' ' + this.right.toString() + ' )';
  }
} //

class UnaryOp extends Expr {
  constructor(sourceLoc, op, expr) {
    super(sourceLoc);
    this.op = op;
    this.expr = expr;
  }
}

class Lambda extends Expr {}

class IfExp extends Expr {
  constructor(sourceLoc, test, body, orelse) {
    super(sourceLoc);
    this.test = test;
    this.body = body;
    this.orelse = orelse;
  }
}

class Dict extends Expr {}
class Set extends Expr {}
class ListComp extends Expr {}
class SetComp extends Expr {}
class DictComp extends Expr {}
class GeneratorExp extends Expr {}

class Await extends Expr {
  constructor(sourceLoc, value) {
    super(sourceLoc);
    this.value = value;
  }
}

class Yield extends Expr {}
class YieldFrom extends Expr {}

class Compare extends Expr {
  constructor(sourceLoc, left, ops, comparators) {
    super(sourceLoc);
    this.left = left;
    this.ops = ops;
    this.comparators = comparators;
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
} //

class Num extends Expr {
  constructor(sourceLoc, value) {
    super(sourceLoc);
    this.value = value;
  }

  toString() {
    return this.value;
  }
} //

class Str extends Expr {
  constructor(sourceLoc, type, value) {
    super(sourceLoc);
    this.type = type;
    this.value = value;
  }
}

class FormattedValue extends Expr {} // TODO

class JoinedStr extends Expr {
  constructor(sourceLoc, values) {
    super(sourceLoc);
    this.values = values;
  }
}

class Bytes extends Expr {
  constructor(sourceLoc, bytes) {
    super(sourceLoc);
    this.bytes = bytes;
  }
}

class NameConstant extends Expr {
  constructor(sourceLoc, type) {
    super(sourceLoc);
    this.type = type;
  }
}

class Ellipsis extends Expr {}

class Constant extends Expr {} // TODO

class Attribute extends Expr {
  constructor(sourceLoc, value, attr) { // TODO: ctx
    super(sourceLoc);
    this.value = value;
    this.attr = attr;
  }
}

class Subscript extends Expr {
  constructor(sourceLoc, slice) { // TODO: ctx
    super(sourceLoc);
    this.slice = slice;
  }
}

class Starred extends Expr {
  constructor(sourceLoc, value) { // TODO: context
    super(sourceLoc);
    this.value = value;
  }
}

class Name extends Expr {} //
class List extends Expr {}
class Tuple extends Expr {}

class Identifier extends AST {
  constructor(sourceLoc, value) {
    super(sourceLoc);
    this.value = value;
  }

  toString() {
    return this.value;
  }
}

class Keyword extends AST {
  constructor(sourceLoc, arg, value) {
    super(sourceLoc);
    this.arg = arg;
    this.value = value;
  }
}

class Slice extends AST {
  constructor(sourceLoc, lower, upper, step) {
    super(sourceLoc);
    this.lower = lower;
    this.upper = upper;
    this.step = step;
  }
}

class ExtSlice extends AST {
  constructor(sourceLoc, dims) {
    super(sourceLoc);
    this.dims = dims;
  }
}

class Index extends AST {
  constructor(sourceLoc, value) {
    super(sourceLoc);
    this.value = value;
  }
}

// TODO: more stuff goes here