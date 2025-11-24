export const UIElements = {
    scoreEl: document.getElementById('score'),
    gameOverEl: document.getElementById('game-over'),
    restartBtn: document.getElementById('restart-btn'),
    pauseMenuEl: document.getElementById('pause-menu'),
    resumeBtn: document.getElementById('resume-btn'),
    livesEl: document.getElementById('lives'),
    healthBarEl: document.getElementById('health-bar'),
    uiContainer: document.getElementById('ui-container'),
    highScoreMainEl: document.getElementById('high-score-main'),
    highScoreOverEl: document.getElementById('high-score-over'),
    introContainer: document.getElementById('intro-container'),
    introVideo: document.getElementById('intro-video'),
    mainMenu: document.getElementById('main-menu'),
    startBtn: document.getElementById('start-btn'),
    loadBtn: document.getElementById('load-btn'),
    saveBtn: document.getElementById('save-btn'),
    howToBtn: document.getElementById('howto-btn'),
    aboutBtn: document.getElementById('about-btn'),
    creditsBtn: document.getElementById('credits-btn'),
    exitBtn: document.getElementById('exit-btn'),
    aboutScreen: document.getElementById('about-screen'),
    creditsScreen: document.getElementById('credits-screen'),
    howToScreen: document.getElementById('howto-screen'),
    backBtns: document.querySelectorAll('.back-btn'),
    levelEl: document.getElementById('level'),
    quitBtn: document.getElementById('quit-btn'),
    powerupsContainer: document.getElementById('powerups-container'),
    skipIntroBtn: document.getElementById('skip-intro-btn'),
    mobileControls: document.getElementById('mobile-controls'),
    shootButton: document.getElementById('shoot-button')
};

export function updateScoreUI(score) {
    if (UIElements.scoreEl) UIElements.scoreEl.innerText = `Score: ${score}`;
}

export function updateLevelUI(level) {
    if (UIElements.levelEl) UIElements.levelEl.innerText = `Level: ${level}`;
}

export function updateLivesUI(lives) {
    if (!UIElements.livesEl) return;
    UIElements.livesEl.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const lifeIcon = document.createElement('div');
        lifeIcon.className = 'life-icon';
        UIElements.livesEl.appendChild(lifeIcon);
    }
}

export function updateHealthUI(health) {
    if (!UIElements.healthBarEl) return;
    UIElements.healthBarEl.style.width = `${health}%`;
}

export function refreshHighScoreUI(highScore) {
    if (UIElements.highScoreMainEl) UIElements.highScoreMainEl.innerText = `High Score: ${highScore}`;
    if (UIElements.highScoreOverEl) UIElements.highScoreOverEl.innerText = `High Score: ${highScore}`;
}

export function showLevelUpMessage(level) {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '50%';
    notification.style.left = '50%';
    notification.style.transform = 'translate(-50%, -50%)';
    notification.style.fontSize = '48px';
    notification.style.color = '#00ffcc';
    notification.style.fontFamily = 'Courier New, monospace';
    notification.style.fontWeight = 'bold';
    notification.style.textShadow = '0 0 20px #00ffcc';
    notification.style.zIndex = '1000';
    notification.style.pointerEvents = 'none';
    notification.innerText = `LEVEL ${level}!`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

export function showSaveConfirmation() {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '50%';
    notification.style.left = '50%';
    notification.style.transform = 'translate(-50%, -50%)';
    notification.style.fontSize = '32px';
    notification.style.color = '#00ff00';
    notification.style.fontFamily = 'Courier New, monospace';
    notification.style.fontWeight = 'bold';
    notification.style.textShadow = '0 0 20px #00ff00';
    notification.style.zIndex = '1000';
    notification.style.pointerEvents = 'none';
    notification.innerText = 'GAME SAVED!';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 1500);
}

export function updatePowerUpUI(activePowerUps) {
    const container = UIElements.powerupsContainer;
    if (!container) return;

    container.innerHTML = '';

    if (activePowerUps['shield']) {
        const div = document.createElement('div');
        div.className = 'powerup-indicator';
        div.style.color = '#0088ff';
        div.style.borderColor = '#0088ff';
        div.innerText = 'SHIELD ACTIVE';
        container.appendChild(div);
    }

    if (activePowerUps['rapidFire']) {
        const div = document.createElement('div');
        div.className = 'powerup-indicator';
        div.style.color = '#ff8800';
        div.style.borderColor = '#ff8800';
        div.innerText = 'RAPID FIRE';
        container.appendChild(div);
    }

    if (activePowerUps['scoreMultiplier']) {
        const div = document.createElement('div');
        div.className = 'powerup-indicator';
        div.style.color = '#ffdd00';
        div.style.borderColor = '#ffdd00';
        div.innerText = '2X SCORE';
        container.appendChild(div);
    }
}

export function updateLoadButtonVisibility(hasSavedGame) {
    if (UIElements.loadBtn) {
        UIElements.loadBtn.style.display = hasSavedGame ? 'block' : 'none';
    }
}

export function togglePauseMenu(isPaused) {
    if (UIElements.pauseMenuEl) {
        UIElements.pauseMenuEl.style.display = isPaused ? 'block' : 'none';
    }
}

export function showGameOver(show) {
    if (UIElements.gameOverEl) {
        UIElements.gameOverEl.style.display = show ? 'block' : 'none';
    }
}
