AST.prototype.instrumented = function(state) {
  throw new Error('this method is abstract! ' + this.constructor.name);
};

Program.prototype.instrumented = function(state) {
  state.executionOrderCounters.push({count: 0});
  const execCounter = last(state.executionOrderCounters);
  const stmts = [];
  stmts.push(assign(id('__currentEnv__'), call(dot(id('R'), 'program'), [n(++execCounter.count), this.sourceLoc.toAST()])));
  stmts.push(assign(id(`__env_${state.envId++}__`), id('__currentEnv__')));
  stmts.push(assign(id(`__declEnv__`), id('__currentEnv__')));

  const instrumentedBody = this.body.map(stmt => stmt.instrumented(state));
  const lambdaDecls = state.lambdas.map(lambda => lambda.instrumented(state));

  stmts.push(...flatten(lambdaDecls));
  stmts.push(...flatten(instrumentedBody));

  state.executionOrderCounters.pop();
  return prog(stmts, this.sourceLoc);
};

// Literal
// ------

Num.prototype.instrumented = function(state) {
  return this;
};

List.prototype.instrumented = function(state) {
  return new List(this.sourceLoc, this.elts.map(elt => elt.instrumented(state)));
};

// Variables
// --------

Name.prototype.instrumented = function(state) {
  return this;
};

// Expressions
// ---------


BinOp.prototype.instrumented = function(state) {
  return new BinOp(this.sourceLoc, this.left.instrumented(state), this.op, this.right.instrumented(state));
};

Compare.prototype.instrumented = function(state) {
  return new Compare(this.sourceLoc, this.left.instrumented(state), this.ops, 
    this.comparators.map(comparator => comparator.instrumented(state)));
};

Call.prototype.instrumented = function(state) {
  if (this.keywords.length > 0) {
    throw new Error('keyword arguments not implemented yet');
  }
  const execCounter = last(state.executionOrderCounters);
  const elts = [];
  const receiver = this.func;
  const selector = this.func.toString();

  // R.memoize(<id>_func, receiver)
  elts.push(call(dot(id('R'), 'memoize'), [str(this.id + '_func'), receiver], []));
  // R.memoize(<id>_args, args)
  elts.push(call(dot(id('R'), 'memoize'), [str(this.id + '_args'), 
    ...this.args.map(arg => arg.instrumented(state))], []));
  // R.send(orderNum, this.sourceLoc, __currentEnv__, R.retrieve(<id>_func), selector, R.retrieve(<id>_args), None)
  // TODO: activationToken
  // TODO: keyword arguments in recorder
  elts.push(call(dot(id('R'), 'send'), [n(++execCounter.count), this.sourceLoc.toAST(), id('__currentEnv__'),
    call(dot(id('R'), 'retrieve'), [str(this.id + '_func')], []), str(selector), 
    call(dot(id('R'), 'retrieve'), [str(this.id + '_args')], []), none()], []));
  // R.receive(__currentEnv__, R.retrieve(<id>_func)(*R.retrieve(<id>_args)))
  elts.push(call(dot(id('R'), 'receive'), [
    id('__currentEnv__'), call(
      call(dot(id('R'), 'retrieve'), [str(this.id + '_func')], []), 
      [star(call(dot(id('R'), 'retrieve'), [str(this.id + '_args')], []))], [])], [], this.sourceLoc));

  return sub(tuple(elts), idx(n(3)));
}

IfExp.prototype.instrumented = function(state) {
  return new IfExp(this.sourceLoc, 
    this.test.instrumented(state), this.body.instrumented(state), this.orelse.instrumented(state));
};

// Subscripting
// ----------

// Comprehensions
// ------------

// Statements
// ---------

Assign.prototype.instrumented = function(state) {
  const ans = [];
  ans.push(exprS(call(dot(id('R'), 'memoize'), [str(this.id + '_value'), this.value.instrumented(state)], [])))
  this.targets.forEach(target => ans.push(...destructure(this.id, target, state)));
  return ans;
}

// Imports
// ------

ImportFrom.prototype.instrumented = function(state) {
  console.warn('TODO');
  return this;
};

// Control Flow
// ----------

For.prototype.instrumented = function(state) {
  const ans = [];
  const prevEnvId = state.envId - 1;
  const execCounter = last(state.executionOrderCounters);
  // __currentEnv__ = R.enterScope(..., __currentEnv__)
  ans.push(assign([id('__currentEnv__')], call(dot(id('R'), 'enterScope'), [
    n(++execCounter.count), this.sourceLoc.toAST(), id('__currentEnv__')
  ], [])));
  // __env_<id>__ = __currentEnv__
  ans.push(assign(id(`__env_${state.envId++}__`), id('__currentEnv__')));
  // instrumented for loop
  ans.push(for_(this.target.instrumented(state), this.iter.instrumented(state), 
    flatten(this.body.map(stmt => stmt.instrumented(state))), 
    this.orelse ? flatten(this.orelse.map(stmt => stmt.instrumented(state))) : null), this.sourceLoc);
  // R.leaveScope(__currentEnv__)
  ans.push(exprS(call(dot(id('R'), 'leaveScope'), [id('__currentEnv__')], [])));
  // __currentEnv__ = __env_<prevEnvId>__
  ans.push(assign([id('__currentEnv__')], id(`__env_${prevEnvId}__`)));
  return ans;
}

// Function and Class Definitions
// -----------------------

FunctionDef.prototype.instrumented = function(state) {
  state.executionOrderCounters.push({count: 0});
  const body = [];
  //   __currentEnv__ = R.mkEnv(..., parentEnv, fnname, 'fnname', [args])
  body.push(assign(id('__currentEnv__'), call(dot(id('R'), 'mkEnv'), [
    this.sourceLoc.toAST(), call(dot(id('R'), 'getParentEnv'), [id(this.name)]),
    id(this.name), str(this.name), this.args !== null ? this.args.toList() : []
  ])));
  //   __env_<id>__ = __currentEnv__
  body.push(assign(id(`__env_${state.envId++}__`), id('__currentEnv__')));
  //   __declEnv__ = __currentEnv__
  body.push(assign(id('__declEnv__'), id('__currentEnv__')));
  if (this.args !== null) {
    body.push(...this.args.instrumented(state));
  }
  body.push(...flatten(this.body.map(stmt => stmt.instrumented(state))));

  state.executionOrderCounters.pop();
  return [
    def(this.name, this.args, body, this.decoratorList, this.returns, this.sourceLoc),
    exprS(call(dot(id('R'), 'parentEnv'), [id(this.name), id('__currentEnv__')]))
  ];
};

Lambda.prototype.instrumented = function(state) {
  const lambdaId = state.lambdaId++;
  const fn = def(`__lambda_${lambdaId}__`, this.args, [ret(this.body, this.body.sourceLoc)], [], null, this.sourceLoc);
  state.lambdas.push(fn);
  return id(`__lambda_${lambdaId}__`);
};

Return.prototype.instrumented = function(state) {
  const execCounter = last(state.executionOrderCounters);
  // return R.localReturn(..., __currentEnv__, value)
  return ret(call(dot(id('R'), 'localReturn'), [
    n(++execCounter.count), this.sourceLoc.toAST(), id('__currentEnv__'),
    this.value.instrumented(state)
  ]), this.sourceLoc);
}

Arguments.prototype.instrumented = function(state) {
  const stmts = [];
  const execCounter = last(state.executionOrderCounters);
  this.args.forEach(arg => {
    // R.assignVar(..., __currentEnv__, __declEnv__, argname, arg);
    stmts.push(exprS(call(dot(id('R'), 'assignVar'), [
      n(++execCounter.count), arg.sourceLoc.toAST() /*TODO: full param source*/,
      id('__currentEnv__'), id('__declEnv__'), str(arg.toString()), arg
    ])));
  });
  if (this.vararg !== null) {
    // R.assignVar(..., varargname, vararg)
    throw new Error('TODO: varargs');
  }
  return stmts;
};

// -------------
// -------------

// accessors
// subscript -> [...]
// 
function destructure(stmtId, target, state, accessPath = []) {
  const right = accessValue(stmtId, accessPath); // TODO
  const execCounter = last(state.executionOrderCounters);
  switch (target.constructor.name) {
    case 'Name':
      // id = R.assignVar(..., env, declEnv, 'id', right)
      return [assign(target, call(dot(id('R'), 'assignVar'), 
        [n(++execCounter.count), target.sourceLoc.toAST(), id('__currentEnv__'), 
          id('__declEnv__'), str(target.toString()), right], []))];
    case 'Tuple':
    case 'List':
      throw new Error('TODO: implement this');
    case 'Attribute':
      // __obj__ = value
      // __obj__.attr = R.assignInstVar(..., env, value, 'attr', right)
      return [
        assign([id('__obj__')], target.value),
        assign(dot(id('__obj__'), target.attr), call(dot(id('R'), 'assignInstVar'),
          [n(++execCounter.count), target.sourceLoc.toAST(), id('__currentEnv__'),
            id('__obj__'), target.attr, right]))
      ];
    case 'Subscript':
      throw new Error('TODO: implement this');
    case 'Starred':
      throw new Error('TODO: implement this'); 
  }
}

function accessValue(stmtId, accessPath) { // TODO: implement this. it's supposed to build up an accessor based on the path
  return call(dot(id('R'), 'retrieve'), [str(stmtId + '_value')]);
}