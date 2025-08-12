function update(engine, dt) {
    // Horde mode: spawn a weak enemy every 0.5 seconds
    engine.spawnTimer = (engine.spawnTimer || 0) + dt;
    if (engine.spawnTimer > 0.5) {
        engine.spawnTimer = 0;
        engine.spawnEnemy({
            health: 10,
            size: 7,
            color: '#ff8888',
            ai_type: 'chase'
        });
    }
}
