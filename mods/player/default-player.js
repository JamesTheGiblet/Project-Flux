function modifyPlayer(player) {
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
