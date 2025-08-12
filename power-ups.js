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
    }
};