export class WeaponSystem {
  constructor(mod) {
    this.name = "WeaponSystem";
    this.mod = mod;
  }

  init(engine) {
    this.engine = engine;
    console.log("Weapon system initialized with mod:", this.mod.name);
  }

  shoot(player, target) {
    this.mod.shoot(player, target, this.engine);
  }
}