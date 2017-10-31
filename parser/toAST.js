semantics.addOperation('toAST(sourceMap, idContext)', {
  Program(newlinesAndStmts, _) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    if (sourceMap === undefined) debugger;
    const sourceLoc = this.sourceLoc(sourceMap);
    sourceLoc.startIdx = 0;
    return new Program(sourceLoc, this.id(idContext),
      flattenAndFilterNulls(newlinesAndStmts.toAST(sourceMap, idContext)));
  },

  Stmt_simple(stmts, _){
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    return stmts.toAST(sourceMap, idContext);
  },

  SimpleStmt_assign(targetListCsts, _eq, valueCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const targets = targetListCsts.toAST(sourceMap, idContext)
      .map((target, idx) => {
        const targetCst = targetListCsts.child(idx);
        if (target instanceof Array) {
          return tupleOrExpr(targetCst.sourceLoc(sourceMap), targetCst.id(idContext), target);
        } else {
          return target;
        }
      });
    const value = valueCst.toAST(sourceMap, idContext);
    return new Assign(this.sourceLoc(sourceMap), _eq.id(idContext), targets, value);
  },

  // SimpleStmt_annassign() {}, // TODO

  SimpleStmt_augassign(targetCst, augOpCst, valueCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const target = targetCst.toAST(sourceMap, idContext);
    const op = augOpCst.sourceString;
    const value = valueCst.ctorName === 'ExprList' ?
      valueCst.toAST(sourceMap, idContext)[0] : valueCst.toAST(sourceMap, idContext);

    return new AugAssign(this.sourceLoc(sourceMap), augOpCst.id(idContext), target, op, value);
  },

  SimpleStmt_pass(_pass) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;

    return new Pass(this.sourceLoc(sourceMap), _pass.id(idContext));
  },

  SimpleStmt_del(_del, targetList) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const targets = targetList.toAST(sourceMap, idContext);
    return new Delete(this.sourceLoc(sourceMap), _del.id(idContext), targets);
  },

  SimpleStmt_return(_ret, optExprList) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    let value;
    if (optExprList.numChildren === 1) {
      value = tupleOrExpr(optExprList.child(0).sourceLoc(sourceMap), 
        optExprList.child(0).id(idContext), 
        optExprList.child(0).toAST(sourceMap, idContext));
    } else {
      value = new NameConstant(null, 'None');
    }

    return new Return(this.sourceLoc(sourceMap), _ret.id(idContext), value);
  },

  SimpleStmt_expr(exprCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const expr = exprCst.toAST(sourceMap, idContext);
    return new ExprStmt(this.sourceLoc(sourceMap), this.id(idContext), expr);
  },

  // TODO: SimpleStmt_raise
  // TODO: SimpleStmt_break
  // TODO: SimpleStmt_continue
  // TODO: SimpleStmt_global
  // TODO: SimpleStmt_nonlocal

  // TODO: ImportStmt_normal

  ImportStmt_from(_import, moduleCst, __, nameCsts) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const [module, level] = moduleCst.toAST(sourceMap, idContext);
    const names = nameCsts.toAST(sourceMap, idContext);

    return new ImportFrom(this.sourceLoc(sourceMap), _import.id(idContext), module, names, level);
  },

  // TODO: ImportStmt_fromParen
  // TODO: ImportStmt_fromStar

  // TODO: ModuleAsName

  IdentifierAsName(identCst, _as, optName) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const name = identCst.sourceString;
    let asName;
    if (optName.numChildren > 0) {
      asName = optName.child(0).sourceString;
    } else {
      asName = null;
    }
    return new Alias(this.sourceLoc(sourceMap), _as.id(idContext), name, asName);
  },

  RelativeModule_named(dots, moduleCst) {
    return [moduleCst.sourceString, dots.numChildren];
  },

  // TODO: RelativeModule_unnamed

  CompoundStmt_if(_if, testCst, bodyCst, __, elifTestCsts, elifBodyCsts, ___, optElseBodyCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const test = testCst.toAST(sourceMap, idContext);
    const body = flattenAndFilterNulls(bodyCst.toAST(sourceMap, idContext));
    const elifTests = elifTestCsts.toAST(sourceMap, idContext);
    const elifBodies = elifBodyCsts.toAST(sourceMap, idContext).map(body => flattenAndFilterNulls(body));
    const orelse = optElseBodyCst.numChildren === 1 ? flattenAndFilterNulls(optElseBodyCst.toAST(sourceMap, idContext)[0]) : null;

    return new If(this.sourceLoc(sourceMap), _if.id(idContext),
      [test].concat(...elifTests), [body].concat(elifBodies), orelse);
  },

  CompoundStmt_while(_while, testCst, bodyCst, __, optElseCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const test = testCst.toAST(sourceMap, idContext);
    const body = flattenAndFilterNulls(bodyCst.toAST(sourceMap, idContext));
    const orelse = optElseCst.numChildren === 1 ? flattenAndFilterNulls(optElse.toAST(sourceMap, idContext)[0]) : null;

    return new While(this.sourceLoc(sourceMap), _while.id(idContext), test, body, orelse);
  },

  CompoundStmt_for(_for, targetCst, __, iterCst, bodyCst, ___, optElseCst ) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const target = tupleOrExpr(targetCst.sourceLoc(sourceMap), targetCst.id(idContext), targetCst.toAST(sourceMap, idContext));
    const iter = tupleOrExpr(iterCst.sourceLoc(sourceMap), iterCst.id(idContext), iterCst.toAST(sourceMap, idContext));
    const body = bodyCst.toAST(sourceMap, idContext);
    let orelse = optElseCst.toAST(sourceMap, idContext);
    if (orelse.length === 0) {
      orelse = null;
    } else {
      orelse = orelse[0];
    }
    return new For(this.sourceLoc(sourceMap), _for.id(idContext), target, iter, body, orelse);
  },

  // TODO: CompoundStmt_tryWithExcept
  // TODO: CompoundStmt_tryWithoutExcept
  // TODO: CompoundStmt_with

  CompoundStmt_funcdef(decoratorCsts, _def, nameCst, __, optParamCsts, ___, ____, optReturnCst, bodyCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const decorators = decoratorCsts.toAST(sourceMap, idContext);
    const name = nameCst.sourceString;
    const params = optParamCsts.numChildren === 1 ? optParamCsts.toAST(sourceMap, idContext)[0] : null;
    const returns = optReturnCst.numChildren === 1 ? optReturnCst.toAST(sourceMap, idContext)[0] : null;
    const body = bodyCst.toAST(sourceMap, idContext);

    return new FunctionDef(this.sourceLoc(sourceMap), _def.id(idContext), name, params, body, decorators, returns);
  },

  CompoundStmt_classdef(decoratorCsts, _class, nameCst, __, optArgCst, ___, bodyCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const decorators = decoratorCsts.toAST(sourceMap, idContext);
    const name = nameCst.sourceString;
    const args = optArgCst.children.length === 1 ? optArgCst.toAST(sourceMap, idContext)[0][0] : null;
    const body = bodyCst.toAST(sourceMap, idContext);
    
    if (args) {
      console.assert(!args.positional.some(arg => arg instanceof Starred));
      console.assert(!args.keyword.some(arg => arg instanceof Keyword && arg.arg === null));
    }


    return new ClassDef(this.sourceLoc(sourceMap), _class.id(idContext), name, 
      args? args.positional : [] , 
      args? args.keyword : [] , body, decorators);
  },

  // TODO: CompoundStmt_asyncFuncDef
  // TODO: CompoundStmt_asyncWith
  // TODO: CompoundStmt_asyncFor

  Suite_single(_, stmtCst, __) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    return [flatten(stmtCst.toAST(sourceMap, idContext))];
  },

  Suite_many(_, __, ___, stmts, ____) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    return flatten(stmts.toAST(sourceMap, idContext));
  },

  // TODO: WithItem
  // TODO: Decorator
  // TODO: DottedName

  ParameterList_normal(defParameters, _, optRest) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const positional = defParameters.asIteration().toAST(sourceMap, idContext);
    const rest = optRest.numChildren === 1 ?
      optRest.toAST(sourceMap, idContext)[0] : {vararg: null, kwonlyargs: [], kwarg: null, defaults: []};
    
    return new Arguments(this.sourceLoc(sourceMap), this.id(idContext),
      positional.map(i => i.param), rest.vararg, rest.kwonlyargs, rest.kwarg, 
      positional.map(i => i.default), rest.defaults);
  },

  Parameter_normal(identCst, _, optAnnCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const ann = optAnnCst.numChildren === 1 ? optAnnCst.toAST(sourceMap, idContext) : null;
    return new Arg(this.sourceLoc(sourceMap), identCst.id(idContext), identCst.sourceString, ann);
  },

  Parameter_noann(identCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    return new Arg(this.sourceLoc(sourceMap), identCst.id(idContext), identCst.sourceString, null);
  },

  DefParameter(paramCst, _, optDefaultCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const param = paramCst.toAST(sourceMap, idContext);
    const default_ = optDefaultCst.numChildren === 1 ? optDefaultCst.toAST(sourceMap, idContext) : null;
    return {param, default: default_};
  },

  // TODO: ExprList_withoutEndingIn
  // TODO: ExprList_withoutEndingIn_item

  Expr_cond(leftCst, _if, optTest, __, optElse) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const left = leftCst.toAST(sourceMap, idContext);
    const test = flattenAndFilterNulls(optTest.toAST(sourceMap, idContext));
    const else_ = flattenAndFilterNulls(optElse.toAST(sourceMap, idContext)); 

    if (test.length === 0) {
      return left;
    } else {
      return new IfExp(this.sourceLoc(sourceMap), _if.id(idContext), test[0], left, else_[0]);
    }
  },

  Expr_lambda(_lambda, optParamCsts, __, bodyCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const args = optParamCsts.numChildren === 1 ? optParamCsts.toAST(sourceMap, idContext)[0] : [];
    const body = bodyCst.toAST(sourceMap, idContext);

    return new Lambda(this.sourceLoc(sourceMap), _lambda.id(idContext), args, body);
  },

  OrTest_or(leftCst, _or, rightCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const left = leftCst.toAST(sourceMap, idContext);
    const right = rightCst.toAST(sourceMap, idContext);
    return new BoolOp(this.sourceLoc(sourceMap), _or.id(idContext), 'or', [left, right]);
  },

  AndTest_and(leftCst, _and, rightCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const left = leftCst.toAST(sourceMap, idContext);
    const right = rightCst.toAST(sourceMap, idContext);
    return new BoolOp(this.sourceLoc(sourceMap), _and.id(idContext), 'and', [left, right]);
  },

  NotTest_not(_not, exprCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const expr = exprCst.toAST(sourceMap, idContext);
    return new UnaryOp(this.sourceLoc(sourceMap), _not.id(idContext), 'not', expr);
  },

  Comparison_default(leftCst, rest) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const left = leftCst.toAST(sourceMap, idContext);
    const [ops, rights] = rest.toAST(sourceMap, idContext);

    if (ops.length === 0) {
      return left;
    } else {
      return new Compare(this.sourceLoc(sourceMap), this.id(idContext), left, ops, rights);
    }
  },

  Comparison_withoutEndingIn(leftCst, rest) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const left = leftCst.toAST(sourceMap, idContext);
    const [ops, rights] = rest.toAST(sourceMap, idContext);

    if (ops.length === 0) {
      return left;
    } else {
      return new Compare(this.sourceLoc(sourceMap), this.id(idContext), left, ops, rights);
    }
  },

  ComparisonRest_default(opCsts, rightCsts) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const ops = opCsts.toAST(sourceMap, idContext);
    const rights = rightCsts.toAST(sourceMap, idContext);
    return [ops, rights];
  },

  ComparisonRest_withoutEndingIn(compRestItems) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const ops = [];
    const rights = [];
    const items = compRestItems.toAST(sourceMap, idContext);
    items.forEach(([op, right]) => {
      ops.push(op);
      rights.push(right);
    });

    return [ops, rights];
  },

  ComparisonRestItemWithoutEndingIn_in(opCst, rightCst, _, __) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const op = opCst.toAST(sourceMap, idContext);
    const right = rightCst.toAST(sourceMap, idContext);
    return [op, right];
  },

  ComparisonRestItemWithoutEndingIn_default(opCst, rightCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const op = opCst.toAST(sourceMap, idContext);
    const right = rightCst.toAST(sourceMap, idContext);
    return [op, right];
  },

  StarredExpr_star(starredItemList) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const maybeStarredItems = starredItemList.asIteration().toAST(sourceMap, idContext);
    if (maybeStarredItems.length === 1) {
      return maybeStarredItems[0];
    } else {
      return new Tuple(this.sourceLoc(sourceMap), this.id(idContext), maybeStarredItems);
    }
  },

  StarredItem_star(_star, exprCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const expr = exprCst.toAST(sourceMap, idContext);
    return new Starred(this.sourceLoc(sourceMap), _star.id(idContext), expr);
  },

  OrExpr_or(leftCst, _or, rightCst) { // bitwise or (left to right associative)
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const left = leftCst.toAST(sourceMap, idContext);
    const right = rightCst.toAST(sourceMap, idContext);
    return new BinOp(this.sourceLoc(sourceMap), _or.id(idContext), left, '|', right);
  },

  XorExpr_xor(leftCst, _xor, rightCst) { // bitwise xor (left to right associative)
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const left = leftCst.toAST(sourceMap, idContext);
    const right = rightCst.toAST(sourceMap, idContext);
    return new BinOp(this.sourceLoc(sourceMap), _xor.id(idContext), left, '^', right);
  },

  AndExpr_and(leftCst, _and, rightCst) { // bitwise and (left to right associative)
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const left = leftCst.toAST(sourceMap, idContext);
    const right = rightCst.toAST(sourceMap, idContext);
    return new BinOp(this.sourceLoc(sourceMap), _and.id(idContext), left, '&', right);
  },

  ShiftExpr_shift(leftCst, opCst, rightCst) { // shift (left to right associative)
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    let left = leftCst.toAST(sourceMap, idContext);
    let op = opCst.toAST(sourceMap, idContext); // TODO
    const right = rightCst.toAST(sourceMap, idContext);
    return new BinOp(this.sourceLoc(sourceMap), opCst.id(idContext), left, op, right);
  },

  AddExpr_addSub(leftCst, opCst, rightCst) { // +/- (left to right associative)
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    let left = leftCst.toAST(sourceMap, idContext);
    let op = opCst.toAST(sourceMap, idContext); // TODO
    const right = rightCst.toAST(sourceMap, idContext);
    return new BinOp(this.sourceLoc(sourceMap), opCst.id(idContext), left, op, right);
  },

  MultExpr_mult(leftCst, _op, rightCst) { // *, /, %, @, // (left to right associative)
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    let left = leftCst.toAST(sourceMap, idContext);
    const right = rightCst.toAST(sourceMap, idContext);
    return new BinOp(this.sourceLoc(sourceMap), _op.id(idContext), left, '*', right);
  },

  MultExpr_matMult(leftCst, _op, rightCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    let left = leftCst.toAST(sourceMap, idContext);
    const right = rightCst.toAST(sourceMap, idContext);
    return new BinOp(this.sourceLoc(sourceMap), _op.id(idContext), left, '@', right);
  },

  MultExpr_intDiv(leftCst, _op, rightCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    let left = leftCst.toAST(sourceMap, idContext);
    const right = rightCst.toAST(sourceMap, idContext);
    return new BinOp(this.sourceLoc(sourceMap), _op.id(idContext), left, '//', right);
  },

  MultExpr_div(leftCst, _op, rightCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    let left = leftCst.toAST(sourceMap, idContext);
    const right = rightCst.toAST(sourceMap, idContext);
    return new BinOp(this.sourceLoc(sourceMap), _op.id(idContext), left, '/', right);
  },

  MultExpr_mod(leftCst, _op, rightCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    let left = leftCst.toAST(sourceMap, idContext);
    const right = rightCst.toAST(sourceMap, idContext);
    return new BinOp(this.sourceLoc(sourceMap), _op.id(idContext), left, '%', right);
  },

  UnaryExpr_unary(opCst, exprCst) { // unary ops (-, +, ~)
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    let op = opCst.toAST(sourceMap, idContext); // TODO
    let expr = exprCst.toAST(sourceMap, idContext);
    return new UnaryOp(this.sourceLoc(sourceMap), opCst.id(idContext), op, expr);
  },

  Power(leftCst, _op, optRightCst) { // ** (right associative)
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    let left = leftCst.toAST(sourceMap, idContext);
    const right = optRightCst.toAST(sourceMap, idContext);

    if (right.length === 0) {
      return left;
    } else {
      return new BinOp(this.sourceLoc(sourceMap), _op.id(idContext), left, '**', right[0]);
    }
  },

  // Await_expr_await() {}, // TODO

  PrimaryExpr_attributeref(valueCst, _dot, attrCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const value = valueCst.toAST(sourceMap, idContext);
    const attr = attrCst.sourceString;
    return new Attribute(this.sourceLoc(sourceMap), _dot.id(idContext), value, attr);
  },

  PrimaryExpr_slicing(valueCst, _obracket, sliceCst, __) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const value = valueCst.toAST(sourceMap, idContext);
    const slice = sliceCst.toAST(sourceMap, idContext);
    return new Subscript(
      this.sourceLoc(sourceMap), _obracket.id(idContext), 
      value, slice);
  },

  PrimaryExpr_call(funcCst, _oparen, optArgsOrComp, _cparen) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const func = funcCst.toAST(sourceMap, idContext);
    const argsOrComp = optArgsOrComp.toAST(sourceMap, idContext);
    if (argsOrComp.length === 0 || argsOrComp[0] instanceof Comprehension) { // TODO: comprehension
      return new Call(this.sourceLoc(sourceMap), _oparen.id(idContext), func, argsOrComp, []);
    } else {
      const args = argsOrComp[0];
      return new Call(this.sourceLoc(sourceMap), _oparen.id(idContext), func, args.positional, args.keyword);
    }
  },

  Atom_tuple(_oparen, optStarredExpr, _) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    if (optStarredExpr.numChildren === 1) {
      return optStarredExpr.toAST(sourceMap, idContext);
    } else {
      return new Tuple(this.sourceLoc(sourceMap), _oparen.id(idContext), []);
    }
  }, 

  Atom_list(_obracket, starredListOrCompCst, __) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const starredListOrComp = starredListOrCompCst.numChildren === 1 ?
      starredListOrCompCst.toAST(sourceMap, idContext)[0] : [];
    
      if (starredListOrComp.type && starredListOrComp.type === 'comprehension') {
        return new ListComp(this.sourceLoc(sourceMap), _obrace.id(idContext), 
          starredListOrComp.elt, starredListOrComp.generators);
      } else {
        return new List(this.sourceLoc(sourceMap), _obrace.id(idContext), starredListOrComp);
      }
  },

  Atom_list(_obrace, starredListOrCompCst, __) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const starredListOrComp = starredListOrCompCst.numChildren === 1 ?
      starredListOrCompCst.toAST(sourceMap, idContext)[0] : [];
    
    if (starredListOrComp.type && starredListOrComp.type === 'comprehension') {
      return new SetComp(this.sourceLoc(sourceMap), _obrace.id(idContext), 
        starredListOrComp.elt, starredListOrComp.generators);
    } else {
      return new List(this.sourceLoc(sourceMap), _obrace.id(idContext), starredListOrComp);
    }
  },

  Atom_dict(_obrace, optDictCompOrKeyDatumList, _) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const dictCompOrKeyDatumList = optDictCompOrKeyDatumList.numChildren === 1 ?
      optDictCompOrKeyDatumList.toAST(sourceMap, idContext)[0] : {keys: [], values: []};
    
    if (dictCompOrKeyDatumList instanceof DictComp) {
      return dictCompOrKeyDatumList;
    } else {
      return new Dict(this.sourceLoc(sourceMap), _obrace.id(idContext), 
        dictCompOrKeyDatumList.keys, dictCompOrKeyDatumList.values);
    }
  },

  Atom_generator(_oparen, eltCst, generatorCsts, _) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const elt = eltCst.toAST(sourceMap, idContext);
    const generators = generatorCsts.toAST(sourceMap, idContext);
    return new GeneratorExp(this.sourceLoc(sourceMap), _oparen.id(idContext),
      elt, generators);
  },

  Atom_yield(_, yieldExprCst, __) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    return yieldExprCst.toAST(sourceMap, idContext);
  },

  Atom_ellipsis(_ellipsis) {
    return new Ellipsis(this.sourceLoc(sourceMap), _ellipsis.id(idContext), );
  },

  // TODO: YieldExpr
  // TODO: YieldArg

  SliceList(sliceCsts) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const slices = sliceCsts.toAST(sourceMap, idContext);
    if (slices.length > 1) {
      return new ExtSlice(this.sourceLoc(sourceMap), this.id(idContext), slices);
    } else {
      return slices[0];
    }
  },

  Slice_single(exprCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const expr = exprCst.toAST(sourceMap, idContext);
    return new Index(this.sourceLoc(sourceMap), this.id(idContext),expr); // TODO
  }, // TODO context

  Slice_slice(optStartCst, _,  optEndCst, optStepCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const start = optStartCst.toAST(sourceMap, idContext);
    const end = optEndCst.toAST(sourceMap, idContext);
    const step = optStepCst.toAST(sourceMap, idContext);

    return new Slice(this.sourceLoc(sourceMap), this.id(idContext), 
      start.length === 0 ? null : start[0],
      end.length === 0 ? null : end[0],
      step.length === 0 ? null : step[0],
    );
  }, // TODO context

  Sliceop(_, optStepCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const step = optStepCst.toAST(sourceMap, idContext);
    if (step.length === 0) {
      return null;
    } else {
      return step[0];
    }
  },

  ArgList(positionalArguments, _, optStarredAndKeywordsArguments, __, optKeywordsArguments, ___) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const positional = positionalArguments.toAST(sourceMap, idContext);
    let keyword = optKeywordsArguments.numChildren === 1 ?
      optKeywordsArguments.toAST(sourceMap, idContext)[0]: [];

    const starredAndKeywords = optStarredAndKeywordsArguments.numChildren === 1 ?
      optStarredAndKeywordsArguments.toAST(sourceMap, idContext)[0]: [];
    starredAndKeywords
      .filter(item => item instanceof Starred)
      .forEach(starred => positional.push(starred));
    keyword = starredAndKeywords
      .filter(item => item instanceof Keyword)
      .concat(keyword);

    return {positional, keyword};
  },

  Argument_positional(exprCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    return exprCst.toAST(sourceMap, idContext);
  }, // TODO context Param

  Argument_keyword(argCst, _eq,  valueCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const arg = argCst.toAST(sourceMap, idContext);
    const value = valueCst.toAST(sourceMap, idContext);
    return new Keyword(this.sourceLoc(sourceMap), _eq.id(idContext), arg, value);
  }, // TODO context Param

  Argument_singleStar(_star, exprCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const expr = exprCst.toAST(sourceMap, idContext);
    return new Starred(this.sourceLoc(sourceMap), _star.id(idContext), expr);
  }, // TODO context Param

  Argument_doubleStar(_doubleStar, exprCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const expr = exprCst.toAST(sourceMap, idContext);
    return new Keyword(this.sourceLoc(sourceMap), _doubleStar.id(idContext), null, expr);
  }, // TODO context Param

  TargetList(targetCsts) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const targets = targetCsts.toAST(sourceMap, idContext);
    if (targets.slice(0, -1).some(target => target instanceof Starred)) {
      throw new Error('TargetList cannot contain starred in the middle');
    }
    return targets;
  },

  TargetInternalList(targetCsts) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const targets = targetCsts.toAST(sourceMap, idContext);
    if (targets.slice(0, -1).some(target => target instanceof Starred)) {
      throw new Error('TargetList cannot contain starred in the middle');
    }
    return targets;
  },

  TargetInternal_star(_star, targetCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const target = targetCst.toAST(sourceMap, idContext);
    return new Starred(this.sourceLoc(sourceMap), _star.id(idContext), target);
  },

  Target_tuple(_oparen, optTargetListCst, _) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const targets = optTargetListCst.numChildren === 1 ?
      optTargetListCst.toAST(sourceMap, idContext)[0] : [];
    return new Tuple(this.sourceLoc(sourceMap), _oparen.id(idContext), targets);
  },

  Target_list(_obracket, optTargetListCst, _) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const targets = optTargetListCst.numChildren === 1 ?
      optTargetListCst.toAST(sourceMap, idContext)[0] : [];
    return new List(this.sourceLoc(sourceMap), _oparen.id(idContext), targets);
  },
  
  KeyDatumList(keyDatumCsts) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const keyDatums = keyDatumCsts.toAST(sourceMap, idContext);
    const keys = [];
    const values = [];
    keyDatums.forEach(({key, value}) => {
      keys.push(key);
      values.push(value);
    });
    return {keys, values};
  },

  KeyDatum_keyValue(keyCst, _, valueCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const key = keyCst.toAST(sourceMap, idContext);
    const value = valueCst.toAST(sourceMap, idContext);
    return {key, value};
  },

  KeyDatum_doublestar(_doubleStar, valueCst) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const key = new NameConstant(_doubleStar.sourceLoc(sourceMap), _doubleStar.id(idContext),
      'None');
    const value = valueCst.toAST(sourceMap, idContext);
    return {key, value};
  },

  DictComprehension(keyValueCst, generatorCsts) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const {key, value} = keyValueCst.toAST(sourceMap, idContext);
    const generators = generatorCsts.toAST(sourceMap, idContext);
    return new DictComp(this.sourceLoc(sourceMap), key.id, key, value, generators);
  },

  Comprehension(eltCst, generatorCsts) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const elt = eltCst.toAST(sourceMap, idContext);
    const generators = generatorCsts.toAST(sourceMap, idContext);
    return {
      type: 'comprehension',
      elt, generators
    };
  },

  CompIter_for(optAsync, _for, targetCsts, _, iterCst, optCompIters) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const isAsync = optAsync.length === 1;
    const targets = targetCsts.toAST(sourceMap, idContext);
    console.assert(targets.length > 0);
    const target = targets.length > 1 ? 
      new Tuple(targetCsts.sourceLoc(sourceMap), targetCsts.id(sourceMap), targets) : targets[0];
    const iter = iterCst.toAST(sourceMap, idContext);
    const rest = optCompIters.toAST(sourceMap, idContext);

    const ifs = [];
    while (rest.length > 0 && !(rest[0] instanceof Comprehension)) {
      ifs.push(rest.shift());
    }
    rest.unshift(new Comprehension(this.sourceLoc(sourceMap), _for.id(idContext), target, iter, ifs, isAsync));
    
    return rest;
  },

  CompIter_if(_if, testCst, optCompIters) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    const test = testCst.toAST(sourceMap, idContext);
    const rest = optCompIters.numChildren === 1 ?
      optCompIters.toAST(sourceMap, idContext) : [];
    return [test, ...rest];
  },

  newline(_) { return null; },

  stringliteral(optStringPrefix, string) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    let prefix;
    if (optStringPrefix.numChildren > 0) {
      prefix = stringPrefix(optStringPrefix.children[0].sourceString);
    } else {
      prefix = '';
    }

    return new Str(this.sourceLoc(sourceMap), this.id(idContext), prefix, string.sourceString);
  },

  bytesliteral(_b, bytes) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    return new Bytes(this.sourceLoc(sourceMap), _b.id(idContext), bytes.sourceString);
  },

  identifier(_, __) { 
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    return new Name(this.sourceLoc(sourceMap), this.id(idContext), this.sourceString); 
  },

  integer(_) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    return new Num(this.sourceLoc(sourceMap), this.id(idContext), this.sourceString); 
  },

  floating_point(_) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    return new Num(this.sourceLoc(sourceMap), this.id(idContext), this.sourceString); 
  },

  imaginary(_, __) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    return new Num(this.sourceLoc(sourceMap), this.id(idContext), this.sourceString); 
  },

  none(_) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    return new NameConstant(this.sourceLoc(sourceMap), this.id(idContext), 'None');
  },

  true(_) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    return new NameConstant(this.sourceLoc(sourceMap), this.id(idContext), 'True'); 
  },

  false(_) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    return new NameConstant(this.sourceLoc(sourceMap), this.id(idContext), 'False');
  },

  NonemptyListWithOptionalEndSep(list, _) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    return list.asIteration().toAST(sourceMap, idContext);
  },

  NonemptyListOf(_, __, ___) {
    const sourceMap = this.args.sourceMap;
    const idContext = this.args.idContext;
    return this.asIteration().toAST(sourceMap, idContext);
  },

  _terminal() {
    return this.sourceString;
  }
});

function tupleOrExpr(sourceLoc, id, exprs) {
  if (exprs.length === 1) {
    return exprs[0];
  } else {
    return new Tuple(sourceLoc, exprs);
  }
}

function flattenAndFilterNulls(asts) {
  return flatten(asts).filter(ast => ast !== null);
}

function stringPrefix(prefix) {
  switch (prefix) {
    case 'r': case 'R':
      return 'r';
    case 'u': case 'U':
      return 'u';
    case 'f': case 'F':
      return 'F';
    case 'fr': case 'fR': case 'Fr': case 'FR': 
    case 'rf': case 'rF': case 'Rf': case 'RF':
      return 'fr';
    default:
      throw new Error('should never get here');
  }
}