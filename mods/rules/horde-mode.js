/**
 * @typedef {import('../../engine.js').SovereignEngine} SovereignEngine
 */

/**
 * Defines the game's main update loop for "Horde Mode" rules.
 * This function is executed every frame.
 * The editor might show an "Identifier expected" error on the line below. This is safe to ignore.
 *
 * @param {SovereignEngine} engine The main game engine instance.
 * @param {number} dt The delta time since the last frame, in seconds.
 */
function(engine, dt) {
    // Horde mode: spawn a weak enemy every 0.5 seconds
    engine.spawnTimer = (engine.spawnTimer || 0) + dt;
    if (engine.spawnTimer > 0.5) {
        engine.spawnTimer = 0;
        engine.spawnEnemy({
            health: 10,
            size: 7,
            color: '#ff8888',
            ai_type: 'chase'
        });
    }
}
