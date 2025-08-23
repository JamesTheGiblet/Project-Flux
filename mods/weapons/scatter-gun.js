export default {
  name: "Scatter Gun",
  projectileSpeed: 10,
  damage: 30,
  shoot(player, target, engine) {
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    [-0.2, 0, 0.2].forEach(offset => {
      engine.projectiles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle + offset) * this.projectileSpeed,
        vy: Math.sin(angle + offset) * this.projectileSpeed,
        damage: this.damage / 3
      });
    });
  }
};