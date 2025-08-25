/**
 * @typedef {import('../../engine.js').SovereignEngine} SovereignEngine
 */

/**
 * Defines the logic for gaining extra lives based on score.
 * This function is executed every frame.
 * The editor might show an "Identifier expected" error on the line below. This is safe to ignore.
 *
 * @param {SovereignEngine} engine The main game engine instance.
 * @param {number} dt The delta time since the last frame, in seconds.
 */
function(engine, dt) {
    // Gain a life every 1000 points.
    if (engine.score === 0) engine.lastLifeScore = 0;
    if (!engine.hasOwnProperty('lastLifeScore')) engine.lastLifeScore = 0;

    if (engine.score >= engine.lastLifeScore + 1000) {
        if (engine.player.lives < (engine.player.maxLives || 5)) {
            engine.player.lives++;
        }
        engine.lastLifeScore += 1000;
    }
}