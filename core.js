export class EngineCore {
  constructor() {
    this.systems = {};
    this.projectiles = [];
    this.players = [
      { x: 100, y: 100, alive: true, abilities: [], health: 100 },
      { x: 400, y: 300, alive: true, abilities: [], health: 100 }
    ];
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  loadSystem(system) {
    this.systems[system.name] = system;
    system.init(this);
  }

  run() {
    this.loop();
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    this.projectiles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
    });
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw players
    this.players.forEach(p => {
      this.ctx.fillStyle = p.alive ? 'blue' : 'gray';
      this.ctx.fillRect(p.x - 10, p.y - 10, 20, 20);
    });

    // Draw projectiles
    this.ctx.fillStyle = 'red';
    this.projectiles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }
}