const playerPresets = {
    default: `function modifyPlayer(player) {
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
}`,
    tank: `function modifyPlayer(player) {
  // A slow, durable character.
  player.maxHealth = 200;
  player.health = 200;
  player.baseSpeed = 140;
  player.speed = 140;
  player.color = '#88aaff';
  player.size = 12;
  player.fireRate = 3;
  player.damageMultiplier = 1;
  player.sprite = [
    [1, 2, 2, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [0, 1, 1, 0]
  ];
  player.spriteColors = ['#88aaff', '#ddddff'];
}`,
    glassCannon: `function modifyPlayer(player) {
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
}`
};