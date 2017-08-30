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