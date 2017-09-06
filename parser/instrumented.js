AST.prototype.instrumented = function(state) {
  throw new Error('this method is abstract! ' + this.constructor.name);
};

Program.prototype.instrumented = function(state) {
  state.executionOrderCounters.push({count: 0});
  const execCounter = last(state.executionOrderCounters);
  const ans = prog([
    def('runCode', [], [
      assign(id('__currentEnv__'), 
        call(dot(id('R'), 'program'), [n(++execCounter.count), this.sourceLoc.toAST()], [])),
      assign(id(`__env_${state.envId++}__`), id('__currentEnv__')),
      assign(id(`__declEnv__`), id('__currentEnv__')),
      ...flatten(this.body.map(stmt => {
        const ans = stmt.instrumented(state);
        if (ans === undefined) debugger;
        return ans;
      }))
    ], [], [])
  ], this.sourceLoc);
  state.executionOrderCounters.pop();
  return ans;
};

Assign.prototype.instrumented = function(state) {
  const ans = [];
  ans.push(exprS(call(dot(id('R'), 'memoize'), [str(this.id + '_value'), this.value.instrumented(state)], [])))
  this.targets.forEach(target => ans.push(...destructure(this.id, target, state)));
  return ans;
}

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
    this.orelse ? flatten(this.orelse.map(stmt => stmt.instrumented(state))) : null));
  // R.leaveScope(__currentEnv__)
  ans.push(exprS(call(dot(id('R'), 'leaveScope'), [id('__currentEnv__')], [])));
  // __currentEnv__ = __env_<prevEnvId>__
  ans.push(assign([id('__currentEnv__')], id(`__env_${prevEnvId}__`)));
  return ans;
}

Call.prototype.instrumented = function(state) {
  if (this.keywords.length > 0) {
    throw new Error('keyword arguments not implemented yet');
  }
  const execCounter = last(state.executionOrderCounters);
  const elts = [];
  let receiver, selector;
  if (this.func instanceof Attribute) { // bar.foo() -> R.send(..., bar, 'foo', ...)
    receiver = this.func.value;
    selector = this.func.attr;
  } else { // foo() -> R.send(..., foo, '__call__', ...)
    receiver = this.func;
    selector = '__call__';
  }

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
  // R.receive(__currentEnv__, R.retrieve(<id>_func).selector(*R.retrieve(<id>_args)))
  elts.push(call(dot(id('R'), 'receive'), [
    id('__currentEnv__'), call(
      dot( call(dot(id('R'), 'retrieve'), [str(this.id + '_func')], []), selector), 
      [star(call(dot(id('R'), 'retrieve'), [str(this.id + '_args')], []))], [])], []));

  return sub(tuple(elts), idx(n(3)));
}

Lambda.prototype.instrumented = function(state) {
  console.warn('TODO');
  return this;
};

ImportFrom.prototype.instrumented = function(state) {
  console.warn('TODO');
  return this;
};

List.prototype.instrumented = function(state) {
  return new List(this.sourceLoc, this.elts.map(elt => elt.instrumented(state)));
};

BinOp.prototype.instrumented = function(state) {
  return new BinOp(this.sourceLoc, this.left.instrumented(state), this.op, this.right.instrumented(state));
};

Identifier.prototype.instrumented = function(state) {
  return this;
};

Num.prototype.instrumented = function(state) {
  return this;
};

// accessors
// subscript -> [...]
// 
function destructure(stmtId, target, state, accessPath = []) {
  const right = accessValue(stmtId, accessPath); // TODO
  const execCounter = last(state.executionOrderCounters);
  switch (target.constructor.name) {
    case 'Identifier':
      // id = R.assignVar(..., env, declEnv, 'id', right)
      return [assign(target, call(dot(id('R'), 'assignVar'), 
        [n(++execCounter.count), target.sourceLoc.toAST(), id('__currentEnv__'), 
          id('__declEnv__'), str(target.value), right], []))];
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