import * as THREE from 'three';
import { Starfield } from './objects/Starfield.js';
import { Ship } from './objects/Ship.js';
import { Meteors } from './objects/Meteors.js';
import { Lasers } from './objects/Lasers.js';
import { Explosions } from './objects/Explosions.js';
import { Aliens } from './objects/Aliens.js';
import { Comets } from './objects/Comets.js';
import { Planets } from './objects/Planets.js';

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

camera.position.z = 5;
camera.position.y = 2;
camera.lookAt(0, 0, 0);

// UI Elements
const scoreEl = document.getElementById('score');
const gameOverEl = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');
const pauseMenuEl = document.getElementById('pause-menu');
const resumeBtn = document.getElementById('resume-btn');

let score = 0;
let isGameOver = false;
let isPaused = false;

function updateScore(points) {
    score += points;
    if (scoreEl) scoreEl.innerText = `Score: ${score}`;
}

function gameOver() {
    isGameOver = true;
    if (gameOverEl) gameOverEl.style.display = 'block';
}

function restartGame() {
    isGameOver = false;
    isPaused = false;
    score = 0;
    updateScore(0);
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

    ship.mesh.position.set(0, 0, 0);
}

function togglePause() {
    if (isGameOver) return;
    isPaused = !isPaused;
    if (pauseMenuEl) {
        pauseMenuEl.style.display = isPaused ? 'block' : 'none';
    }
}

if (restartBtn) restartBtn.addEventListener('click', restartGame);
if (resumeBtn) resumeBtn.addEventListener('click', togglePause);

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

    ship.update();
    meteors.update();
    comets.update();
    planets.update();
    lasers.update();
    explosions.update();
    starfield.update();
    aliens.update();

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

        if (shipBox.intersectsBox(meteorBox)) {
            explosions.explode(shipMesh.position);
            gameOver();
            scene.remove(meteor);
            meteorList.splice(i, 1);
        }
    }

    // Check Aliens
    for (let i = alienList.length - 1; i >= 0; i--) {
        const alien = alienList[i];
        const alienBox = new THREE.Box3().setFromObject(alien);

        if (shipBox.intersectsBox(alienBox)) {
            explosions.explode(shipMesh.position);
            gameOver();
            scene.remove(alien);
            alienList.splice(i, 1);
        }
    }

    // Check Comets
    for (let i = cometList.length - 1; i >= 0; i--) {
        const comet = cometList[i];
        const cometBox = new THREE.Box3().setFromObject(comet);

        if (shipBox.intersectsBox(cometBox)) {
            explosions.explode(shipMesh.position);
            gameOver();
            scene.remove(comet);
            cometList.splice(i, 1);
        }
    }

    // Check Planets (Crash)
    for (let i = 0; i < planetList.length; i++) {
        const planetGroup = planetList[i];
        const planet = planetGroup.children[0];
        const planetWorldPos = new THREE.Vector3();
        planet.getWorldPosition(planetWorldPos);

        // Simple distance check for planet collision (sphere vs box approx)
        if (shipMesh.position.distanceTo(planetWorldPos) < 4) { // Radius 4
            explosions.explode(shipMesh.position);
            gameOver();
        }
    }
}

animate();
