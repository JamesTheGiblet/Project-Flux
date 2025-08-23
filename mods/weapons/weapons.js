const weaponPresets = {
    default: `function shoot(player, target, engine) {
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const dist = Math.sqrt(dx*dx + dy*dy) || 1;
  engine.projectiles.push({
    x: player.x, y: player.y,
    vx: (dx/dist) * 300,
    vy: (dy/dist) * 300,
    size: 3, color: '#00ff88', life: 2, damage: 25
  });
}`,
    shotgun: `function shoot(player, target, engine) {
  for (let i = 0; i < 6; i++) {
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const angle = Math.atan2(dy, dx);
    const spread = (Math.random() - 0.5) * 0.4; // ~23 degrees spread
    const speed = 280 + Math.random() * 80;
    engine.projectiles.push({
      x: player.x, y: player.y,
      vx: Math.cos(angle + spread) * speed,
      vy: Math.sin(angle + spread) * speed,
      size: 2, color: '#ffaa00', life: 0.6, damage: 10
    });
  }
}`,
    machinegun: `function shoot(player, target, engine) {
  // A fast-firing bullet. The rate of fire is controlled
  // by the 'fireRate' property in the Player Mod.
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const dist = Math.sqrt(dx*dx + dy*dy) || 1;
  const angle = Math.atan2(dy, dx);
  const spread = (Math.random() - 0.5) * 0.08;
  engine.projectiles.push({
    x: player.x, y: player.y,
    vx: Math.cos(angle + spread) * 600,
    vy: Math.sin(angle + spread) * 600,
    size: 2.5, color: '#ffff00', life: 1.2, damage: 15
  });
}`,
    railgun: `function shoot(player, target, engine) {
  // A very fast projectile with a unique visual style.
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const dist = Math.sqrt(dx*dx + dy*dy) || 1;
  engine.projectiles.push({
    x: player.x, y: player.y,
    vx: (dx/dist) * 1500, // Extremely fast
    vy: (dy/dist) * 1500,
    size: 4, color: '#00ffff', life: 0.8, damage: 100,
    isRailgun: true // Custom property for special rendering,
  });
}`
};