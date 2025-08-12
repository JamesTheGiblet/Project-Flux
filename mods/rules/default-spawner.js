function update(engine, dt) {
    // Standard spawner: one enemy every 3 seconds
    engine.spawnTimer = (engine.spawnTimer || 0) + dt;
    if (engine.spawnTimer > 3) {
        engine.spawnTimer = 0;
        engine.spawnEnemy({
            health: 30,
            ai_type: 'chase'
        });
    }
}
