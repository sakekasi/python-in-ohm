semantics.addOperation('toAST(sourceMap)', {
  Program(newlinesAndStmts, _) {
    const sourceMap = this.args.sourceMap;
    return new Program(this.sourceLoc(sourceMap),
      flattenAndFilterNulls(newlinesAndStmts.toAST(sourceMap)));
  },

  Simple_stmt(smallStmts, _, __) {
    const sourceMap = this.args.sourceMap;
    return flattenAndFilterNulls(smallStmts.asIteration().toAST(sourceMap))
  },

  Expr_stmt(left, right) {
    const sourceMap = this.args.sourceMap;
    const target = left.toAST(sourceMap);
    const rightType = last(right.child(0).ctorName.split('_'));

    let ans;
    switch (rightType) {
      case 'annassign':
        break;
      case 'augassign':
        break;
      case 'normal':
        const rights = right.toAST(sourceMap);
        const targets = [target, ...rights.slice(0, -1)]
          .map((target, idx) => {
            let targetCst;
            if (idx === 0) {
              targetCst = left;
            } else {
              targetCst = right.child(idx - 1);
            }
            if (target instanceof Array) {
              return tupleOrExpr(targetCst.sourceLoc(sourceMap), target);
            } else {
              return target;
            }
          });
        const value = last(rights);

        ans = new Assign(this.sourceLoc(sourceMap), targets, value);
        break;
      default:
        throw new Error('should never get here ' + rightType);
    }
    return ans;
  },

  // Expr_stmt_part_annassign() {}, // TODO
  // Expr_stmt_part_augassign() {}, // TODO

  Expr_stmt_part_normal(_, exprCsts) {
    const sourceMap = this.args.sourceMap;
    const exprs = exprCsts.toAST(sourceMap);
    return exprs;
  }, 

  Compound_stmt_for(_, targetCst, __, iterCst, bodyCst, ___, optElseCst ) {
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

  Suite_single(_, stmtCst) {
    const sourceMap = this.args.sourceMap;
    return [stmtCst.toAST(sourceMap)];
  },

  Suite_many(_, __, ___, stmts, ____) {
    const sourceMap = this.args.sourceMap;
    return flattenAndFilterNulls(stmts.toAST(sourceMap));
  },

  Test_or(orCst, _, optTest, __, optElse) {
    const sourceMap = this.args.sourceMap;
    const or = orCst.toAST(sourceMap);
    const test = flattenAndFilterNulls(optTest.toAST(sourceMap));
    const else_ = flattenAndFilterNulls(optElse.toAST(sourceMap)); 

    if (test.length === 0) {
      return or;
    } else {
      return new IfExp(this.sourceLoc(sourceMap), or, test[0], else_[0]);
    }
  },

  // Lambdef() {},

  Or_test(leftCst, _, rightCsts) {
    const sourceMap = this.args.sourceMap;
    const left = leftCst.toAST(sourceMap);
    const rights = flattenAndFilterNulls(rightCsts.toAST(sourceMap));

    if (rights.length === 0) {
      return left;
    } else {
      return new BoolOp(this.sourceLoc(sourceMap), 'or', [left].concat(rights));
    }
  },

  And_test(leftCst, _, rightCsts) {
    const sourceMap = this.args.sourceMap;
    const left = leftCst.toAST(sourceMap);
    const rights = flattenAndFilterNulls(rightCsts.toAST(sourceMap));

    if (rights.length === 0) {
      return left;
    } else {
      return new BoolOp(this.sourceLoc(sourceMap), 'and', [left].concat(rights));
    }
  },

  Not_test_not(_, exprCst) {
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
      return new Compare(left, ops, right);
    }
  },

  Star_expr(_, exprCst) {
    const sourceMap = this.args.sourceMap;
    const expr = exprCst.toAST(sourceMap);
    return new Starred(this.sourceLoc(sourceMap), expr);
  },

  Expr(leftCst, _, rightCsts) { // bitwise or (left to right associative)
    const sourceMap = this.args.sourceMap;
    let left = leftCst.toAST(sourceMap);
    const rights = rightCsts.toAST(sourceMap);

    rights.forEach(right => {
      let nextLeft = new BinOp(
        left.sourceLoc.join(right.sourceLoc), 
        left, '|', right);
      left = nextLeft;
    });
    return left;
  },

  Xor_expr(leftCst, _, rightCsts) { // bitwise xor (left to right associative)
    const sourceMap = this.args.sourceMap;
    let left = leftCst.toAST(sourceMap);
    const rights = rightCsts.toAST(sourceMap);

    rights.forEach(right => {
      let nextLeft = new BinOp(
        left.sourceLoc.join(right.sourceLoc),
        left, '^', right);
      left = nextLeft;
    });
    return left;
  },

  And_expr(leftCst, _, rightCsts) { // bitwise and (left to right associative)
    const sourceMap = this.args.sourceMap;
    let left = leftCst.toAST(sourceMap);
    const rights = rightCsts.toAST(sourceMap);

    rights.forEach(right => {
      let nextLeft = new BinOp(
        left.sourceLoc.join(right.sourceLoc), 
        left, '&', right);
      left = nextLeft;
    });
    return left;
  },

  Shift_expr(leftCst, opCsts, rightCsts) { // shift (left to right associative)
    const sourceMap = this.args.sourceMap;
    let left = leftCst.toAST(sourceMap);
    let ops = opCsts.toAST(sourceMap); // TODO
    const rights = rightCsts.toAST(sourceMap);

    rights.forEach((right, idx) => {
      const op = ops[idx];
      let nextLeft = new BinOp(
        left.sourceLoc.join(right.sourceLoc), 
        left, op, right);
      left = nextLeft;
    });
    return left;
  },

  Arith_expr(leftCst, opCsts, rightCsts) { // +/- (left to right associative)
    const sourceMap = this.args.sourceMap;
    let left = leftCst.toAST(sourceMap);
    let ops = opCsts.toAST(sourceMap); // TODO
    const rights = rightCsts.toAST(sourceMap);

    rights.forEach((right, idx) => {
      const op = ops[idx];
      let nextLeft = new BinOp(
        left.sourceLoc.join(right.sourceLoc), 
        left, op, right);
      left = nextLeft;
    });
    return left;
  },

  Term(leftCst, opCsts, rightCsts) { // *, /, %, @, // (left to right associative)
    const sourceMap = this.args.sourceMap;
    let left = leftCst.toAST(sourceMap);
    let ops = opCsts.toAST(sourceMap); // TODO
    const rights = rightCsts.toAST(sourceMap);

    rights.forEach((right, idx) => {
      const op = ops[idx];
      let nextLeft = new BinOp(
        left.sourceLoc.join(right.sourceLoc), 
        left, op, right);
      left = nextLeft;
    });
    return left;
  },

  Factor_fact(opCst, exprCst) { // unary ops (-, +, ~)
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

  Atom_expr(optAwait, atomCst, trailerCsts) {
    const sourceMap = this.args.sourceMap;
    let atom = atomCst.toAST(sourceMap);
    const trailers = trailerCsts.toAST(sourceMap);
    trailers.forEach((trailer, idx) => {
      let nextAtom;
      const trailerCst = trailerCsts.child(idx);
      switch (trailer.type) {
        case 'call':
          nextAtom = new Call(
            atom.sourceLoc.join(trailerCst.sourceLoc(sourceMap)), 
            atom, trailer.args, trailer.keywords);
          break;
        case 'subscript':
          nextAtom = new Subscript(
            atom.sourceLoc.join(trailerCst.sourceLoc(sourceMap)), 
            trailer.slice);
          break;
        case 'attribute':
          nextAtom = new Attribute(
            atom.sourceLoc.join(trailerCst.sourceLoc(sourceMap)), 
            atom, trailer.attr);
          break;
        default:
          throw new Error('should never get here');
      }
      atom = nextAtom;
    });
    if (optAwait.numChildren > 0) {
      atom = new Await(this.sourceLoc(sourceMap), atom);
    }
    return atom;
  },

  // Atom_tuple() {}, // TODO

  // Atom_list() {}, // TODO

  // Atom_dict() {}, // TODO

  Atom_str(strCsts) {
    const sourceMap = this.args.sourceMap;
    const strs = strCsts.toAST(sourceMap);
    return new JoinedStr(this.sourceLoc(sourceMap), strs);
  },

  Atom_ellipsis(_) {
    return new Ellipsis(this.sourceLoc(sourceMap));
  },

  Trailer_call(_, optArglist, __) {
    const sourceMap = this.args.sourceMap;
    let argList = optArglist.toAST(sourceMap);
    if (argList.length === 0) {
      return {
        args: [], keywords: []
      }
    } else {
      argList = argList[0];
      let handlingKeywords = false;
      let args = [], keywords = [];
      argList.forEach(argExpr => {
        if (argExpr instanceof Keyword) {
          handlingKeywords = true;
          keywords.push(argExpr);
        } else if (argExpr instanceof Expr) {
          if (handlingKeywords) {
            throw new Error('positional argument follows keyword argument');
          }
          args.push(argExpr);
        }
      });
      return { type: 'call', args, keywords }
    }
  }, // TODO

  Trailer_subscript(_, subsriptlistCst, __) {
    const sourceMap = this.args.sourceMap;
    const subscriptList = subsriptlistCst.toAST(sourceMap);
    if (subscriptList.length === 1) {
      return { type: 'subscript', slice: subscriptList[0] }
    } else {
      return { slice: new ExtSlice(this.sourceLoc(sourceMap), subscriptList) }; // TODO
    }
  }, // TODO context

  Trailer_attribute(_, attributeCst) {
    const sourceMap = this.args.sourceMap;
    const attribute = attributeCst.toAST(sourceMap);
    return { type: 'attribute', attr: attribute };
  }, // TODO

  Subscript_single(exprCst) {
    const sourceMap = this.args.sourceMap;
    const expr = exprCst.toAST(sourceMap);
    return new Index(this.sourceLoc(sourceMap), expr); // TODO
  }, // TODO context

  Subscript_slice(optStartCst, _,  optEndCst, optStepCst) {
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

  Argument_positional(exprCst, optCompCst) {
    const sourceMap = this.args.sourceMap;
    const expr = exprCst.toAST(sourceMap);
    const comp = optCompCst.toAST(sourceMap);
    if (comp.length === 0) {
      return expr;
    } else {
      throw new Error('TODO: implement comprehensions');
    }
  }, // TODO context Param

  Argument_keyword(argCst,_,  valueCst) {
    const sourceMap = this.args.sourceMap;
    const arg = argCst.toAST(sourceMap);
    const value = valueCst.toAST(sourceMap);
    return new Keyword(this.sourceLoc(sourceMap), arg, value);
  }, // TODO context Param

  Argument_single_star(_, exprCst) {
    const sourceMap = this.args.sourceMap;
    const expr = exprCst.toAST(sourceMap);
    return new Starred(this.sourceLoc(sourceMap), expr);
  }, // TODO context Param

  Argument_double_star(_, exprCst) {
    const sourceMap = this.args.sourceMap;
    const expr = exprCst.toAST(sourceMap);
    return new Keyword(this.sourceLoc(sourceMap), null, expr);
  }, // TODO context Param

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
    return new Identifier(this.sourceLoc(sourceMap), this.sourceString); 
  },

  number(_) {
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