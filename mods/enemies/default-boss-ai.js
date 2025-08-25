/**
 * @typedef {import('../../engine.js').SovereignEngine} SovereignEngine
 */

/**
 * This function defines the behavior for a boss enemy. It's a state machine that switches between different attack patterns.
 * The editor might show an "Identifier expected" error on the line below because this file contains only a function expression.
 * This is correct, as the engine loads this code as a string and evaluates it. The error can be safely ignored.
 *
 * @param {object} boss The boss enemy object.
 * @param {number} boss.x The boss's position on the x-axis.
 * @param {number} boss.y The boss's position on the y-axis.
 * @param {number} boss.vx The boss's velocity on the x-axis.
 * @param {number} boss.vy The boss's velocity on the y-axis.
 * @param {string[]} boss.patterns A list of available attack patterns (e.g., 'spiral_shot', 'charge').
 * @param {string} boss.currentPattern The name of the currently active pattern.
 * @param {number} dt The delta time since the last frame, in seconds.
 * @param {SovereignEngine} engine The main game engine instance, providing access to projectiles, player data, and helper functions.
 */
function(boss, dt, engine) {
    // This function defines how the boss behaves based on its current pattern.
    // It's called for each boss every frame.

    boss.patternTimer -= dt;
    boss.attackTimer -= dt;

    if (boss.patternTimer <= 0) {
        // Switch to a new random pattern from its list
        const currentPatternIndex = boss.patterns.indexOf(boss.currentPattern); // Not random
        let nextPatternIndex = Math.floor(engine.random() * boss.patterns.length);
        // Avoid using the same pattern twice in a row if possible
        if (boss.patterns.length > 1 && nextPatternIndex === currentPatternIndex) {
            nextPatternIndex = (nextPatternIndex + 1) % boss.patterns.length;
        }
        boss.currentPattern = boss.patterns[nextPatternIndex];
        boss.patternTimer = 8 + engine.random() * 4; // Switch pattern every 8-12 seconds
        boss.attackTimer = 1; // Brief delay before new pattern starts
        delete boss.chargeState; // Clear state from previous patterns
        delete boss.isTelegraphing; // Clear telegraphing state
        engine.playPhaseTransitionSound();
    }

    // Execute current pattern's logic
    switch (boss.currentPattern) {
        case 'spiral_shot':
            // Slowly drift
            boss.vx *= 0.98; boss.vy *= 0.98;
            if (boss.attackTimer <= 0) {
                boss.spiralAngle = (boss.spiralAngle || 0) + 0.4; // Increment angle
                const bulletSpeed = 150 + engine.level * 10;
                engine.projectiles.push({
                    from: 'enemy', x: boss.x, y: boss.y,
                    vx: Math.cos(boss.spiralAngle) * bulletSpeed,
                    vy: Math.sin(boss.spiralAngle) * bulletSpeed,
                    size: 5, color: '#ff88ff', life: 4, damage: 15
                });
                boss.attackTimer = 0.05; // Fire rate
            }
            break;

        case 'charge':
            if (!boss.chargeState || (boss.chargeState === 'cooldown' && boss.attackTimer <= 0)) {
                boss.chargeState = 'telegraph';
                boss.isTelegraphing = true;
                boss.attackTimer = 1.5; // 1.5s telegraph time
                boss.targetX = engine.player.x;
                boss.targetY = engine.player.y;
                boss.vx = 0; boss.vy = 0;
            } else if (boss.chargeState === 'telegraph' && boss.attackTimer <= 0) {
                boss.chargeState = 'dashing';
                delete boss.isTelegraphing;
                boss.attackTimer = 1.2; // Max dash time
                const dx = boss.targetX - boss.x;
                const dy = boss.targetY - boss.y;
                const dist = Math.sqrt(dx*dx + dy*dy) || 1;
                const chargeSpeed = 600 + engine.level * 20;
                boss.vx = (dx/dist) * chargeSpeed;
                boss.vy = (dy/dist) * chargeSpeed;
            } else if (boss.chargeState === 'dashing' && boss.attackTimer <= 0) {
                boss.chargeState = 'cooldown';
                boss.attackTimer = 2; // 2s cooldown
                boss.vx *= 0.1; boss.vy *= 0.1; // Skid to a halt
            }
            break;

        case 'burst_shot':
            boss.vx = 0; boss.vy = 0; // Stay still
            if (boss.attackTimer <= 0) {
                const dx = engine.player.x - boss.x;
                const dy = engine.player.y - boss.y;
                const angle = Math.atan2(dy, dx);
                const bulletSpeed = 300 + engine.level * 15;
                for (let i = 0; i < 5; i++) {
                    const spread = (i - 2) * 0.08; // 5 shots in a narrow cone
                    engine.projectiles.push({
                        from: 'enemy', x: boss.x, y: boss.y,
                        vx: Math.cos(angle + spread) * bulletSpeed,
                        vy: Math.sin(angle + spread) * bulletSpeed,
                        size: 4, color: '#ff5555', life: 3, damage: 20
                    });
                }
                boss.attackTimer = Math.max(0.8, 2.5 - (engine.level * 0.1));
            }
            break;
    }
}