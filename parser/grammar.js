const pythonGrammar = ohm.grammar(`
Python {
  Program = (newline | Stmt)* end
  
  Stmt = StmtList newline -- simple
    | CompoundStmt
  
  StmtList = NonemptyListWithOptionalEndSep<SimpleStmt, ";">
  
  SimpleStmt = assert Expr ("," Expr)? -- assert
    | (~((StarredExpr | YieldExpr) stmtSep) TargetList "=")+ (StarredExpr | YieldExpr) -- assign
    | AugTarget augassign (ExprList | YieldExpr) -- augassign
    | AugTarget ":" Expr ("=" Expr)? -- annassign
    | pass -- pass
    // used to be ExprList
    | del TargetList -- del
    | return ExprList? -- return
    | YieldExpr -- yield
    | ImportStmt
    | StarredExpr -- expr
    | raise (Expr (from Expr)?)? -- raise
    | break -- break
    | continue -- continue
    | global NonemptyListOf<identifier, ","> -- global
    | nonlocal NonemptyListOf<identifier, ","> -- nonlocal
  
  stmtSep = ";" | newline

  ImportStmt = import NonemptyListOf<ModuleAsName, ","> -- normal
    | from RelativeModule import NonemptyListOf<IdentifierAsName, ","> -- from
    | from RelativeModule import "(" NonemptyListWithOptionalEndSep<IdentifierAsName, ","> ")" -- fromParen
    | from Module import "*" -- fromStar
  ModuleAsName = Module (as Name)?
  IdentifierAsName = identifier (as Name)?
  Module = NonemptyListOf<identifier, ".">
  RelativeModule = "."* Module -- named
    | "."+ -- unnamed
  Name = identifier

  CompoundStmt = if Expr Suite (elif Expr Suite)* (else Suite)? -- if
    | while Expr Suite (else Suite)? -- while
    | for TargetList in ExprList Suite (else Suite)? -- for
    | try Suite (except (Expr (as identifier)?)? Suite)+ (else Suite)? (finally Suite)? -- tryWithExcept
    | try Suite finally Suite -- tryWithoutExcept
    | with NonemptyListOf<WithItem, ","> Suite -- with
    | Decorator* def identifier "(" ParameterListWithAnn? ")" ("->" Expr)? Suite -- funcdef
    | Decorator* class identifier ("(" ArgList? ")")? Suite -- classdef
    | Decorator* async def identifier "(" ParameterListWithAnn? ")" ("->" Expr)? Suite -- asyncFuncDef
    | async CompoundStmt_with -- asyncWith
    | async CompoundStmt_for -- asyncFor
  
  Suite = ":" newline indent Stmt+  dedent -- many
    | ":" StmtList newline -- single
  
  WithItem = Expr ("as" Target)?
  Decorator = "@" DottedName ("(" (ArgList ","?)? ")")? newline
  DottedName = NonemptyListOf<identifier, ".">
  
  ParameterListWithoutAnn = ParameterList<Parameter_noann>
  ParameterListWithAnn = ParameterList<Parameter_normal>

  ParameterList<Param> = NonemptyListOf<DefParameter<Param>, ","> ("," ParameterListStarArgs<Param>?)? -- normal
    | ParameterListStarArgs<Param>
  ParameterListStarArgs<Param> = "*" Param? ("," DefParameter<Param>)* ("," ("**" Param ","?)?)? -- argsAndKwargs
    | "**" Param ","? -- kwargs
  Parameter = identifier (":" Expr)? -- normal
    | identifier -- noann
  DefParameter<Param> = Param ("=" Expr)?

  ExprList = NonemptyListWithOptionalEndSep<Expr, ",">

  ExprList_withoutEndingIn = 
    | Expr ("," Expr)* "," -- endComma
    | ExprList_withoutEndingIn_item ("," ExprList_withoutEndingIn_item)* -- noEndComma

  ExprList_withoutEndingIn_item =
    | Expr &"," -- notEnd
    | Expr_withoutEndingIn -- end

  StarredList = NonemptyListWithOptionalEndSep<StarredItem, ",">

  // TODO: not sure about this
  StarredExpr = NonemptyListOf<StarredItem, ","> -- star 
    | Expr

  StarredItem = "*" OrExpr -- star
    | Expr

  Expr = lambda ParameterListWithoutAnn? ":" Expr -- lambda
    | OrTest (if OrTest else Expr)? -- cond

  Expr_nocond = lambda ParameterListWithoutAnn? ":" Expr_nocond -- lambda
    | OrTest
  
  Expr_withoutEndingIn =
    | lambda ParameterListWithoutAnn? ":" Expr_withoutEndingIn -- lambda
    | OrTest if OrTest else Expr_withoutEndingIn -- cond
    | OrTest_withoutEndingIn

  OrTest = OrTest or AndTest -- or
    | AndTest
  
  OrTest_withoutEndingIn =
    | OrTest or AndTest_withoutEndingIn -- or
    | AndTest_withoutEndingIn

  AndTest = AndTest and NotTest -- and
    | NotTest
  
  AndTest_withoutEndingIn =
    | AndTest and NotTest_withoutEndingIn -- and
    | NotTest_withoutEndingIn

  NotTest = not NotTest -- not
    | Comparison
  
  NotTest_withoutEndingIn =
    | not NotTest_withoutEndingIn -- not
    | Comparison_withoutEndingIn

  Star_expr = "*" Expr

  Comparison = OrExpr ComparisonRest -- default
    | OrExpr ComparisonRest_withoutEndingIn -- withoutEndingIn
  
  ComparisonRest =
    | (comp_op OrExpr)* -- default
    | ComparisonRestItemWithoutEndingIn* -- withoutEndingIn
  
  ComparisonRestItemWithoutEndingIn =
    | in OrExpr &(comp_op OrExpr) -- in
    | ~in comp_op OrExpr -- default

  OrExpr = OrExpr "|" XorExpr -- or
    | XorExpr

  XorExpr = XorExpr "^" AndExpr -- xor
    | AndExpr

  AndExpr = AndExpr "&" ShiftExpr -- and
    | ShiftExpr

  ShiftExpr = ShiftExpr ("<<"|">>") AddExpr -- shift
    | AddExpr

  AddExpr = AddExpr ("+"|"-") MultExpr -- addSub
    | MultExpr

  MultExpr = MultExpr "*" UnaryExpr -- mult
    | MultExpr "@" MultExpr -- matMult
    | MultExpr "//" UnaryExpr -- intDiv
    | MultExpr "/" UnaryExpr -- div
    | MultExpr "%" UnaryExpr -- mod
    | UnaryExpr

  UnaryExpr = ("+"|"-"|"~") UnaryExpr -- unary
    | Power

  Power = AwaitExpr ("**" UnaryExpr)?

  AwaitExpr = await PrimaryExpr -- await
    | PrimaryExpr

  PrimaryExpr = 
    | PrimaryExpr "." identifier -- attributeref
    | PrimaryExpr "[" SliceList "]" -- slicing
    | PrimaryExpr "[" ExprList "]" -- subscription
    | PrimaryExpr "(" (Comprehension | ArgList)? ")" -- call
    | Atom
  
  Atom = 
    | "(" StarredExpr? ")" -- tuple
    | "[" (Comprehension | StarredList)? "]" -- list
    | "{" (Comprehension | StarredList) "}" -- set
    | "{" (DictComprehension | KeyDatumList)? "}" -- dict
    | "(" Expr CompIter_for ")" -- generator
    | "(" YieldExpr ")" -- yield
    | identifier -- identifier
    | literal -- literal
    | "..." -- ellipsis
    | none -- none
    | true -- true
    | false -- false

  YieldExpr = yield YieldArg?
  YieldArg = 
    | from Expr -- from
    | ExprList -- args
  
  SliceList = NonemptyListWithOptionalEndSep<Slice, ",">
  Slice = 
    | Expr? ":" Expr? Sliceop? -- slice
    | Expr -- single
  Sliceop = ":" Expr?

  ArgList = PositionalArguments ("," StarredAndKeywordsArguments)? ("," KeywordsArguments)? ","?

  Argument = Expr -- positional
    | "*" Expr -- singleStar
    | identifier "=" Expr -- keyword
    | "**" Expr -- doubleStar
  
  PositionalArgument = Argument_positional | Argument_singleStar
  StarredAndKeywordsArgument = Argument_singleStar | Argument_keyword
  KeywordsArgument = Argument_keyword | Argument_doubleStar
  
  PositionalArguments = NonemptyListOf<~(Argument_keyword) PositionalArgument, ",">
  StarredAndKeywordsArguments = NonemptyListOf<StarredAndKeywordsArgument, ",">
  KeywordsArguments = NonemptyListOf<KeywordsArgument, ",">

  TargetList = NonemptyListWithOptionalEndSep<Target, ",">
  TargetInternalList = NonemptyListWithOptionalEndSep<TargetInternal, ",">
  TargetInternal = Target
    | "*" Target -- star
  Target = 
    | "(" TargetInternalList? ")" -- tuple
    | "[" TargetInternalList? "]" -- list
    | PrimaryExpr_attributeref -- attributeref
    | PrimaryExpr_subscription -- subscription
    | PrimaryExpr_slicing -- slicing
    | identifier -- identifier
  
  AugTarget = Target_attributeref
    | Target_subscription
    | Target_slicing
    | identifier

  KeyDatumList = NonemptyListWithOptionalEndSep<KeyDatum, ",">
  KeyDatum = Expr ":" Expr -- keyValue
    | "**" Expr -- doublestar
    
  DictComprehension = KeyDatum_keyValue CompIter_for
  Comprehension = Expr CompIter_for 
  // ExprList_withoutEndingIn
  CompIter = async? for TargetList in OrTest CompIter? -- for
    | if Expr_nocond CompIter? -- if
  
  newline = "\\n"
  space := " "
    | "\\t"
    | comment
  indent = "⇨"
  dedent = "⇦"
  comment = "#" (~"\\n" any)*
  
  identifier = ~keyword id_start id_continue*
  id_start = "_"
  	| "a".."z"
    | "A".."Z"
  id_continue = id_start
  	| "0".."9"
 
  literal = stringliteral | bytesliteral |integer | floating_point | imaginary
 
  number = imaginary
    | floating_point
    | integer
  
  integer = 
    | "0" ("b" | "B") ("_"? bindigit)+ -- binary
    | "0" ("o" | "O") ("_"? octdigit)+ -- octal
    | "0" ("x" | "X") ("_"? hexdigit)+ -- hex
    | nonzerodigit ("_"? digit)* -- nonzerodecimal
    | "0"+ ("_"? "0")* -- zero
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
  
  stringliteral = stringprefix? (longstring | shortstring)
  stringprefix = "fr" | "Fr" | "fR" | "FR" | "rf" | "rF" | "Rf" | "RF" | "r" | "u" | "R" | "U" | "f" | "F" 
  shortstring = "'" shortstringitem<"'">* "'" | "\\"" shortstringitem<"\\"">* "\\""
  longstring = "'''" (~"'''" longstringitem)* "'''" | "\\"\\"\\"" (~"\\"\\"\\"" longstringitem)* "\\"\\"\\""
  shortstringitem<quote> = shortstringchar<quote> | stringescapeseq
  longstringitem = longstringchar | stringescapeseq
  shortstringchar<quote> = ~(quote|newline|"\\\\") any
  longstringchar = ~"\\\\" any
  stringescapeseq = "\\\\" any
  
  bytesliteral = bytesprefix (longbytes | shortbytes)
  bytesprefix = "br" | "Br" | "bR" | "BR" | "rb" | "rB" | "Rb" | "RB" | "b" | "B" 
  shortbytes = "'" shortbytesitem<"'">* "'" | "\\"" shortbytesitem<"\\"">* "\\""
  longbytes = "'''" (~"'''" longbytesitem)* "'''" | "\\"\\"\\"" (~"\\"\\"\\"" longbytesitem)* "\\"\\"\\""
  shortbytesitem<quote> = shortbyteschar<quote> | bytesescapeseq
  longbytesitem = longbyteschar | bytesescapeseq
  shortbyteschar<quote> = ~("\\\\" | newline | quote) ascii
  longbyteschar = ~"\\\\" ascii
  bytesescapeseq = "\\\\" ascii
 
  ascii = "\\u0000".."\\u007F"
  
  async = "async" ~id_continue
  await = "await" ~id_continue
  
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

  keyword
    = false | none | true | and | as | assert | break | class | continue | def | del | elif | else | except
    | finally | for | from | global | if | import | in | is | lambda | nonlocal | not | or | pass | raise
    | return | try | while | with | yield
  
  comp_op = 
    | "==" -- eq
    | ">=" -- ge
    | "<=" -- le
    | "<>" -- lg
    | "<" -- lt
    | ">" -- gt
    | "!=" -- neq
    | not space* in -- notin
    | in -- in
    | is space* not -- isnot
    | is -- is
  augassign = "+=" | "-=" | "*=" | "@=" | "/=" | "%=" | "&=" | "|=" | "^=" | "<<=" | ">>=" | "**=" | "//="
  
  NonemptyListWithOptionalEndSep<elem, sep> = NonemptyListOf<elem, sep> sep?
}
`);

window.grammar = pythonGrammar;