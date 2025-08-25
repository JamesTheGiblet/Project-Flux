/**
 * @typedef {import('../engine.js').SovereignEngine} SovereignEngine
 */

/**
 * Defines the "Default" control scheme (WASD to move, Mouse/Space to shoot).
 * This function is executed every frame to handle player input.
 * The editor might show an "Identifier expected" error on the line below. This is safe to ignore.
 *
 * @param {SovereignEngine} engine The main game engine instance.
 * @param {number} dt The delta time since the last frame, in seconds.
 */
function(engine, dt) {
    // This is the classic engine control scheme, re-implemented here to be hackable.
    // It uses WASD/Arrows for movement and Mouse/Space for shooting.

    // Player movement
    let dx = 0, dy = 0;
    if (engine.keys['KeyW'] || engine.keys['ArrowUp']) dy = -1;
    if (engine.keys['KeyS'] || engine.keys['ArrowDown']) dy = 1;
    if (engine.keys['KeyA'] || engine.keys['ArrowLeft']) dx = -1;
    if (engine.keys['KeyD'] || engine.keys['ArrowRight']) dx = 1;

    if (dx !== 0 || dy !== 0) {
        const mag = Math.sqrt(dx*dx + dy*dy);
        const moveDx = dx / mag;
        const moveDy = dy / mag;

        engine.player.lastMoveDir = { x: moveDx, y: moveDy };
        engine.player.x += moveDx * engine.player.speed * dt;
        engine.player.y += moveDy * engine.player.speed * dt;
    }

    // Handle shooting
    if (engine.isMouseDown) {
        engine.handleShooting(engine.mousePos);
    } else if (engine.keys['Space']) {
        const forwardTarget = {
            x: engine.player.x + engine.player.lastMoveDir.x * 100,
            y: engine.player.y + engine.player.lastMoveDir.y * 100
        };
        engine.handleShooting(forwardTarget);
    }
}