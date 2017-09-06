// TODO: lots of classes to fill in here

AST.prototype.verify = function(code) {
  console.log(this.constructor.name);
  console.log(this.toString());
  console.log(code.substring(this.sourceLoc.startIdx, this.sourceLoc.endIdx));
  console.log('\n');
};

Program.prototype.verify = function(code) {
  AST.prototype.verify.call(this, code);
  this.body.forEach(stmt => stmt.verify(code));
};

Assign.prototype.verify = function(code) {
  AST.prototype.verify.call(this, code);
  this.targets.concat(this.value)
    .forEach(item => item.verify(code));
};

For.prototype.verify = function(code) {
  AST.prototype.verify.call(this, code);
  this.target.verify(code);
  this.iter.verify(code);
  this.body.forEach(stmt => stmt.verify(code));
  if (this.orelse) {
    this.orelse.forEach(stmt => stmt.verify(code));
  }
};

Call.prototype.verify = function(code) {
  AST.prototype.verify.call(this, code);
  this.func.verify(code);
  this.args.forEach(arg => arg.verify(code));
  this.keywords.forEach(keyword => keyword.verify(code));
};

BinOp.prototype.verify = function(code) {
  AST.prototype.verify.call(this, code);
  this.left.verify(code);
  this.right.verify(code);
};

Lambda.prototype.verify = function(code) {
  AST.prototype.verify.call(this, code);
  this.args.verify(code);
  this.body.verify(code);
};

Arguments.prototype.verify = function(code) {
  AST.prototype.verify.call(this, code);
  this.args.forEach(arg => arg.verify(code));
  if (this.vararg) {
    this.vararg.verify(code);
  }
  this.kwonlyargs.forEach(arg => arg.verify(code));
  if (this.kwarg) {
    this.kwarg.verify(code);
  }

  this.defaults.forEach(default_ => default_ ? default_.verify(code) : null);
  this.kw_defaults.forEach(default_ => default_ ? default_.verify(code) : null);
};