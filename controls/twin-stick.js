/**
 * @typedef {import('../engine.js').SovereignEngine} SovereignEngine
 */

/**
 * Defines the "Twin-Stick" control scheme (Mouse to move, WASD to shoot).
 * This function is executed every frame to handle player input.
 * The editor might show an "Identifier expected" error on the line below. This is safe to ignore.
 *
 * @param {SovereignEngine} engine The main game engine instance.
 * @param {number} dt The delta time since the last frame, in seconds.
 */
function(engine, dt) {
    // MOUSE MOVEMENT: Player follows the mouse cursor.
    const dx = engine.mousePos.x - engine.player.x;
    const dy = engine.mousePos.y - engine.player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > (engine.player.size / 2)) { // Stop if close to prevent jittering
        const normalizedDx = dx / dist;
        const normalizedDy = dy / dist;
        engine.player.x += normalizedDx * engine.player.speed * dt;
        engine.player.y += normalizedDy * engine.player.speed * dt;
        // Update lastMoveDir for player sprite rotation (to face the cursor)
        engine.player.lastMoveDir = { x: normalizedDx, y: normalizedDy };
    }

    // WASD SHOOTING: Use WASD keys for directional shooting.
    let shootDx = 0, shootDy = 0;
    if (engine.keys['KeyW']) shootDy = -1;
    if (engine.keys['KeyS']) shootDy = 1;
    if (engine.keys['KeyA']) shootDx = -1;
    if (engine.keys['KeyD']) shootDx = 1;

    if (shootDx !== 0 || shootDy !== 0) {
        const shootMag = Math.sqrt(shootDx*shootDx + shootDy*shootDy);
        engine.handleShooting({ x: engine.player.x + (shootDx/shootMag)*100, y: engine.player.y + (shootDy/shootMag)*100 });
    }
}