const powerUpTypes = {
    shield: {
        color: '#00aaff',
        symbol: 'S',
        duration: 0, // Shields don't expire with time, they absorb damage.
        apply: (player, engine) => {
            player.shield = (player.shield || 0) + 50; // Add 50 shield points
        },
        // No timed removal for shield
        remove: (player, engine) => {}
    },
    speedBoost: {
        color: '#ffff00',
        symbol: '⚡',
        duration: 8, // 8 seconds
        apply: (player, engine) => {
            player.speed = player.baseSpeed * 1.5; // 50% speed boost
        },
        remove: (player, engine) => {
            player.speed = player.baseSpeed;
        }
    },
    quadDamage: {
        color: '#ff00ff',
        symbol: '4x',
        duration: 10, // 10 seconds
        apply: (player, engine) => {
            player.damageMultiplier = 4;
        },
        remove: (player, engine) => {
            player.damageMultiplier = 1;
        }
    },
    healthPack: {
        color: '#00ff00',
        symbol: '✚',
        duration: 0, // Instant effect
        apply: (player, engine) => {
            player.health += 50;
            if (player.health > (player.maxHealth || 100)) {
                player.health = player.maxHealth || 100;
            }
        },
        remove: (player, engine) => {}
    },
    nuke: {
        color: '#ffffff',
        symbol: '☢',
        duration: 0, // Instant effect
        apply: (player, engine) => {
            engine.enemies.forEach(enemy => {
                engine.score += 10; // Grant score for each enemy killed
                engine.spawnParticles(enemy.x, enemy.y, '#ffff00', 10); // Standard death particles
                enemy.health = 0; // Mark for removal
            });
        },
        remove: (player, engine) => {}
    },
    regenShield: {
        color: '#44ccff',
        symbol: 'R',
        duration: 20, // The effect lasts for 20 seconds
        apply: (player, engine) => {
            player.maxShield = 75;
            if (!player.hasOwnProperty('shield') || player.shield < player.maxShield) {
                player.shield = player.maxShield;
            }
            player.shieldRegenRate = 15; // points per second
            player.shieldRegenDelay = 3; // seconds after last hit
            player.lastShieldDamageTime = 0;
        },
        remove: (player, engine) => {
            delete player.shieldRegenRate;
        }
    }
};