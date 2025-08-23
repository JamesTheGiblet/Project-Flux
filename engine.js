class SovereignEngine {
    constructor() {
        // Initialize canvas and context
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

		// --- GAME AUDIO ---
        
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
        this.initializeAudio();

		// --- GAME STATE ---

        this.gameTime = 0;
        this.score = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.enemySpeed = 80;
        this.lastDifficulty = 0;
        
        this.weaponShoot = this.defaultShoot;
        // --- COMBO STATE ---
        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboMaxTime = 2.5; // seconds

        // --- PRNG ---
        this.seed = Date.now(); // Default seed to current time
        this.currentSeed = this.seed; // Internal state for PRNG
        
        this.bossAIUpdate = () => {}; // Will be set by applyMod on load
        this.rulesUpdate = () => {}; // Will be set by applyMod on load
        
        this.spriteSets = [
            // Level 1 (Default Red/Purple)
            {
                chaser: {
                    sprite: [[0,1,0],[1,1,1],[0,1,0]],
                    spriteColors: ['#ff3333']
                },
                shooter: {
                    sprite: [[0,1,0],[1,2,1],[1,1,1]],
                    spriteColors: ['#ff8800', '#ffff00']
                },
                boss: {
                    sprite: [[0,1,1,0,1,1,0],[1,2,2,1,2,2,1],[1,2,2,2,2,2,1],[1,1,2,2,2,1,1],[0,1,1,1,1,1,0],[0,0,1,0,1,0,0]],
                    spriteColors: ['#ff00ff', '#ff99ff']
                }
            },
            // Level 2 (Blue/Cyan)
            {
                chaser: {
                    sprite: [[1,0,1],[0,1,0],[1,0,1]],
                    spriteColors: ['#00aaff']
                },
                shooter: {
                    sprite: [[1,1,0],[1,2,1],[1,1,0]],
                    spriteColors: ['#00ffff', '#ffffff']
                },
                boss: {
                    sprite: [[0,1,1,1,0],[1,2,2,2,1],[1,2,1,2,1],[1,2,2,2,1],[0,1,0,1,0]],
                    spriteColors: ['#0088ff', '#aaddff']
                }
            },
            // Level 3 (Green/Yellow)
            {
                chaser: {
                    sprite: [[1,1,1],[1,0,1],[1,1,1]],
                    spriteColors: ['#00ff00']
                },
                shooter: {
                    sprite: [[0,2,0],[1,2,1],[0,2,0]],
                    spriteColors: ['#ffff00', '#ffffff']
                },
                boss: {
                    sprite: [[0,1,0,1,0],[1,1,1,1,1],[0,1,2,1,0],[1,1,1,1,1],[0,1,0,1,0]],
                    spriteColors: ['#88ff00', '#ffff88']
                }
            }
        ];

        this.setupEvents();
        this.gameLoop();
    }

    initializeAudio() {
        try {
            // Ensure any existing context is closed before creating a new one.
            if (this.audioContext && this.audioContext.state !== 'closed') {
                this.audioContext.close();
            }
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn("Web Audio API is not supported in this browser. Audio disabled.");
            this.audioContext = null; // Disable audio
        }
    }
    
    setSeed(seed) {
        this.seed = seed;
        this.currentSeed = seed;
    }

    random() {
        this.currentSeed = (this.currentSeed * 9301 + 49297) % 233280;
        return this.currentSeed / 233280;
    }

    shutdown() {
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
            console.log("AudioContext shut down.");
        }
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
		this.playShootSound();
        engine.projectiles.push({
            x: player.x, y: player.y,
            vx: (dx/dist) * 300,
            vy: (dy/dist) * 300,
            size: 3, color: '#00ff88', life: 2, damage: 25
        });
    }

    playShootSound() {
        if (!this.audioContext || this.audioContext.state === 'closed') return;
        const time = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'square';
        gain.gain.setValueAtTime(0.1, time);
        osc.frequency.setValueAtTime(800, time);

        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        osc.frequency.exponentialRampToValueAtTime(200, time + 0.1);

        osc.start(time);
        osc.stop(time + 0.1);
    }

    playExplosionSound() {
        if (!this.audioContext || this.audioContext.state === 'closed') return;
        const time = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
    
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.2, time);
        osc.frequency.setValueAtTime(160, time);
    
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.4);
    
        osc.start(time);
        osc.stop(time + 0.4);
    }

    playPowerupSound() {
        if (!this.audioContext || this.audioContext.state === 'closed') return;
        const time = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
    
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, time);
        osc.frequency.setValueAtTime(440, time);
        osc.frequency.exponentialRampToValueAtTime(880, time + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    
        osc.start(time);
        osc.stop(time + 0.2);
    }
    playShooterSound() {
        if (!this.audioContext || this.audioContext.state === 'closed') return;
        const time = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.1, time);
        osc.frequency.setValueAtTime(600, time);

        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
        osc.frequency.exponentialRampToValueAtTime(100, time + 0.2);

        osc.start(time);
        osc.stop(time + 0.2);
    }

    playPlayerHitSound() {
        if (!this.audioContext || this.audioContext.state === 'closed') return;
        const time = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
    
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.2, time);
        osc.frequency.setValueAtTime(300, time);
    
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
        osc.frequency.exponentialRampToValueAtTime(100, time + 0.2);
    
        osc.start(time);
        osc.stop(time + 0.2);
    }

    playPhaseTransitionSound() {
        if (!this.audioContext || this.audioContext.state === 'closed') return;
        const time = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
    
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, time);
        osc.frequency.setValueAtTime(100, time);
        osc.frequency.exponentialRampToValueAtTime(500, time + 0.3);
    
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
    
        osc.start(time);
        osc.stop(time + 0.4);
    }

    playWaveClearSound() {
        if (!this.audioContext || this.audioContext.state === 'closed') return;
        const time = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
    
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.2, time);
        osc.frequency.setValueAtTime(660, time);
        osc.frequency.setValueAtTime(880, time + 0.1);
    
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
    
        osc.start(time);
        osc.stop(time + 0.3);
    }

    playLevelCompleteSound() {
        if (!this.audioContext || this.audioContext.state === 'closed') return;
        const time = this.audioContext.currentTime;
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioContext.destination);
    
        osc1.type = 'sine';
        osc2.type = 'sine';
        gain.gain.setValueAtTime(0.3, time);
        osc1.frequency.setValueAtTime(523.25, time); // C5
        osc2.frequency.setValueAtTime(659.25, time); // E5
        osc1.frequency.setValueAtTime(659.25, time + 0.15); // E5
        osc2.frequency.setValueAtTime(783.99, time + 0.15); // G5
        osc1.frequency.setValueAtTime(783.99, time + 0.3); // G5
        osc2.frequency.setValueAtTime(1046.50, time + 0.3); // C6
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
        osc1.start(time);
        osc1.stop(time + 0.6);
        osc2.start(time);
        osc2.stop(time + 0.6);
    }

    playDeathSound() {
        if (!this.audioContext || this.audioContext.state === 'closed') return;
        const time = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
    
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.2, time);
        osc.frequency.setValueAtTime(200, time);
    
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
        osc.frequency.exponentialRampToValueAtTime(50, time + 0.8);
    
        osc.start(time);
        osc.stop(time + 0.8);
    }

    getEnemySpawnPosition() {
        const edge = Math.floor(this.random() * 4);
        let x, y;
        const offset = 30;
        switch(edge) {
            case 0: x = this.random() * this.canvas.width; y = -offset; break;
            case 1: x = this.canvas.width + offset; y = this.random() * this.canvas.height; break;
            case 2: x = this.random() * this.canvas.width; y = this.canvas.height + offset; break;
            case 3: x = -offset; y = this.random() * this.canvas.height; break;
        }
        return { x, y };
    }

    spawnEnemy(options = {}) {
        const spawnPos = this.getEnemySpawnPosition();
        const levelSpriteSet = this.spriteSets[(this.level - 1) % this.spriteSets.length]; // Use level-based sprite set
        const enemyType = options.ai_type || 'chaser';
        const spriteData = levelSpriteSet[enemyType] || levelSpriteSet.chaser;

        const defaults = {
            ...spawnPos, vx: 0, vy: 0,
            health: 30, size: 6, color: '#ff3333',
            ai_type: 'chase',
            ...spriteData
        };
        this.enemies.push({ ...defaults, ...options });
    }

    spawnBoss(options = {}) {
        const spawnPos = this.getEnemySpawnPosition();
        const levelSpriteSet = this.spriteSets[(this.level - 1) % this.spriteSets.length]; // Boss sprite set based on level
        const spriteData = levelSpriteSet.boss;
        const defaults = {
            ...spawnPos, vx: 0, vy: 0,
            health: 500, size: 25, color: '#ff00ff',
            isBoss: true, // Special flag for tracking
            ...spriteData
        };
        const boss = { ...defaults, ...options };
        // Boss AI patterns are now defined in the rules preset
        boss.currentPattern = boss.patterns ? boss.patterns[0] : 'chase';
        boss.patternTimer = 10;
        boss.attackTimer = 0;
        boss.ai_type = 'boss_pattern';
        boss.isBoss = true;

        // Boss health and score should scale with level
        boss.health = (defaults.health + this.level * 150);
        boss.maxHealth = boss.health;
        boss.scoreValue = 100 + this.level * 50;
        this.enemies.push(boss);
    }

    /**
     * Spawns a power-up item on the map.
     * @param {number} x - The x-coordinate.
     * @param {number} y - The y-coordinate.
     * @param {string} type - The key of the power-up from powerUpTypes.
     */
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

    spawnRandomPowerUp(x, y) {
        // This is a helper function to spawn a random power-up from the available types.
        // It was missing, causing a crash on enemy death.
        const types = Object.keys(powerUpTypes); // powerUpTypes is global
        if (types.length === 0) return; // No power-ups defined
        const randomType = types[Math.floor(this.random() * types.length)];
        this.spawnPowerUp(x, y, randomType);
    }

    /**
     * Applies the effect of a collected power-up to the player.
     * @param {object} powerUp - The power-up object that was collected.
     */
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
        
        // Thruster effect: spawn particles if player is moving
        if (dx !== 0 || dy !== 0) {
            const thrusterAngle = Math.atan2(this.player.lastMoveDir.y, this.player.lastMoveDir.x) + Math.PI;
            this.spawnParticles(this.player.x, this.player.y, { // Use this.random() for color selection
                count: 1, // One particle per frame for continuous stream
                color: ['#ffaa00', '#ff5500', '#ff0000'][Math.floor(this.random() * 3)], // Random orange/red
                speed: { min: 20, max: 50 }, // Low speed
                life: { min: 0.1, max: 0.3 }, // Short life
                size: { min: 1, max: 3 },
                baseAngle: thrusterAngle,
                angleSpread: Math.PI / 6 // 30-degree cone
            });
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

        // Shield Regeneration
        if (this.player.shieldRegenRate && this.player.shield < (this.player.maxShield || 50)) {
            if (this.gameTime > (this.player.lastShieldDamageTime || 0) + this.player.shieldRegenDelay) {
                this.player.shield += this.player.shieldRegenRate * dt;
                if (this.player.shield > (this.player.maxShield || 50)) {
                    this.player.shield = this.player.maxShield || 50;
                }
            }
        }

        // Enemy AI
        this.enemies.forEach(enemy => {
            if (enemy.isBoss) {
                this.bossAIUpdate(enemy, dt, this); // Call the modded boss AI
            } else if (enemy.ai_type === 'shooter') {
                const dx = this.player.x - enemy.x;
                const dy = this.player.y - enemy.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                // Try to stay at a distance
                if (dist > 250) {
                    enemy.vx = (dx/dist) * this.enemySpeed * 0.7;
                    enemy.vy = (dy/dist) * this.enemySpeed * 0.7;
                } else {
                    enemy.vx *= 0.9; // Slow down when in range
                    enemy.vy *= 0.9;
                }
                // Fire at the player
                enemy.attackTimer = (enemy.attackTimer || 2) - dt;
                if (enemy.attackTimer <= 0) {
                    this.projectiles.push({
                        from: 'enemy', x: enemy.x, y: enemy.y,
                        vx: (dx/dist) * 250, vy: (dy/dist) * 250,
                        size: 4, color: '#ff8800', life: 3, damage: 10
                    });
                    enemy.attackTimer = 2.5 + this.random(); // Reset timer
                    this.playShooterSound(); // This sound is not random, so no change
                }
            } else if (enemy.ai_type === 'chase') {
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

            // Keep all enemies within the canvas bounds
            enemy.x = Math.max(enemy.size, Math.min(this.canvas.width - enemy.size, enemy.x));
            enemy.y = Math.max(enemy.size, Math.min(this.canvas.height - enemy.size, enemy.y));
        });
        
        // Projectiles
        this.projectiles.forEach(proj => {
            proj.x += proj.vx * dt;
            proj.y += proj.vy * dt;
            proj.life -= dt;

            // Check for wall collision to create sparks
            let hitWall = false;
            let sparkAngle = 0;
            if (proj.x <= proj.size) {
                hitWall = true; sparkAngle = 0; // Sparks to the right
            } else if (proj.x >= this.canvas.width - proj.size) {
                hitWall = true; sparkAngle = Math.PI; // Sparks to the left
            }
            if (proj.y <= proj.size) {
                hitWall = true; sparkAngle = Math.PI / 2; // Sparks down
            } else if (proj.y >= this.canvas.height - proj.size) {
                hitWall = true; sparkAngle = -Math.PI / 2; // Sparks up
            }

            if (hitWall) {
                proj.life = 0; // Kill projectile
                this.spawnParticles(proj.x, proj.y, {
                    count: 3, color: '#ffcc00',
                    speed: { min: 30, max: 100 }, life: { min: 0.2, max: 0.4 }, size: { min: 1, max: 2 }, // No random here
                    baseAngle: sparkAngle, angleSpread: Math.PI / 2 // 90 degree spread
                });
            }
        });
        
        // Particles
        this.particles.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.gravity) {
                p.vy += p.gravity * dt;
            }
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
            if (proj.from === 'enemy') {
                // Enemy projectile vs Player
                const dx = this.player.x - proj.x;
                const dy = this.player.y - proj.y;
                if (Math.sqrt(dx*dx + dy*dy) < this.player.size + proj.size) {
                    const damage = proj.damage || 10;
                    if (this.player.shield && this.player.shield > 0) {
                        this.player.shield -= damage;
                        if (this.player.shieldRegenRate) { 
                            this.player.lastShieldDamageTime = this.gameTime; 
                        }
                        if (this.player.shield < 0) { this.player.health += this.player.shield; this.player.shield = 0; }
                    } else {
                        this.player.health -= damage;
                    }
                    this.playPlayerHitSound();
                    this.spawnParticles(this.player.x, this.player.y, { 
                        count: 5, 
                        color: '#ffdddd',
                        speed: {min: 50, max: 150}, 
                        life: {min: 0.2, max: 0.4},
                        size: {min: 1, max: 2}
                    });
                    proj.life = 0;
                }
            } else { // Player projectile
                this.enemies.forEach(enemy => {
                    const dx = proj.x - enemy.x;
                    const dy = proj.y - enemy.y;
                    if (Math.sqrt(dx*dx + dy*dy) < enemy.size + proj.size) {
                        const damage = proj.damage * (this.player.damageMultiplier || 1);
                        enemy.health -= damage;
                        proj.life = 0;
                        if (proj.hitParticleOptions) {
                            this.spawnParticles(enemy.x, enemy.y, proj.hitParticleOptions);
                        } else {
                            this.spawnParticles(enemy.x, enemy.y, { color: '#ff6b00', count: 5, speed: {min: 20, max: 80}, life: {min: 0.2, max: 0.5} });
                        }
                        if (enemy.health <= 0) {
                            this.score += enemy.isBoss ? (enemy.scoreValue || 250) : 10;
                            const explosionSize = Math.max(3, enemy.size);
                            if (enemy.isBoss) {
                                this.playExplosionSound();
                                // Big boss explosion
                                this.spawnParticles(enemy.x, enemy.y, { count: 200, color: '#ff8800', speed: {min: 50, max: 500}, life: {min: 0.8, max: 2.0} });
                                this.spawnParticles(enemy.x, enemy.y, { count: 100, color: '#ffff00', speed: {min: 50, max: 400}, life: {min: 0.5, max: 1.5} });
                            } else {
                                // Standard enemy explosion scaled by size
                                this.spawnParticles(enemy.x, enemy.y, { 
                                    count: Math.floor(explosionSize * 2), 
                                    color: '#ffff00',
                                    speed: {min: 20, max: 20 + explosionSize * 15},
                                    life: {min: 0.3, max: 0.3 + explosionSize * 0.05}
                                });
                            }
                            // Handle combo logic on enemy defeat
                            this.comboTimer = this.comboMaxTime;
                            this.comboCount++;
                            if (this.comboCount > 1) {
                                this.score += (this.comboCount - 1) * 5; // Add combo bonus score
                            }
                            if (this.random() < 0.1) { this.playExplosionSound(); this.spawnRandomPowerUp(enemy.x, enemy.y); }
                        }
                    }
                });
            }
        });
        
        // Player-enemy
        this.enemies.forEach(enemy => {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            if (Math.sqrt(dx*dx + dy*dy) < this.player.size + enemy.size) {
                if (this.player.shield && this.player.shield > 0) {
                    this.player.shield -= 20;
                    if (this.player.shieldRegenRate) { 
                        this.player.lastShieldDamageTime = this.gameTime; 
                    }
                    if (this.player.shield < 0) {
                        this.player.health += this.player.shield;
                        this.player.shield = 0;
                    }
                } else {
                    this.player.health -= 20;
                }
                this.playPlayerHitSound();
                this.spawnParticles(this.player.x, this.player.y, { 
                    count: 10, 
                    color: '#ffdddd', 
                    speed: {min: 50, max: 150}, 
                    life: {min: 0.2, max: 0.4},
                    size: {min: 1, max: 2}
                });
                enemy.health = 0;
                // Game over and life-loss logic is now handled by the patch in sovereign-engine.html
            }
        });

        // Player-powerUp
        const player = this.player;
        this.powerUps = this.powerUps.filter(powerUp => {
            const dx = player.x - powerUp.x;
            const dy = player.y - powerUp.y;
            if (Math.sqrt(dx*dx + dy*dy) < player.size + powerUp.size) {
                this.applyPowerUp(powerUp);
                this.playPowerupSound();
                this.spawnParticles(powerUp.x, powerUp.y, { color: powerUp.color, count: 12, speed: {min: 20, max: 100} });
                return false; // Remove powerUp
            }
            return true; // Keep powerUp
        });
    }

    spawnParticles(x, y, options = {}) {
        const defaults = {
            count: 10,
            color: '#ffffff',
            speed: { min: 50, max: 150 },
            life: { min: 0.3, max: 0.8 },
            size: { min: 1, max: 3 },
            gravity: 0, // vertical acceleration
            baseAngle: 0,
            angleSpread: Math.PI * 2,
        };
        const config = { ...defaults, ...options };

        for (let i = 0; i < config.count; i++) {
            const angle = config.baseAngle + (this.random() - 0.5) * config.angleSpread;
            const speed = config.speed.min + this.random() * (config.speed.max - config.speed.min);
            const life = config.life.min + this.random() * (config.life.max - config.life.min);
            const size = config.size.min + this.random() * (config.size.max - config.size.min);

            this.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, color: config.color, life: life, maxLife: life, alpha: 1, size: size, gravity: config.gravity });
        }
    }
    
    /**
     * Draws an entity using a 2D array of pixel data.
     * @param {object} entity - The entity to draw (e.g., player, enemy).
     * @returns {boolean} - True if a sprite was drawn, false otherwise.
     */
    drawSprite(entity) {
         if (!entity.sprite || !entity.sprite.length || !entity.sprite[0].length) return false;
 
         const sprite = entity.sprite;
         const spriteHeight = sprite.length;
         const spriteWidth = sprite[0].length;
 
         const maxDim = Math.max(spriteWidth, spriteHeight);
         const pixelSize = (entity.size * 2) / maxDim;
 
         const totalWidth = spriteWidth * pixelSize;
         const totalHeight = spriteHeight * pixelSize;
 
         this.ctx.save();
         this.ctx.translate(entity.x, entity.y);
 
         // Determine rotation angle. Sprites are designed facing "up" (negative y).
         // atan2(y, x) gives angle from positive x-axis. We add PI/2 (90 deg) to align "up" with 0 angle.
         let angle = 0;
         if (entity === this.player) {
             angle = Math.atan2(this.player.lastMoveDir.y, this.player.lastMoveDir.x) + Math.PI / 2;
         } else if (entity.vx !== 0 || entity.vy !== 0) { // For other moving entities
             angle = Math.atan2(entity.vy, entity.vx) + Math.PI / 2;
         }
         this.ctx.rotate(angle);
 
         const startX = -totalWidth / 2;
         const startY = -totalHeight / 2;
 
         for (let y = 0; y < spriteHeight; y++) {
             for (let x = 0; x < spriteWidth; x++) {
                 const colorIndex = sprite[y][x];
                 if (colorIndex > 0) { // 0 is transparent
                     const color = entity.spriteColors ? (entity.spriteColors[colorIndex - 1] || entity.color) : entity.color;
                     this.ctx.fillStyle = color;
                     this.ctx.fillRect(Math.round(startX + x * pixelSize), Math.round(startY + y * pixelSize), pixelSize, pixelSize);
                 }
             }
         }
 
         this.ctx.restore();
         return true;
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
            this.ctx.shadowColor = enemy.color;
            this.ctx.shadowBlur = 4;

            const drawn = this.drawSprite(enemy);
            if (!drawn) {
                // Fallback to circle if no sprite
                this.ctx.fillStyle = enemy.color;
                this.ctx.beginPath();
                this.ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.shadowBlur = 0;
        });
        
        // Player
        this.ctx.shadowColor = this.player.color;
        this.ctx.shadowBlur = 8;
        const playerDrawn = this.drawSprite(this.player);
        if (!playerDrawn) {
            this.ctx.fillStyle = this.player.color;
            this.ctx.beginPath();
            this.ctx.arc(this.player.x, this.player.y, this.player.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.shadowBlur = 0;
        
        // Boss Health Bar
        const boss = this.enemies.find(e => e.isBoss);
        if (boss) {
            const barWidth = this.canvas.width * 0.6;
            const barHeight = 20;
            const xPos = (this.canvas.width - barWidth) / 2;
            const yPos = 20;
            const healthPercent = Math.max(0, boss.health / (boss.maxHealth || 1));

            // Bar background
            this.ctx.fillStyle = 'rgba(50, 0, 0, 0.7)';
            this.ctx.fillRect(xPos, yPos, barWidth, barHeight);

            // Bar foreground
            this.ctx.fillStyle = '#ff0033';
            this.ctx.fillRect(xPos, yPos, barWidth * healthPercent, barHeight);

            // Border and Text
            this.ctx.strokeStyle = '#ff8888';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(xPos, yPos, barWidth, barHeight);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 14px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('B O S S', this.canvas.width / 2, yPos + 15);
        }

        // Health & Shield bar UI
        const barWidth = 150;
        const barHeight = 10;
        const healthPercent = Math.max(0, this.player.health / (this.player.maxHealth || 100));
        const shieldPercent = Math.max(0, this.player.shield / (this.player.maxShield || 50));
        const xPos = this.canvas.width - barWidth - 20;
        const yPos = 50;
        
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
            icon.title = `${p.type} - ${p.timeRemaining > 0 ? p.timeRemaining.toFixed(1) + 's left' : 'Active'}`;

            // Only add a timer bar for power-ups with a duration
            if (p.duration > 0) {
                const timer = document.createElement('div');
                timer.className = 'powerup-timer';
                
                const percentRemaining = (p.timeRemaining / p.duration) * 100;
                timer.style.width = `${percentRemaining}%`;
                
                icon.appendChild(timer);
            }

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
