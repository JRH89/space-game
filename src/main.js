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

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);

// Starfield
const starfield = new Starfield(scene);

// Meteors
const meteors = new Meteors(scene);

// Comets
const comets = new Comets(scene);

// Planets
const planets = new Planets(scene);

// Lasers
const lasers = new Lasers(scene);

// Explosions
const explosions = new Explosions(scene);

// Player Ship
const ship = new Ship(scene, lasers);

// Aliens
const aliens = new Aliens(scene, ship);

// Power-ups
const powerUps = new PowerUps(scene);

camera.position.z = 5;
camera.position.y = 2;
camera.lookAt(0, 0, 0);

// UI Elements
const scoreEl = document.getElementById('score');
const gameOverEl = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');
const pauseMenuEl = document.getElementById('pause-menu');
const resumeBtn = document.getElementById('resume-btn');
const livesEl = document.getElementById('lives');
const healthBarEl = document.getElementById('health-bar');
const uiContainer = document.getElementById('ui-container');
const highScoreMainEl = document.getElementById('high-score-main');
const highScoreOverEl = document.getElementById('high-score-over');

// Menu Elements
const introContainer = document.getElementById('intro-container');
const introVideo = document.getElementById('intro-video');
const mainMenu = document.getElementById('main-menu');
const startBtn = document.getElementById('start-btn');
const howToBtn = document.getElementById('howto-btn');
const aboutBtn = document.getElementById('about-btn');
const creditsBtn = document.getElementById('credits-btn');
const exitBtn = document.getElementById('exit-btn');
const aboutScreen = document.getElementById('about-screen');
const creditsScreen = document.getElementById('credits-screen');
const howToScreen = document.getElementById('howto-screen');
const backBtns = document.querySelectorAll('.back-btn');

let score = 0;
let lives = 5;
let health = 100;
let level = 1;
let isGameOver = false;
let isPaused = true; // Start paused
let isInvincible = false;
let scoreMultiplier = 1;
let activePowerUps = {};
let gameStarted = false;

// High score (localStorage)
let highScore = parseInt(localStorage.getItem('highScore') || '0', 10);

function refreshHighScoreUI() {
    if (highScoreMainEl) highScoreMainEl.innerText = `High Score: ${highScore}`;
    if (highScoreOverEl) highScoreOverEl.innerText = `High Score: ${highScore}`;
}

// Level thresholds
const LEVEL_THRESHOLDS = {
    2: 1000,
    3: 2500,
    4: 5000,
    5: 10000
};

function updateScore(points) {
    score += points * scoreMultiplier;
    if (scoreEl) scoreEl.innerText = `Score: ${score}`;
    checkLevelUp();
}

function checkLevelUp() {
    for (let nextLevel in LEVEL_THRESHOLDS) {
        if (score >= LEVEL_THRESHOLDS[nextLevel] && level < nextLevel) {
            level = parseInt(nextLevel);
            updateLevel();
            showLevelUpMessage();
            break;
        }
    }
}

function updateLevel() {
    const levelEl = document.getElementById('level');
    if (levelEl) levelEl.innerText = `Level: ${level}`;
}

function showLevelUpMessage() {
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

function updateLives() {
    if (!livesEl) return;
    livesEl.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const lifeIcon = document.createElement('div');
        lifeIcon.className = 'life-icon';
        livesEl.appendChild(lifeIcon);
    }
}

function updateHealth() {
    if (!healthBarEl) return;
    healthBarEl.style.width = `${health}%`;
}

function loseLife() {
    lives--;
    updateLives();

    if (lives <= 0) {
        gameOver();
    } else {
        // Respawn with invincibility
        health = 100;
        updateHealth();
        ship.mesh.position.set(0, 0, 0);
        ship.mesh.visible = true;

        // Brief invincibility
        isInvincible = true;
        setTimeout(() => {
            isInvincible = false;
        }, 2000);
    }
}

function gameOver() {
    isGameOver = true;
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', String(highScore));
    }

    refreshHighScoreUI();

    if (gameOverEl) gameOverEl.style.display = 'block';
}

function restartGame() {
    isGameOver = false;
    isPaused = false;
    score = 0;
    lives = 5;
    health = 100;
    level = 1;
    isInvincible = false;
    scoreMultiplier = 1;
    activePowerUps = {};
    ship.fireRate = 400; // Reset fire rate

    updateScore(0);
    updateLives();
    updateHealth();
    updateLevel();
    updatePowerUpUI();

    if (gameOverEl) gameOverEl.style.display = 'none';
    if (pauseMenuEl) pauseMenuEl.style.display = 'none';

    // Clear scene entities
    while (meteors.meteors.length > 0) {
        scene.remove(meteors.meteors[0]);
        meteors.meteors.shift();
    }
    while (lasers.lasers.length > 0) {
        scene.remove(lasers.lasers[0]);
        lasers.lasers.shift();
    }
    while (aliens.aliens.length > 0) {
        scene.remove(aliens.aliens[0]);
        aliens.aliens.shift();
    }
    while (comets.comets.length > 0) {
        scene.remove(comets.comets[0]);
        comets.comets.shift();
    }
    while (planets.planets.length > 0) {
        scene.remove(planets.planets[0]);
        planets.planets.shift();
    }
    while (powerUps.powerups.length > 0) {
        scene.remove(powerUps.powerups[0]);
        powerUps.powerups.shift();
    }

    ship.mesh.position.set(0, 0, 0);
    ship.mesh.visible = true;
}

function togglePause() {
    if (isGameOver || !gameStarted) return;
    isPaused = !isPaused;
    if (pauseMenuEl) {
        pauseMenuEl.style.display = isPaused ? 'block' : 'none';
    }
}

if (restartBtn) restartBtn.addEventListener('click', restartGame);
if (resumeBtn) resumeBtn.addEventListener('click', togglePause);

// Handle Enter key for pause
window.addEventListener('keydown', (e) => {
    if (e.code === 'Enter') {
        togglePause();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    if (isGameOver || isPaused) return;

    // Update game objects
    starfield.update();

    // Level 1+: Always spawn meteors and planets
    meteors.update();
    planets.update();

    // Level 2+: Spawn aliens
    if (level >= 2) {
        aliens.update();
    }

    // Level 3+: Spawn comets
    if (level >= 3) {
        comets.update();
    }

    lasers.update();
    ship.update();
    explosions.update();
    powerUps.update();

    applyGravity();
    checkCollisions();

    renderer.render(scene, camera);
}

function applyGravity() {
    const shipMesh = ship.mesh;

    for (const planetGroup of planets.planets) {
        const planet = planetGroup.children[0]; // First child is planet mesh

        // Calculate distance
        const distance = shipMesh.position.distanceTo(planetGroup.position);

        if (distance < planet.userData.gravityRadius) {
            // Pull ship towards planet
            const direction = new THREE.Vector3().subVectors(planetGroup.position, shipMesh.position).normalize();
            shipMesh.position.add(direction.multiplyScalar(planet.userData.gravityStrength));
        }
    }
}

function checkCollisions() {
    const laserList = lasers.lasers;
    const meteorList = meteors.meteors;
    const alienList = aliens.aliens;
    const cometList = comets.comets;
    const planetList = planets.planets;
    const shipMesh = ship.mesh;

    // Lasers vs Meteors & Aliens & Comets & Moons
    for (let i = laserList.length - 1; i >= 0; i--) {
        const laser = laserList[i];
        const laserBox = new THREE.Box3().setFromObject(laser);
        let laserHit = false;

        // Check Meteors
        for (let j = meteorList.length - 1; j >= 0; j--) {
            const meteor = meteorList[j];
            const meteorBox = new THREE.Box3().setFromObject(meteor);
            meteorBox.expandByScalar(-0.3); // Tighten collision

            if (laserBox.intersectsBox(meteorBox)) {
                explosions.explode(meteor.position);
                scene.remove(laser);
                scene.remove(meteor);
                laserList.splice(i, 1);
                meteorList.splice(j, 1);
                updateScore(100);
                laserHit = true;
                break;
            }
        }
        if (laserHit) continue;

        // Check Aliens
        for (let k = alienList.length - 1; k >= 0; k--) {
            const alien = alienList[k];
            const alienBox = new THREE.Box3().setFromObject(alien);
            alienBox.expandByScalar(-0.4); // Tighten collision

            if (laserBox.intersectsBox(alienBox)) {
                explosions.explode(alien.position);
                scene.remove(laser);
                scene.remove(alien);
                laserList.splice(i, 1);
                alienList.splice(k, 1);
                updateScore(200);
                laserHit = true;
                break;
            }
        }
        if (laserHit) continue;

        // Check Comets
        for (let l = cometList.length - 1; l >= 0; l--) {
            const comet = cometList[l];
            const cometBox = new THREE.Box3().setFromObject(comet);

            if (laserBox.intersectsBox(cometBox)) {
                explosions.explode(comet.position);
                scene.remove(laser);
                scene.remove(comet);
                laserList.splice(i, 1);
                cometList.splice(l, 1);
                updateScore(300);
                laserHit = true;
                break;
            }
        }
        if (laserHit) continue;

        // Check Moons
        for (let m = 0; m < planetList.length; m++) {
            const planetGroup = planetList[m];
            const moon = planetGroup.userData.moon;

            if (moon) {
                // Need world position for collision check since moon is child of planetGroup
                const moonWorldPos = new THREE.Vector3();
                moon.getWorldPosition(moonWorldPos);
                const moonBox = new THREE.Box3().setFromCenterAndSize(moonWorldPos, new THREE.Vector3(1.6, 1.6, 1.6)); // Approx size

                if (laserBox.intersectsBox(moonBox)) {
                    explosions.explode(moonWorldPos);
                    scene.remove(laser);
                    planetGroup.remove(moon);
                    planetGroup.userData.moon = null; // Remove reference

                    laserList.splice(i, 1);
                    updateScore(500);
                    laserHit = true;

                    // Disable gravity for this planet if moon destroyed? User said "destroy its moon to escape the pull"
                    planetGroup.children[0].userData.gravityStrength = 0;

                    break;
                }
            }
        }
    }

    // Ship vs Meteors & Aliens & Comets & Planets
    const shipBox = new THREE.Box3().setFromObject(shipMesh);
    shipBox.expandByScalar(-0.2);

    // Check Meteors
    for (let i = meteorList.length - 1; i >= 0; i--) {
        const meteor = meteorList[i];
        const meteorBox = new THREE.Box3().setFromObject(meteor);
        meteorBox.expandByScalar(-0.3); // Tighten collision

        if (shipBox.intersectsBox(meteorBox) && !isInvincible) {
            explosions.explode(shipMesh.position);
            scene.remove(meteor);
            meteorList.splice(i, 1);

            // Reduce health
            health -= 25;
            updateHealth();

            if (health <= 0) {
                shipMesh.visible = false;
                setTimeout(() => loseLife(), 300);
            }
        }
    }

    // Check Aliens
    for (let i = alienList.length - 1; i >= 0; i--) {
        const alien = alienList[i];
        const alienBox = new THREE.Box3().setFromObject(alien);
        alienBox.expandByScalar(-0.5); // Tighten collision

        if (shipBox.intersectsBox(alienBox) && !isInvincible) {
            explosions.explode(shipMesh.position);
            scene.remove(alien);
            alienList.splice(i, 1);

            // Reduce health
            health -= 30;
            updateHealth();

            if (health <= 0) {
                shipMesh.visible = false;
                setTimeout(() => loseLife(), 300);
            }
        }
    }

    // Check Comets
    for (let i = cometList.length - 1; i >= 0; i--) {
        const comet = cometList[i];
        const cometBox = new THREE.Box3().setFromObject(comet);
        cometBox.expandByScalar(-0.3); // Tighten collision

        if (shipBox.intersectsBox(cometBox) && !isInvincible) {
            explosions.explode(shipMesh.position);
            scene.remove(comet);
            cometList.splice(i, 1);

            // Reduce health
            health -= 40;
            updateHealth();

            if (health <= 0) {
                shipMesh.visible = false;
                setTimeout(() => loseLife(), 300);
            }
        }
    }

    // Check Planets (Crash)
    for (let i = 0; i < planetList.length; i++) {
        const planetGroup = planetList[i];
        const planet = planetGroup.children[0];
        const planetWorldPos = new THREE.Vector3();
        planet.getWorldPosition(planetWorldPos);

        // Reduced collision radius - gives more time to destroy moon before crash
        if (shipMesh.position.distanceTo(planetWorldPos) < 3.2) { // Smaller = more time
            explosions.explode(shipMesh.position);

            // Reduce health massively
            health = 0;
            updateHealth();

            shipMesh.visible = false;
            setTimeout(() => loseLife(), 300);
        }
    }

    // Check Power-ups
    for (let i = powerUps.powerups.length - 1; i >= 0; i--) {
        const powerUp = powerUps.powerups[i];
        const powerUpBox = new THREE.Box3().setFromObject(powerUp);

        if (shipBox.intersectsBox(powerUpBox)) {
            const type = powerUps.collect(powerUp);
            activatePowerUp(type);
        }
    }
}

function activatePowerUp(type) {
    const now = Date.now();

    switch (type) {
        case 'extraLife':
            lives++;
            updateLives();
            break;

        case 'health':
            health = Math.min(100, health + 25);
            updateHealth();
            break;

        case 'shield':
            isInvincible = true;
            activePowerUps['shield'] = now + 5000;
            setTimeout(() => {
                if (Date.now() >= activePowerUps['shield']) {
                    isInvincible = false;
                    delete activePowerUps['shield'];
                    updatePowerUpUI();
                }
            }, 5000);
            break;

        case 'rapidFire':
            ship.fireRate = 100;
            activePowerUps['rapidFire'] = now + 5000;
            setTimeout(() => {
                if (Date.now() >= activePowerUps['rapidFire']) {
                    ship.fireRate = 400;
                    delete activePowerUps['rapidFire'];
                    updatePowerUpUI();
                }
            }, 5000);
            break;

        case 'scoreMultiplier':
            scoreMultiplier = 2;
            activePowerUps['scoreMultiplier'] = now + 10000;
            setTimeout(() => {
                if (Date.now() >= activePowerUps['scoreMultiplier']) {
                    scoreMultiplier = 1;
                    delete activePowerUps['scoreMultiplier'];
                    updatePowerUpUI();
                }
            }, 10000);
            break;
    }
    updatePowerUpUI();
}

function updatePowerUpUI() {
    const container = document.getElementById('powerups-container');
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

function initGame() {
    // Show intro video first, hide menu and in-game UI
    if (introContainer) introContainer.style.display = 'flex';
    if (mainMenu) mainMenu.style.display = 'none';
    if (uiContainer) uiContainer.style.display = 'none';

    // When video finishes, go to main menu
    if (introVideo) {
        introVideo.onended = () => {
            if (introContainer) introContainer.style.display = 'none';
            if (mainMenu) mainMenu.style.display = 'flex';
        };
    }

    // Skip button: same as video end
    const skipIntroBtn = document.getElementById('skip-intro-btn');
    if (skipIntroBtn) {
        skipIntroBtn.style.display = 'block';
        skipIntroBtn.addEventListener('click', () => {
            if (introVideo) {
                introVideo.pause();
                introVideo.currentTime = 0;
            }
            if (introContainer) introContainer.style.display = 'none';
            if (mainMenu) mainMenu.style.display = 'flex';
        });
    }

    gameStarted = false;
}

function startGame() {
    mainMenu.style.display = 'none';
    uiContainer.style.display = 'block';
    gameStarted = true;
    restartGame(); // Starts fresh

    // Initialize Google AdSense after UI is visible
    const adSlot = document.querySelector('#ad-container .adsbygoogle');
    if (window.adsbygoogle && adSlot) {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.warn('Adsbygoogle push failed:', e);
        }
    }
}

function showHowTo() {
    mainMenu.style.display = 'none';
    howToScreen.style.display = 'flex';
}

function showAbout() {
    mainMenu.style.display = 'none';
    aboutScreen.style.display = 'flex';
}

function showCredits() {
    mainMenu.style.display = 'none';
    creditsScreen.style.display = 'flex';
}

function exitGame() {
    // Just return to main menu
    uiContainer.style.display = 'none';
    mainMenu.style.display = 'flex';
    isPaused = true;
}

// Event Listeners
startBtn.addEventListener('click', startGame);
if (howToBtn) howToBtn.addEventListener('click', showHowTo);
aboutBtn.addEventListener('click', showAbout);
creditsBtn.addEventListener('click', showCredits);
exitBtn.addEventListener('click', exitGame);

backBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        aboutScreen.style.display = 'none';
        creditsScreen.style.display = 'none';
        if (howToScreen) howToScreen.style.display = 'none';
        mainMenu.style.display = 'flex';
    });
});

// Initialize UI
updateLives();
updateHealth();
updateLevel();
refreshHighScoreUI();

const quitBtn = document.getElementById('quit-btn');

function quitToMenu() {
    isPaused = true;
    gameStarted = false; // Stop the game loop logic from running if we unpause accidentally
    if (pauseMenuEl) pauseMenuEl.style.display = 'none';

    uiContainer.style.display = 'none';
    mainMenu.style.display = 'flex';
}

if (quitBtn) quitBtn.addEventListener('click', quitToMenu);

// Start with intro video flow, then run the game loop
initGame();
animate();
