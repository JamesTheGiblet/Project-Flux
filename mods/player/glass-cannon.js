function modifyPlayer(player) {
    // High speed, but fragile
    player.speed = player.baseSpeed * 1.5;
    player.maxHealth = 50;
    player.health = 50; // Set current health as well
}
