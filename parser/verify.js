// TODO: lots of classes to fill in here

AST.prototype.verify = function(code) {
  console.log(this.constructor.name);
  console.log(this.toString());
  console.log(code.substring(this.sourceLoc.startIdx, this.sourceLoc.endIdx));
  console.log('\n');

  this.children
    .filter(child => child !== null)
    .forEach(child => child.verify(code));
};