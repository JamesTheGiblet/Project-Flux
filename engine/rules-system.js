export class RulesSystem {
  constructor(mod) {
    this.name = "RulesSystem";
    this.mod = mod;
  }

  init(engine) {
    this.engine = engine;
    console.log("Rules system initialized with mod:", this.mod.name);
  }

  checkWinCondition(state) {
    return this.mod.checkWinCondition(state);
  }
}