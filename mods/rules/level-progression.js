/**
 * @typedef {import('../../engine.js').SovereignEngine} SovereignEngine
 */

/**
 * Defines the game's main update loop for rules and enemy spawning.
 * This rule set manages game state through waves, intermissions, and boss fights.
 * This function is executed every frame.
 * The editor might show an "Identifier expected" error on the line below. This is safe to ignore.
 *
 * @param {SovereignEngine} engine The main game engine instance.
 * @param {number} dt The delta time since the last frame, in seconds.
 */
function(engine, dt) {
  if (engine.waveState === 'WAVE') {
    // --- WAVE LOGIC ---
    if (engine.waveEnemiesSpawned === 0) {
      // Start of a new wave, set the total number of enemies
      engine.waveEnemiesTotal = 5 + engine.wave * 2 + engine.level * 3;
    }

    // Spawn enemies for the current wave
    if (engine.waveEnemiesSpawned < engine.waveEnemiesTotal && engine.random() < 0.05) {
      engine.spawnEnemy({
        health: 30 + engine.level * 5,
        size: 6 + engine.random() * engine.level,
      });
      engine.waveEnemiesSpawned++;
    }

    // Check if wave is cleared
    if (engine.waveEnemiesSpawned >= engine.waveEnemiesTotal && engine.enemies.length === 0) {
      engine.wave++;
      engine.waveEnemiesSpawned = 0;
      engine.waveEnemiesTotal = 0;

      if (engine.wave > engine.wavesPerLevel) {
        engine.waveState = 'BOSS';
        engine.intermissionTime = engine.gameTime + 2; 
      } else {
        engine.waveState = 'INTERMISSION';
        engine.intermissionTime = engine.gameTime + 3; // 3 second break
        engine.playWaveClearSound();
      }
    }

  } else if (engine.waveState === 'BOSS') {
    const isBossOnScreen = engine.enemies.some(e => e.isBoss);

    if (engine.wasBossPresent && !isBossOnScreen) {
      engine.state = 'UPGRADE';
      engine.playLevelCompleteSound();
    } else if (!isBossOnScreen && engine.gameTime > engine.intermissionTime) {
      engine.spawnBoss({ patterns: ['spiral_shot', 'charge', 'burst_shot'] });
    }
    engine.wasBossPresent = isBossOnScreen;

  } else if (engine.waveState === 'INTERMISSION') {
    if (engine.gameTime > engine.intermissionTime) {
      engine.waveState = 'WAVE';
    }
  }
}