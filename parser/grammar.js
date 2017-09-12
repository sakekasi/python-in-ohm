const pythonGrammar = ohm.grammar(`
Python {
  Program = (newline | Stmt)* end
  
  Stmt = StmtList newline -- simple
    | CompoundStmt
  
  StmtList = NonemptyListWithOptionalEndSep<SimpleStmt, ";">
  
  SimpleStmt = assert Expr ("," Expr)? -- assert
    | (TargetList "=")+ (StarredExpr | YieldExpr) -- assign
    | AugTarget augassign (ExprList | YieldExpr) -- augassign
    | AugTarget ":" Expr ("=" Expr)? -- annassign
    | pass -- pass
    | del ExprList -- del
    | return ExprList? -- return
    | YieldExpr -- yield
    | ImportStmt
    | StarredExpr -- expr
    | raise (Expr (from Expr)?)? -- raise
    | break -- break
    | continue -- continue
    | global NonemptyListOf<identifier, ","> -- global
    | nonlocal NonemptyListOf<identifier, ","> -- nonlocal

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
    | Decorator* def identifier "(" ParameterList? ")" ("->" Expr)? Suite -- funcdef
    | Decorator* class identifier ("(" ArgList? ")")? Suite -- classdef
    | Decorator* async def identifier "(" ParameterList? ")" ("->" Expr)? Suite -- asyncFuncDef
    | async CompoundStmt_with -- asyncWith
    | async CompoundStmt_for -- asyncFor
  
  Suite = ":" newline indent Stmt+  dedent -- many
    | ":" StmtList newline -- single
  
  WithItem = Expr ("as" Target)?
  Decorator = "@" DottedName ("(" (ArgList ","?)? ")")? newline
  DottedName = NonemptyListOf<identifier, ".">
  
  ParameterList = NonemptyListOf<DefParameter, ","> ("," ParameterListStarArgs?)? -- normal
    | ParameterListStarArgs -- starargs
  ParameterListStarArgs = "*" Parameter? ("," DefParameter)* ("," ("**" Parameter ","?)?)? -- argsAndKwargs
    | "**" Parameter ","? -- kwargs
  Parameter = identifier // (":" Expr)? // TODO
  DefParameter = Parameter ("=" Expr)?

  Varargslist = Vfpdef ("=" Expr)? ("," Vfpdef ("=" Expr)?)* ("," VarArgsRest)? -- positional
  | VarArgsRest -- var
  VarArgsRest = "*" Vfpdef? ("," Vfpdef ("=" Expr)?)* ("," ("**" Vfpdef ","?)?)? -- single_star
  | "**" Vfpdef ","? -- double_star
  Vfpdef = identifier

  ExprList = NonemptyListWithOptionalEndSep<Expr, ",">
  StarredList = NonemptyListWithOptionalEndSep<StarredItem, ",">

  StarredExpr = ListOf<StarredItem, ","> -- star
    | Expr
  StarredItem = "*" OrExpr -- star
    | Expr

  Expr = lambda ParameterList? ":" Expr -- lambda
    | OrTest (if OrTest else Expr)? -- cond

  Expr_nocond = lambda ParameterList? ":" Expr_nocond -- lambda
    | OrTest

  OrTest = OrTest or AndTest -- or
    | AndTest

  AndTest = AndTest and NotTest -- and
    | NotTest

  NotTest = not NotTest -- not
    | Comparison

  Star_expr = "*" Expr

  Comparison = OrExpr (comp_op OrExpr)*

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

  PrimaryExpr = PrimaryExpr "." identifier -- attributeref
    | PrimaryExpr "[" ExprList "]" -- subscription
    | PrimaryExpr "[" SliceList "]" -- slicing
    | PrimaryExpr "(" (ArgList | Comprehension)? ")" -- call
    | Atom
  
  Atom = "(" (StarredExpr)? ")" -- tuple
    | "[" (StarredList | Comprehension)? "]" -- list
    | "{" (StarredList | Comprehension) "}" -- set
    | "{" (KeyDatumList | DictComprehension)? "}" -- dict
    | "(" Expr CompIter_for ")"-- generator
    | "(" YieldExpr ")" -- yield
    | identifier -- identifier
    | literal -- literal
    | "..." -- ellipsis
    | none -- none
    | true -- true
    | false -- false

  YieldExpr = yield YieldArg?
  YieldArg = from Expr -- from
    | ExprList -- args
  
  SliceList = NonemptyListWithOptionalEndSep<Slice, ",">
  Slice = Expr -- single
    | Expr? ":" Expr? Sliceop? -- slice
  Sliceop = ":" Expr?

  ArgList = PositionalArguments ("," KeywordsArguments)? ","?

  Argument = Expr -- positional
    | "*" Expr -- singleStar
    | identifier "=" Expr -- keyword
    | "**" Expr -- doubleStar
  
  PositionalArgument = Argument_positional | Argument_singleStar
  StarredOrKeywordArgument = Argument_singleStar | Argument_keyword
  KeywordsArgument = Argument_keyword | Argument_doubleStar
  
  PositionalArguments = NonemptyListOf<PositionalArgument, ",">
  StarredOrKeywordArguments = NonemptyListOf<StarredOrKeywordArgument, ",">
  KeywordsArguments = NonemptyListOf<KeywordsArgument, ",">

  TargetList = NonemptyListWithOptionalEndSep<Target, ",">
  Target = identifier -- identifier
    | "(" TargetList? ")" -- tuple
    | "[" TargetList? "]" -- list
    | PrimaryExpr_attributeref -- attributeref
    | PrimaryExpr_subscription -- subscription
    | PrimaryExpr_slicing -- slicing
    | "*" Target -- star
  
  AugTarget = identifier
    | Target_attributeref
    | Target_subscription
    | Target_slicing

  KeyDatumList = NonemptyListWithOptionalEndSep<KeyDatum, ",">
  KeyDatum = Expr ":" Expr -- keyValue
    | "**" Expr -- doublestar

  DictComprehension = KeyDatum_keyValue CompIter_for
  Comprehension = Expr CompIter_for 
  CompIter = async? for ExprList in OrTest CompIter? -- for
    | if Expr_nocond CompIter? -- if
  
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
 
  literal = stringliteral | bytesliteral |integer | floating_point | imaginary
 
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

window.grammar = pythonGrammar;