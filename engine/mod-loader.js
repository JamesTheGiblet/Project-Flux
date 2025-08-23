import { WeaponSystem } from './weapon-system.js';
import { CharacterSystem } from './character-system.js';
import { RulesSystem } from './rules-system.js';

export class ModLoader {
  constructor(engine) {
    this.engine = engine;
    this.registry = {
      weapons: {},
      characters: {},
      rules: {}
    };
  }

  async loadMods() {
    const manifest = await this.fetchManifest();

    for (const category of Object.keys(manifest)) {
      for (const modName of manifest[category]) {
        const mod = await this.importMod(category, modName);
        this.registry[category][mod.name] = mod;
      }
    }

    console.log("✅ Mods loaded:", this.registry);
  }

  async fetchManifest() {
    const res = await fetch('./mods/mod-manifest.json');
    if (!res.ok) throw new Error("Failed to load mod manifest");
    return await res.json();
  }

  async importMod(category, modName) {
    const path = `../mods/${category}/${modName}.js`;
    try {
      const module = await import(path);
      return module.default;
    } catch (err) {
      console.error(`❌ Failed to import ${category}/${modName}:`, err);
      return { name: modName, error: true };
    }
  }

  getMod(category, name) {
    return this.registry[category][name];
  }

  applyMod(category, name) {
    const mod = this.getMod(category, name);
    if (!mod || mod.error) return;

    switch (category) {
      case 'weapons':
        this.engine.loadSystem(new WeaponSystem(mod));
        break;
      case 'characters':
        this.engine.loadSystem(new CharacterSystem(mod));
        break;
      case 'rules':
        this.engine.loadSystem(new RulesSystem(mod));
        break;
    }
  }
}