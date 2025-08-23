const rulesPresets = {
    'level-progression': `function update(engine, dt) {
  // This rule manages game state through waves and boss fights.

  if (engine.gameState === 'WAVE') {
    // --- WAVE LOGIC ---
    if (engine.waveEnemiesSpawned === 0) {
      // Start of a new wave, set the total number of enemies
      engine.waveEnemiesTotal = 5 + engine.wave * 2 + engine.level * 3;
    }

    // Spawn enemies for the current wave
    if (engine.waveEnemiesSpawned < engine.waveEnemiesTotal && Math.random() < 0.05) {
      engine.spawnEnemy({
        health: 30 + engine.level * 5,
        size: 6 + Math.random() * engine.level,
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
        // Give player a moment before boss spawns
        engine.intermissionTime = engine.gameTime + 2; 
      } else {
        engine.gameState = 'INTERMISSION';
        engine.intermissionTime = engine.gameTime + 3; // 3 second break
      }
    }

  } else if (engine.gameState === 'BOSS') {
    // --- BOSS LOGIC ---
    const bossExists = engine.enemies.some(e => e.isBoss);
    if (!bossExists && engine.gameTime > engine.intermissionTime) {
      engine.spawnBoss();
    }

    // If boss is defeated, progress to next level
    if (bossExists && !engine.enemies.some(e => e.isBoss)) {
      engine.level++;
      engine.wave = 1;
      engine.gameState = 'INTERMISSION';
      engine.intermissionTime = engine.gameTime + 5; // 5 second break after boss
    }

  } else if (engine.gameState === 'INTERMISSION') {
    // --- INTERMISSION LOGIC ---
    if (engine.gameTime > engine.intermissionTime) {
      engine.gameState = 'WAVE';
      document.getElementById('waveCount').style.color = '#00ff88'; // Reset color
    }
  }
}`,
    endless: `function update(engine, dt) {
  // Spawn standard enemies that chase the player.
  if (Math.random() < 0.015) {
    engine.spawnEnemy(); // Uses default enemy properties.
  }
  // Gradually increase the speed of chasing enemies.
  if (engine.gameTime > engine.lastDifficulty + 10) {
    engine.enemySpeed += 10;
    engine.lastDifficulty = engine.gameTime;
  }
}`,
    horde: `function update(engine, dt) {
  // Spawn weaker enemies at a much higher rate.
  if (Math.random() < 0.1) {
    engine.spawnEnemy({ health: 15, size: 5, color: '#ff5555' });
  }
  // Difficulty scaling is faster in horde mode.
  if (engine.gameTime > engine.lastDifficulty + 5) {
    engine.enemySpeed += 5;
    engine.lastDifficulty = engine.gameTime;
  }
}`,
    meteors: `function update(engine, dt) {
  // This rule ignores engine.enemySpeed and lastDifficulty.
  // It creates "meteor" enemies that don't chase the player.
  if (Math.random() < 0.08) {
    const spawnPos = engine.getEnemySpawnPosition();
    
    // Meteors fly towards the general center of the screen.
    const targetX = engine.canvas.width / 2 + (Math.random() - 0.5) * 400;
    const targetY = engine.canvas.height / 2 + (Math.random() - 0.5) * 400;
    const dx = targetX - spawnPos.x;
    const dy = targetY - spawnPos.y;
    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
    const speed = 80 + Math.random() * 100;

    engine.spawnEnemy({
      ...spawnPos,
      vx: (dx/dist) * speed, vy: (dy/dist) * speed,
      ai_type: 'linear', // This custom property prevents chasing.
      color: '#999999', size: 4 + Math.random() * 8, health: 40,
      sprite: [
        [0, 1, 1, 0],
        [1, 2, 2, 1],
        [1, 2, 2, 1],
        [0, 1, 1, 0]
      ],
      spriteColors: ['#999999', '#666666']
    });
  }
}`,
    powerUpFrenzy: `function update(engine, dt) {
  // Standard enemy spawning
  if (Math.random() < 0.02) {
    engine.spawnEnemy();
  }

  // High chance to spawn a random power-up anywhere on the map
  if (Math.random() < 0.01) {
    const x = Math.random() * engine.canvas.width;
    const y = Math.random() * engine.canvas.height;
    const types = Object.keys(powerUpTypes);
    const randomType = types[Math.floor(Math.random() * types.length)];
    engine.spawnPowerUp(x, y, randomType);
  }
}`
};