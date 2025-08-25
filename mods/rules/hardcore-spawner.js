/**
 * @typedef {import('../../engine.js').SovereignEngine} SovereignEngine
 */

/**
 * "Hardcore Spawner" Rules Mod
 * This mod introduces new AI types and spawns a challenging mix of enemies.
 * @param {SovereignEngine} engine The main game engine instance.
 * @param {number} dt The delta time since the last frame, in seconds.
 */
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
    // This overrides the default movement logic.
    if (enemy.ai_type === 'interceptor') {
      const leadTime = dist / (enemy.speed * 0.9); // Heuristic for how far to lead
      const targetX = player.x + (player.vx || 0) * leadTime;
      const targetY = player.y + (player.vy || 0) * leadTime;
      const tdx = targetX - enemy.x, tdy = targetY - enemy.y;
      const tdist = Math.sqrt(tdx*tdx + tdy*tdy);
      if (tdist > 1) {
        enemy.vx = (tdx / tdist) * enemy.speed;
        enemy.vy = (tdy / tdist) * enemy.speed;
      }
    }

    // 'shooter' AI: Keeps distance and fires projectiles.
    // This AI *complements* the base 'chase' AI. The engine will handle movement,
    // and this logic adds the ability to shoot.
    if (enemy.ai_type === 'shooter') {
      enemy.ai_state.shootCooldown = (enemy.ai_state.shootCooldown || 1) - dt;
      if (enemy.ai_state.shootCooldown <= 0) {
        enemy.ai_state.shootCooldown = 2.5 + engine.random(); // Cooldown of 2.5-3.5s
        const angle = Math.atan2(dy, dx);
        engine.projectiles.push({
          x: enemy.x, y: enemy.y,
          vx: Math.cos(angle) * 300, vy: Math.sin(angle) * 300,
          size: 4, color: '#ff8800', life: 2.5, damage: 10,
          isEnemyProjectile: true // IMPORTANT: Flag for collision system
        });
        // Play a sound if the function exists
        if (engine.playShooterSound) engine.playShooterSound();
      }
    }
  });

  // --- 2. Spawner Logic (Modified from 'level-progression') ---
  if (engine.gameState === 'WAVE') {
    // Increased spawn chance for more action
    if (engine.waveEnemiesSpawned < engine.waveEnemiesTotal && engine.random() < 0.12) {
      const rand = engine.random();
      let enemyConfig = {};

      if (rand < 0.5) { // 50% chance for a fast, weak chaser
        enemyConfig = { health: 20, size: 6 + engine.random() * 4, speed: 90 + engine.random() * 40, ai_type: 'chase', color: '#ff4444' };
      } else if (rand < 0.8) { // 30% chance for a predictive interceptor
        enemyConfig = { health: 40, size: 8, speed: 110, ai_type: 'interceptor', color: '#ffff66' };
      } else { // 20% chance for a durable shooter that also chases
        enemyConfig = { health: 50, size: 10, speed: 60, ai_type: 'shooter', color: '#ff8800' };
      }
      
      // Scale health with the current level
      enemyConfig.health += engine.level * 10;
      engine.spawnEnemy(enemyConfig);
      engine.waveEnemiesSpawned++;
    }

    // Check if wave is cleared (same as original level-progression)
    if (engine.waveEnemiesSpawned >= engine.waveEnemiesTotal && engine.enemies.length === 0) {
      engine.wave++;
      engine.waveEnemiesSpawned = 0;
      engine.waveEnemiesTotal = 0;
      if (engine.wave > engine.wavesPerLevel) {
        engine.gameState = 'BOSS';
        engine.intermissionTime = engine.gameTime + 2;
      } else {
        engine.gameState = 'INTERMISSION';
        engine.intermissionTime = engine.gameTime + 3;
      }
    }

  } else if (engine.gameState === 'BOSS') {
    // This part of the logic is unchanged.
    const bossExists = engine.enemies.some(e => e.isBoss);
    if (!bossExists && engine.gameTime > engine.intermissionTime) {
      engine.spawnBoss({
        ai_type: 'boss_pattern',
        patterns: ['spiral_shot', 'charge', 'burst_shot'],
      });
    }
    if (bossExists && !engine.enemies.some(e => e.isBoss)) {
      engine.level++;
      engine.wave = 1;
      engine.gameState = 'INTERMISSION';
      engine.intermissionTime = engine.gameTime + 5;
    }
  } else if (engine.gameState === 'INTERMISSION') {
    if (engine.gameTime > engine.intermissionTime) {
      engine.gameState = 'WAVE';
    }
  }
}