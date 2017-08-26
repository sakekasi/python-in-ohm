class Token {
}

class Identifier extends Token {
  constructor(name) {
    super();
    this.name = name;
  }

  static create(state, name) { return new Identifier(name); }
}

Identifier.regex = /[_a-zA-Z][_a-zA-Z0-9]*/u;

class Keyword extends Token {
  constructor(kw) {
    super();
    this.kw = keyword;
  }

  static create(state, kw) { return new Keyword(kw); }
}

Keyword.regex = /False|None|True|and|as|assert|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield/u;

class Operator extends Token {
  constructor(op) {
    super();
    this.op = op;
  }

  static create(state, op) { return new Operator(op); }
}

Operator.regex = /\+|-|\*\*|\*|\/\/|\/|%|@|<<|>>|&|\||\^|~|<|>|<=|>=|==|!=/u

class Literal extends Token {
  constructor(value) {
    super();
    this.value = value;
  }
}

class StringLiteral extends Literal {
  constructor(value) { 
    super(); 
    this.value = value;
  }

  static create(state, value) { return new StringLiteral(value); }
}

const prefix = `(r|u|R|U|f|F|fr|Fr|fR|FR|rf|rF|Rf|RF)`;

const singleQuoteShortStringChar = `[^\\n']`;
const doubleQuoteShortStringChar = `[^\\n"]`;
const singleQuoteShortString = `'${singleQuoteShortStringChar}*'`;
const doubleQuoteShortString = `"${doubleQuoteShortStringChar}*"`;
const shortString = `(${singleQuoteShortString}|${doubleQuoteShortString})`;

const longStringChar = `(.|\\n)`;
const singleQuoteLongString = `'''${longStringChar}*'''`;
const doubleQuoteLongString = `"""${longStringChar}*"""`;
const longString = `(${singleQuoteLongString}|${doubleQuoteLongString})`;

StringLiteral.regex = new RegExp(`${prefix}?(${longString}|${shortString})`, 'u');

class Delimiter extends Token {
  constructor(value) { 
    super(); 
    this.value = value;
  }
  
  static create(state, value) {
    switch (value) {
    case '(':
    case '[':
    case '{':
      // handle open
      state.parenStack.push(value);
      break;
    case ')':
    case ']':
    case '}':
      const matchingOpen = state.parenStack.pop();
      if (!(matchingOpen && matches(matchingOpen, value))) { // TODO
        throw new Error('parens dont match');
      }
      break;
    }
    return new Delimiter(value); 
  }
}

function matches(open, close) {
  switch (open) {
  case '(': return close === ')';
  case '[': return close === ']';
  case '{': return close === '}';
  default: throw new Error(`can't match ${open} and ${close}`);
  }
}

Delimiter.regex = /\(|\)|\[|\]|\{|\}|,|:|\.|;|=|->|\+=|-=|\*=|\/=|\/\/=|%=|@=|&=|\|=|\^=|>>=|<<=|\*\*=|@/u;

const WhiteSpace = {};
WhiteSpace.create = (state, value) => {};
WhiteSpace.regex = /[ \t\u00A0]+/u; // TODO: update regex to include unicode

class Indent extends Token {
  constructor(indentationLevel) {
    super();
    this.indentationLevel = indentationLevel;
  }
}

class Dedent extends Token {
  constructor(indentationLevel) {
    super();
    this.indentationLevel = indentationLevel;
  }
}

class NewLine extends Token {
  constructor() { super(); }

  static create(state, _, spaces) {
    if (state.parenStack.length > 0 || state.explicitLineJoin) {
      // nop
    } else {
      const ans = [new NewLine()];
      const currentIndentationLevel = spaces.length;
      const lastIndentationLevel = state.indentationStack[state.indentationStack.length - 1];
      if (currentIndentationLevel === lastIndentationLevel) {
        // nop
      } else if (currentIndentationLevel > lastIndentationLevel) {
        state.indentationStack.push(currentIndentationLevel);
        ans.push(new Indent(currentIndentationLevel)); // TODO
      } else {
        while (state.indentationStack[state.indentationStack.length - 1] > currentIndentationLevel) {
          ans.push(new Dedent(state.indentationStack.pop()));
        }
        if (state.indentationStack[state.indentationStack.length - 1] !== currentIndentationLevel) {
          throw new Error('indentation error');
        }
      }
      state.explicitLineJoin = false;
      return ans;
    }
  }
}

NewLine.regex = /\n([ ]*)/u; // TODO: deal with tabs and nbsps

const EOF = {};
EOF.create = (state) => {
  const ans = [];
  while (state.indentationStack.length > 1) {
    ans.push(new Dedent(state.indentationStack.pop()));
  }
  return ans;
}
EOF.regex = /$/u