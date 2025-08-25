/**
 * @typedef {import('../../engine.js').SovereignEngine} SovereignEngine
 */

/**
 * Defines the behavior of the "Default Pistol" weapon when it is fired.
 * This function is called when the player shoots.
 * The editor might show an "Identifier expected" error on the line below. This is safe to ignore.
 *
 * @param {object} player The player object.
 * @param {{x: number, y: number}} target An object with x and y coordinates representing the shot's target.
 * @param {SovereignEngine} engine The main game engine instance.
 */
function(player, target, engine) {
    engine.playShootSound();

    // Standard pistol
    const bulletSpeed = 600;
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const magnitude = Math.sqrt(dx * dx + dy * dy) || 1;

    engine.projectiles.push({
        x: player.x,
        y: player.y,
        vx: (dx / magnitude) * bulletSpeed,
        vy: (dy / magnitude) * bulletSpeed,
        size: 3,
        color: '#00ff88',
        damage: 25 * player.damageMultiplier,
        life: 2
    });
}
