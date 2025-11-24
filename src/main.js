import * as THREE from 'three';
import { Starfield } from './objects/Starfield.js';
import { Ship } from './objects/Ship.js';
import { Meteors } from './objects/Meteors.js';
import { Lasers } from './objects/Lasers.js';
import { Explosions } from './objects/Explosions.js';
import { Aliens } from './objects/Aliens.js';
import { Comets } from './objects/Comets.js';
import { Planets } from './objects/Planets.js';
import { PowerUps } from './objects/PowerUps.js';

import { createScene } from './modules/SceneSetup.js';
import { gameState, resetGameState, saveGame as saveGameState, loadGame as loadGameState, hasSavedGame, LEVEL_THRESHOLDS } from './modules/GameState.js';
import * as UI from './modules/UIManager.js';
import { initInput } from './modules/InputHandler.js';
import { checkCollisions, applyGravity } from './modules/CollisionHandler.js';

// Scene setup
const { scene, camera, renderer } = createScene();

// Game Objects
const starfield = new Starfield(scene);
const meteors = new Meteors(scene);
const comets = new Comets(scene);
const planets = new Planets(scene);
const lasers = new Lasers(scene);
const explosions = new Explosions(scene);
const ship = new Ship(scene, lasers);
const aliens = new Aliens(scene, ship);
const powerUps = new PowerUps(scene);

// Initialize Input
initInput(camera, renderer, ship, {
    onPause: togglePause
});

// Game Logic Functions
function updateScore(points) {
    gameState.score += points * gameState.scoreMultiplier;
    UI.updateScoreUI(gameState.score);
    checkLevelUp();
}

function checkLevelUp() {
    for (let nextLevel in LEVEL_THRESHOLDS) {
        if (gameState.score >= LEVEL_THRESHOLDS[nextLevel] && gameState.level < nextLevel) {
            gameState.level = parseInt(nextLevel);
            UI.updateLevelUI(gameState.level);
            UI.showLevelUpMessage(gameState.level);
            break;
        }
    }
}

function loseLife() {
    gameState.lives--;
    UI.updateLivesUI(gameState.lives);

    if (gameState.lives <= 0) {
        gameOver();
    } else {
        // Respawn with invincibility
        gameState.health = 100;
        UI.updateHealthUI(gameState.health);
        ship.mesh.position.set(0, 0, 0);
        ship.mesh.visible = true;

        // Brief invincibility
        gameState.isInvincible = true;
        setTimeout(() => {
            gameState.isInvincible = false;
        }, 2000);
    }
}

function gameOver() {
    gameState.isGameOver = true;
    // Update high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('highScore', String(gameState.highScore));
    }

    UI.refreshHighScoreUI(gameState.highScore);
    UI.showGameOver(true);
}

function restartGame() {
    resetGameState();
    ship.fireRate = 400; // Reset fire rate

    UI.updateScoreUI(0);
    UI.updateLivesUI(gameState.lives);
    UI.updateHealthUI(gameState.health);
    UI.updateLevelUI(gameState.level);
    UI.updatePowerUpUI(gameState.activePowerUps);
    UI.showGameOver(false);
    UI.togglePauseMenu(false);

    // Clear scene entities
    clearSceneEntities();

    ship.mesh.position.set(0, 0, 0);
    ship.mesh.visible = true;
}

function clearSceneEntities() {
    const clearList = (manager) => {
        const list = manager[Object.keys(manager).find(k => Array.isArray(manager[k]))];
        while (list.length > 0) {
            scene.remove(list[0]);
            list.shift();
        }
    };

    clearList(meteors);
    clearList(lasers);
    clearList(aliens);
    clearList(comets);
    clearList(planets);
    clearList(powerUps);
}

function togglePause() {
    if (gameState.isGameOver || !gameState.gameStarted) return;
    gameState.isPaused = !gameState.isPaused;
    UI.togglePauseMenu(gameState.isPaused);
}

function activatePowerUp(type) {
    const now = Date.now();

    switch (type) {
        case 'extraLife':
            gameState.lives++;
            UI.updateLivesUI(gameState.lives);
            break;

        case 'health':
            gameState.health = Math.min(100, gameState.health + 25);
            UI.updateHealthUI(gameState.health);
            break;

        case 'shield':
            gameState.isInvincible = true;
            gameState.activePowerUps['shield'] = now + 5000;
            setTimeout(() => {
                if (Date.now() >= gameState.activePowerUps['shield']) {
                    gameState.isInvincible = false;
                    delete gameState.activePowerUps['shield'];
                    UI.updatePowerUpUI(gameState.activePowerUps);
                }
            }, 5000);
            break;

        case 'rapidFire':
            ship.fireRate = 100;
            gameState.activePowerUps['rapidFire'] = now + 5000;
            setTimeout(() => {
                if (Date.now() >= gameState.activePowerUps['rapidFire']) {
                    ship.fireRate = 400;
                    delete gameState.activePowerUps['rapidFire'];
                    UI.updatePowerUpUI(gameState.activePowerUps);
                }
            }, 5000);
            break;

        case 'scoreMultiplier':
            gameState.scoreMultiplier = 2;
            gameState.activePowerUps['scoreMultiplier'] = now + 10000;
            setTimeout(() => {
                if (Date.now() >= gameState.activePowerUps['scoreMultiplier']) {
                    gameState.scoreMultiplier = 1;
                    delete gameState.activePowerUps['scoreMultiplier'];
                    UI.updatePowerUpUI(gameState.activePowerUps);
                }
            }, 10000);
            break;
    }
    UI.updatePowerUpUI(gameState.activePowerUps);
}

function saveGame() {
    saveGameState();
    UI.showSaveConfirmation();
}

function loadGame() {
    if (loadGameState()) {
        startGame(true);
    }
}

function initGame() {
    // Show intro video first, hide menu and in-game UI
    if (UI.UIElements.introContainer) UI.UIElements.introContainer.style.display = 'flex';
    if (UI.UIElements.mainMenu) UI.UIElements.mainMenu.style.display = 'none';
    if (UI.UIElements.uiContainer) UI.UIElements.uiContainer.style.display = 'none';

    const onIntroEnd = () => {
        if (UI.UIElements.introContainer) UI.UIElements.introContainer.style.display = 'none';
        if (UI.UIElements.mainMenu) UI.UIElements.mainMenu.style.display = 'flex';
        UI.updateLoadButtonVisibility(hasSavedGame());
    };

    if (UI.UIElements.introVideo) {
        UI.UIElements.introVideo.onended = onIntroEnd;
    }

    if (UI.UIElements.skipIntroBtn) {
        UI.UIElements.skipIntroBtn.style.display = 'block';
        UI.UIElements.skipIntroBtn.addEventListener('click', () => {
            if (UI.UIElements.introVideo) {
                UI.UIElements.introVideo.pause();
                UI.UIElements.introVideo.currentTime = 0;
            }
            onIntroEnd();
        });
    }

    gameState.gameStarted = false;
}

function startGame(isLoadingGame = false) {
    UI.UIElements.mainMenu.style.display = 'none';
    UI.UIElements.uiContainer.style.display = 'block';
    gameState.gameStarted = true;

    if (!isLoadingGame) {
        restartGame();
    } else {
        gameState.isPaused = false;
        gameState.isGameOver = false;
        gameState.isInvincible = false;
        gameState.scoreMultiplier = 1;
        gameState.activePowerUps = {};
        ship.fireRate = 400;

        UI.updateScoreUI(gameState.score);
        UI.updateLivesUI(gameState.lives);
        UI.updateHealthUI(gameState.health);
        UI.updateLevelUI(gameState.level);
        UI.updatePowerUpUI(gameState.activePowerUps);

        clearSceneEntities();

        ship.mesh.position.set(0, 0, 0);
        ship.mesh.visible = true;

        UI.showGameOver(false);
        UI.togglePauseMenu(false);
    }

    // Show mobile controls on touch devices
    if (UI.UIElements.mobileControls) {
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
        if (isTouchDevice) {
            UI.UIElements.mobileControls.style.display = 'block';
        }
    }

    // Initialize Google AdSense
    try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
        console.warn('Adsbygoogle push failed:', e);
    }
}

function quitToMenu() {
    gameState.isPaused = true;
    gameState.gameStarted = false;
    UI.togglePauseMenu(false);
    UI.UIElements.uiContainer.style.display = 'none';
    UI.UIElements.mainMenu.style.display = 'flex';
}

function exitGame() {
    UI.UIElements.uiContainer.style.display = 'none';
    gameState.isPaused = true;
    gameState.gameStarted = false;

    if (UI.UIElements.introContainer) UI.UIElements.introContainer.style.display = 'flex';
    if (UI.UIElements.introVideo) {
        UI.UIElements.introVideo.currentTime = 0;
        UI.UIElements.introVideo.play();
    }
}

// Event Listeners
if (UI.UIElements.restartBtn) UI.UIElements.restartBtn.addEventListener('click', restartGame);
if (UI.UIElements.resumeBtn) UI.UIElements.resumeBtn.addEventListener('click', togglePause);
if (UI.UIElements.startBtn) UI.UIElements.startBtn.addEventListener('click', () => startGame(false));
if (UI.UIElements.loadBtn) UI.UIElements.loadBtn.addEventListener('click', loadGame);
if (UI.UIElements.saveBtn) UI.UIElements.saveBtn.addEventListener('click', saveGame);
if (UI.UIElements.quitBtn) UI.UIElements.quitBtn.addEventListener('click', quitToMenu);
if (UI.UIElements.exitBtn) UI.UIElements.exitBtn.addEventListener('click', exitGame);

if (UI.UIElements.howToBtn) UI.UIElements.howToBtn.addEventListener('click', () => {
    UI.UIElements.mainMenu.style.display = 'none';
    UI.UIElements.howToScreen.style.display = 'flex';
});
if (UI.UIElements.aboutBtn) UI.UIElements.aboutBtn.addEventListener('click', () => {
    UI.UIElements.mainMenu.style.display = 'none';
    UI.UIElements.aboutScreen.style.display = 'flex';
});
if (UI.UIElements.creditsBtn) UI.UIElements.creditsBtn.addEventListener('click', () => {
    UI.UIElements.mainMenu.style.display = 'none';
    UI.UIElements.creditsScreen.style.display = 'flex';
});

UI.UIElements.backBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        UI.UIElements.aboutScreen.style.display = 'none';
        UI.UIElements.creditsScreen.style.display = 'none';
        if (UI.UIElements.howToScreen) UI.UIElements.howToScreen.style.display = 'none';
        UI.UIElements.mainMenu.style.display = 'flex';
    });
});

// Initialize UI
UI.updateLivesUI(gameState.lives);
UI.updateHealthUI(gameState.health);
UI.updateLevelUI(gameState.level);
UI.refreshHighScoreUI(gameState.highScore);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    if (gameState.isGameOver || gameState.isPaused) return;

    // Update game objects
    starfield.update();
    meteors.update();
    planets.update();

    if (gameState.level >= 2) aliens.update();
    if (gameState.level >= 3) comets.update();

    lasers.update();
    ship.update(camera);
    explosions.update();
    powerUps.update();

    applyGravity(ship, planets);

    checkCollisions({
        scene,
        ship,
        lasers,
        meteors,
        aliens,
        comets,
        planets,
        powerUps,
        explosions,
        gameState,
        callbacks: {
            onScore: updateScore,
            onDamage: (amount) => {
                gameState.health -= amount;
                UI.updateHealthUI(gameState.health);
                if (gameState.health <= 0) {
                    ship.mesh.visible = false;
                    setTimeout(() => loseLife(), 300);
                }
            },
            onPowerUp: activatePowerUp
        }
    });

    renderer.render(scene, camera);
}

// Start
initGame();
animate();
