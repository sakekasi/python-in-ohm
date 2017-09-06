/**
 * what does an AST need?
 * 
 */
class AST { //
  constructor(sourceLoc) {
    this.id = AST.id++;
    this.sourceLoc = sourceLoc;
  }

  toString() {
    throw new Error('this method is abstract! ' + this.constructor.name);
  }
}
AST.id = 0;

class Program extends AST { //
  constructor(sourceLoc, body) {
    super(sourceLoc);
    this.body = body;
  }

  toString(indentation = 0) {
    return this.body
      .map(stmt => stmt.toString(indentation))
      .join('');
  }
}

class Stmt extends AST {} //

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
    ans += this.args.toString() + ' ) '
    if (this.returns.length > 0) {
      ans += '-> ' + this.returns.toString();
    }
    ans += ':\n'
    ans += this.body.map(stmt => stmt.toString(indentation + 2)).join('');
    return ans;
  }
} 

class AsyncFunctionDef extends Stmt {}

class ClassDef extends Stmt {}
class Return extends Stmt {}

class Delete extends Stmt {}
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
}

class Global extends Stmt {}
class Nonlocal extends Stmt {}

class ExprStmt extends Stmt {
  constructor(sourceLoc, expr) {
    super(sourceLoc);
    this.expr = expr;
  }

  toString(indentation = 0) {
    return spaces(indentation) + this.expr.toString() + '\n';
  }
}

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

  toString() {
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

class Lambda extends Expr {
  constructor(sourceLoc, args, body) {
    super(sourceLoc);
    this.args = args;
    this.body = body;
  }

  toString() {
    return 'lambda ' + this.args.toString() + ': ' + this.body.toString();
  }
}

class IfExp extends Expr {
  constructor(sourceLoc, test, body, orelse) {
    super(sourceLoc);
    this.test = test;
    this.body = body;
    this.orelse = orelse;
  }
}

class Dict extends Expr {
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
}

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
    if (this.keywords === undefined) debugger;
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

  toString() {
    return this.value; // TODO: value shouldn't require quotes in value
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

  toString() {
    return this.type;
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

  toString() {
    return this.value.toString() + ' . ' + this.attr.toString();
  }
}

class Subscript extends Expr {
  constructor(sourceLoc, value, slice) { // TODO: ctx
    super(sourceLoc);
    this.value = value;
    this.slice = slice;
  }

  toString() {
    return this.value.toString() + ' [ ' + this.slice.toString() + ' ] ';
  }
}

class Starred extends Expr {
  constructor(sourceLoc, value) { // TODO: context
    super(sourceLoc);
    this.value = value;
  }

  toString() {
    return '* ( ' + this.value.toString()  + ' )'
  }
}

class Name extends Expr {} //

class List extends Expr {
  constructor(sourceLoc, elts) {
    super(sourceLoc);
    this.elts = elts;
  }

  toString() {
    return '[ ' + this.elts.map(elt => elt.toString()).join(', ') + ' ]';
  }
}

class Tuple extends Expr {
  constructor(sourceLoc, elts) { // TODO: ctx
    super(sourceLoc);
    this.elts = elts;
  }

  toString() {
    return '( ' + this.elts.map(elt => elt.toString()).join(', ') + ' )';
  }
}

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

  toString() {
    return this.value.toString();
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
}

class Arguments extends AST {
  constructor(sourceLoc, args, vararg, kwonlyargs, kwarg, defaults, kw_defaults) {
    super(sourceLoc);
    
    this.args = args;
    this.vararg = vararg;
    this.kwonlyargs = kwonlyargs;
    this.kwarg = kwarg;
    this.defaults = defaults;
    this.kw_defaults = kw_defaults;
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
      const default_ =  this.kw_defaults[idx];
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
}

// TODO: more stuff goes here