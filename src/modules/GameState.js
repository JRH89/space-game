export const gameState = {
    score: 0,
    lives: 5,
    health: 100,
    level: 1,
    isGameOver: false,
    isPaused: true, // Start paused
    isInvincible: false,
    scoreMultiplier: 1,
    activePowerUps: {},
    gameStarted: false,
    highScore: parseInt(localStorage.getItem('highScore') || '0', 10)
};

export const LEVEL_THRESHOLDS = {
    2: 1000,
    3: 2500,
    4: 5000,
    5: 10000
};

export function resetGameState() {
    gameState.score = 0;
    gameState.lives = 5;
    gameState.health = 100;
    gameState.level = 1;
    gameState.isGameOver = false;
    gameState.isPaused = false;
    gameState.isInvincible = false;
    gameState.scoreMultiplier = 1;
    gameState.activePowerUps = {};
    // gameStarted remains true if we are just restarting
}

export function saveGame() {
    const data = {
        lives: gameState.lives,
        score: gameState.score,
        level: gameState.level,
        health: gameState.health,
        timestamp: Date.now()
    };
    localStorage.setItem('savedGame', JSON.stringify(data));
}

export function loadGame() {
    const savedData = localStorage.getItem('savedGame');
    if (!savedData) return false;

    try {
        const data = JSON.parse(savedData);
        gameState.score = data.score || 0;
        gameState.lives = data.lives || 5;
        gameState.level = data.level || 1;
        gameState.health = data.health || 100;
        return true;
    } catch (e) {
        console.error('Failed to load game:', e);
        return false;
    }
}

export function hasSavedGame() {
    return localStorage.getItem('savedGame') !== null;
}
