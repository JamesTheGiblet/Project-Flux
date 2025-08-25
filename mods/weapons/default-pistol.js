function shoot(player, target, engine) {
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
