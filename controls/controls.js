const controlPresets = {
    'default': `function(engine, dt) {
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
}`,

    'twin-stick': `function(engine, dt) {
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
}`
};