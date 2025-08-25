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
                engine.spawnParticles(enemy.x, enemy.y, { color: '#ffff00', count: 10 }); // Standard death particles
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
            delete player.shieldRegenDelay;
            delete player.lastShieldDamageTime;
            delete player.maxShield;
        }
    },
    freeze: {
        color: '#00aaff', // Blue color for ice/freeze
        symbol: '❄', // Snowflake symbol
        duration: 5, // Freeze enemies for 5 seconds
        apply: function(player, engine) {
            engine.enemies.forEach(enemy => {
                // Store original state before freezing
                enemy._originalVx = enemy.vx;
                enemy._originalVy = enemy.vy;
                enemy._originalSpeed = enemy.speed;
                enemy._originalColor = enemy.color;
                enemy._originalSpriteColors = enemy.spriteColors ? [...enemy.spriteColors] : null;

                // Apply frozen state
                enemy.vx = 0;
                enemy.vy = 0;
                enemy.speed = 0;
                enemy.isFrozen = true; // Flag to indicate enemy is frozen
                enemy.color = '#00aaff'; // Change color to blue
                enemy.spriteColors = ['#00aaff', '#00ffff']; // Blue/cyan for frozen sprite
            });
            if (engine.playSpecialSound) engine.playSpecialSound(); // Play a sound when activated
        },
        remove: function(player, engine) {
            engine.enemies.forEach(enemy => {
                // Restore original state if it was frozen by this effect
                if (enemy.isFrozen && enemy._originalVx !== undefined) {
                    enemy.vx = enemy._originalVx;
                    enemy.vy = enemy._originalVy;
                    enemy.speed = enemy._originalSpeed;
                    enemy.color = enemy._originalColor;
                    enemy.spriteColors = enemy._originalSpriteColors;
                    delete enemy.isFrozen; // Remove the frozen flag
                    // Clean up temporary properties
                    delete enemy._originalVx; delete enemy._originalVy; delete enemy._originalSpeed;
                    delete enemy._originalColor; delete enemy._originalSpriteColors;
                }
            });
            // No specific sound for unfreeze, or you could add a subtle one
        }
    }
};