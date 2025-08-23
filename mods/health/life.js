const lifePresets = {
    'points-based': `function lifeRuleUpdate(engine, dt) {
    // Gain a life every 1000 points.
    if (engine.score === 0) engine.lastLifeScore = 0;
    if (!engine.hasOwnProperty('lastLifeScore')) engine.lastLifeScore = 0;

    if (engine.score >= engine.lastLifeScore + 1000) {
        if (engine.player.lives < (engine.player.maxLives || 5)) {
            engine.player.lives++;
        }
        engine.lastLifeScore += 1000;
    }
}`
};