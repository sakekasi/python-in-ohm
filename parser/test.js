const tests = [
  {
    unpreprocessed: `class Point(object):
  def __init__(self, x, y):
    self.x = x
    self.y = y

  def __str__(self):
    sx = str(self.x)
    sy = str(self.y)
    return "(" + sx + ", " + sy + ")"

  def toDebugString(self):
    return str(self)

  def move(self):
    self.x = self.x + 5
    self.y = self.y - 7

p = Point(1, 2)
s = str(p)

before = p
p.move()
after = p`,
    rule: 'Program'
  },
  {
    unpreprocessed: `a, b = 5, 6
a, b = b, a
a.b += c`,
    rule: 'Program'
  },
  {
    unpreprocessed: `sum = 0
i = 0
while i < 10:
  sum += i
  i += 1`,
    rule: 'Program'
  },
  {
    unpreprocessed: `def fib(n):
  if n < 2:
    return n
  else:
    fa = fib(n-1)
    fb = fib(n-2)
    return fa + fb


for x in range(5): 
  fx = fib(x)`,
    rule: 'Program'
  },
  {
    unpreprocessed: `def less(a, b):
  return a < b

def five():
  return 5

a = five() if less(3, 5) else 2`,
    rule: 'Program'
  },
  {
    unpreprocessed: `from functools import reduce

ans = reduce(
  lambda x, y:
    x + y,
  [1, 2, 3, 4], 0)`,
    rule: 'Program'
  },
  {
    unpreprocessed: `sum = 0
for x in range(5): 
  sum = sum + x`,
    rule: 'Program'
  },
//   {
//     code: `def f(a = 5):
// ⇨ return a
// ⇦`,
//     rule: 'Program'
//   },
//   {
//     code: `import json 
// import time 
// from events import * 
// from Env import Env , Scope 
// from utils import toJSON 
// import pickle 
// class EventRecorder ( object ) : 
// ⇨ def __init__ ( self , queue ) : 
// ⇨ self . currentProgramOrSendEvent = None 
// self . queue = queue 
// self . raised = False 
// ⇦ def program ( self , orderNum , sourceLoc ) : 
// ⇨ event = ProgramEvent ( orderNum , sourceLoc ) 
// self . currentProgramOrSendEvent = event 
// self . _emit ( event ) 
// env = self . mkEnv ( sourceLoc , None , None , 'program' , [ ] ) 
// return env 
// ⇦ def send ( self , orderNum , sourceLoc , env , recv , selector , args , activationPathToken ) : 
// ⇨ event = SendEvent ( orderNum , sourceLoc , env , recv , selector , args , activationPathToken ) 
// self . _emit ( event ) 
// env . currentSendEvent = event 
// self . currentProgramOrSendEvent = event 
// ⇦ def _hiddenSend ( self , env , selector ) : 
// ⇨ self . send ( - 1 , None , env , None , selector , [ ] , None ) 
// ⇦ def _mkHiddenEnv ( self , parentEnv ) : 
// ⇨ programOrSendEvent = self . currentProgramOrSendEvent 
// newEnv = Env ( None , parentEnv , programOrSendEvent . env , programOrSendEvent ) 
// return self . _registerSend ( newEnv ) 
// ⇦ def mkEnv ( self , newEnvSourceLoc , parentEnv , recv , selector , args , scope = False ) : 
// ⇨ if scope : 
// ⇨ envClass = Scope 
// ⇦ else : 
// ⇨ envClass = Env 
// ⇦ programOrSendEvent = self . currentProgramOrSendEvent 
// same = ( recv is programOrSendEvent . recv ) and ( selector is programOrSendEvent . selector ) 
// for idx , arg in enumerate ( args ) : 
// ⇨ same = same and ( arg is programOrSendEvent . args [ idx ] ) 
// ⇦ if not programOrSendEvent . activated : 
// ⇨ if same : 
// ⇨ callerEnv = programOrSendEvent . env 
// ⇦ else : 
// ⇨ callerEnv = self . _mkHiddenEnv ( parentEnv ) 
// self . _hiddenSend ( callerEnv , selector ) 
// programOrSendEvent = self . currentProgramOrSendEvent 
// ⇦ ⇦ else : 
// ⇨ callerEnv = programOrSendEvent . env 
// self . _hiddenSend ( callerEnv , selector ) 
// programOrSendEvent = self . currentProgramOrSendEvent 
// ⇦ newEnv = envClass ( newEnvSourceLoc , parentEnv , callerEnv , programOrSendEvent ) 
// return self . _registerSend ( newEnv ) 
// ⇦ def _registerSend ( self , newEnv ) : 
// ⇨ programOrSendEvent = self . currentProgramOrSendEvent 
// if ( ( isinstance ( programOrSendEvent , SendEvent ) or isinstance ( programOrSendEvent , ProgramEvent ) ) and hasattr ( programOrSendEvent , 'activationEnv' ) ) : 
// ⇨ programOrSendEvent . activationEnv = newEnv 
// programOrSendEvent . activated = True 
// if programOrSendEvent . env != None : 
// ⇨ parentEvent = programOrSendEvent . env . programOrSendEvent 
// ⇦ else : 
// ⇨ parentEvent = None 
// ⇦ if parentEvent != None : 
// ⇨ parentEvent . children . append ( programOrSendEvent ) 
// ⇦ self . queue . put ( pickle . dumps ( newEnv . toJSONObject ( ) ) ) 
// return newEnv 
// ⇦ ⇦ def receive ( self , env , returnValue ) : 
// ⇨ if not self . currentProgramOrSendEvent . activated : 
// ⇨ newEnv = self . _mkHiddenEnv ( None ) 
// self . _registerSend ( newEnv ) 
// ⇦ event = ReceiveEvent ( env , returnValue ) 
// self . _emit ( event ) 
// try : 
// ⇨ env . currentSendEvent . returnValue = returnValue 
// ⇦ except AttributeError : 
// ⇨ pass 
// ⇦ self . currentProgramOrSendEvent = env . programOrSendEvent 
// return returnValue 
// ⇦ def enterScope ( self , orderNum , sourceLoc , env ) : 
// ⇨ self . send ( orderNum , sourceLoc , env , None , 'enterNewScope' , [ ] , None ) 
// return self . mkEnv ( sourceLoc , env , None , 'enterNewScope' , [ ] , True ) 
// ⇦ def leaveScope ( self , env ) : 
// ⇨ self . receive ( env , None ) 
// ⇦ def _emit ( self , event ) : 
// ⇨ self . queue . put ( pickle . dumps ( event . toJSONObject ( ) ) ) 
// ⇦ def show ( self , orderNum , sourceLoc , env , string , alt ) : 
// ⇨ pass 
// ⇦ def error ( self , sourceLoc , env , error ) : 
// ⇨ event = ErrorEvent ( sourceLoc , env , str ( error ) ) 
// self . raised = True 
// self . _emit ( event ) 
// return error 
// ⇦ def localReturn ( self , orderNum , sourceLoc , env , value ) : 
// ⇨ event = LocalReturnEvent ( orderNum , sourceLoc , env , value ) 
// self . _emit ( event ) 
// return value 
// ⇦ def nonLocalReturn ( self , orderNum , sourceLoc , env , value ) : 
// ⇨ pass 
// ⇦ def assignVar ( self , orderNum , sourceLoc , env , declEnv , name , value ) : 
// ⇨ try : 
// ⇨ declEnv = declEnv . getDeclEnvFor ( name ) 
// event = VarAssignmentEvent ( orderNum , sourceLoc , env , declEnv , name , value ) 
// ⇦ except KeyError : 
// ⇨ declEnv . declare ( name ) 
// event = VarDeclEvent ( orderNum , sourceLoc , env , declEnv , name , value ) 
// ⇦ self . _emit ( event ) 
// return value 
// ⇦ def assignInstVar ( self , orderNum , sourceLoc , env , obj , name , value ) : 
// ⇨ event = InstVarAssignmentEvent ( orderNum , sourceLoc , env , obj , name , value ) 
// self . _emit ( event ) 
// return value 
// ⇦ def instantiate ( self , orderNum , sourceLoc , env , _class , args , newInstance ) : 
// ⇨ event = InstantiationEvent ( orderNum , sourceLoc , env , _class , args , newInstance ) 
// self . _emit ( event ) 
// return newInstance 
// ⇦ def done ( self ) : 
// ⇨ self . queue . put ( pickle . dumps ( { 'type' : 'done' } ) ) 
// ⇦ ⇦ `,
//     rule : 'Program'
//   },
//   {
//     code: `fibonacci(5)`,
//     rule: 'Expr_stmt'
//   },
//   {
//     code: `a = {"x": 5, "y": 69}`,
//     rule: 'Small_stmt'
//   },
//   {
//     code: `a, b = (b, a)`,
//     rule: 'Small_stmt'
//   },
//   {
//     code: `yield a`,
//     rule: 'Small_stmt'
//   },
//   {
//     code: `global a`,
//     rule: 'Small_stmt'
//   },
//   {
//     code: `import json`,
//     rule: 'Small_stmt'
//   },
//   {
//     code: `pass`,
//     rule: 'Small_stmt_pass'
//   },
//   {
//     code: `a`,
//     rule: 'Expr'
//   },
//   {
//     code: `del a, b, c,`,
//     rule: 'Small_stmt_del'
//   },
//   {
//     code: `a = 5`,
//     rule: 'Expr_stmt'
//   },
//   {
//     code: `__init__`,
//     rule: 'Test'
//   },
//   {
//     code: `__init__`,
//     rule: 'identifier'
//   },
//   {
//     code: `3.14e45j`,
//     rule: 'number'
//   },
//   {
//     code: `3.14e45`,
//     rule: 'number'
//   },
//   {
//     code: `3.14`,
//     rule: 'number'
//   },
//   {
//     code: `"hello world\\n"`,
//     rule: 'string'
//   },
//   {
//     code: `def __init__ ( FILLMEIN2 ) : 
// ⇨ x = 5 
// y = 6 
// ⇦ `,
//     rule: 'Program'
//   },
//   {
//     code: `def __init__ ( FILLMEIN2 ) : 
// ⇨ self . x = x 
// self . y = y 
// ⇦ `,
//     rule: 'Program'
//   },
//   {
//     code: `def __init__ ( self , x , y ) : 
// ⇨ self . x = x 
// self . y = y 
// ⇦ `,
//     rule: 'Program'
//   }
]

const preprocessor = new Preprocessor();
tests.forEach(({unpreprocessed, code, rule}, idx) => {
  let result;
  let map;
  if (unpreprocessed) {
    const tokenStream = preprocessor.lex(unpreprocessed);
    code = tokenStream.output.code;
    map = tokenStream.output.map;
  }

  result = pythonGrammar.match(code, rule);
  
  if (result.succeeded()) {
    console.log(code);
    console.log(rule, 'SUCCEEDED');
    console.log(result);

    const ast = semantics(result).toAST(map);
    console.log(ast);
    console.log(ast.toString());
    
    if (unpreprocessed) {
      console.log('\nVERIFYING');
      ast.verify(unpreprocessed);
    }

    const instrumented = ast.instrumented(new InstrumenterState());
    console.log(instrumented);
    console.log(instrumented.toString());
  } else {
    console.log(code);
    console.log(rule, 'FAILED');
    console.error(result.message);
  }
});