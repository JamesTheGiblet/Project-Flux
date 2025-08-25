function shoot(player, target, engine) {
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
