function modifyPlayer(player) {
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
