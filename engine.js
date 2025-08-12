class SovereignEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        this.player = { x: 400, y: 300, vx: 0, vy: 0, health: 100, size: 8, color: '#00ff88', speed: 200, lastMoveDir: { x: 0, y: -1 } };
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.powerUps = [];
        this.activePowerUps = [];
        
        this.isMouseDown = false;
        this.lastShotTime = 0;
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.gameTime = 0;
        this.score = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.enemySpeed = 80;
        this.lastDifficulty = 0;
        
        this.weaponShoot = this.defaultShoot;
        this.rulesUpdate = () => {}; // Will be set by applyMod on load
        
        this.setupEvents();
        this.gameLoop();
    }
    
    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }
    
    setupEvents() {
        document.addEventListener('keydown', (e) => this.keys[e.code] = true);
        document.addEventListener('keyup', (e) => this.keys[e.code] = false);
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = e.clientX - rect.left;
            this.mousePos.y = e.clientY - rect.top;
        });
        this.canvas.addEventListener('mousedown', () => { this.isMouseDown = true; });
        this.canvas.addEventListener('mouseup', () => { this.isMouseDown = false; });
        this.canvas.addEventListener('mouseleave', () => { this.isMouseDown = false; }); // Stop firing if mouse leaves canvas
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    defaultShoot(player, target, engine) {
        const dx = target.x - player.x;
        const dy = target.y - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy) || 1;
        engine.projectiles.push({
            x: player.x, y: player.y,
            vx: (dx/dist) * 300,
            vy: (dy/dist) * 300,
            size: 3, color: '#00ff88', life: 2, damage: 25
        });
    }
    
    getEnemySpawnPosition() {
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        const offset = 30;
        switch(edge) {
            case 0: x = Math.random() * this.canvas.width; y = -offset; break;
            case 1: x = this.canvas.width + offset; y = Math.random() * this.canvas.height; break;
            case 2: x = Math.random() * this.canvas.width; y = this.canvas.height + offset; break;
            case 3: x = -offset; y = Math.random() * this.canvas.height; break;
        }
        return { x, y };
    }

    spawnEnemy(options = {}) {
        const spawnPos = this.getEnemySpawnPosition();
        const defaults = {
            ...spawnPos, vx: 0, vy: 0,
            health: 30, size: 6, color: '#ff3333',
            ai_type: 'chase' // Default AI chases player
        };
        this.enemies.push({ ...defaults, ...options });
    }

    spawnPowerUp(x, y, type) {
        const powerUpType = powerUpTypes[type];
        if (powerUpType) {
            this.powerUps.push({
                x: x, y: y,
                size: 10,
                color: powerUpType.color,
                symbol: powerUpType.symbol,
                type: type
            });
        }
    }

    applyPowerUp(powerUp) {
        const powerUpType = powerUpTypes[powerUp.type];
        if (powerUpType) {
            // If a power-up of this type is already active, remove it first
            const existingPowerUp = this.activePowerUps.find(p => p.type === powerUp.type);
            if (existingPowerUp) {
                existingPowerUp.remove(this.player, this);
            }
            
            powerUpType.apply(this.player, this);
            
            // Only add to activePowerUps if it has a duration
            if (powerUpType.duration > 0) {
                this.activePowerUps.push({
                    ...powerUpType,
                    type: powerUp.type,
                    timeRemaining: powerUpType.duration
                });
            }
        }
    }
    
    handleShooting(target) {
        const now = this.gameTime;
        // Use player's fireRate, or a default of 5 if not set.
        const fireCooldown = 1 / (this.player.fireRate || 5); 
        if (now > this.lastShotTime + fireCooldown) {
            // Pass the player's damage multiplier into the shoot function
            this.weaponShoot(this.player, target, this);
            this.lastShotTime = now;
        }
    }

    update(dt) {
        this.gameTime += dt;
        
        // Player movement
        let dx = 0, dy = 0;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) dy = -1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) dy = 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx = -1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) dx = 1;

        if (dx !== 0 || dy !== 0) {
            const mag = Math.sqrt(dx*dx + dy*dy);
            const moveDx = dx / mag;
            const moveDy = dy / mag;

            this.player.lastMoveDir = { x: moveDx, y: moveDy };
            this.player.x += moveDx * this.player.speed * dt;
            this.player.y += moveDy * this.player.speed * dt;
        }

        this.player.x = Math.max(this.player.size, Math.min(this.canvas.width - this.player.size, this.player.x));
        this.player.y = Math.max(this.player.size, Math.min(this.canvas.height - this.player.size, this.player.y));

        // Handle shooting
        if (this.isMouseDown) {
            this.handleShooting(this.mousePos);
        } else if (this.keys['Space']) {
            const forwardTarget = {
                x: this.player.x + this.player.lastMoveDir.x * 100, // Project a point 100px forward
                y: this.player.y + this.player.lastMoveDir.y * 100
            };
            this.handleShooting(forwardTarget);
        }
        
        // Power-up timers
        this.activePowerUps.forEach(p => {
            p.timeRemaining -= dt;
            // Power-ups with 0 duration are permanent or based on other logic (e.g., shields)
            if (p.timeRemaining <= 0) {
                p.remove(this.player, this);
            }
        });

        // Enemy AI
        this.enemies.forEach(enemy => {
            // AI logic: 'chase' AI recalculates velocity towards player
            if (enemy.ai_type === 'chase') {
                const dx = this.player.x - enemy.x;
                const dy = this.player.y - enemy.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist > 0) {
                    enemy.vx = (dx/dist) * this.enemySpeed;
                    enemy.vy = (dy/dist) * this.enemySpeed;
                }
            }
            // Movement is applied to all enemies regardless of AI
            enemy.x += enemy.vx * dt;
            enemy.y += enemy.vy * dt;
        });
        
        // Projectiles
        this.projectiles.forEach(proj => {
            proj.x += proj.vx * dt;
            proj.y += proj.vy * dt;
            proj.life -= dt;
        });
        
        // Particles
        this.particles.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            p.alpha = p.life / p.maxLife;
        });
        
        this.checkCollisions();
        this.rulesUpdate(this, dt);
        
        // Cleanup
        this.projectiles = this.projectiles.filter(p => p.life > 0);
        this.particles = this.particles.filter(p => p.life > 0);
        this.enemies = this.enemies.filter(e => e.health > 0);
        this.activePowerUps = this.activePowerUps.filter(p => p.timeRemaining > 0 || p.duration === 0);
    }
    
    checkCollisions() {
        // Projectile-enemy
        this.projectiles.forEach(proj => {
            this.enemies.forEach(enemy => {
                const dx = proj.x - enemy.x;
                const dy = proj.y - enemy.y;
                if (Math.sqrt(dx*dx + dy*dy) < enemy.size + proj.size) {
                    const damage = proj.damage * (this.player.damageMultiplier || 1);
                    enemy.health -= damage;
                    proj.life = 0;
                    this.spawnParticles(enemy.x, enemy.y, '#ff6b00', 5);
                    if (enemy.health <= 0) {
                        this.score += 10;
                        this.spawnParticles(enemy.x, enemy.y, '#ffff00', 10);
                        // 10% chance to drop a power-up on kill
                        if (Math.random() < 0.1) {
                            const types = Object.keys(powerUpTypes);
                            const randomType = types[Math.floor(Math.random() * types.length)];
                            this.spawnPowerUp(enemy.x, enemy.y, randomType);
                        }
                    }
                }
            });
        });
        
        // Player-enemy
        this.enemies.forEach(enemy => {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            if (Math.sqrt(dx*dx + dy*dy) < this.player.size + enemy.size) {
                if (this.player.shield && this.player.shield > 0) {
                    this.player.shield -= 20;
                    if (this.player.shield < 0) {
                        this.player.health += this.player.shield;
                        this.player.shield = 0;
                    }
                } else {
                    this.player.health -= 20;
                }
                this.spawnParticles(this.player.x, this.player.y, '#ff3333', 3);
                enemy.health = 0;
                if (this.player.health <= 0) {
                    console.log('Game Over! Score:', this.score);
                    this.player.health = 100;
                    this.score = 0;
                }
            }
        });

        // Player-powerUp
        const player = this.player;
        this.powerUps = this.powerUps.filter(powerUp => {
            const dx = player.x - powerUp.x;
            const dy = player.y - powerUp.y;
            if (Math.sqrt(dx*dx + dy*dy) < player.size + powerUp.size) {
                this.applyPowerUp(powerUp);
                this.spawnParticles(powerUp.x, powerUp.y, powerUp.color, 8);
                return false; // Remove powerUp
            }
            return true; // Keep powerUp
        });
    }
    
    spawnParticles(x, y, color, count = 5) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 100;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color, life: 0.5, maxLife: 0.5, alpha: 1, size: 2
            });
        }
    }
    
    render() {
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;

        // Power-ups
        this.powerUps.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = 12;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 12px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(p.symbol, p.x, p.y + 4);
        });

        // Projectiles
        this.projectiles.forEach(proj => {
            this.ctx.shadowColor = proj.color;
            this.ctx.shadowBlur = 8;
            this.ctx.fillStyle = proj.color;

            if (proj.isRailgun) {
                // Draw a thin rectangle for the railgun slug, oriented to its velocity
                const angle = Math.atan2(proj.vy, proj.vx);
                this.ctx.save(); // Save context state
                this.ctx.translate(proj.x, proj.y);
                this.ctx.rotate(angle);
                this.ctx.fillRect(-proj.size * 2, -proj.size / 2, proj.size * 4, proj.size);
                this.ctx.restore(); // Restore context state
            } else {
                this.ctx.beginPath();
                this.ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.shadowBlur = 0;
        });
        
        // Enemies
        this.enemies.forEach(enemy => {
            this.ctx.fillStyle = enemy.color;
            this.ctx.shadowColor = enemy.color;
            this.ctx.shadowBlur = 4;
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
        
        // Player
        this.ctx.fillStyle = this.player.color;
        this.ctx.shadowColor = this.player.color;
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Health & Shield bar UI
        const barWidth = 150;
        const barHeight = 10;
        const healthPercent = Math.max(0, this.player.health / 100);
        const shieldPercent = Math.max(0, this.player.shield / 50); // Assuming shield max is 50
        const xPos = this.canvas.width - barWidth - 20;
        const yPos = 20;
        
        // Health Bar
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(xPos, yPos, barWidth, barHeight);
        this.ctx.fillStyle = healthPercent > 0.5 ? '#00ff88' : healthPercent > 0.25 ? '#ffaa00' : '#ff3333';
        this.ctx.fillRect(xPos, yPos, barWidth * healthPercent, barHeight);
        
        // Shield Bar (above health)
        if (this.player.shield > 0) {
            this.ctx.fillStyle = '#00aaff';
            this.ctx.fillRect(xPos, yPos - 12, barWidth * shieldPercent, 5);
        }

        this.renderPowerUpUI();
    }

    renderPowerUpUI() {
        const container = document.getElementById('activePowerUpsContainer');
        container.innerHTML = '';
        
        this.activePowerUps.forEach(p => {
            const icon = document.createElement('div');
            icon.className = 'powerup-icon';
            icon.style.background = p.color;
            icon.textContent = p.symbol;
            container.appendChild(icon);
        });
    }
    
    gameLoop() {
        const now = performance.now();
        const dt = (now - (this.lastTime || now)) / 1000;
        this.lastTime = now;
        
        this.update(dt);
        this.render();
        this.updateStats();
        
        this.frameCount++;
        requestAnimationFrame(() => this.gameLoop());
    }
    
    updateStats() {
        const now = performance.now();
        if (now - this.lastFpsUpdate > 1000) {
            document.getElementById('fps').textContent = Math.round(this.frameCount * 1000 / (now - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }
        document.getElementById('objectCount').textContent = this.enemies.length + this.projectiles.length + this.particles.length + this.powerUps.length + this.activePowerUps.length + 1;
        document.getElementById('score').textContent = this.score;
    }
}