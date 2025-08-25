/**
 * @typedef {import('../../engine.js').SovereignEngine} SovereignEngine
 */

/**
 * Defines the game's main update loop for rules and enemy spawning. This is the "Standard" rule set.
 * This function is executed every frame.
 * The editor might show an "Identifier expected" error on the line below. This is safe to ignore.
 *
 * @param {SovereignEngine} engine The main game engine instance.
 * @param {number} dt The delta time since the last frame, in seconds.
 */
function(engine, dt) {
    // Standard spawner: one enemy every 3 seconds
    engine.spawnTimer = (engine.spawnTimer || 0) + dt;
    if (engine.spawnTimer > 3) {
        engine.spawnTimer = 0;
        engine.spawnEnemy({
            health: 30,
            ai_type: 'chase'
        });
    }
}
