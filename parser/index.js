class Instrumenter {
  instrument(preprocessedCode, map) {
    console.debug(preprocessedCode);

    const result = pythonGrammar.match(preprocessedCode);
    if (result.succeeded()) {
      const ast = semantics(result).toAST(map);
      const instrumented = ast.instrumented(new InstrumenterState());
      return instrumented.toString();
    } else {
      throw new Error(result.message);
    }
  }
}

class InstrumenterState {
  constructor() {
    this.executionOrderCounters = [];
    this.lambdas = [];
    this.envId = 0;
    this.lambdaId = 0;
    this.parents = [];
  }

  pushExecutionOrderCounter() {
    this.executionOrderCounters.push({count: 0});
  }

  popExecutionOrderCounter() {
    this.executionOrderCounters.pop();
  }

  nextOrderNum() {
    return this.executionOrderCounters[this.executionOrderCounters.length - 1].count++;
  }

  get parent() {
    return this.parents[this.parents.length - 1];
  }
}