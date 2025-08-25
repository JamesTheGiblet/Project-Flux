/**
 * Modifies the player object to set its base stats for the "Standard" character.
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
    // These are the base stats for the player.
    player.maxHealth = 100;
    player.health = 100;
    player.baseSpeed = 200; // The reference speed for power-ups
    player.speed = 200;
    player.color = '#00ff88';
    player.size = 8;
    player.fireRate = 5; // shots per second
    player.damageMultiplier = 1;
    player.sprite = [
        [0, 1, 0],
        [1, 1, 1],
        [1, 2, 1],
        [1, 0, 1]
    ];
    player.spriteColors = ['#00ff88', '#ffffff'];
}
