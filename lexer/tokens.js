class Token {
  constructor(value, startIdx, endIdx) {
    this.value = value;
    this.startIdx = startIdx;
    this.endIdx = endIdx;
  }

  toString() {
    return this.value;
  }
}

function getBounds(state, name) {
  const startIdx = state.idx;
  state.idx += name.length;
  const endIdx = state.idx;
  return [startIdx, endIdx]
}

class Identifier extends Token {
  static create(state, name) {
    return new Identifier(name, ...getBounds(state, name)); 
  }
}
Identifier.regex = /[_a-zA-Z][_a-zA-Z0-9]*/u;

class Keyword extends Token {
  static create(state, kw) { 
    return new Keyword(kw, ...getBounds(state, kw));
  }
}
Keyword.regex = /False|None|True|and|as|assert|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield/u;

class Operator extends Token {
  static create(state, op) { 
    return new Operator(op, ...getBounds(state, op));
  }
}
Operator.regex = /\+|-|\*\*|\*|\/\/|\/|%|@|<<|>>|&|\||\^|~|<|>|<=|>=|==|!=/u

class Literal extends Token {}

class StringLiteral extends Literal {
  static create(state, value) {
    return new StringLiteral(value, ...getBounds(state, value));
  }
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

class BytesLiteral extends Literal {
  static create(state, value) {
    return new BytesLiteral(value, ...getBounds(state, value));
  }
}

const bytesPrefix = `(b|B|br|Br|bR|BR|rb|rB|Rb|RB)`
BytesLiteral.regex = new RegExp(`${bytesPrefix}(${longString}|${shortString})`);

class IntegerLiteral extends Literal {
  static create(state, value) {
    return new IntegerLiteral(value, ...getBounds(state, value));
  }
}
IntegerLiteral.regex = /[1-9](_?[0-9])*|0(b|B)(_?[01])+|0(o|O)(_?[0-7])+|0(x|X)(_?[0-9a-fA-F])+|0+(_?0)*/u

class FloatingPointLiteral extends Literal {
  static create(state, value) {
    return new FloatingPointLiteral(value, ...getBounds(state, value));
  }
}

FloatingPointLiteral.regex = /((([0-9](_?[0-9])*)?\.([0-9](_?[0-9])*)|[0-9](_?[0-9])*\.)|[0-9](_?[0-9])*)((e|E)[+-]?[0-9](_?[0-9])*)?[jJ]?/u;

class Delimiter extends Token {
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
      if (!(matchingOpen && matches(matchingOpen, value))) {
        throw new Error('parens dont match');
      }
      break;
    }
    return new Delimiter(value, ...getBounds(state, value)); 
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

class ExplicitLineJoin extends Token {
  static create(state, value) {
    // const ans = new ExplicitLineJoin(value, state.idx, state.idx + 1);
    state.idx += value.length;
    // return ans;
  }
}
ExplicitLineJoin.regex = /\\[ \t\u00A0]*\n/u;

class Comment extends Token {
  static create(state, value) {
    // return new Comment(value, ...getBounds(state, name));
    state.idx += name.length;
  }
}
Comment.regex = /#.*(?=(\n|$))/u;

class WhiteSpace extends Token {
  static create(state, value) {
    state.idx += value.length;
    // return new WhiteSpace(value);
  }
}
WhiteSpace.regex = /[ \t\u00A0]+/u; // TODO: update regex to include unicode

class Indent extends Token {
  constructor(indentationLevel, startIdx, endIdx) {
    super(null, startIdx, endIdx);
    this.indentationLevel = indentationLevel;
  }

  toString() { return '⇨'; }
}

class Dedent extends Token {
  constructor(indentationLevel, startIdx, endIdx) {
    super(null, startIdx, endIdx);
    this.indentationLevel = indentationLevel;
  }

  toString() { return '⇦'; }
}

class NewLine extends Token {
  constructor(startIdx, endIdx) { super('\n', startIdx, endIdx); }

  static create(state, _, currentIndentation) {
    if (state.parenStack.length > 0) {
      // nop
    } else {
      const ans = [new NewLine(state.idx, ++state.idx)];
      const currentIndentationLevel = currentIndentation.length;
      let lastIndentation = state.indentationStack.join('');
      let lastIndentationLevel = lastIndentation.length;
      if (currentIndentationLevel === lastIndentationLevel) {
        if (currentIndentation !== lastIndentation) {
          throw new Error('indentation error');
        }
      } else if (currentIndentationLevel > lastIndentationLevel) {
        if (currentIndentation.slice(0, lastIndentationLevel) !== lastIndentation) {
          throw new Error('indentation error');
        }
        state.indentationStack.push(currentIndentation.slice(lastIndentationLevel));
        ans.push(new Indent(currentIndentationLevel, ...getBounds(state, currentIndentation)));
      } else {
        while (lastIndentationLevel > currentIndentationLevel) {
          state.indentationStack.pop();
          ans.push(new Dedent(lastIndentationLevel, state.idx, state.idx));
          lastIndentation = state.indentationStack.join('');
          lastIndentationLevel = lastIndentation.length;
        }
        if (lastIndentationLevel !== currentIndentationLevel || lastIndentation !== currentIndentation) {
          throw new Error('indentation error');
        }
        state.idx += currentIndentation.length;
      }
      state.explicitLineJoin = false;
      return ans;
    }
  }
}
NewLine.regex = /\n([ \t\u00A0]*)(?!\n)/u; // TODO: update to match whitespace

class BlankLine extends Token {
  static create(state, blankLine) {
    // const ans = new NewLine(state.idx, state.idx + 1);
    state.idx += blankLine.length;
    // return ans;
  }
}
BlankLine.regex = /\n([ \t\u00A0]*)(#.*(?=(\n|$)))?(?=\n)/u;

class EOF extends Token{
  static create(state) {
    const ans = [new NewLine(state.idx, state.idx)];
    while (state.indentationStack.length > 1) {
      ans.push(new Dedent(state.indentationStack.join('').length, state.idx, state.idx));
      state.indentationStack.pop();
    }
    return ans;
  }
}
EOF.regex = /$/u
