AST.prototype.instrumented = function(state) {
  throw new Error('this method is abstract! ' + this.constructor.name);
};

Program.prototype.instrumented = function(state) {
  const parent = state.parent;
  state.parents.push(this);

  state.pushExecutionOrderCounter();
  const stmts = [];
  stmts.push(assign(id('__currentEnv__'), call(dot(id('R'), 'program'), [
    n(state.nextOrderNum()), this.sourceLoc.toAST()
  ])));
  stmts.push(assign(id(`__env_${this.id}__`), id('__currentEnv__')));
  stmts.push(assign(id(`__declEnv__`), id('__currentEnv__')));

  const instrumentedBody = this.body.map(stmt => stmt.instrumented(state));
  const lambdaDecls = state.lambdas.map(lambda => lambda.instrumented(state));

  stmts.push(...flatten(lambdaDecls));
  stmts.push(...flatten(instrumentedBody));

  state.popExecutionOrderCounter();

  const defn = def('runCode', null, stmts, [], null, null)
  state.parents.pop();
  return program([defn], this.sourceLoc, this.id);
};

// Literal
// ------

Num.prototype.instrumented = function(state) {
  const parent = state.parent;
  state.parents.push(this);

  state.parents.pop();
  return this;
};

Str.prototype.instrumented = function(state) {
  const parent = state.parent;
  state.parents.push(this);

  state.parents.pop();
  return this;
}

List.prototype.instrumented = function(state) {
  const parent = state.parent;
  state.parents.push(this);

  state.parents.pop();
  return new List(this.sourceLoc, this.id, this.elts.map(elt => elt.instrumented(state)));
};

Tuple.prototype.instrumented = function(state) {
  return new Tuple(this.sourceLoc, this.id, this.elts.map(elt => elt.instrumented(state)), this.ctx);
};

// Variables
// --------

Name.prototype.instrumented = function(state) {
  const parent = state.parent;
  state.parents.push(this);

  state.parents.pop();
  return this;
};

// Expressions
// ---------

UnaryOp.prototype.instrumented = function(state) {
  return new UnaryOp(this.sourceLoc, this.id, this.op, this.expr.instrumented(state));
}

BinOp.prototype.instrumented = function(state) {
  const parent = state.parent;
  state.parents.push(this);

  state.parents.pop();
  return new BinOp(this.sourceLoc, this.id, this.left.instrumented(state), this.op, this.right.instrumented(state));
};

// TODO: BoolOp

Compare.prototype.instrumented = function(state) {
  const parent = state.parent;
  state.parents.push(this);

  state.parents.pop();
  return new Compare(this.sourceLoc, this.id, this.left.instrumented(state), this.ops, 
    this.comparators.map(comparator => comparator.instrumented(state)));
};

Call.prototype.instrumented = function(state) {
  const parent = state.parent;
  state.parents.push(this);

  if (this.keywords.length > 0) {
    throw new Error('keyword arguments not implemented yet');
  }
  const elts = [];
  const receiver = this.func;
  const selector = this.func.toString();

  // R.memoize(<id>_func, receiver)
  elts.push(call(dot(id('R'), 'memoize'), [str(this.id + '_func'), receiver], []));
  // R.memoize(<id>_args, args)
  elts.push(call(dot(id('R'), 'memoize'), [str(this.id + '_args'), 
    list(this.args.map(arg => arg.instrumented(state)))], []));
  // R.send(orderNum, this.sourceLoc, __currentEnv__, R.retrieve(<id>_func), selector, R.retrieve(<id>_args), this.id)
  // TODO: keyword arguments in recorder
  elts.push(call(dot(id('R'), 'send'), [n(state.nextOrderNum()), this.sourceLoc.toAST(), id('__currentEnv__'),
    call(dot(id('R'), 'retrieve'), [str(this.id + '_func')], []), str(selector), 
    call(dot(id('R'), 'retrieve'), [str(this.id + '_args')], []), n(this.id)], []));
  // R.receive(__currentEnv__, R.retrieve(<id>_func)(*R.retrieve(<id>_args)))
  elts.push(call(dot(id('R'), 'receive'), [
    id('__currentEnv__'), call(
      call(dot(id('R'), 'retrieve'), [str(this.id + '_func')], []), 
      [star(call(dot(id('R'), 'retrieve'), [str(this.id + '_args')], []))], [])], [], this.sourceLoc, this.id));

      state.parents.pop();
  return sub(tuple(elts), index(n(3)));
}

Keyword.prototype.instrumented = function(state) {
  return new Keyword(this.sourceLoc, this.id, this.arg, this.value.instrumented(state));
};

IfExp.prototype.instrumented = function(state) {
  const parent = state.parent;
  state.parents.push(this);

  state.parents.pop();
  return new IfExp(this.sourceLoc, this.id,  
    this.test.instrumented(state), this.body.instrumented(state), this.orelse.instrumented(state));
};

Attribute.prototype.instrumented = function(state) {
  return new Attribute(this.sourceLoc, this.id, this.value.instrumented(state), this.attr, this.ctx);
};

// Subscripting
// ----------

Subscript.prototype.instrumented = function(state) {
  return new Subscript(
    this.sourceLoc, this.id, 
    this.value.instrumented(state), this.slice.instrumented(state), 
    this.ctx);
};

Index.prototype.instrumented = function(state) {
  return new Index(this.sourceLoc, this.id, this.value.instrumented(state));
};

Slice.prototype.instrumented = function(state) {
  return new Slice(this.sourceLoc, this.id,
    this.lower === null ? null : this.lower.instrumented(state),
    this.upper === null ? null : this.upper.instrumented(state),
    this.step === null ? null : this.step.instrumented(state)
  );
};

// TODO: ExtSlice

// Comprehensions
// ------------

// TODO: ListComp
// TODO: SetComp
// TODO: DictComp
// TODO: GeneratorExp
// TODO: Comprehension

// Statements
// ---------

Assign.prototype.instrumented = function(state) {
  const parent = state.parent;
  state.parents.push(this);

  const ans = [];
  ans.push(exprS(call(dot(id('R'), 'memoize'), [str(this.id + '_value'), this.value.instrumented(state)], [])))
  this.targets.forEach(target => ans.push(...destructure(this.id, target, state)));
  state.parents.pop();
  return ans;
}

// TODO: AnnAssign

// with AugTargets, no destructuring is necessary
AugAssign.prototype.instrumented = function(state) {
  const parent = state.parent;
  state.parents.push(this);

  let augValue;
  switch (this.target.constructor.name) {
    case 'Name':
      // target = R.assignVar(..., target.toString(), target op value)
      augValue = new BinOp(null, null, this.target, this.op.slice(0, -1), this.value.instrumented(state));
      return assign(this.target, call(dot(id('R'), 'assignVar'), [
        n(state.nextOrderNum()), this.sourceLoc.toAST(), id('__currentEnv__'), id('__declEnv__'),
        str(this.target.toString()), augValue
      ]));
    case 'Attribute':
      // TODO
      augValue = new BinOp(null, null, 
        dot(call(dot(id('R'), 'retrieve'), [str(`${this.target.id}_obj`)]), this.target.attr), this.op.slice(0, -1), 
        this.value.instrumented(state));
      return [
        // R.memoize(<id>_obj, value)
        exprS(call(dot(id('R'), 'memoize'), [
          str(`${this.target.id}_obj`), this.target.value
        ])),
        // R.retrieve(<id>_obj).attr = R.assignInstVar(..., env, R.retrieve(<id>_obj), 'attr', R.retrieve(<id>_obj).attr op value)
        assign(dot(call(dot(id('R'), 'retrieve'), [str(`${this.target.id}_obj`)]), this.target.attr), 
          call(dot(id('R'), 'assignInstVar'), [
            n(state.nextOrderNum()), this.target.sourceLoc.toAST(), id('__currentEnv__'),
            call(dot(id('R'), 'retrieve'), [str(`${this.target.id}_obj`)]), str(this.target.attr), augValue
          ]))
      ];
    case 'Subscript':
    // func().attr += 5
    // f = func()
    // f.attr = f.attr + 5
      throw new Error('TODO: instvarassign goes here')
  }
  
  ans.push(exprS(call(dot(id('R'), 'memoize'), [str(this.id + '_value'), this.value.instrumented(state)], [])))
  ans.push()
  this.targets.forEach(target => ans.push(...destructure(this.id, target, state)));
  state.parents.pop();
  return ans;
};

// TODO: Raise
// TODO: Assert
// TODO: Delete

Pass.prototype.instrumented = function(state) {
  return this;
}

ExprStmt.prototype.instrumented = function(state) {
  const parent = state.parent;
  state.parents.push(this);

  const ans = new ExprStmt(this.sourceLoc, this.id, this.expr.instrumented(state));
  state.parents.pop();
  return ans;
};

// TODO: ExprStmt

// Imports
// ------

// TODO: Import

ImportFrom.prototype.instrumented = function(state) {
  const parent = state.parent;
  state.parents.push(this);

  console.warn('TODO');
  state.parents.pop();
  return this;
};

// TODO: Alias

// Control Flow
// ----------

If.prototype.instrumented = function(state) {
  const parent = state.parent;
  state.parents.push(this);

  const newTests = [];
  const newBodies = [];
  this.tests.forEach((test, idx) => {
    const body = this.bodies[idx];
    newTests.push(test.instrumented(state));
    newBodies.push(flatten(body.map(stmt => stmt.instrumented(state))));
  });
  const newOrElse = this.orelse === null ? null : flatten(this.orelse.map(stmt => stmt.instrumented(state)));
  state.parents.pop();
  return new If(this.sourceLoc, this.id, newTests, newBodies, newOrElse);
}

For.prototype.instrumented = function(state) {
  const parent = state.parent;
  state.parents.push(this);

  const ans = [];
  const prevEnvId = parent.id;

  // R.memoize(<id>_iter, iter)
  ans.push(exprS(call(dot(id('R'), 'memoize'), [str(`${this.id}_iter`), this.iter.instrumented(state)])));
  // __currentEnv__ = R.enterScope(..., __currentEnv__, this.id)
  ans.push(assign([id('__currentEnv__')], call(dot(id('R'), 'enterScope'), [
    n(state.nextOrderNum()), this.sourceLoc.toAST(), id('__currentEnv__'), n(this.id)
  ], [])));
  // __env_<id>_loop__ = __currentEnv__
  ans.push(assign(id(`__env_${this.id}_loop__`), id('__currentEnv__')));
  // TODO
  // __iteration_<id>__ = 0
  ans.push(assign(id(`__iteration_${this.id}__`), n(0)))

  const instrumentedForBody = [];
  // __currentEnv__ = R.enterScope(..., __currentEnv__, __iteration_id__)
  instrumentedForBody.push(assign(id('__currentEnv__'), call(dot(id('R'), 'enterScope'), [
    n(state.nextOrderNum()), this.sourceLoc.toAST(), id('__currentEnv__'), id(`__iteration_${this.id}__`)
  ], [])));
  // __env_<id>__ = __currentEnv__
  instrumentedForBody.push(assign(id(`__env_${this.id}__`), id('__currentEnv__')));
  // <target> = <target>
  instrumentedForBody.push(
    assign(this.target, this.target, this.target.sourceLoc, this.target.id)
      .instrumented(state)
  );
  instrumentedForBody.push(...this.body.map(stmt => stmt.instrumented(state)));
  // R.leaveScope(__currentEnv__)
  instrumentedForBody.push(exprS(call(dot(id('R'), 'leaveScope'), [id('__currentEnv__')], [])));
  // __currentEnv__ = __env_<id>_loop__
  instrumentedForBody.push(assign([id('__currentEnv__')], id(`__env_${this.id}_loop__`)));
  // __iteration_<id>__ = __iteration_<id>__ + 1
  instrumentedForBody.push(assign(id(`__iteration_${this.id}__`), plus(id(`__iteration_${this.id}__`), n(1))));

  // instrumented for loop
  ans.push(for_(this.target.instrumented(state), call(dot(id('R'), 'retrieve'), [str(`${this.id}_iter`)]), 
    flatten(instrumentedForBody), 
    this.orelse ? flatten(this.orelse.map(stmt => stmt.instrumented(state))) : null, this.sourceLoc, this.id));
  // R.leaveScope(__currentEnv__)
  ans.push(exprS(call(dot(id('R'), 'leaveScope'), [id('__currentEnv__')], [])));
  // __currentEnv__ = __env_<prevEnvId>__
  ans.push(assign([id('__currentEnv__')], id(`__env_${prevEnvId}__`)));
  state.parents.pop();
  return ans;
}

While.prototype.instrumented = function(state) {
  const parent = state.parent;
  state.parents.push(this);

  const ans = [];
  const prevEnvId = parent.id;
  // __currentEnv__ = R.enterScope(..., __currentEnv__, this.id)
  ans.push(assign([id('__currentEnv__')], call(dot(id('R'), 'enterScope'), [
    n(state.nextOrderNum()), this.sourceLoc.toAST(), id('__currentEnv__'), n(this.id)
  ], [])));
  // __env_<id>_loop__ = __currentEnv__
  ans.push(assign(id(`__env_${this.id}_loop__`), id('__currentEnv__')));
  // __iteration_<id>__ = 0
  ans.push(assign(id(`__iteration_${this.id}__`), n(0)))

  const instrumentedWhileBody = [];
  // __currentEnv__ = R.enterScope(..., __currentEnv__, __iteration_<id>__)
  instrumentedWhileBody.push(assign(id('__currentEnv__'), call(dot(id('R'), 'enterScope'), [
    n(state.nextOrderNum()), this.sourceLoc.toAST(), id('__currentEnv__'), id(`__iteration_${this.id}__`)
  ], [])));
  // __env_<id>__ = __currentEnv__
  instrumentedWhileBody.push(assign(id(`__env_${this.id}__`), id('__currentEnv__')));
  // instrumented while body
  instrumentedWhileBody.push(...flatten(this.body.map(stmt => stmt.instrumented(state))));
  
  // R.leaveScope(__currentEnv__)
  instrumentedWhileBody.push(exprS(call(dot(id('R'), 'leaveScope'), [id('__currentEnv__')], [])));
  // __currentEnv__ = __env_<id>_loop__
  instrumentedWhileBody.push(assign([id('__currentEnv__')], id(`__env_${this.id}_loop__`)));
  // __iteration_<id>__ = __iteration_<id>__ + 1
  instrumentedWhileBody.push(assign(id(`__iteration_${this.id}__`), plus(id(`__iteration_${this.id}__`), n(1))));

  // instrumented while loop
  ans.push(while_(this.test.instrumented(state), 
    instrumentedWhileBody,
    this.orelse ? flatten(this.orelse.map(stmt => stmt.instrumented(state))) : null, this.sourceLoc, this.id
  ));
  // R.leaveScope(__currentEnv__)
  ans.push(exprS(call(dot(id('R'), 'leaveScope'), [id('__currentEnv__')], [])));
  // __currentEnv__ = __env_<prevEnvId>__
  ans.push(assign([id('__currentEnv__')], id(`__env_${prevEnvId}__`)));
  state.parents.pop();
  return ans;
}

// TODO: Break
// TODO: Continue
// TODO: ExceptHandler
// TODO: WithItem

// Function and Class Definitions
// -----------------------

FunctionDef.prototype.instrumented = function(state) {
  const parent = state.parent;
  state.parents.push(this);
  const isMethod = parent instanceof ClassDef;
  const fnName = isMethod ? dot(id(parent.name), this.name) : id(this.name);

  state.pushExecutionOrderCounter();
  const body = [];
  //   __currentEnv__ = R.mkEnv(..., parentEnv, fnname, 'fnname', [args])
  body.push(assign(id('__currentEnv__'), call(dot(id('R'), 'mkEnv'), [
    this.sourceLoc.toAST(), call(dot(id('R'), 'getParentEnv'), [fnName]),
    fnName, str(this.name), this.args !== null ? this.args.toList() : list([])
  ])));
  //   __env_<id>__ = __currentEnv__
  body.push(assign(id(`__env_${this.id}__`), id('__currentEnv__')));
  //   __declEnv__ = __currentEnv__
  body.push(assign(id('__declEnv__'), id('__currentEnv__')));
  if (this.args !== null) {
    body.push(...this.args.instrumented(state));
  }
  body.push(...flatten(this.body.map(stmt => stmt.instrumented(state))));

  state.popExecutionOrderCounter();
  state.parents.pop();
  return [
    def(this.name, this.args, body, this.decoratorList, this.returns, this.sourceLoc, this.id),
    exprS(call(dot(id('R'), 'parentEnv'), [id(this.name), id('__currentEnv__')]))
  ];
};

Lambda.prototype.instrumented = function(state) {
  const parent = state.parent;
  state.parents.push(this);

  const lambdaId = state.lambdaId++;
  const fn = def(`__lambda_${lambdaId}__`, this.args, [ret(this.body, this.body.sourceLoc)], [], null, this.sourceLoc, this.id);
  state.lambdas.push(fn);
  state.parents.pop();
  return id(`__lambda_${lambdaId}__`);
};

Arguments.prototype.instrumented = function(state) {
  const parent = state.parent;
  state.parents.push(this);

  const stmts = [];
  const execCounter = last(state.executionOrderCounters);
  this.args.forEach(arg => {
    // R.assignVar(..., __currentEnv__, __declEnv__, argname, arg);
    stmts.push(exprS(call(dot(id('R'), 'assignVar'), [
      n(state.nextOrderNum()), arg.sourceLoc.toAST() /*TODO: full param source*/,
      id('__currentEnv__'), id('__declEnv__'), str(arg.toString()), arg
    ])));
  });
  if (this.vararg !== null) {
    // R.assignVar(..., varargname, vararg)
    throw new Error('TODO: varargs');
  }
  state.parents.pop();
  return stmts;
};

Return.prototype.instrumented = function(state) {
  const parent = state.parent;
  state.parents.push(this);
  
  // return R.localReturn(..., __currentEnv__, value)
  const instrumentedValue = this.value.instrumented(state);
  state.parents.pop();
  return ret(call(dot(id('R'), 'localReturn'), [
    n(state.nextOrderNum()), this.sourceLoc.toAST(), id('__currentEnv__'),
    instrumentedValue
  ]), this.sourceLoc, this.id);
};

// TODO: Yield
// TODO: YieldFrom
// TODO: Global
// TODO: Nonlocal

ClassDef.prototype.instrumented = function(state) {
  console.assert(!this.body.some(stmt => stmt instanceof FunctionDef && stmt.name === '__new__'));

  const parent = state.parent;
  state.parents.push(this);
  const prevEnvId = parent.id;

  state.pushExecutionOrderCounter();
  const body = [];

  /**
   * def __new__(typ, *args, **kwargs):
   *   obj = object.__new__(typ)
   *   programOrSendEvent = R.currentProgramOrSendEvent
   *   R.instantiate(programOrSendEvent.orderNum, programOrSendEvent.sourceLoc, programOrSendEvent.env, className, args, kwargs, obj)
   *   return obj
   */
  body.push(def(`__new__`, args([id('typ'), star(id('args')), doubleStar(id('kwargs'))]), [
    // obj = object.__new__(typ)
    assign(id('obj'), call(dot(id('object'), '__new__'), [id('typ')])),
    // programOrSendEvent = R.currentProgramOrSendEvent
    assign(id('programOrSendEvent'), dot(id('R'), 'currentProgramOrSendEvent')),
    // R.instantiate(orderNum, sourceLoc, env, className, args, kwargs, obj)
    exprS(call(dot(id('R'), 'instantiate'), [
      dot(id('programOrSendEvent'), 'orderNum'), dot(id('programOrSendEvent'), 'sourceLoc'), 
      dot(id('programOrSendEvent'), 'env'), id(this.name), id('args'), /*id('kwargs'),*/ id('obj')
    ])),
    // return obj
    ret(id('obj'))
  ], []));
  // rest of body
  body.push(...flatten(this.body.map(stmt => stmt.instrumented(state))));

  state.popExecutionOrderCounter();
  state.parents.pop();

  const ans = [];
  // __currentEnv__ = R.enterScope(...)
  // TODO: fix ordering
  ans.push(assign(id('__currentEnv__'), call(dot(id('R'), 'enterScope'), [
    n(state.nextOrderNum()), this.sourceLoc.toAST(), id('__currentEnv__'), n(this.id)
  ])));
  // __env_<id>__ = __currentEnv__
  ans.push(assign(id(`__env_${this.id}__`), id('__currentEnv__')));
  // __declEnv__ = __currentEnv__
  ans.push(assign(id(`__declEnv__`), id('__currentEnv__')));
  // classDef
  ans.push(clsDef(this.name, this.bases, this.keywords, body, this.decoratorList, this.sourceLoc, this.id));
  // R.leaveScope(__currentEnv__)
  ans.push(exprS(call(dot(id('R'), 'leaveScope'), [id('__currentEnv__')])))
  // __currentEnv__ = __env_<prevEnvId>__
  ans.push(assign(id('__currentEnv__'), id(`__env_${prevEnvId}__`)));
  // __declEnv__ = __currentEnv__
  ans.push(assign(id('__declEnv__'), id('__currentEnv__')));
  
  return ans;
};

// Async and Await
// --------------

// -------------
// -------------

// accessors
// subscript -> [...]
// 
function destructure(stmtId, target, state, accessPath = []) {
  const right = accessValue(stmtId, accessPath); // TODO
  switch (target.constructor.name) {
    case 'Name':
    // id = R.assignVar(..., env, declEnv, 'id', right)
    return [assign(target, call(dot(id('R'), 'assignVar'), 
    [n(state.nextOrderNum()), target.sourceLoc.toAST(), id('__currentEnv__'), 
    id('__declEnv__'), str(target.toString()), right], []))];
    case 'Tuple':
    case 'List':
      return flatten(target.elts.map((elt, idx) => {
        if (elt instanceof Starred) {
          return destructure(stmtId, elt, state, accessPath.concat(slice(idx)));
        }
        return destructure(stmtId, elt, state, accessPath.concat(index(n(idx))));
      }));
    case 'Attribute':
      return [
        // R.memoize(<id>_obj, value)
        exprS(call(dot(id('R'), 'memoize'), [
          str(`${target.id}_obj`), target.value
        ])),
        // R.retrieve(<id>_obj).attr = R.assignInstVar(..., env, value, 'attr', right)
        assign(dot(call(dot(id('R'), 'retrieve'), [str(`${target.id}_obj`)]), target.attr), 
          call(dot(id('R'), 'assignInstVar'), [
            n(state.nextOrderNum()), target.sourceLoc.toAST(), id('__currentEnv__'),
            call(dot(id('R'), 'retrieve'), [str(`${target.id}_obj`)]), str(target.attr), right
          ]))
      ];
    case 'Subscript':
      throw new Error('TODO: implement this');
    case 'Starred':
      throw new Error('TODO: implement this'); 
  }
}

function accessValue(stmtId, accessPath) { // TODO: implement this. it's supposed to build up an accessor based on the path
  let valueAccessor = call(dot(id('R'), 'retrieve'), [str(stmtId + '_value')]);
  accessPath.forEach(accessor => {
    if (typeof accessor === 'string') {
      valueAccessor = dot(valueAccessor, accessor);
    } else if (accessor instanceof Slice || accessor instanceof Index || accessor instanceof ExtSlice) {
      valueAccessor = sub(valueAccessor, accessor);
    }
  });
  return valueAccessor;
}