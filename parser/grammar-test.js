const tests = {
  Program: [
    {
      name: 'less than or equal',
      code: `a = 5
b = a <= 5
`,
      succeed: true
    },
    {
      name: 'point',
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
      succeed: true
    }
    // TODO: failing example
  ],

  'WithItem': [
    {
      name: 'foo() as (a, b)',
      code: 'foo() as (a, b)',
    },
    {
      name: 'bar**2 as test',
      code: 'bar**2 as test',
    },
    {
      name: 'a as 42',
      code: 'a as 42',
      succeed: false
    },
    {
      name: 'a as',
      code: 'a as',
      succeed: false
    },
  ],

  'StmtList': [
    {
      name: '',
      code: '',
      succeed: false,
    },
  ],

  'SimpleStmt_assign': [
    {
      name: 'test = x <= 3',
      code: 'test = x <= 3',
      succeed: true
    },
    {
      name: `hello = goodbye = yield 42`,
      code: `hello = goodbye = yield 42`,
    },
    {
      name: `(a, *b, c) = d = (e, f) = fn()`,
      code: `(a, *b, c) = d = (e, f) = fn()`,
    },
    {
      name: ` = 42`,
      code: ` = 42`,
      succeed: false,
    },
    {
      name: `a = 5,`,
      code: `a = 5,`,
      succeed: false,
    },
  ],

  'SimpleStmt_augassign': [
    {
      name: `hello += 5, 6, 7`,
      code: `hello += 5, 6, 7`,
    },
    {
      name: `hello += yield 42`,
      code: `hello += yield 42`,
    },
    {
      name: `hello += 6,`,
      code: `hello += 6,`,
    },
    {
      name: `hello +=`,
      code: `hello +=`,
      succeed: false,
    },
  ],

  'SimpleStmt_annassign': [
    {
      name: `hello : meow()`,
      code: `hello : meow()`,
    },
    {
      name: `hello : meow() = hi`,
      code: `hello : meow() = hi`,
    },
    {
      name: `hello : = hi`,
      code: `hello : = hi`,
      succeed: false,
    },
    {
      name: `hello() : meow() = hi`,
      code: `hello() : meow() = hi`,
      succeed: false,
    },
  ],

  'SimpleStmt_del': [
    {
      name: `del a, b, c`,
      code: `del a, b, c`,
    },
    {
      name: `del a`,
      code: `del a`,
    },
    {
      name: `del`,
      code: `del`,
      succeed: false,
    },
    {
      name: `del a,`,
      code: `del a,`,
    },
  ],

  'SimpleStmt_return': [
    {
      name: `return`,
      code: `return`,
    },
    {
      name: `return hello`,
      code: `return hello`,
    },
    {
      name: 'return hello, goodbye',
      code: 'return hello, goodbye',
    },
    {
      name: `return hello, goodbye,`,
      code: `return hello, goodbye,`,
    },
  ],

  'SimpleStmt_expr': [
    {
      name: '',
      code: '',
      succeed: false,
    },
  ],

  'SimpleStmt_raise': [
    {
      name: `raise`,
      code: `raise`,
    },
    {
      name: `raise Error()`,
      code: `raise Error()`,
    },
    {
      name: 'raise Error() from expr',
      code: 'raise Error() from expr',
    },
    {
      name: `raise expr expr`,
      code: `raise expr expr`,
      succeed: false,
    },
    {
      name: `raise expr from expr from expr`,
      code: `raise expr from expr from expr`,
      succeed: false,
    },
  ],

  'SimpleStmt_global': [
    {
      name: `global hello`,
      code: `global hello`,
    },
    {
      name: `global hello, goodbye`,
      code: `global hello, goodbye`,
    },
    {
      name: `global`,
      code: `global`,
      succeed: false,
    },
    {
      name: `global hello,`,
      code: `global hello,`,
      succeed: false,
    },
  ],

  'SimpleStmt_nonlocal': [
    {
      name: `nonlocal hello`,
      code: `nonlocal hello`,
    },
    {
      name: `nonlocal hello, goodbye`,
      code: `nonlocal hello, goodbye`,
    },
    {
      name: `nonlocal`,
      code: `nonlocal`,
      succeed: false,
    },
    {
      name: `nonlocal hello,`,
      code: `nonlocal hello,`,
      succeed: false,
    },
  ],

  'ImportStmt_normal': [
    {
      name: `import math`,
      code: `import math`,
    },
    {
      name: `import random as hi, meow as b`,
      code: `import random as hi, meow as b`,
    },
    {
      name: `import random,`,
      code: `import random,`,
      succeed: false,
    },
    {
      name: `import`,
      code: `import`,
      succeed: false,
    },
  ],

  'ImportStmt_from': [
    {
      name: `from test import a`,
      code: `from test import a`,
    },
    {
      name: `from test import a, b`,
      code: `from test import a, b`,
    },
    {
      name: `from test import`,
      code: `from test import`,
      succeed: false,
    },
    {
      name: `from test import (a, b)`,
      code: `from test import (a, b)`,
      succeed: false,
    },
  ],

  'ImportStmt_fromParen': [
    {
      name: `from ..hello import ( hi )`,
      code: `from ..hello import ( hi )`,
    },
    {
      name: `from hello import ( meow, hi )`,
      code: `from hello import ( meow, hi )`,
    },
    {
      name: `from hello import ()`,
      code: `from hello import ()`,
      succeed: false,
    },
    {
      name: `from hello import test`,
      code: `from hello import test`,
      succeed: false,
    },
  ],

  'ImportStmt_fromStar': [
    {
      name: `from ast import *`,
      code: `from ast import *`,
    },
    {
      name: `from ast.hi import *`,
      code: `from ast.hi import *`,
    },
    {
      name: `from hello() import *`,
      code: `from hello() import *`,
      succeed: false,
    },
    {
      name: `from a import **`,
      code: `from a import **`,
      succeed: false,
    },
  ],

  'ModuleAsName': [
    {
      name: `test as hi`,
      code: `test as hi`,
    },
    {
      name: `test.hi as meow`,
      code: `test.hi as meow`,
    },
    {
      name: `test() as meow`,
      code: `test() as meow`,
      succeed: false,
    },
    {
      name: `test.hi as meow()`,
      code: `test.hi as meow()`,
      succeed: false,
    },
  ],

  'IdentifierAsName': [
    {
      name: `test`,
      code: `test`,
    },
    {
      name: `test as hi`,
      code: `test as hi`,
    },
    {
      name: `test() as hi`,
      code: `test() as hi`,
      succeed: false,
    },
    {
      name: `test as hi()`,
      code: `test as hi()`,
      succeed: false,
    },
  ],

  'Module': [
    {
      name: `a.b.c.d`,
      code: `a.b.c.d`,
    },
    {
      name: `a`,
      code: `a`,
    },
    {
      name: ``,
      code: ``,
      succeed: false,
    },
    {
      name: `a..b`,
      code: `a..b`,
      succeed: false,
    },
  ],

  'RelativeModule_named': [
    {
      name: `...hello`,
      code: `...hello`,
    },
    {
      name: `hello`,
      code: `hello`,
    },
    {
      name: `hello..`,
      code: `hello..`,
      succeed: false,
    },
    {
      name: ``,
      code: ``,
      succeed: false,
    },
  ],

  'RelativeModule_unnamed': [
    {
      name: `...`,
      code: `...`,
    },
    {
      name: `..`,
      code: `..`,
    },
    {
      name: ``,
      code: ``,
      succeed: false,
    },
    {
      name: `_`,
      code: `_`,
      succeed: false,
    },
  ],

  'CompoundStmt_if': [
    {
      name: `if test: pass\n`,
      unpreprocessed: `if test: pass\n`,
    },
    {
      name: `if test: pass
else: pass\n`,
      unpreprocessed: `if test: pass
else: pass\n`,
    },
    {
      name: `if test: pass
elif test: pass
else: pass\n`,
      unpreprocessed: `if test: pass
elif test: pass
else: pass\n`,
    },
    {
      name: `if test: pass
elif test: pass\n`,
      unpreprocessed: `if test: pass
elif test: pass\n`,
    },
    {
      name: `if test: pass
else: pass
elif test: pass`,
      unpreprocessed: `if test: pass
else: pass
elif test: pass`,
      succeed: false,
    },
    {
      name: `if test: pass
elif: pass\n`,
      unpreprocessed: `if test: pass
elif: pass\n`,
      succeed: false,
    },
  ],

  'CompoundStmt_while': [
    {
      name: `while test: pass\n`,
      unpreprocessed: `while test: pass\n`,
    },
    {
      name: `while test: pass
else: pass\n`,
      unpreprocessed: `while test: pass
else: pass\n`,
    },
    {
      name: `while test else: pass\n`,
      unpreprocessed: `while test else: pass\n`,
      succeed: false,
    },
    {
      name: `while test: pass else`,
      unpreprocessed: `while test: pass else`,
      succeed: false,
    },
  ],

  'CompoundStmt_for': [
    {
      name: `for i in range(4): pass\n`,
      unpreprocessed: `for i in range(4): pass\n`,
    },
    {
      name: `for i, j in zip(a,b): pass 
else: pass\n`,
      unpreprocessed: `for i, j in zip(a,b): pass 
else: pass\n`,
    },
    {
      name: `for in range: pass\n`,
      unpreprocessed: `for in range: pass\n`,
      succeed: false,
    },
    {
      name: `for i in range: pass
else:`,
      unpreprocessed: `for i in range: pass
else:`,
      succeed: false,
    },
  ],

  'CompoundStmt_tryWithExcept': [
    {
      name: `try: pass 
except: meow`,
      unpreprocessed: `try: pass 
except: meow`,
    },
    {
      name: `try: pass
except ValueError: meow`,
      unpreprocessed: `try: pass
except ValueError: meow`,
    },
    {
      name: `try: pass
except ValueError as ve: meow`,
      unpreprocessed: `try: pass
except ValueError as ve: meow`,
    },
    {
      name: `try: pass
except ValueError: meow
else: pass`,
      unpreprocessed: `try: pass
except ValueError: meow
else: pass`,
    },
    {
      name: `try: pass
except ValueError: meow
else: pass
finally: pass\n`,
      unpreprocessed: `try: pass
except ValueError: meow
else: pass
finally: pass\n`,
    },
    {
      name: `try: pass
finally: pass\n`,
      unpreprocessed: `try: pass
finally: pass\n`,
      succeed: false,
    },
    {
      name: `try: pass
except: pass
finally: pass
else: pass`,
      unpreprocessed: `try: pass
except: pass
finally: pass
else: pass`,
      succeed: false,
    },
  ],

  'CompoundStmt_tryWithoutExcept': [
    {
      name: `try: error
finally: thing()`,
      unpreprocessed: `try: error
finally: thing()`,
    },
    {
      name: `try:
  error()
finally:
  a = doTheThing()[5]`,
      unpreprocessed: `try:
  error()
finally:
  a = doTheThing()[5]`,
    },
    {
      name: `try: error`,
      unpreprocessed: `try: error`,
      succeed: false,
    },
    {
      name: `try: error
except e: pass`,
      unpreprocessed: `try: error
except e: pass`,
      succeed: false,
    },
  ],

  'CompoundStmt_with': [
    {
      name: `with meow: pass\n`,
      unpreprocessed: `with meow: pass\n`,
    },
    {
      name: `with a, b as c:
  a = c
  b = d`,
      unpreprocessed: `with a, b as c:
  a = c
  b = d`,
    },
    {
      name: `with : pass\n`,
      unpreprocessed: `with : pass\n`,
      succeed: false,
    },
    {
      name: `with test: \n`,
      unpreprocessed: `with test: \n`,
      succeed: false,
    },
  ],

  'CompoundStmt_funcdef': [
    {
      name: `@static()
def __new__(a, b, c): 
  return test()[5]`,
      unpreprocessed: `@static()
def __new__(a, b, c): 
  return test()[5]`,
    },
    {
      name: `def a() -> meow(): pass\n`,
      unpreprocessed: `def a() -> meow(): pass\n`,
    },
    {
      name: `def a(**k, *a): pass\n`,
      unpreprocessed: `def a(**k, *a): pass\n`,
      succeed: false,
    },
    {
      name: `def test(): \n`,
      unpreprocessed: `def test(): \n`,
      succeed: false,
    },
  ],

  'CompoundStmt_classdef': [
    {
      name: `class Test(object): pass\n`,
      unpreprocessed: `class Test(object): pass\n`,
    },
    {
      name: `class Test:
  def __init__(self):
    pass`,
      unpreprocessed: `class Test:
  def __init__(self):
    pass`,
    },
    {
      name: `class Test()(): pass\n`,
      unpreprocessed: `class Test()(): pass\n`,
      succeed: false,
    },
    {
      name: `class 42(): pass\n`,
      unpreprocessed: `class 42(): pass\n`,
      succeed: false,
    },
  ],

  'CompoundStmt_asyncFuncDef': [
    {
      name: `async def handle_request(self, reader, writer):
  return response`,
      unpreprocessed: `async def handle_request(self, reader, writer):
  return response`,
    },
    {
      name: `async def handle_request(self) -> meow(): pass\n`,
      unpreprocessed: `async def handle_request(self) -> meow(): pass\n`,
    },
    {
      name: `async def test() -> : pass\n`,
      unpreprocessed: `async def test() -> : pass\n`,
      succeed: false,
    },
    {
      name: `async def foo(): \n`,
      unpreprocessed: `async def foo(): \n`,
      succeed: false,
    },
  ],

  'CompoundStmt_asyncWith': [
    {
      name: `async with meow: pass\n`,
      unpreprocessed: `async with meow: pass\n`,
    },
    {
      name: `async with a, b as c:
  a = c
  b = d`,
      unpreprocessed: `async with a, b as c:
  a = c
  b = d`,
    },
    {
      name: `async with 42 as 42: pass\n`,
      unpreprocessed: `async with 42 as 42: pass\n`,
      succeed: false,
    },
    {
      name: `async with : pass\n`,
      unpreprocessed: `async with : pass\n`,
      succeed: false,
    },
  ],

  'CompoundStmt_asyncFor': [
    {
      name: `async for i in range(5):
        print(i)`,
      unpreprocessed: `async for i in range(5):
        print(i)`,
    },
    {
      name: `async for i in range(4): pass\n`,
      unpreprocessed: `async for i in range(4): pass\n`,
    },
    {
      name: `async for i in range(4): \n`,
      unpreprocessed: `async for i in range(4): \n`,
      succeed: false,
    },
    {
      name: `async for i in range(4) pass\n`,
      unpreprocessed: `async for i in range(4) pass\n`,
      succeed: false,
    },
  ],

  'Suite_many': [
    {
      name: ':\\n ⇨ pass \\n⇦',
      code: ':\n ⇨ pass \n⇦',
    },
    {
      name: ':\\n ⇨ a = b\\nb = c \\n⇦',
      code: ':\n ⇨ a = b\nb = c \n⇦',
    },
    {
      name: ':\\n ⇨⇦',
      code: ':\n ⇨⇦',
      succeed: false,
    },
    {
      name: ':\\n pass\\n',
      code: ':\n pass\n',
      succeed: false,
    },
  ],

  'Suite_single': [
    {
      name: ': pass\n',
      code: ': pass\n',
    },
    {
      name: ': pass; a = 5\n',
      code: ': pass; a = 5\n',
    },
    {
      name: ': \\n',
      code: ': \n',
      succeed: false,
    },
    {
      name: 'pass\\n',
      code: 'pass\n',
      succeed: false,
    },
  ],

  'Decorator': [
    {
      name: '@static.method\\n',
      code: '@static.method\n',
    },
    {
      name: '@get("/")\\n',
      code: '@get("/")\n',
    },
    {
      name: '@("/")\\n',
      code: '@("/")\n',
      succeed: false
    },
    {
      name: '@',
      code: '@',
      succeed: false
    },
  ],

  'DottedName': [
    {
      name: 'hello.goodbye',
      code: 'hello.goodbye',
    },
    {
      name: 'meow',
      code: 'meow',
    },
    {
      name: 'hello.goodbye.',
      code: 'hello.goodbye.',
      succeed: false
    },
    {
      name: '..',
      code: '..',
      succeed: false
    },
  ],

  'ParameterList_normal': [
    {
      name: 'a = 5, a',
      code: 'a = 5, a',
    },
    {
      name: 'a = 5, a, *',
      code: 'a = 5, a, *',
    },
    {
      name: ', *',
      code: ', *',
      succeed: false
    },
  ],

  'ParameterListStarArgs_argsAndKwargs': [
    {
      name: '*,',
      code: '*,',
    },
    {
      name: '*args, a = 5,',
      code: '*args, a = 5,',
    },
    {
      name: '*, **kwargs,',
      code: '*, **kwargs,',
    },
    {
      name: 'a = 5',
      code: 'a = 5',
      succeed: false
    },
    {
      name: '*, **',
      code: '*, **',
      succeed: false
    },
  ],

  'ParameterListStarArgs_kwargs': [
    {
      name: '**test',
      code: '**test',
    },
    {
      name: '**test : 4',
      code: '**test : 4',
    },
    {
      name: '**4',
      code: '**4',
      succeed: false
    },
    {
      name: '** meow() : cat',
      code: '** meow() : cat',
      succeed: false
    },
  ],

  'Parameter': [
    {
      name: 'test',
      code: 'test',
    },
    {
      name: 'test : 42',
      code: 'test : 42',
    },
    {
      name: '5',
      code: '5',
      succeed: false
    },
    {
      name: '5 : 42',
      code: '5 : 42',
      succeed: false
    },
  ],

  'DefParameter': [
    {
      name: 'test = 5',
      code: 'test = 5',
    },
    {
      name: 'test : 2 = 42',
      code: 'test : 2 = 42',
    },
    {
      name: '42 = 42',
      code: '42 = 42',
      succeed: false
    },
    {
      name: '42 : 42 = 42',
      code: '42 : 42 = 42',
      succeed: false
    },
  ],

  'StarredExpr_star': [
    {
      name: '*42, 43',
      code: '*42, 43',
    },
    {
      name: '',
      code: '',
      succeed: false
    },
    {
      name: '**42, 43',
      code: '**42, 43',
      succeed: false
    },
  ],

  'StarredItem_star': [
    {
      name: '*42',
      code: '*42',
    },
    {
      name: '*list(dict())',
      code: '*list(dict())',
    },
    {
      name: '*32meow',
      code: '*32meow',
      succeed: false
    },
    {
      name: '42',
      code: '42',
      succeed: false
    },
  ],

  'Expr': [
    {
      name: 'x <= 3',
      code: 'x <= 3',
      succeed: true
    }
  ],
  
  'Expr_lambda': [
    {
      name: 'lambda x, y: x + y, [1,2,3,4], 0: 4 : pass',
      code: 'lambda x, y: x + y, [1,2,3,4], 0: 4 : pass',
      succeed: false
    },
    {
      name: 'lambda: 42',
      code: 'lambda: 42',
    },
    {
      name: 'lambda x = 5: 5**x',
      code: 'lambda x = 5: 5**x',
    },
    {
      name: 'lambda 42',
      code: 'lambda 42',
      succeed: false
    },
  ],

  'Expr_cond': [
    {
      name: 'five() if less(3, 5) else 2',
      code: 'five() if less(3, 5) else 2',
    },
    {
      name: 'meow()[5]',
      code: 'meow()[5]',
    },
    {
      name: 'a else b if c',
      code: 'a else b if c',
      succeed: false
    },
    {
      name: 'a if b if c',
      code: 'a if b if c',
      succeed: false
    },
  ],

  'Expr_withoutEndingIn_lambda': [
    {
      name: 'lambda: x in y',
      code: 'lambda: x in y',
      succeed: false
    },
  ],

  'Expr_withoutEndingIn_cond': [
    {
      name: 'a if b else c in d',
      code: 'a if b else c in d',
      succeed: false
    },
  ],

  'OrTest_or': [
    {
      name: 'True or False',
      code: 'True or False',
    },
    {
      name: 'True or not 42',
      code: 'True or not 42',
    },
    {
      name: 'True or 42 o 43',
      code: 'True or 42 o 43',
      succeed: false
    },
  ],

  'OrTest_withoutEndingIn_or': [
    {
      name: 'True or 4 in [4, 5, 6]',
      code: 'True or 4 in [4, 5, 6]',
      succeed: false
    },
  ],

  'AndTest_and': [
    {
      name: 'True and False',
      code: 'True and False',
    },
    {
      name: 'True and not 42',
      code: 'True and not 42',
    },
    {
      name: 'True and 42 or 43',
      code: 'True and 42 or 43',
      succeed: false
    },
  ],

  'AndTest_withoutEndingIn_and': [
    {
      name: 'True and 4 in [4, 5, 6]',
      code: 'True and 4 in [4, 5, 6]',
      succeed: false
    },
  ],

  'NotTest_not': [
    {
      name: 'not 42',
      code: 'not 42',
    },
    {
      name: 'not not not 42',
      code: 'not not not 42',
    },
    {
      name: 'no 42',
      code: 'no 42',
      succeed: false
    },
  ],

  'NotTest_withoutEndingIn_not': [
    {
      name: 'not 42 in 43',
      code: 'not 42 in 43',
      succeed: false
    },
  ],

  'Star_expr': [
    {
      name: '*a',
      code: '*a',
    },
    {
      name: '*foo()',
      code: '*foo()',
    },
    {
      name: '**a',
      code: '**a',
      succeed: false
    },
    {
      name: 'a',
      code: 'a',
      succeed: false
    },
  ],

  'Comparison_default': [
    {
      name: 'a <= b <= c',
      code: 'a <= b <= c',
    },
    {
      name: 'a',
      code: 'a',
    },
    {
      name: '',
      code: '',
      succeed: false
    },
  ],

  'Comparison_withoutEndingIn': [
    {
      name: 'a < b < c',
      code: 'a < b < c',
    },
    {
      name: 'a in b in c < d',
      code: 'a in b in c < d',
    },
    {
      name: 'a in b in c',
      code: 'a in b in c',
      succeed: false
    },
    {
      name: 'a < b in c',
      code: 'a < b in c',
      succeed: false
    },
  ],

  'OrExpr_or': [
    {
      name: 'a | b',
      code: 'a | b',
    },
    {
      name: 'a | b ^ c',
      code: 'a | b ^ c',
    },
    {
      name: 'a || b',
      code: 'a || b',
      succeed: false
    },
    {
      name: 'a | b or c',
      code: 'a | b or c',
      succeed: false
    },
  ],

  'XorExpr_xor': [
    {
      name: 'a ^ b',
      code: 'a ^ b',
    },
    {
      name: 'a ^ b & c',
      code: 'a ^ b & c',
    },
    {
      name: 'a ^ b | c',
      code: 'a ^ b | c',
      succeed: false
    },
    {
      name: 'a ^^ b',
      code: 'a ^^ b',
      succeed: false
    },
  ],

  'AndExpr_and': [
    {
      name: 'a & b',
      code: 'a & b',
    },
    {
      name: 'a & -b',
      code: 'a & -b',
    },
    {
      name: 'a & b >> c',
      code: 'a & b >> c',
    },
    {
      name: 'a & b | c',
      code: 'a & b | c',
      succeed: false
    },
  ],

  'ShiftExpr_shift': [
    {
      name: 'a << b',
      code: 'a << b',
    },
    {
      name: 'a >> --b',
      code: 'a >> --b',
    },
    {
      name: 'a << b - c',
      code: 'a << b - c',
    },
    {
      name: 'a << b & c',
      code: 'a << b & c',
      succeed: false
    },
  ],

  'AddExpr_addSub': [
    {
      name: 'a + b',
      code: 'a + b',
    },
    {
      name: 'a ------b',
      code: 'a ------b',
    },
    {
      name: 'a + b * c',
      code: 'a + b * c',
    },
    {
      name: 'a + b << c',
      code: 'a + b << c',
      succeed: false
    },
  ],

  'MultExpr': [
    {
      name: '5 @ foo()',
      code: '5 @ foo()',
    },
    {
      name: 'foo * +-4',
      code: 'foo * +-4',
    },
    {
      name: '5*4**2',
      code: '5*4**2',
    },
    {
      name: '5*4+3',
      code: '5*4+3',
      succeed: false
    },
  ],

  'UnaryExpr_unary': [
    {
      name: '+-5',
      code: '+-5',
    },
    {
      name: '~5 ** 6',
      code: '~5 ** 6',
    },
    {
      name: '-',
      code: '-',
      succeed: false
    },
  ],

  'Power': [
    {
      name: '5**6',
      code: '5**6',
    },
    {
      name: 'await 5 ** await 8',
      code: 'await 5 ** await 8',
    },
    {
      name: '3 + 4 ** 5',
      code: '3 + 4 ** 5',
      succeed: false
    },
    {
      name: '3 ** 4 + 5',
      code: '3 ** 4 + 5',
      succeed: false
    },
  ],

  'AwaitExpr_await': [
    {
      name: 'await foo()',
      code: 'await foo()',
    },
    {
      name: 'await a[5]',
      code: 'await a[5]',
    },
    {
      name: 'await *a',
      code: 'await *a',
      succeed: false
    },
    {
      name: 'await 3 + 4',
      code: 'await 3 + 4',
      succeed: false
    },
  ],

  'PrimaryExpr_attributeref': [
    {
      name: 'foo.bar',
      code: 'foo.bar',
    },
    {
      name: 'foo().__bar__',
      code: 'foo().__bar__',
    },
    {
      name: 'foo.123',
      code: 'foo.123',
      succeed: false
    },
    {
      name: 'foo.',
      code: 'foo.',
      succeed: false
    },
  ],

  'PrimaryExpr_slicing': [
    {
      name: 'foo[a:b:c, d:e:f]',
      code: 'foo[a:b:c, d:e:f]',
    },
    {
      name: 'foo[::, :]',
      code: 'foo[::, :]',
    },
    {
      name: 'foo[5, 6, 7]',
      code: 'foo[5, 6, 7]',
    },
    {
      name: 'foo[]',
      code: 'foo[]',
      succeed: false
    },
  ],

  'PrimaryExpr_subscription': [
    {
      name: 'foo[a, b, c]',
      code: 'foo[a, b, c]',
    },
    {
      name: 'foo[a]',
      code: 'foo[a]',
    },
    {
      name: 'foo[]',
      code: 'foo[]',
      succeed: false
    },
    {
      name: 'foo[a:b]',
      code: 'foo[a:b]',
      succeed: false
    },
  ],

  'PrimaryExpr_call': [
    {
      name: 'reduce(lambda x, y: x + y, [1,2,3,4], 0)',
      code: 'reduce(lambda x, y: x + y, [1,2,3,4], 0)',
    },
    {
      name: 'foo(a, *b, k = v, **d)',
      code: 'foo(a, *b, k = v, **d)',
    },
    {
      name: 'foo(a for a in range(5))',
      code: 'foo(a for a in range(5))',
    },
    {
      name: 'foo()',
      code: 'foo()',
    },
    {
      name: 'foo(a',
      code: 'foo(a',
      succeed: false
    },
    {
      name: 'foo(a:a for a in range(5))',
      code: 'foo(a:a for a in range(5))',
      succeed: false
    },
  ],

  'Atom_tuple': [
    {
      name: '(a, *b)',
      code: '(a, *b)',
    },
    {
      name: '()',
      code: '()',
    },
    {
      name: '(a:a, **b)',
      code: '(a:a, **b)',
      succeed: false
    },
    {
      name: '(a:a+1 for a in range(5))',
      code: '(a:a+1 for a in range(5))',
      succeed: false
    },
  ],

  'Atom_list': [
    {
      name: '[a, *b]',
      code: '[a, *b]',
    },
    {
      name: '[a for a in range(4)]',
      code: '[a for a in range(4)]',
    },
    {
      name: '[]',
      code: '[]',
    },
    {
      name: '[a:a, **b]',
      code: '[a:a, **b]',
      succeed: false
    },
    {
      name: '[a:a+1 for a in range(5)]',
      code: '[a:a+1 for a in range(5)]',
      succeed: false
    },
  ],

  'Atom_set': [
    {
      name: '{a, b, *c, d, *e}',
      code: '{a, b, *c, d, *e}',
    },
    {
      name: '{a for a in range(42)}',
      code: '{a for a in range(42)}',
    },
    {
      name: '{a:b, **c}',
      code: '{a:b, **c}',
      succeed: false
    },
    {
      name: '{a:a+1 for a in range(4)}',
      code: '{a:a+1 for a in range(4)}',
      succeed: false
    },
  ],

  'Atom_dict': [
    {
      name: '{a: b, c: d, **e, **f, g: h}',
      code: '{a: b, c: d, **e, **f, g: h}',
    },
    {
      name: '{a:a+1 for a in range(5)}',
      code: '{a:a+1 for a in range(5)}',
    },
    {
      name: '{}',
      code: '{}',
    },
    {
      name: '{a, b, *e}',
      code: '{a, b, *e}',
      succeed: false
    },
    {
      name: '{a for a in range(5)}',
      code: '{a for a in range(5)}',
      succeed: false
    },
  ],

  'YieldExpr': [
    {
      name: 'yield 42, foo(), a[5]',
      code: 'yield 42, foo(), a[5]',
    },
    {
      name: 'yield from asyncio.get("http://www.google.com")',
      code: 'yield from asyncio.get("http://www.google.com")',
    },
    {
      name: 'yield',
      code: 'yield'
    },
    {
      name: 'yield from 42, 43',
      code: 'yield from 42, 43',
      succeed: false
    },
  ],

  'Slice': [
    {
      name: '5',
      code: '5',
    },
    {
      name: '0: -1',
      code: '0: -1',
    },
    {
      name: '0: -1: 2',
      code: '0: -1: 2',
    },
    {
      name: '::',
      code: '::',
    },
    {
      name: ':',
      code: ':',
    },
    {
      name: '1:2:3:4',
      code: '1:2:3:4',
      succeed: false
    },
    {
      name: '',
      code: '',
      succeed: false
    },
  ],

  'ArgList': [
    {
      name: 'a()[2], *b(), c',
      code: 'a()[2], *b(), c',
    },
    {
      name: 'a()[2], *b(), c, keyword = value, *a, k = v, *b, *c',
      code: 'a()[2], *b(), c, keyword = value, *a, k = v, *b, *c',
    },
    {
      name: 'a()[2], *b(), c, keyword = value, *a, k = v, *b, *c, k = 2, **dict, m = blah, **d, **e',
      code: 'a()[2], *b(), c, keyword = value, *a, k = v, *b, *c, k = 2, **dict, m = blah, **d, **e'
    },
    {
      name: '**d, a',
      code: '**d, a',
      succeed: false
    },
    {
      name: 'k = 5, 42',
      code: 'k = 5, 42',
      succeed: false
    },
    {
      name: '**dict, *list',
      code: '**dict, *list',
      succeed: false
    },
  ],

  'PositionalArguments': [
    {
      name: '42, *a, 39, foo(), *bar()',
      code: '42, *a, 39, foo(), *bar()',
    },
    {
      name: 'a()[2], *b(), c',
      code: 'a()[2], *b(), c',
    },
    {
      name: '42, **a',
      code: '42, **a',
      succeed: false
    },
    {
      name: '',
      code: '',
      succeed: false
    },
  ],

  'StarredAndKeywordsArguments': [
    {
      name: '*a, foo = 42, *b',
      code: '*a, foo = 42, *b',
    },
    {
      name: '*foo(), bar = 69, baz = 2, *meow, *snek',
      code: '*foo(), bar = 69, baz = 2, *meow, *snek',
    },
    {
      name: '**foo',
      code: '**foo',
      succeed: false
    },
    {
      name: '42',
      code: '42',
      succeed: false
    },
  ],

  'KeywordsArguments': [
    {
      name: 'mi = 5, **dict, moo = cow',
      code: 'mi = 5, **dict, moo = cow',
    },
    {
      name: '**dict, **ion, **ary',
      code: '**dict, **ion, **ary',
    },
    {
      name: '*a',
      code: '*a',
      succeed: false
    },
    {
      name: '5',
      code: '5',
      succeed: false
    },
  ],

  'Argument_singleStar': [
    {
      name: '*meow()[5]',
      code: '*meow()[5]',
    },
    {
      name: '* boots() * cats()',
      code: '* boots() * cats()',
    },
    {
      name: 'boots()',
      code: 'boots()',
      succeed: false
    },
    {
      name: '* 42foo',
      code: '* 42foo',
      succeed: false
    },
  ],

  'Argument_keyword': [
    {
      name: 'meow = thing()()',
      code: 'meow = thing()()',
    },
    {
      name: '__init__ = 3 * 42()',
      code: '__init__ = 3 * 42()',
    },
    {
      name: '23foo = thing()',
      code: '23foo = thing()',
      succeed: false
    },
    {
      name: 'thing = 23foo',
      code: 'thing = 23foo',
      succeed: false
    },
  ],

  'Argument_doubleStar': [
    {
      name: '**dictionary()',
      code: '**dictionary()',
    },
    {
      name: '**(dictionary(), 42, 3)[0]',
      code: '**(dictionary(), 42, 3)[0]',
    },
    {
      name: '**(3 * 3 * dictionary())',
      code: '**(3 * 3 * dictionary())',
    },
    {
      name: '*meow',
      code: '*meow',
      succeed: false
    },
    {
      name: '**32fe',
      code: '**32fe',
      succeed: false
    },
  ],

  'Target_tuple': [
    {
      name: '(a, b, *rest)',
      code: '(a, b, *rest)',
    },
    {
      name: '()',
      code: '()',
    },
    {
      name: '(a, b, c)',
      code: '(a, b, c)',
    },
    {
      name: '(a, b, *c, *d)',
      code: '(a, b, *c, *d)',
    },
    {
      name: '(a, b, range(42))',
      code: '(a, b, range(42))',
      succeed: false
    },
  ],

  'Target_list': [
    {
      name: '[a, b, *rest]',
      code: '[a, b, *rest]',
    },
    {
      name: '[]',
      code: '[]',
    },
    {
      name: '[a, b, c]',
      code: '[a, b, c]',
    },
    {
      name: '[a, b, *c, *d]',
      code: '[a, b, *c, *d]',
    },
    {
      name: '[a, b, range(42)]',
      code: '[a, b, range(42)]',
      succeed: false
    },
  ],

  'Target_star': [
    {
      name: '*(a,b)',
      code: '*(a,b)',
    },
    {
      name: '*rest',
      code: '*rest',
    },
    {
      name: '*range(42)',
      code: '*range(42)',
      succeed: false
    },
  ],

  'KeyDatum': [
    {
      name: '1:False',
      code: '1:False',
    },
    {
      name: 'key: value',
      code: 'key: value',
    },
    {
      name: 'range(42**2) : meow',
      code: 'range(42**2) : meow',
    },
    {
      name: '**range(42**2)',
      code: '**range(42**2)',
    },
    {
      name: '*range(42**2)',
      code: '*range(42**2)',
      succeed: false
    },
    {
      name: 'range(42**2) meow',
      code: 'range(42**2) meow',
      succeed: false
    },
  ],

  'DictComprehension': [
    {
      name: 'key: value for i in range(13)',
      code: 'key: value for i in range(13)',
    },
    {
      name: 'n: n**2 for n in range(5)',
      code: 'n: n**2 for n in range(5)',
    },
    {
      name: 'nn**2 for n in range(5)',
      code: 'nn**2 for n in range(5)',
      succeed: false
    },
    {
      name: 'n: n**2 for in in range(5)',
      code: 'n: n**2 for in in range(5)',
      succeed: false
    },
  ],

  'Comprehension': [
    {
      name: 'x ** 2 for x in range(10)',
      code: 'x ** 2 for x in range(10)',
    },
    {
      name: '2**i for i in range(13)',
      code: '2**i for i in range(13)',
    },
    {
      name: 'x for x in range(2, 50) if x not in noprimes',
      code: 'x for x in range(2, 50) if x not in noprimes',
    },
    {
      name: '[w.upper(), w.lower(), len(w)] for w in words',
      code: '[w.upper(), w.lower(), len(w)] for w in words',
    },
    {
      name: '12meow for w in words',
      code: '12meow for w in words',
      succeed: false
    },
    {
      name: '[w.upper(), w.lower(), len(w)] for for w in words',
      code: '[w.upper(), w.lower(), len(w)] for for w in words',
      succeed: false
    },
  ],

  'CompIter_for': [
    {
      name: 'async for i in range(2, 8) in range(2, 8)',
      code: 'async for i in range(2, 8) in range(2, 8)',
    },
    {
      name: 'async for i in range(2, 8)',
      code: 'async for i in range(2, 8)',
    },
    {
      name: 'for i in range(2, 8) in range(2, 8)',
      code: 'for i in range(2, 8) in range(2, 8)',
    },
    {
      name: 'for i in range(2, 8)',
      code: 'for i in range(2, 8)',
    },
    {
      name: 'for x in range(2, 5) if x not in noprimes',
      code: 'for x in range(2, 5) if x not in noprimes',
    },
    {
      name: 'for w in words if x % 2 == 0',
      code: 'for w in words if x % 2 == 0',
    },
    {
      name: 'for w in words async for x in cats for y in dogs',
      code: 'for w in words async for x in cats for y in dogs'
    },
    {
      name: 'for i * i in range(j) in range(42)',
      code: 'for i * i in range(j) in range(42)'
    },
    {
      name: 'for in in range(42)',
      code: 'for in in range(42)',
      succeed: false
    },
    {
      name: 'for for i * i in range(j) in range(42)',
      code: 'for for i * i in range(j) in range(42)',
      succeed: false
    },
  ],

  'CompIter_if': [
    {
      name: 'if x not in noprimes',
      code: 'if x not in noprimes',
    },
    {
      name: 'if x % 2 == 0',
      code: 'if x % 2 == 0',
    },
    {
      name: 'if x not in noprimes for i * i in range(j) in range(42)',
      code: 'if x not in noprimes for i * i in range(j) in range(42)',
    },
    {
      name: 'if x % 2 == 0 for i * i in range(j) in range(42)',
      code: 'if x % 2 == 0 for i * i in range(j) in range(42)',
    },
    {
      name: 'if x not in noprimes for in in range(42)',
      code: 'if x not in noprimes for in in range(42)',
      succeed: false
    },
    {
      name: 'if x % 2 == 0 for in in range(42)',
      code: 'if x % 2 == 0 for in in range(42)',
      succeed: false
    },
    {
      name: 'if True if x % 2 == 0 else False',
      code: 'if True if x % 2 == 0 else False',
      succeed: false
    },
  ],

  'comment': [
    {
      name: 'basic comment 1',
      code: '#aksdjaslkdjfalskjdfla asdfa sd 98713 }{ f4v 4'
    },
    {
      name: 'with newline',
      code: '#aflkjsdlfkajsdlf adsfawe  \n nasldkf j',
      succeed: false
    }
  ],

  'identifier': [
    {
      name: '__init__',
      code: '__init__'
    },
    {
      name: 'identifier',
      code: 'identifier'
    },
    {
      name: 'Identif_ier032894',
      code: 'Identif_ier032894'
    },
    {
      name: 'pass0',
      code: 'pass0',
    },
    {
      name: 'pass',
      code: 'pass',
      succeed: false
    },
    {
      name: '0hello',
      code: '0hello',
      succeed: false
    },
  ],

  'integer': [
    {
      name: 'regular',
      code: '123_452_000_000'
    },
    {
      name: 'zero',
      code: '00000'
    },
    {
      name: 'regular with hex',
      code: '0o123_452_0A0_0b0',
      succeed: false
    },
    {
      name: 'regular with beginning zero',
      code: '0123_452_000_000',
      succeed: false
    },

    {
      name: 'binary',
      code: '0b0101_111_000_000',
    },
    {
      name: 'binary zero',
      code: '0B00000'
    },
    {
      name: 'binary with decimal',
      code: '0b0123_452_000_000',
      succeed: false
    },

    {
      name: 'octal regular',
      code: '0o123_452_000_000'
    },
    {
      name: 'octal zero',
      code: '0o00000'
    },
    {
      name: 'octal regular with decimal',
      code: '0o123_452_09_080',
      succeed: false
    },

    {
      name: 'hex regular',
      code: '0xDEaD_BeEF'
    },
    {
      name: 'hex zero',
      code: '0x00000'
    },
    {
      name: 'hex regular 2',
      code: '0x123_452_09_080',
    },

    {
      name: 'invalid 1',
      code: 'meow',
      succeed: false
    },
    {
      name: 'invalid 2',
      code: '0xmeow',
      succeed: false
    },
    {
      name: 'invalid 3',
      code: '0m12_13_45',
      succeed: false
    }
  ],

  'floating_point_exponent': [
    {
      name: '14159.14159e314_15_9',
      code: '14159.14159e314_15_9'
    },
    {
      name: '1_4_159.14159E0314159',
      code: '1_4_159.14159E0314159'
    },
    {
      name: 'pi',
      code: '3.1415E0314159',
    },
    {
      name: '14159E0314159',
      code: '14159E0314159',
    },
    {
      name: '14159.E0314159',
      code: '14159.E0314159'
    },
    {
      name: '1_4_159.E0314159',
      code: '1_4_159.E0314159'
    },
    {
      name: 'pi',
      code: '3.1415',
      succeed: false
    },
    {
      name: '14159',
      code: '14159',
      succeed: false
    },
  ],

  'floating_point_withFract': [
    {
      name: '14159.14159',
      code: '14159.14159'
    },
    {
      name: '1_4_159.14159',
      code: '1_4_159.14159'
    },
    {
      name: 'pi',
      code: '3.1415',
    },
    {
      name: '14159',
      code: '14159',
      succeed: false
    },
  ],

  'floating_point_withoutFract': [
    {
      name: '14159.',
      code: '14159.'
    },
    {
      name: '1_4_159.',
      code: '1_4_159.'
    },
    {
      name: 'pi',
      code: '3.1415',
      succeed: false
    },
    {
      name: '14159',
      code: '14159',
      succeed: false
    },
  ],

  'digitpart': [
    {
      name: '14159',
      code: '14159'
    },
    {
      name: '1_4_159',
      code: '1_4_159'
    },
    {
      name: 'pi',
      code: '3.1415',
      succeed: false
    },
  ],  

  'fraction': [
    {
      name: '.14159',
      code: '.14159'
    },
    {
      name: '.1_4_159',
      code: '.1_4_159'
    },
    {
      name: 'pi',
      code: '3.1415',
      succeed: false
    },
    {
      name: '14159',
      code: '14159',
      succeed: false
    },
  ],

  'exponent': [
    {
      name: 'e',
      code: 'e314_15_9'
    },
    {
      name: 'E',
      code: 'E0314159'
    },
    {
      name: 'pi',
      code: '3.1415',
      succeed: false
    },
    {
      name: 'f',
      code: 'f4',
      succeed: false
    },
  ],

  'imaginary': [
    {
      name: 'pi j',
      code: '3.1415j'
    },
    {
      name: '3e4 j',
      code: '3e4J'
    },
    {
      name: 'pi',
      code: '3.1415',
      succeed: false
    },
    {
      name: '3e4',
      code: '3e4',
      succeed: false
    },
  ],

  'stringliteral': [
    {
      name: 'hello world single',
      code: `'hello world'`,
    },
    {
      name: 'hello world double',
      code: `r"hello world"`,
    },
    {
      name: 'single with double quotes',
      code: `Fr'hello """""world'`,
    },
    {
      name: 'double with single quotes',
      code: `"hello '''''world"`,
    },
    {
      name: 'hello world single triple',
      code: `'''hello\nworld'''`,
    },
    {
      name: 'hello world double triple',
      code: `"""hello\nworld"""`,
    },
    {
      name: 'hello world double bad prefix',
      code: `RFx"hello world"`,
      succeed: false
    },
  ],

  'shortstring': [
    {
      name: 'hello world single',
      code: `'hello world'`,
    },
    {
      name: 'hello world double',
      code: `"hello world"`,
    },
    {
      name: 'single with double quotes',
      code: `'hello """""world'`,
    },
    {
      name: 'double with single quotes',
      code: `"hello '''''world"`,
    },
    {
      name: 'hello world single triple',
      code: `'''hello\nworld'''`,
      succeed: false
    },
    {
      name: 'hello world double triple',
      code: `"""hello\nworld"""`,
      succeed: false
    },
  ],

  'longstring': [
    {
      name: 'hello world single triple',
      code: `'''hello\nworld'''`
    },
    {
      name: 'hello world double triple',
      code: `"""hello\nworld"""`
    },
    {
      name: 'hello world single triple quotes in the middle',
      code: `'''hello\n''world'''`
    },
    {
      name: 'hello world double triple quotes in the middle',
      code: `"""hello\n""world"""`
    },
    {
      name: 'hello world single',
      code: `'hello world'`,
      succeed: false
    },
    {
      name: 'hello world double',
      code: `"hello world"`,
      succeed: false
    },
  ],

  'shortstringchar<"\\"">': [
    {
      name: 'a',
      code: 'a'
    },
    {
      name: '8',
      code: '8'
    },
    {
      name: 'æ',
      code: 'æ',
    },
    {
      name: '\\n',
      code: '\n',
      succeed: false
    },
    {
      name: '\\',
      code: '\\',
      succeed: false
    },
    {
      name: '\"',
      code: '\"',
      succeed: false
    },
  ],

  'longstringchar': [
    {
      name: 'a',
      code: 'a'
    },
    {
      name: '8',
      code: '8'
    },
    {
      name: '\\n',
      code: '\n'
    },
    {
      name: 'æ',
      code: 'æ',
    },
    {
      name: '\\',
      code: '\\',
      succeed: false
    },
  ],

  'stringescapeseq': [
    {
      name: '\\a',
      code: '\\a'
    },
    {
      name: '\\n',
      code: '\\n'
    },
    {
      name: '\\å',
      code: '\\å'
    },
    {
      name: '\\aa',
      code: '\\aa',
      succeed: false
    },
    {
      name: '\\',
      code: '\\',
      succeed: false
    },
    {
      name: 'empty',
      code: '',
      succeed: false
    },
  ],

  'bytesliteral': [
    {
      name: 'hello world single',
      code: `b'hello world'`,
    },
    {
      name: 'hello world double',
      code: `RB"hello world"`,
    },
    {
      name: 'single with double quotes',
      code: `b'hello """""world'`,
    },
    {
      name: 'double with single quotes',
      code: `b"hello '''''world"`,
    },
    {
      name: 'hello world single triple',
      code: `b'''hello\nworld'''`,
    },
    {
      name: 'hello world double triple',
      code: `b"""hello\nworld"""`,
    },
    {
      name: 'hello world double bad prefix',
      code: `RBx"hello world"`,
      succeed: false
    },
  ],

  'shortbytes': [
    {
      name: 'hello world single',
      code: `'hello world'`,
    },
    {
      name: 'hello world double',
      code: `"hello world"`,
    },
    {
      name: 'single with double quotes',
      code: `'hello """""world'`,
    },
    {
      name: 'double with single quotes',
      code: `"hello '''''world"`,
    },
    {
      name: 'hello world single triple',
      code: `'''hello\nworld'''`,
      succeed: false
    },
    {
      name: 'hello world double triple',
      code: `"""hello\nworld"""`,
      succeed: false
    },
  ],

  'longbytes': [
    {
      name: 'hello world single triple',
      code: `'''hello\nworld'''`
    },
    {
      name: 'hello world double triple',
      code: `"""hello\nworld"""`
    },
    {
      name: 'hello world single triple quotes in the middle',
      code: `'''hello\n''world'''`
    },
    {
      name: 'hello world double triple quotes in the middle',
      code: `"""hello\n""world"""`
    },
    {
      name: 'hello world single',
      code: `'hello world'`,
      succeed: false
    },
    {
      name: 'hello world double',
      code: `"hello world"`,
      succeed: false
    },
  ],

  'shortbyteschar<"\\"">': [
    {
      name: 'a',
      code: 'a'
    },
    {
      name: '8',
      code: '8'
    },
    {
      name: '\\n',
      code: '\n',
      succeed: false
    },
    {
      name: '\\',
      code: '\\',
      succeed: false
    },
    {
      name: '\"',
      code: '\"',
      succeed: false
    },
    {
      name: 'æ',
      code: 'æ',
      succeed: false
    },
  ],

  'longbyteschar': [
    {
      name: 'a',
      code: 'a'
    },
    {
      name: '8',
      code: '8'
    },
    {
      name: '\\n',
      code: '\n'
    },
    {
      name: '\\',
      code: '\\',
      succeed: false
    },
    {
      name: 'æ',
      code: 'æ',
      succeed: false
    },
  ],

  'bytesescapeseq': [
    {
      name: '\\a',
      code: '\\a'
    },
    {
      name: '\\n',
      code: '\\n'
    },
    {
      name: '\\aa',
      code: '\\aa',
      succeed: false
    },
    {
      name: '\\',
      code: '\\',
      succeed: false
    },
    {
      name: 'empty',
      code: '',
      succeed: false
    },
  ],

  'async': [
    {
      name: 'async',
      code: 'async'
    },
    {
      name: 'asyncio',
      code: 'asyncio',
      succeed: false
    },
  ],

  'true': [
    {
      name: 'True',
      code: 'True'
    },
    {
      name: 'Trueish',
      code: 'Trueish',
      succeed: false
    },
    {
      name: '+=',
      code: '+=',
      succeed: false
    },
  ],

  'comp_op': [
    {
      name: '<',
      code: '<'
    },
    {
      name: '<=',
      code: '<='
    },
    {
      name: 'in',
      code: 'in'
    },
    {
      name: 'not in',
      code: 'not in',
    },
    {
      name: 'asdf',
      code: 'asdf',
      succeed: false
    },
    {
      name: '+=',
      code: '+=',
      succeed: false
    },
  ],

  augassign: [
    {
      name: '+=',
      code: '+='
    },
    {
      name: '-=',
      code: '-='
    },
    {
      name: '^=',
      code: '^='
    },
    {
      name: '+',
      code: '+',
      succeed: false
    },
    {
      name: 'asdf',
      code: 'asdf',
      succeed: false
    },
  ],
};

const preprocessor = new Preprocessor();
Object.keys(pythonGrammar.rules).forEach(rule => {
  const ruleObj = pythonGrammar.rules[rule];
  let ruleStrings;
  if (ruleObj.formals.length === 0) {
    ruleStrings = [rule];
  } else {
    ruleStrings = Object.keys(tests)
      .filter(r => r.indexOf(`${rule}<`) === 0);
  }
  ruleStrings.forEach(ruleStr => testRule(ruleStr));
})

function testRule(rule) {
  const ruleTests = tests[rule];
  if (ruleTests == null) {
    console.warn(`no tests for ${rule}`);
  } else {
    console.log(`%c${rule}`, 'font-weight: bold;');
    ruleTests.forEach(({name, unpreprocessed, code, succeed: succeed = true}, idx) => {
      let result;

      let tokenStream = null;
      if (unpreprocessed) {
        tokenStream = preprocessor.lex(unpreprocessed);
        code = tokenStream.output.code;
      }

      result = pythonGrammar.match(code, rule);
      const succeeded = result.succeeded();
      if (succeeded === succeed) {
        console.log(`'${name}' passed`);
      } else {
        console.error(`'${name}' failed`);
        if (unpreprocessed) {
          console.error(code);
        }
        if (succeeded) {
          console.error(code, 'parsed successfully');
        } else {
          console.error(result.message);
        }
      }
    });
  }
}

console.log(
  `%c${Object.keys(tests)
        .map(rule => tests[rule].length)
        .reduce((a, b) => a + b, 0)} tests!`, 'font-weight: bold; font-size: 40px;');