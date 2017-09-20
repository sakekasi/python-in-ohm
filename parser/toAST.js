semantics.addOperation('toAST(sourceMap)', {
  Program(newlinesAndStmts, _) {
    const sourceMap = this.args.sourceMap;
    return new Program(this.sourceLoc(sourceMap),
      flattenAndFilterNulls(newlinesAndStmts.toAST(sourceMap)));
  },

  Stmt_simple(stmts, _){
    const sourceMap = this.args.sourceMap;
    return stmts.toAST(sourceMap);
  },

  SimpleStmt_assign(targetListCsts, _, valueCst) {
    const sourceMap = this.args.sourceMap;
    const targets = targetListCsts.toAST(sourceMap)
      .map((target, idx) => {
        const targetCst = targetListCsts.child(idx);
        if (target instanceof Array) {
          return tupleOrExpr(targetCst.sourceLoc(sourceMap), target);
        } else {
          return target;
        }
      });
    const value = valueCst.toAST(sourceMap);
    return new Assign(this.sourceLoc(sourceMap), targets, value);
  },

  // SimpleStmt_annassign() {}, // TODO

  SimpleStmt_augassign(targetCst, augOpCst, valueCst) {
    const sourceMap = this.args.sourceMap;
    const target = targetCst.toAST(sourceMap);
    const op = augOpCst.sourceString;
    const value = valueCst.ctorName === 'ExprList' ?
      valueCst.toAST(sourceMap)[0] : valueCst.toAST(sourceMap);

    return new AugAssign(this.sourceLoc(sourceMap), target, op, value);
  },

  SimpleStmt_return(_, optExprList) {
    const sourceMap = this.args.sourceMap;
    let value;
    if (optExprList.numChildren === 1) {
      value = tupleOrExpr(optExprList.sourceLoc(sourceMap)[0], optExprList.toAST(sourceMap)[0]);
    } else {
      value = new NameConstant(null, 'None');
    }

    return new Return(this.sourceLoc(sourceMap), value);
  },

  SimpleStmt_expr(exprCst) {
    const sourceMap = this.args.sourceMap;
    const expr = exprCst.toAST(sourceMap);
    return new ExprStmt(this.sourceLoc(sourceMap), expr);
  },

  ImportStmt_from(_, moduleCst, __, nameCsts) {
    const sourceMap = this.args.sourceMap;
    const [module, level] = moduleCst.toAST(sourceMap);
    const names = nameCsts.toAST(sourceMap);

    return new ImportFrom(this.sourceLoc(sourceMap), module, names, level);
  },

  RelativeModule_named(dots, moduleCst) {
    return [moduleCst.sourceString, dots.numChildren];
  },

  IdentifierAsName(identCst, _, optName) {
    const sourceMap = this.args.sourceMap;
    const name = identCst.sourceString;
    let asName;
    if (optName.numChildren > 0) {
      asName = optName.child(0).sourceString;
    } else {
      asName = null;
    }
    return new Alias(this.sourceLoc(sourceMap), name, asName);
  },

  CompoundStmt_if(_, testCst, bodyCst, __, elifTestCsts, elifBodyCsts, ___, optElseBodyCst) {
    const sourceMap = this.args.sourceMap;
    const test = testCst.toAST(sourceMap);
    const body = flattenAndFilterNulls(bodyCst.toAST(sourceMap));
    const elifTests = elifTestCsts.toAST(sourceMap);
    const elifBodies = elifBodyCsts.toAST(sourceMap).map(body => flattenAndFilterNulls(body));
    const orelse = optElseBodyCst.numChildren === 1 ? flattenAndFilterNulls(optElseBodyCst.toAST(sourceMap)[0]) : null;

    return new If(this.sourceLoc(sourceMap),
      [test].concat(...elifTests), [body].concat(...elifBodies), orelse);
  },

  CompoundStmt_while(_, testCst, bodyCst, __, optElseCst) {
    const sourceMap = this.args.sourceMap;
    const test = testCst.toAST(sourceMap);
    const body = flattenAndFilterNulls(bodyCst.toAST(sourceMap));
    const orelse = optElseCst.numChildren === 1 ? flattenAndFilterNulls(optElse.toAST(sourceMap)[0]) : null;

    return new While(this.sourceLoc(sourceMap), test, body, orelse);
  },

  CompoundStmt_for(_, targetCst, __, iterCst, bodyCst, ___, optElseCst ) {
    const sourceMap = this.args.sourceMap;
    const target = tupleOrExpr(targetCst.sourceLoc(sourceMap), targetCst.toAST(sourceMap));
    const iter = tupleOrExpr(iterCst.sourceLoc(sourceMap), iterCst.toAST(sourceMap));
    const body = bodyCst.toAST(sourceMap);
    let orelse = optElseCst.toAST(sourceMap);
    if (orelse.length === 0) {
      orelse = null;
    } else {
      orelse = orelse[0];
    }
    return new For(this.sourceLoc(sourceMap), target, iter, body, orelse);
  },

  CompoundStmt_funcdef(decoratorCsts, _, nameCst, __, optParamCsts, ___, ____, optReturnCst, bodyCst) {
    const sourceMap = this.args.sourceMap;
    const decorators = decoratorCsts.toAST(sourceMap);
    const name = nameCst.sourceString;
    const params = optParamCsts.numChildren === 1 ? optParamCsts.toAST(sourceMap)[0] : null;
    const returns = optReturnCst.numChildren === 1 ? optReturnCst.toAST(sourceMap)[0] : null;
    const body = bodyCst.toAST(sourceMap);

    return new FunctionDef(this.sourceLoc(sourceMap), name, params, body, decorators, returns);
  },

  CompoundStmt_classdef(decoratorCsts, _, nameCst, __, optArgCst, ___, bodyCst) {
    const sourceMap = this.args.sourceMap;
    const decorators = decoratorCsts.toAST(sourceMap);
    const name = nameCst.sourceString;
    const args = optArgCst.children.length === 1 ? optArgCst.toAST(sourceMap)[0][0] : null;
    const body = bodyCst.toAST(sourceMap);
    
    console.assert(!args.positional.some(arg => arg instanceof Starred));
    console.assert(!args.keyword.some(arg => arg instanceof Keyword && arg.arg === null));


    return new ClassDef(this.sourceLoc(sourceMap), name, args.positional, args.keyword, body, decorators);
  },

  Suite_single(_, stmtCst, __) {
    const sourceMap = this.args.sourceMap;
    return [flatten(stmtCst.toAST(sourceMap))];
  },

  Suite_many(_, __, ___, stmts, ____) {
    const sourceMap = this.args.sourceMap;
    return flatten(stmts.toAST(sourceMap));
  },

  ParameterList_normal(defParameters, _, optRest) {
    const sourceMap = this.args.sourceMap;
    const positional = defParameters.asIteration().toAST(sourceMap);
    const rest = optRest.numChildren === 1 ?
      optRest.toAST(sourceMap)[0] : {vararg: null, kwonlyargs: [], kwarg: null, defaults: []};
    
    return new Arguments(this.sourceLoc(sourceMap), 
      positional.map(i => i.param), rest.vararg, rest.kwonlyargs, rest.kwarg, 
      positional.map(i => i.default), rest.defaults);
  },

  DefParameter(paramCst, _, optDefaultCst) {
    const sourceMap = this.args.sourceMap;
    const param = paramCst.toAST(sourceMap); // TODO: parameter
    const default_ = optDefaultCst.numChildren === 1 ? optDefaultCst.toAST(sourceMap) : null;
    return {param, default: default_};
  },

  Expr_cond(leftCst, _, optTest, __, optElse) {
    const sourceMap = this.args.sourceMap;
    const left = leftCst.toAST(sourceMap);
    const test = flattenAndFilterNulls(optTest.toAST(sourceMap));
    const else_ = flattenAndFilterNulls(optElse.toAST(sourceMap)); 

    if (test.length === 0) {
      return left;
    } else {
      return new IfExp(this.sourceLoc(sourceMap), test[0], left, else_[0]);
    }
  },

  Expr_lambda(_, optParamCsts, __, bodyCst) {
    const sourceMap = this.args.sourceMap;
    const args = optParamCsts.numChildren === 1 ? optParamCsts.toAST(sourceMap)[0] : [];
    const body = bodyCst.toAST(sourceMap);

    return new Lambda(this.sourceLoc(sourceMap), args, body);
  },

  OrTest_or(leftCst, _, rightCst) {
    const sourceMap = this.args.sourceMap;
    const left = leftCst.toAST(sourceMap);
    const right = rightCst.toAST(sourceMap);
    return new BoolOp(this.sourceLoc(sourceMap), 'or', [left, right]);
  },

  AndTest_and(leftCst, _, rightCst) {
    const sourceMap = this.args.sourceMap;
    const left = leftCst.toAST(sourceMap);
    const right = rightCst.toAST(sourceMap);
    return new BoolOp(this.sourceLoc(sourceMap), 'and', [left, right]);
  },

  NotTest_not(_, exprCst) {
    const sourceMap = this.args.sourceMap;
    const expr = exprCst.toAST(sourceMap);
    return new UnaryOp(this.sourceLoc(sourceMap), 'not', expr);
  },

  Comparison(leftCst, opCsts, rightCsts) {
    const sourceMap = this.args.sourceMap;
    const left = leftCst.toAST(sourceMap);
    const ops = opCsts.toAST(sourceMap);
    const rights = rightCsts.toAST(sourceMap);

    if (ops.length === 0) {
      return left;
    } else {
      return new Compare(this.sourceLoc(sourceMap), left, ops, rights);
    }
  },

  StarredExpr_star(starredItemList) {
    const sourceMap = this.args.sourceMap;
    const maybeStarredItems = starredItemList.asIteration().toAST(sourceMap);
    if (maybeStarredItems.length === 1) {
      return maybeStarredItems[0];
    } else {
      return new Tuple(this.sourceLoc(sourceMap), maybeStarredItems);
    }
  },

  StarredItem_star(_, exprCst) {
    const sourceMap = this.args.sourceMap;
    const expr = exprCst.toAST(sourceMap);
    return new Starred(this.sourceLoc(sourceMap), expr);
  },

  OrExpr_or(leftCst, _, rightCst) { // bitwise or (left to right associative)
    const sourceMap = this.args.sourceMap;
    const left = leftCst.toAST(sourceMap);
    const right = rightCst.toAST(sourceMap);
    return new BinOp(this.sourceLoc(sourceMap), left, '|', right);
  },

  XorExpr_xor(leftCst, _, rightCst) { // bitwise xor (left to right associative)
    const sourceMap = this.args.sourceMap;
    const left = leftCst.toAST(sourceMap);
    const right = rightCst.toAST(sourceMap);
    return new BinOp(this.sourceLoc(sourceMap), left, '^', right);
  },

  AndExpr_and(leftCst, _, rightCst) { // bitwise and (left to right associative)
    const sourceMap = this.args.sourceMap;
    const left = leftCst.toAST(sourceMap);
    const right = rightCst.toAST(sourceMap);
    return new BinOp(this.sourceLoc(sourceMap), left, '&', right);
  },

  ShiftExpr_shift(leftCst, opCst, rightCst) { // shift (left to right associative)
    const sourceMap = this.args.sourceMap;
    let left = leftCst.toAST(sourceMap);
    let op = opCst.toAST(sourceMap); // TODO
    const right = rightCst.toAST(sourceMap);
    return new BinOp(this.sourceLoc(sourceMap), left, op, right);
  },

  AddExpr_addSub(leftCst, opCst, rightCst) { // +/- (left to right associative)
    const sourceMap = this.args.sourceMap;
    let left = leftCst.toAST(sourceMap);
    let op = opCst.toAST(sourceMap); // TODO
    const right = rightCst.toAST(sourceMap);
    return new BinOp(this.sourceLoc(sourceMap), left, op, right);
  },

  MultExpr_mult(leftCst, _, rightCst) { // *, /, %, @, // (left to right associative)
    const sourceMap = this.args.sourceMap;
    let left = leftCst.toAST(sourceMap);
    const right = rightCst.toAST(sourceMap);
    return new BinOp(this.sourceLoc(sourceMap), left, '*', right);
  },

  MultExpr_matMult(leftCst, _, rightCst) {
    const sourceMap = this.args.sourceMap;
    let left = leftCst.toAST(sourceMap);
    const right = rightCst.toAST(sourceMap);
    return new BinOp(this.sourceLoc(sourceMap), left, '@', right);
  },

  MultExpr_intDiv(leftCst, _, rightCst) {
    const sourceMap = this.args.sourceMap;
    let left = leftCst.toAST(sourceMap);
    const right = rightCst.toAST(sourceMap);
    return new BinOp(this.sourceLoc(sourceMap), left, '//', right);
  },

  MultExpr_div(leftCst, _, rightCst) {
    const sourceMap = this.args.sourceMap;
    let left = leftCst.toAST(sourceMap);
    const right = rightCst.toAST(sourceMap);
    return new BinOp(this.sourceLoc(sourceMap), left, '/', right);
  },

  MultExpr_mod(leftCst, _, rightCst) {
    const sourceMap = this.args.sourceMap;
    let left = leftCst.toAST(sourceMap);
    const right = rightCst.toAST(sourceMap);
    return new BinOp(this.sourceLoc(sourceMap), left, '%', right);
  },

  UnaryExpr_unary(opCst, exprCst) { // unary ops (-, +, ~)
    const sourceMap = this.args.sourceMap;
    let op = opCst.toAST(sourceMap); // TODO
    let expr = exprCst.toAST(sourceMap);
    return new UnaryOp(this.sourceLoc(sourceMap), op, exprCst);
  },

  Power(leftCst, _, optRightCst) { // ** (right associative)
    const sourceMap = this.args.sourceMap;
    let left = leftCst.toAST(sourceMap);
    const right = optRightCst.toAST(sourceMap);

    if (right.length === 0) {
      return left;
    } else {
      return new BinOp(this.sourceLoc(sourceMap), left, '**', right[0]);
    }
  },

  // Await_expr_await() {}, // TODO

  PrimaryExpr_attributeref(valueCst, _, attrCst) {
    const sourceMap = this.args.sourceMap;
    const value = valueCst.toAST(sourceMap);
    const attr = attrCst.sourceString;
    return new Attribute(this.sourceLoc(sourceMap), value, attr);
  },

  PrimaryExpr_slicing(valueCst, _, sliceCst, __) {
    const sourceMap = this.args.sourceMap;
    const value = valueCst.toAST(sourceMap);
    const slice = sliceCst.toAST(sourceMap);
    return new Subscript(
      this.sourceLoc(sourceMap),
      value, slice);
  },

  PrimaryExpr_call(funcCst, _, optArgsOrComp, __) {
    const sourceMap = this.args.sourceMap;
    const func = funcCst.toAST(sourceMap);
    const argsOrComp = optArgsOrComp.toAST(sourceMap);
    if (argsOrComp.length === 0 || argsOrComp[0] instanceof Comprehension) { // TODO: comprehension
      return new Call(this.sourceLoc(sourceMap), func, argsOrComp, []);
    } else {
      const args = argsOrComp[0];
      return new Call(this.sourceLoc(sourceMap), func, args.positional, args.keyword);
    }
  },

  // Atom_tuple() {}, // TODO

  Atom_list(_, starredListOrCompCst, __) {
    const sourceMap = this.args.sourceMap;
    const starredListOrComp = starredListOrCompCst.numChildren === 1 ?
      starredListOrCompCst.toAST(sourceMap)[0] : [];
    
    if (starredListOrComp instanceof Comprehension) {
      throw new Error('TODO not implemented yet'); 
    } else {
      return new List(this.sourceLoc(sourceMap), starredListOrComp);
    }
  },

  // Atom_dict() {}, // TODO

  // Atom_str(strCsts) {
  //   const sourceMap = this.args.sourceMap;
  //   const strs = strCsts.toAST(sourceMap);
  //   return new JoinedStr(this.sourceLoc(sourceMap), strs);
  // },

  Atom_ellipsis(_) {
    return new Ellipsis(this.sourceLoc(sourceMap));
  },

  Slice_single(exprCst) {
    const sourceMap = this.args.sourceMap;
    const expr = exprCst.toAST(sourceMap);
    return new Index(this.sourceLoc(sourceMap), expr); // TODO
  }, // TODO context

  Slice_slice(optStartCst, _,  optEndCst, optStepCst) {
    const sourceMap = this.args.sourceMap;
    const start = optStartCst.toAST(sourceMap);
    const end = optEndCst.toAST(sourceMap);
    const step = optStepCst.toAST(sourceMap);

    return new Slice(this.sourceLoc(sourceMap), // TODO
      start.length === 0 ? null : start[0],
      end.length === 0 ? null : end[0],
      step.length === 0 ? null : step[0],
    );
  }, // TODO context

  Sliceop(_, optStepCst) {
    const sourceMap = this.args.sourceMap;
    const step = optStepCst.toAST(sourceMap);
    if (step.length === 0) {
      return null;
    } else {
      return step[0];
    }
  },

  Argument_positional(exprCst) {
    const sourceMap = this.args.sourceMap;
    return exprCst.toAST(sourceMap);
  }, // TODO context Param

  Argument_keyword(argCst,_,  valueCst) {
    const sourceMap = this.args.sourceMap;
    const arg = argCst.toAST(sourceMap);
    const value = valueCst.toAST(sourceMap);
    return new Keyword(this.sourceLoc(sourceMap), arg, value);
  }, // TODO context Param

  Argument_singleStar(_, exprCst) {
    const sourceMap = this.args.sourceMap;
    const expr = exprCst.toAST(sourceMap);
    return new Starred(this.sourceLoc(sourceMap), expr);
  }, // TODO context Param

  Argument_doubleStar(_, exprCst) {
    const sourceMap = this.args.sourceMap;
    const expr = exprCst.toAST(sourceMap);
    return new Keyword(this.sourceLoc(sourceMap), null, expr);
  }, // TODO context Param

  ArgList(positionalArguments, _, optKeywordsArguments, __) {
    const sourceMap = this.args.sourceMap;
    const positional = positionalArguments.toAST(sourceMap);
    let keyword = optKeywordsArguments.toAST(sourceMap);
    if (keyword.length > 0) {
      keyword = keyword[0];
    }
    return {positional, keyword};
  },

  TargetList(targetCsts) {
    const sourceMap = this.args.sourceMap;
    const targets = targetCsts.toAST(sourceMap);
    if (targets.slice(0, -1).some(target => target instanceof Starred)) {
      throw new Error('TargetList cannot contain starred in the middle');
    }
    return targets;
  },

  newline(_) { return null; },

  stringliteral(optStringPrefix, string) {
    const sourceMap = this.args.sourceMap;
    let prefix;
    if (optStringPrefix.numChildren > 0) {
      prefix = stringPrefix(optStringPrefix.children[0].sourceString);
    } else {
      prefix = '';
    }

    return new Str(this.sourceLoc(sourceMap), prefix, string.sourceString);
  },

  bytesliteral(_, bytes) {
    const sourceMap = this.args.sourceMap;
    return new Bytes(this.sourceLoc(sourceMap), bytes.sourceString);
  },

  identifier(_, __) { 
    const sourceMap = this.args.sourceMap;
    return new Name(this.sourceLoc(sourceMap), this.sourceString); 
  },

  integer(_) {
    const sourceMap = this.args.sourceMap;
    return new Num(this.sourceLoc(sourceMap), this.sourceString); 
  },

  floating_point(_) {
    const sourceMap = this.args.sourceMap;
    return new Num(this.sourceLoc(sourceMap), this.sourceString); 
  },

  imaginary(_, __) {
    const sourceMap = this.args.sourceMap;
    return new Num(this.sourceLoc(sourceMap), this.sourceString); 
  },

  none(_) {
    const sourceMap = this.args.sourceMap;
    return new NameConstant(this.sourceLoc(sourceMap), 'None');
  },

  true(_) {
    const sourceMap = this.args.sourceMap;
    return new NameConstant(this.sourceLoc(sourceMap), 'True'); 
  },

  false(_) {
    const sourceMap = this.args.sourceMap;
    return new NameConstant(this.sourceLoc(sourceMap), 'False');
  },

  NonemptyListWithOptionalEndSep(list, _) {
    const sourceMap = this.args.sourceMap;
    return list.asIteration().toAST(sourceMap);
  },

  NonemptyListOf(_, __, ___) {
    const sourceMap = this.args.sourceMap;
    return this.asIteration().toAST(sourceMap);
  },

  _terminal() {
    return this.sourceString;
  }
});

function tupleOrExpr(sourceLoc, exprs) {
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