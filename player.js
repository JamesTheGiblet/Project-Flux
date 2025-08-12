const playerPresets = {
    default: `function modifyPlayer(player) {
  // These are the base stats for the player.
  player.baseSpeed = 200;
  player.color = '#00ff88';
  player.size = 8;
  player.fireRate = 5; // shots per second
  // Note: Health is reset to 100 on game over, not here.
}`
};