const pythonGrammar = ohm.grammar(`
Python {
  Program = (newline | Stmt)* end
  
  Stmt = Simple_stmt
    | Compound_stmt
    
  Simple_stmt = NonemptyListOf<Small_stmt, ";"> ";"? newline
  
  Small_stmt = Flow_stmt -- flow
    | del Exprlist -- del
    | pass -- pass
    | import Dotted_as_names -- import_name
    | from Import_from_package import Import_from_names -- import_from
    | global NonemptyListOf<identifier, ","> -- global
    | nonlocal NonemptyListOf<identifier, ","> -- nonlocal
    | Expr_stmt -- expr
    | assert Test ("," Test)? -- assert
  
  Expr_stmt = Testlist_star_expr Expr_stmt_part
  Expr_stmt_part = ":" Test ("=" Test)? -- annassign
    | augassign (Yield_expr | Testlist) -- augassign
    | ("=" (Yield_expr | Testlist_star_expr))* -- normal

  Flow_stmt = break -- break
    | continue -- continue
    | return Testlist? -- return
    | raise (Test (from Test)?)? -- raise
    | Yield_expr -- yield
  
  Import_from_package = ("."|"...")* Dotted_name  -- name
    | ("."|"...")+ -- dots
  Import_from_names = "*" -- star
    | "(" Import_as_names ")" -- parenNames
    | Import_as_names -- names

  Import_as_name = identifier (as identifier)?
  Dotted_as_name = Dotted_name (as identifier)?
  Import_as_names = NonemptyListWithOptionalEndSep<Import_as_name, ",">
  Dotted_as_names = NonemptyListOf<Dotted_as_name, ",">
  Dotted_name = identifier ("." identifier)?

  Compound_stmt = if Test Suite (elif Test Suite)* (else Suite)? -- if
    | while Test Suite (else Suite)? -- while
    | for Exprlist in Testlist Suite (else Suite)? -- for
    | try Suite (Except_clause Suite)+ (else Suite)? (finally Suite)? -- tryWithExcept
    | try Suite finally Suite -- tryWithoutExcept
    | with NonemptyListOf<With_item, ","> Suite -- with
    | def identifier Parameters ("->" Test)? Suite -- funcdef
    | class identifier ("(" Arglist? ")")? Suite -- classdef
    | Decorator+ (Compound_stmt_classdef | Compound_stmt_funcdef | Async_stmt_funcdef) -- decorated
    | Async_stmt -- async
  
  Decorator = "@" Dotted_name ("[" Arglist? "]")? newline
  
  Async_stmt = async Compound_stmt_funcdef -- funcdef
    | async Compound_stmt_with -- with
    | async Compound_stmt_for -- for

  With_item = Test ("as" Expr)?
  Except_clause = except (Test (as identifier)?)?
  
  Parameters = "(" TypedArgsList? ")"
  TypedArgsList = Tfpdef ("=" Test)? ("," Tfpdef ("=" Test)?)* ("," TypedArgsRest)? -- positional
    | TypedArgsRest -- var
  TypedArgsRest = "*" Tfpdef? ("," Tfpdef ("=" Test)?)* ("," ("**" Tfpdef ","?)?)? -- single_star
    | "**" Tfpdef ","? -- double_star
  Tfpdef = identifier (":" Test)?

  Varargslist = Vfpdef ("=" Test)? ("," Vfpdef ("=" Test)?)* ("," VarArgsRest)? -- positional
  | VarArgsRest -- var
  VarArgsRest = "*" Vfpdef? ("," Vfpdef ("=" Test)?)* ("," ("**" Vfpdef ","?)?)? -- single_star
  | "**" Vfpdef ","? -- double_star
  Vfpdef = identifier
  
  Suite = ":" Simple_stmt -- single
  	| ":" newline indent Stmt+  dedent -- many

  Test = Or_test (if Or_test else Test)? -- or
    | Lambdef -- lambda
  Test_nocond = Or_test -- or
    | Lambdef_nocond -- lambda
  Lambdef = lambda (Varargslist)? ":" Test
  Lambdef_nocond = lambda (Varargslist)? ":" Test_nocond

  Or_test = And_test (or And_test)*
  And_test = Not_test (and Not_test)*
  Not_test = not Not_test -- not
    | Comparison -- comp
  Comparison = Expr (comp_op Expr)*
  Star_expr = "*" Expr
  Expr = Xor_expr ("|" Xor_expr)*
  Xor_expr = And_expr ("^" And_expr)*
  And_expr = Shift_expr ("&" Shift_expr)*
  Shift_expr = Arith_expr (("<<"|">>") Arith_expr)*
  Arith_expr = Term (("+"|"-") Term)*
  Term = Factor (("*"|"@"|"/"|"%"|"//") Factor)*
  Factor = ("+"|"-"|"~") Factor -- fact
    | Power -- pow
  Power = Atom_expr ("**" Factor)?
  Atom_expr = (await)? Atom Trailer*
  Atom = "(" (Yield_expr | Testlist_comp)? ")" -- tuple
    | "[" (Testlist_comp)? "]" -- list
    | "{" (Dictorsetmaker)? "}" -- dict
    | identifier -- identifier
    | number -- number
    | string+ -- str
    | "..." -- ellipsis
    | none -- none
    | true -- true
    | false -- false
  Yield_expr = yield Yield_arg?
  Yield_arg = from Test -- from
    | Testlist -- args
  
  Testlist_comp = (Test | Star_expr) TestlistRest
  TestlistRest = Comp_for -- comp
    | ("," (Test | Star_expr))* ","? -- lit
  
  Trailer = "(" Arglist? ")" -- call
    | "[" Subscriptlist "]" -- subscript
    | "." identifier -- attribute
  Subscript = Test -- single
    | Test? ":" Test? Sliceop? -- slice
  Sliceop = ":" Test?
  Argument = Test Comp_for? -- positional
    | identifier "=" Test -- keyword
    | "*" Test -- single_star
    | "**" Test -- double_star
  
  Subscriptlist = NonemptyListWithOptionalEndSep<Subscript, ",">
  Arglist = NonemptyListWithOptionalEndSep<Argument, ",">
  Testlist_star_expr = NonemptyListWithOptionalEndSep<(Test | Star_expr), ",">
  Exprlist = NonemptyListWithOptionalEndSep<(Expr|Star_expr), ",">
  Testlist = NonemptyListWithOptionalEndSep<Test, ",">

  Dictorsetmaker = Key_value_or_doublestar_expr DictRest -- dict
    | (Test | Star_expr) SetRest -- set
  DictRest = Comp_for -- comp
    | ("," Key_value_or_doublestar_expr)* ","? -- lit
  SetRest = Comp_for -- comp
    | ("," (Test | Star_expr))* ","? -- lit
  Key_value_or_doublestar_expr = Test ":" Test -- kv
    | "**" Expr -- doublestar

  Comp = async? for Exprlist in Or_test Comp? -- for
    | if Test_nocond Comp? -- if
  
  newline = "\\n"
  space := " "
    | "\\t"
    | comment
  indent = "⇨"
  dedent = "⇦"
  comment = "#" (~"\\n" any)*
  
  identifier = id_start id_continue*
  id_start = "_"
  	| "a".."z"
    | "A".."Z"
  id_continue = id_start
  	| "0".."9"
 
 
  number = imaginary
    | floating_point
    | integer
  
  integer = nonzerodigit ("_"? digit)* -- nonzerodecimal
    | "0"+ ("_"? "0")* -- zero
    | "0" ("b" | "B") ("_"? bindigit)+ -- binary
    | "0" ("o" | "O") ("_"? octdigit)+ -- octal
    | "0" ("x" | "X") ("_"? hexdigit)+ -- hex
  nonzerodigit = "1".."9"
  bindigit = "0" | "1"
  octdigit = "0".."7"
  hexdigit = digit | "a".."f" | "A".."F"
  
  floating_point = (floating_point_withFract | floating_point_withoutFract | digitpart) exponent -- exponent
    | digitpart? fraction -- withFract
    | digitpart "." -- withoutFract
    
  digitpart = digit ("_"? digit)*
  fraction = "." digitpart
  exponent = ("e" | "E") ("+" | "-")? digitpart
  
  imaginary = (floating_point | digitpart) ("j" | "J")
  
  string = stringliteral | bytesliteral
  
  stringliteral = stringprefix? (shortstring | longstring)
  stringprefix = "r" | "u" | "R" | "U" | "f" | "F" | "fr" | "Fr" | "fR" | "FR" | "rf" | "rF" | "Rf" | "RF"
  shortstring = "'" shortstringitem<"'">* "'" | "\\"" shortstringitem<"\\"">* "\\""
  longstring = "'''" longstringitem* "'''" | "\\"\\"\\"" longstringitem* "\\"\\"\\""
  shortstringitem<quote> = shortstringchar<quote> | stringescapeseq
  longstringitem = longstringchar | stringescapeseq
  shortstringchar<quote> = ~(quote|newline|"\\\\") any
  longstringchar = ~"\\\\" any
  stringescapeseq = "\\\\" any
  
  bytesliteral = bytesprefix (shortbytes | longbytes)
  bytesprefix = "b" | "B" | "br" | "Br" | "bR" | "BR" | "rb" | "rB" | "Rb" | "RB"
  shortbytes = "'" shortbytesitem<"'">* "'" | "\\"" shortbytesitem<"\\"">* "\\""
  longbytes = "'''" longbytesitem* "'''" | "\\"\\"\\"" longbytesitem* "\\"\\"\\""
  shortbytesitem<quote> = shortbyteschar<quote> | bytesescapeseq
  longbytesitem = longbyteschar | bytesescapeseq
  shortbyteschar<quote> = ~("\\\\" | newline | quote) ascii
  longbyteschar = ~"\\\\" ascii
  bytesescapeseq = "\\\\" ascii
 
  ascii = "\\u0000".."\\u007F"
  
  async = "async"
  await = "await"
  
  false = "False" ~id_continue
  class = "class" ~id_continue
  finally = "finally" ~id_continue
  is = "is" ~id_continue
  return = "return" ~id_continue
  
  none = "None" ~id_continue
  continue = "continue" ~id_continue
  for = "for" ~id_continue
  lambda = "lambda" ~id_continue
  try = "try" ~id_continue
  
  true = "True" ~id_continue
  def = "def" ~id_continue
  from = "from" ~id_continue
  nonlocal = "nonlocal" ~id_continue
  while = "while" ~id_continue
  
  and = "and" ~id_continue
  del = "del" ~id_continue
  global = "global" ~id_continue
  not = "not" ~id_continue
  with = "with" ~id_continue
  
  as = "as" ~id_continue
  elif = "elif" ~id_continue
  if = "if" ~id_continue
  or = "or" ~id_continue
  yield = "yield" ~id_continue
  
  assert = "assert" ~id_continue
  else = "else" ~id_continue
  import = "import" ~id_continue
  pass = "pass" ~id_continue
  
  break = "break" ~id_continue
  except = "except" ~id_continue
  in = "in" ~id_continue
  raise = "raise" ~id_continue
  
  comp_op = "<" -- lt
    | ">" -- gt
    | "==" -- eq
    | ">=" -- ge
    | "<=" -- le
    | "<>" -- lg
    | "!=" -- neq
    | in -- in
    | not in -- notin
    | is -- is
    | is not -- isnot
  augassign = "+=" | "-=" | "*=" | "@=" | "/=" | "%=" | "&=" | "|=" | "^=" | "<<=" | ">>=" | "**=" | "//="
  
  NonemptyListWithOptionalEndSep<elem, sep> = NonemptyListOf<elem, sep> sep?
}
`);