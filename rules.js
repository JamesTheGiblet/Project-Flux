const rulesPresets = {
    default: `function update(engine, dt) {
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
      color: '#999999', size: 4 + Math.random() * 8, health: 40
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