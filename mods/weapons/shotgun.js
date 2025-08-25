/**
 * @typedef {import('../../engine.js').SovereignEngine} SovereignEngine
 */

/**
 * Defines the behavior of the "Shotgun" weapon when it is fired.
 * This function is called when the player shoots.
 * The editor might show an "Identifier expected" error on the line below. This is safe to ignore.
 *
 * @param {object} player The player object.
 * @param {{x: number, y: number}} target An object with x and y coordinates representing the shot's target.
 * @param {SovereignEngine} engine The main game engine instance.
 */
function(player, target, engine) {
    engine.playShootSound();

    // 8-pellet shotgun
    const pelletCount = 8;
    const spread = 0.3; // radians
    const bulletSpeed = 500;
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const angle = Math.atan2(dy, dx);

    for (let i = 0; i < pelletCount; i++) {
        const offset = (engine.random() - 0.5) * spread;
        engine.projectiles.push({
            x: player.x,
            y: player.y,
            vx: Math.cos(angle + offset) * bulletSpeed,
            vy: Math.sin(angle + offset) * bulletSpeed,
            size: 2,
            color: '#ffaa00',
            damage: 10 * player.damageMultiplier,
            life: 0.7
        });
    }
}
