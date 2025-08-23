# 🚀 SOVEREIGN ENGINE: Flux

Hackable. Modular. Yours. Every line of code is an invitation.

Welcome to Sovereign Engine, a game framework designed from the ground up to empower creators with total control. This isn't an engine; it's a living manifesto for digital sovereignty, challenging the notion of software as a black box. Here, every pixel is hackable, every rule is rewritable, and every system is explicitly yours to command. Dive in, modify, and reclaim your digital creative freedom.

⚡ THE MANIFESTO

We believe software should be transparent, modifiable, and truly owned by its users. The Sovereign Engine is a testament to this belief. It's about refusing to accept limitations and embracing the power to reshape your digital experience. No permissions, no gatekeepers, just pure creative freedom.

✨ Core Principles

The Sovereign Engine is built on a philosophy of ultimate flexibility and immediate feedback:

    Dependency-Injected Systems: The engine's architecture promotes modularity. Core functionalities like the WeaponSystem, CharacterSystem, and RulesSystem are dependency-injected and hot-swappable. This means you can completely replace or augment how weapons fire, how characters behave, or how game rules function without touching the engine's core.

    No Build Step: Forget compilers, bundlers, and complex development environments. With Sovereign Engine, it's about speed and direct interaction. Edit, save, refresh. That's it. Your changes are instantly reflected in the game, allowing for rapid iteration and experimentation.

    No Licensing: This project is intentionally in the Public Domain (or uses a highly permissive MIT License). You are free to fork, use, modify, and redistribute the engine and any mods without asking for permission or worrying about restrictive terms. It's truly yours.

    No Servers: The engine is designed to run independently. It operates offline and can be hosted anywhere—whether on your local machine, a simple HTTP server, IPFS, or GitHub Pages. Your game, your data, your distribution.

    No Limits: If you can code it in JavaScript, you can mod it. The engine's design explicitly exposes its internal workings, providing you with the tools to implement anything from custom particle effects and AI behaviors to entirely new game mechanics and procedural generation systems.

🛠️ Ready-to-Hack Presets

To demonstrate the power of the Sovereign Engine, it ships with working example mods that showcase its core philosophy in action:

    Pistol → Shotgun: Instantly switch from a single-shot pistol to a multi-projectile shotgun. The code for both is available in the editor, showing how different firing logic can be implemented.

    Default Player → Custom Build: Modify the player's core stats like speed, size, and color on the fly. Create a fast, fragile glass cannon or a slow, durable tank by editing the player mod.

    Endless Mode → Level Progression: See how entire game modes can be re-defined. Switch from a simple endless spawner to a complete game loop with waves, bosses, and difficulty scaling, all controlled by the Rules Mod.

🚀 Get Started (Self-Hosting)

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

💡 How to Mod

The engine is designed for live modification directly in the browser. The "How to Hack" panel in the UI provides a quick reference, but here's the core workflow:

    Select a Mod Panel: Choose what you want to change: 🔫 WEAPON, 🎮 RULES, or 🧍 PLAYER.

    Choose a Preset: Use the dropdown menu to load existing code. This is the best way to see how things work.

    Edit the Code: The code for the selected preset appears in the text editor. Change it however you like!

    Apply Your Changes: Click the "Apply" button for that section. Your changes will take effect instantly in the game.

    Save Your Creation: If you create something you love, give it a name in the input field at the bottom of the section and click "💾 Save". It will be saved to your browser's localStorage and will appear in the dropdown menu next time you load the game.

🔫 Weapon Mod Example

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
      const spread = (Math.random() - 0.5) *0.1;
      engine.projectiles.push({
        x: player.x, y: player.y,
        vx: Math.cos(angle + spread)* speed,
        vy: Math.sin(angle + spread) *speed,
        size: 3, color: '#ff55ff', life: 1.5, damage: 18
      });
    }, i* 80); // 80ms delay between each shot in the burst
  }
}

🎮 Rules Mod Example

The rules mod is a function that runs every frame: function update(engine, dt). You can use it to control enemy spawning, difficulty, or any other global game logic.

// Paste this into the RULES MOD editor to spawn bosses every 15 seconds.
if (engine.gameTime > (engine.lastBossTime || 0) + 15) {
  engine.spawnEnemy({
    health: 200,
    size: 20,
    color: '#ff1111',
    ai_type: 'chase'
  });
  engine.lastBossTime = engine.gameTime;
}

🌐 Distribution & Sharing

The Sovereign Engine is designed for maximum freedom in distribution:

    Self-Hosting: As shown above, a simple git clone and python -m http.server is all you need to host your version of the engine.

    IPFS Distribution: For truly uncensorable, distributed hosting, you can add your sovereign-engine/ directory to IPFS. This makes your version of the game persistently available on the decentralized web: ipfs add -r sovereign-engine/.

    GitHub Pages: Push your repository to GitHub, and you can instantly host your game globally using GitHub Pages. Just enable it in your repository settings, and your game will be live at https://YOUR_GITHUB_USERNAME.github.io/sovereign-engine/.

🔮 The Vision Realized

The Sovereign Engine is more than just a game; it's a proof of concept for sovereign software. Every click in the mod panel is someone exercising digital sovereignty. Every line of code edited is someone refusing to accept software as a black box. The engine teaches by invitation: "Here's how weapons work. Here's how to change them. What will you build?"

Want to add multiplayer? Mod the network layer. Want different graphics? Mod the renderer. Want blockchain integration? Mod the state system. The architecture doesn't care what you build—it just gives you the tools and gets out of your way. This is how all software should be built: transparent, modifiable, and yours.

🤝 Contributing

We welcome contributions from anyone who believes in the vision of sovereign software!

    Fork the repository: Start by forking sovereign-engine on GitHub.

    Create your mods: Experiment, hack, and create new game mechanics, characters, or rules.

    Share your creations: Submit pull requests with your new mods (ideally in the mods/ directory following the suggested community mod format) or showcase your forks in our community channels.

    Improve the engine: Found a bug? Have an idea for a core engine improvement? Open an issue or submit a pull request!

📄 License

This project is released under the MIT License. For full details, see the LICENSE file in this repository.

📧 Contact

Have questions or want to connect? Reach out on [Your preferred community channel, e.g., Discord/Twitter/Email].
