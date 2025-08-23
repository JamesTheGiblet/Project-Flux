export class EngineCore {
  constructor() {
    this.systems = {};
    this.projectiles = [];
  }

  loadSystem(system) {
    this.systems[system.name] = system;
    system.init(this);
  }

  run() {
    console.log("Engine running with systems:", Object.keys(this.systems));
    // Game loop placeholder
  }
}