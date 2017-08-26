const lexer = new Lexer();

const state = {
  parenStack: [],
  indentationStack: [0]
};

lexer.addRule(NewLine.regex, _.partial(NewLine.create, state));
lexer.addRule(WhiteSpace.regex, _.partial(WhiteSpace.create, state));
lexer.addRule(EOF.regex, _.partial(EOF.create, state));
lexer.addRule(Identifier.regex, _.partial(Identifier.create, state));
// TODO: update identifier to handle unicode
lexer.addRule(Keyword.regex, _.partial(Keyword.create, state));
lexer.addRule(StringLiteral.regex, _.partial(StringLiteral.create, state));
// TODO: update string literals to account for escape chars
// TODO: the rest of the literals
lexer.addRule(Operator.regex, _.partial(Operator.create, state));
lexer.addRule(Delimiter.regex, _.partial(Delimiter.create, state));

const tests = [
  `
class Point(object):
  def __init__(self, x, y):
    self.x = x
    self.y = y

  def getX():
    return self.x`,
  'a + b / c ** d @ e @@',
  `"hello"`,
  `'''test\n  \thi'''`,
  `(['test'\n  ]\n    )`
];

tests.forEach(test => {
  console.log(test);
  lexer.setInput(test);
  let token;
  while(token = lexer.lex()) {
    console.log(token);
  }
  console.log('\n');
})

window.lexer = lexer;
