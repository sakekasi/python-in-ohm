class Token {
  constructor(value, startIdx, endIdx) {
    this.value = value;
    this.startIdx = startIdx; // where the token starts in the original string
    this.endIdx = endIdx;
  }

  toString() {
    return this.value;
  }

  equals(other) {
    return other instanceof this.constructor &&
      other.value === this.value;
  }
}

class IdentifierT extends Token {
  static create(state, name) {
    return new IdentifierT(name, ...state.getRange(name)); 
  }
}
IdentifierT.regex = /[_a-zA-Z][_a-zA-Z0-9]*/u;

class KeywordT extends Token {
  static create(state, kw) { 
    return new KeywordT(kw, ...state.getRange(kw));
  }
}
KeywordT.regex = /False|None|True|and|as|assert|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield/u;

class Operator extends Token {
  static create(state, op) { 
    return new Operator(op, ...state.getRange(op));
  }
}
Operator.regex = /\+|-|\*\*|\*|\/\/|\/|%|@|<<|>>|&|\||\^|~|<=|>=|==|!=|<|>/u

class LiteralT extends Token {}

class StringLiteral extends LiteralT {
  static create(state, value) {
    return new StringLiteral(value, ...state.getRange(value));
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

class BytesLiteral extends LiteralT {
  static create(state, value) {
    return new BytesLiteral(value, ...state.getRange(value));
  }
}

const bytesPrefix = `(b|B|br|Br|bR|BR|rb|rB|Rb|RB)`
BytesLiteral.regex = new RegExp(`${bytesPrefix}(${longString}|${shortString})`);

class IntegerLiteral extends LiteralT {
  static create(state, value) {
    return new IntegerLiteral(value, ...state.getRange(value));
  }
}
IntegerLiteral.regex = /[1-9](_?[0-9])*|0(b|B)(_?[01])+|0(o|O)(_?[0-7])+|0(x|X)(_?[0-9a-fA-F])+|0+(_?0)*/u

class FloatingPointLiteral extends LiteralT {
  static create(state, value) {
    return new FloatingPointLiteral(value, ...state.getRange(value));
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
        throw new ParensError(state.origIdx, `^\nparens don't match`);
      }
      break;
    }
    return new Delimiter(value, ...state.getRange(value)); 
  }
}

function matches(open, close) {
  switch (open) {
  case '(': return close === ')';
  case '[': return close === ']';
  case '{': return close === '}';
  default: throw new ParensError(state.origIdx, `^\ncan't match ${open} and ${close}`);
  }
}

Delimiter.regex = /\(|\)|\[|\]|\{|\}|,|:|\.|;|=|->|\+=|-=|\*=|\/=|\/\/=|%=|@=|&=|\|=|\^=|>>=|<<=|\*\*=|@/u;

class ExplicitLineJoin extends Token {
  static create(state, value) {
    // const ans = new ExplicitLineJoin(value, state.origIdx, state.origIdx + 1);
    state.getRange(value);
    // return ans;
  }
}
ExplicitLineJoin.regex = /\\[ \t\u00A0]*\n/u;

class Comment extends Token {
  static create(state, value) {
    // return new Comment(value, ...state.getRange(name));
    state.getRange(value);
  }
}
Comment.regex = /#.*(?=(\n|$))/u;

class WhiteSpace extends Token {
  static create(state, value) {
    state.getRange(value);
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
      state.getRange(_);
    } else {
      const ans = [new NewLine(state.origIdx, ++state.origIdx)];
      const currentIndentationLevel = currentIndentation.length;
      let lastIndentation = state.indentationStack.join('');
      let lastIndentationLevel = lastIndentation.length;
      if (currentIndentationLevel === lastIndentationLevel) {
        state.getRange(currentIndentation);
        if (currentIndentation !== lastIndentation) {
          throw new IndentationError(state.origIdx);
        }
      } else if (currentIndentationLevel > lastIndentationLevel) {
        if (currentIndentation.slice(0, lastIndentationLevel) !== lastIndentation) {
          throw new IndentationError(state.origIdx);
        }
        state.indentationStack.push(currentIndentation.slice(lastIndentationLevel));
        ans.push(new Indent(currentIndentationLevel, state.origIdx, state.origIdx + 1)); // TODO: this is suspect
        state.getRange(currentIndentation);
      } else {
        while (lastIndentationLevel > currentIndentationLevel) {
          state.indentationStack.pop();
          ans.push(new Dedent(lastIndentationLevel, state.origIdx, state.origIdx));
          lastIndentation = state.indentationStack.join('');
          lastIndentationLevel = lastIndentation.length;
        }
        state.getRange(currentIndentation);
        if (lastIndentationLevel !== currentIndentationLevel || lastIndentation !== currentIndentation) {
          throw new IndentationError(state.origIdx);
        }
      }
      state.explicitLineJoin = false;
      return ans;
    }
  }
}
NewLine.regex = /\n([ \t\u00A0]*)(?!\n)/u; // TODO: update to match whitespace

class BlankLine extends Token {
  static create(state, blankLine) {
    state.getRange(blankLine);
  }
}
BlankLine.regex = /\n([ \t\u00A0]*)(#.*(?=(\n|$)))?(?=\n)/u;

class EOF extends Token{
  static create(state) {
    let ans;
    if (!(state.lastToken instanceof NewLine)) {
      ans = [new NewLine(state.origIdx, state.origIdx)];
    } else {
      ans = [];
    }
    while (state.indentationStack.length > 1) {
      ans.push(new Dedent(state.indentationStack.join('').length, state.origIdx, state.origIdx));
      state.indentationStack.pop();
    }
    if (state.parenStack.length > 0) {
      throw new ParensError(state.origIdx, `^\nUnmatched parentheses`);
    }
    return ans;
  }
}
EOF.regex = /$/u
