# 🚀 SOVEREIGN ENGINE: Flux (MVP Release)

Hackable. Modular. Yours. Every line of code is an invitation.

> **This is the Minimum Viable Product (MVP) release of the Sovereign Engine.** It's a fully functional, playable, and hackable proof of concept demonstrating our vision for "sovereign software." We invite you to dive in, break things, and see the potential for yourself.

Welcome to Sovereign Engine, a game framework designed from the ground up to empower creators with total control. This isn't an engine; it's a living manifesto for digital sovereignty, challenging the notion of software as a black box. Here, every pixel is hackable, every rule is rewritable, and every system is explicitly yours to command. Dive in, modify, and reclaim your digital creative freedom.

⚡ THE MANIFESTO

We believe software should be transparent, modifiable, and truly owned by its users. The Sovereign Engine is a testament to this belief. It's about refusing to accept limitations and embracing the power to reshape your digital experience. No permissions, no gatekeepers, just pure creative freedom.

## ✨ Core Principles

The Sovereign Engine is built on a philosophy of ultimate flexibility and immediate feedback:

    Dependency-Injected Systems: The engine's architecture promotes modularity. Core functionalities like the WeaponSystem, CharacterSystem, and RulesSystem are dependency-injected and hot-swappable. This means you can completely replace or augment how weapons fire, how characters behave, or how game rules function without touching the engine's core.

    No Build Step: Forget compilers, bundlers, and complex development environments. With Sovereign Engine, it's about speed and direct interaction. Edit, save, refresh. That's it. Your changes are instantly reflected in the game, allowing for rapid iteration and experimentation.

    No Licensing: This project is intentionally in the Public Domain (or uses a highly permissive MIT License). You are free to fork, use, modify, and redistribute the engine and any mods without asking for permission or worrying about restrictive terms. It's truly yours.

    No Servers: The engine is designed to run independently. It operates offline and can be hosted anywhere—whether on your local machine, a simple HTTP server, IPFS, or GitHub Pages. Your game, your data, your distribution.

    No Limits: If you can code it in JavaScript, you can mod it. The engine's design explicitly exposes its internal workings, providing you with the tools to implement anything from custom particle effects and AI behaviors to entirely new game mechanics and procedural generation systems.

## 🚀 Get Started (Self-Hosting)

Getting the Sovereign Engine up and running is as straightforward as possible:

    Clone this repository:

        Open your terminal or command prompt and run:
    Bash

git clone [https://github.com/YOUR_GITHUB_USERNAME/sovereign-engine.git](https://github.com/YOUR_GITHUB_USERNAME/sovereign-engine.git)
cd sovereign-engine

Serve locally (requires Python 3):

    Navigate to the cloned directory and start a simple local HTTP server:

Bash

    python -m http.server 8000

        If you don't have Python, any other local server (e.g., Node.js http-server) will work.

    Open in browser:

        Open your web browser and navigate to http://localhost:8000. You should see the Sovereign Engine running, ready for your modifications!

## 💡 How to Mod

The engine is designed for live modification directly in the browser. The "How to Hack" panel in the UI provides a quick reference, but here's the core workflow:

    Select a Mod Panel: Choose what you want to change: 🔫 WEAPON, 🎮 RULES, or 🧍 PLAYER.

    Choose a Preset: Use the dropdown menu to load existing code. This is the best way to see how things work.

    Edit the Code: The code for the selected preset appears in the text editor. Change it however you like!

    Apply Your Changes: Click the "Apply" button for that section. Your changes will take effect instantly in the game.

    Save Your Creation: If you create something you love, give it a name in the input field at the bottom of the section and click "💾 Save". It will be saved to your browser's localStorage and will appear in the dropdown menu next time you load the game.

### 🔫 Weapon Mod Example

The weapon mod is a function with the signature function shoot(player, target, engine). To create a new projectile, you add an object to the engine.projectiles array.

// Paste this into the WEAPON MOD editor to try a 3-shot burst fire weapon.
// This demonstrates using setTimeout for more complex, time-based logic.
function shoot(player, target, engine) {
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const angle = Math.atan2(dy, dx);
  const speed = 450;

  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const spread = (engine.random() - 0.5) *0.1;
      engine.projectiles.push({
        x: player.x, y: player.y,
        vx: Math.cos(angle + spread)* speed,
        vy: Math.sin(angle + spread) *speed,
        size: 3, color: '#ff55ff', life: 1.5, damage: 18
      });
    }, i* 80); // 80ms delay between each shot in the burst
  }
}

### 🎮 Rules Mod Example

The rules mod is a function that runs every frame: `function update(engine, dt)`. You can use it to control enemy spawning, difficulty, or any other global game logic.

// This is the 'level-progression' rule, managing waves, intermissions, and boss fights.
function update(engine, dt) {
  if (engine.gameState === 'WAVE') {
    // Spawn enemies for the current wave
    if (engine.waveEnemiesSpawned < engine.waveEnemiesTotal && engine.random() < 0.05) {
      engine.spawnEnemy({
        health: 30 + engine.level *5,
        size: 6 + engine.random()* engine.level,
      });
      engine.waveEnemiesSpawned++;
    }

    // Check if wave is cleared
    if (engine.waveEnemiesSpawned >= engine.waveEnemiesTotal && engine.enemies.length === 0) {
      engine.wave++;
      engine.waveEnemiesSpawned = 0;
      engine.waveEnemiesTotal = 0;

      if (engine.wave > engine.wavesPerLevel) {
        engine.gameState = 'BOSS';
        engine.intermissionTime = engine.gameTime + 2; // Give player a moment
      } else {
        engine.gameState = 'INTERMISSION';
        engine.intermissionTime = engine.gameTime + 3; // 3 second break
      }
    }

  } else if (engine.gameState === 'BOSS') {
    // Boss spawning and defeat logic
    const bossExists = engine.enemies.some(e => e.isBoss);
    if (!bossExists && engine.gameTime > engine.intermissionTime) {
      engine.spawnBoss({
        ai_type: 'boss_pattern', // Boss uses advanced patterns
        patterns: ['spiral_shot', 'charge', 'burst_shot'],
      });
    }
    if (bossExists && !engine.enemies.some(e => e.isBoss)) {
      engine.level++;
      engine.wave = 1;
      engine.gameState = 'INTERMISSION';
      engine.intermissionTime = engine.gameTime + 5; // 5 second break after boss
    }
  } else if (engine.gameState === 'INTERMISSION') {
    if (engine.gameTime > engine.intermissionTime) {
      engine.gameState = 'WAVE';
    }
  }
}

### Creating Advanced Enemy AI

The default engine handles basic AI like `'chase'`. However, you can define entirely new, complex AI behaviors directly within a **Rules Mod**. Because the `update` function in the Rules Mod runs every frame, it can directly manipulate the properties of any enemy on the fly.

This allows you to create sophisticated behaviors like:

- **Interceptors:** Enemies that predict the player's movement.
- **Shooters:** Enemies that keep their distance and fire their own projectiles.
- **Support Units:** Enemies that heal or shield other enemies.

The engine comes with a "Hardcore Spawner" preset that demonstrates this. You can select it from the `🎮 RULES MOD` dropdown to experience a much more challenging game with varied enemy types. Below is the code for that preset, showing how it works.

```javascript
// "Hardcore Spawner" Rules Mod
// This mod introduces new AI types and spawns a challenging mix of enemies.
function update(engine, dt) {
  // --- 1. Custom AI Logic Processing ---
  // We loop through enemies each frame to apply our custom AI.
  engine.enemies.forEach(enemy => {
    if (!enemy.ai_state) enemy.ai_state = {}; // Init state storage
    const player = engine.player;
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // 'interceptor' AI: Aims ahead of the player.
    if (enemy.ai_type === 'interceptor') {
      const leadTime = dist / (enemy.speed * 0.9); // How far to lead
      const targetX = player.x + (player.vx || 0) * leadTime;
      const targetY = player.y + (player.vy || 0) * leadTime;
      const tdx = targetX - enemy.x, tdy = targetY - enemy.y;
      const tdist = Math.sqrt(tdx*tdx + tdy*tdy);
      if (tdist > 1) {
        enemy.vx = (tdx / tdist) * enemy.speed;
        enemy.vy = (tdy / tdist) * enemy.speed;
      }
    }

    // 'shooter' AI: Complements a base movement AI (like 'chase') by adding shooting.
    if (enemy.ai_type === 'shooter') {
      enemy.ai_state.shootCooldown = (enemy.ai_state.shootCooldown || 1) - dt;
      if (enemy.ai_state.shootCooldown <= 0) {
        enemy.ai_state.shootCooldown = 2.5 + engine.random(); // Cooldown
        const angle = Math.atan2(dy, dx);
        engine.projectiles.push({
          x: enemy.x, y: enemy.y,
          vx: Math.cos(angle) * 300, vy: Math.sin(angle) * 300,
          size: 4, color: '#ff8800', life: 2.5, damage: 10,
          isEnemyProjectile: true // IMPORTANT: Flag for collision system
        });
      }
    }
  });

  // --- 2. Spawner Logic (Modified from 'level-progression') ---
  if (engine.gameState === 'WAVE') {
    if (engine.waveEnemiesSpawned < engine.waveEnemiesTotal && engine.random() < 0.12) {
      const rand = engine.random();
      let enemyConfig = {};

      if (rand < 0.5) { // 50% chance for a fast, weak chaser
        enemyConfig = { health: 20, size: 6 + engine.random() * 4, speed: 90 + engine.random() * 40, ai_type: 'chase', color: '#ff4444' };
      } else if (rand < 0.8) { // 30% chance for a predictive interceptor
        enemyConfig = { health: 40, size: 8, speed: 110, ai_type: 'interceptor', color: '#ffff66' };
      } else { // 20% chance for a durable shooter
        enemyConfig = { health: 50, size: 10, speed: 60, ai_type: 'shooter', color: '#ff8800' };
      }
      
      enemyConfig.health += engine.level * 10; // Scale with level
      engine.spawnEnemy(enemyConfig);
      engine.waveEnemiesSpawned++;
    }

    // Wave clearing and state transition logic...
    if (engine.waveEnemiesSpawned >= engine.waveEnemiesTotal && engine.enemies.length === 0) { /* ... */ }
  } else if (engine.gameState === 'BOSS') {
    // (Boss logic can remain the same)
  } else if (engine.gameState === 'INTERMISSION') {
    // (Intermission logic can remain the same)
  }
}
```

## ✨ MVP Core Features

This MVP is not just a tech demo. It's a fully functional proof of concept showcasing the core value of "sovereign software."

- **Complete Game Loop:** This MVP features a full gameplay experience with a **Life & Game Over System**, high score tracking, and a level progression system that takes you from wave-based combat to challenging boss fights.
- **Dynamic Power-Up System:** Defeat enemies to collect a variety of game-changing power-ups, including shields, speed boosts, and the screen-clearing "Nuke." Each power-up provides a temporary but significant advantage, adding a layer of strategy to the gameplay.
- **Advanced & Hackable Boss AI:** Face off against bosses that utilize multiple, distinct attack patterns. The boss AI is not hard-coded; it's another moddable system, allowing you to design your own epic encounters.
- **Live In-Browser Modding:** The core value proposition in action. Modify weapons, player stats, and even core game logic like enemy AI and level progression directly in your browser with instant feedback. No build step required.
- **Ready-to-Hack Presets:** Jumpstart your creativity with a collection of pre-built mods. Instantly switch from a pistol to a shotgun, or from an endless mode to a level-based campaign, and see the code that makes it happen.
- **Procedurally Generated Audio & Visuals:** All sound effects are generated on-the-fly, creating a unique and responsive audio landscape. Combined with dynamic particle effects and sprite rotation, the engine feels alive.
- **Deterministic Gameplay:** Utilize the "Seed" system to generate predictable, replayable runs—perfect for speedrunning, competitions, or simply mastering a specific challenge.

## 🔮 The Vision Realized

The Sovereign Engine is more than just a game; it's a proof of concept for sovereign software. Every click in the mod panel is someone exercising digital sovereignty. Every line of code edited is someone refusing to accept software as a black box. The engine teaches by invitation: "Here's how weapons work. Here's how to change them. What will you build?"

Want to add multiplayer? Mod the network layer. Want different graphics? Mod the renderer. Want blockchain integration? Mod the state system. The architecture doesn't care what you build—it just gives you the tools and gets out of your way. This is how all software should be built: transparent, modifiable, and yours.

## 🌐 Distribution & Sharing

The Sovereign Engine is designed for maximum freedom in distribution:

- **Self-Hosting:** As shown above, a simple `git clone` and `python -m http.server` is all you need to host your version of the engine.
- **IPFS Distribution:** For truly uncensorable, distributed hosting, you can add your `sovereign-engine/` directory to IPFS. This makes your version of the game persistently available on the decentralized web: `ipfs add -r sovereign-engine/`.
- **GitHub Pages:** Push your repository to GitHub, and you can instantly host your game globally using GitHub Pages. Just enable it in your repository settings, and your game will be live at `https://YOUR_GITHUB_USERNAME.github.io/sovereign-engine/`.

## 📚 Documentation & Future Roadmap

This MVP is just the beginning. We are building a comprehensive suite of documentation, advanced tutorials, and exclusive mods to unlock the full potential of the Sovereign Engine.

The complete documentation and our detailed future roadmap are available for purchase. Your support will directly fund the development of new features and help us continue our mission to build truly sovereign software.

👉 **Get the Full Documentation & Roadmap on our Website**

## 🤝 Contributing & Sharing Your Mods

We welcome contributions from anyone who believes in the vision of sovereign software! The best way to share your creations with the community is to add them to the engine as official presets.

### How to Submit Your Mod

If you've created a cool Weapon, Rule, Player, or Control mod that you want to share, you can submit it to be included in the main repository via a GitHub Pull Request. Here is the process:

1. **Finalize Your Code:** Perfect your mod in the in-game editor. Once you're happy with it, copy the entire function.

2. **Create a Mod File:**
    - **Fork the repository** on GitHub.
    - In your fork, navigate to the appropriate `mods/` subdirectory (e.g., `mods/weapons/`, `mods/rules/`).
    - Create a new `.js` file for your mod. The filename should be descriptive, like `laser-beam.js` or `survival-mode.js`.
    - Paste your code into this new file.

3. **Update the Manifest:**
    - Open the `mods/mod-manifest.json` file.
    - Add a new entry for your mod in the correct category. The key is the name that will appear in the dropdown, and the value is the path to your new file.

    ```json
    // Example for a new weapon in mods/mod-manifest.json
    "weapon": {
      "Pistol (Default)": "mods/weapons/pistol.js",
      "Shotgun": "mods/weapons/shotgun.js",
      "Your Awesome Mod": "mods/weapons/your-awesome-mod.js"
    },
    ```

4. **Submit a Pull Request:**
    - Commit your changes (the new `.js` file and the modified `mod-manifest.json`).
    - Push the changes to your fork.
    - Open a Pull Request from your fork to the main `sovereign-engine` repository.
    - In the PR description, briefly explain what your mod does.

We'll review your submission, and if it's a good fit, we'll merge it. Your creation will then be a built-in preset for everyone to enjoy!

### Other Contributions

- **Improve the engine:** Found a bug? Have an idea for a core engine improvement? Open an issue or submit a pull request!
- **Showcase your fork:** If you've made major changes or created a completely new game, share a link to your fork in our community channels!

## 📄 License

This project is released under the MIT License. For full details, see the LICENSE file in this repository.

## 📧 Contact

Have questions or want to connect? Reach out on [Your preferred community channel, e.g., Discord/Twitter/Email].
