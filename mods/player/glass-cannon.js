/**
 * Modifies the player object to set its stats for the "Glass Cannon" character.
 * This function is run once when the mod is applied.
 * The editor might show an "Identifier expected" error on the line below. This is safe to ignore.
 *
 * @param {object} player The player object from the game engine.
 * @param {number} player.maxHealth The maximum health of the player.
 * @param {number} player.health The current health of the player.
 * @param {number} player.baseSpeed The reference speed for power-ups.
 * @param {number} player.speed The current movement speed.
 * @param {string} player.color The player's primary color.
 * @param {number} player.size The player's collision size.
 * @param {number} player.fireRate The number of shots per second.
 * @param {number} player.damageMultiplier A multiplier for all outgoing damage.
 * @param {number[][]} player.sprite A 2D array defining the player's pixel art.
 * @param {string[]} player.spriteColors An array of colors used by the sprite.
 */
function(player) {
    // A fast, high-damage character with low health.
    player.maxHealth = 60;
    player.health = 60;
    player.baseSpeed = 240;
    player.speed = 240;
    player.color = '#ff88ff';
    player.size = 6;
    player.fireRate = 7;
    player.damageMultiplier = 1.75;
    player.sprite = [
        [0, 1, 0],
        [1, 2, 1],
        [1, 1, 1],
        [1, 0, 1]
    ];
    player.spriteColors = ['#ff88ff', '#ffffff'];
}
