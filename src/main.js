import * as THREE from 'three';
import { Starfield } from './objects/Starfield.js';
import { Ship } from './objects/Ship.js';
import { Meteors } from './objects/Meteors.js';
import { Lasers } from './objects/Lasers.js';
import { Explosions } from './objects/Explosions.js';

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

// Lasers
const lasers = new Lasers(scene);

// Explosions
const explosions = new Explosions(scene);

// Player Ship
const ship = new Ship(scene, lasers);

camera.position.z = 5;
camera.position.y = 2;
camera.lookAt(0, 0, 0);

// UI Elements
const scoreEl = document.getElementById('score');
const gameOverEl = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');

let score = 0;
let isGameOver = false;

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
    score = 0;
    updateScore(0);
    if (gameOverEl) gameOverEl.style.display = 'none';

    // Clear scene entities
    while (meteors.meteors.length > 0) {
        scene.remove(meteors.meteors[0]);
        meteors.meteors.shift();
    }
    while (lasers.lasers.length > 0) {
        scene.remove(lasers.lasers[0]);
        lasers.lasers.shift();
    }

    ship.mesh.position.set(0, 0, 0);
}

if (restartBtn) restartBtn.addEventListener('click', restartGame);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    if (isGameOver) return;

    ship.update();
    meteors.update();
    lasers.update();
    explosions.update();
    starfield.update();

    checkCollisions();

    renderer.render(scene, camera);
}

function checkCollisions() {
    const laserList = lasers.lasers;
    const meteorList = meteors.meteors;
    const shipMesh = ship.mesh;

    // Lasers vs Meteors
    for (let i = laserList.length - 1; i >= 0; i--) {
        const laser = laserList[i];
        const laserBox = new THREE.Box3().setFromObject(laser);

        for (let j = meteorList.length - 1; j >= 0; j--) {
            const meteor = meteorList[j];
            const meteorBox = new THREE.Box3().setFromObject(meteor);

            if (laserBox.intersectsBox(meteorBox)) {
                // Collision detected
                explosions.explode(meteor.position);

                scene.remove(laser);
                scene.remove(meteor);

                laserList.splice(i, 1);
                meteorList.splice(j, 1);

                updateScore(100);

                // Break inner loop since laser is gone
                break;
            }
        }
    }

    // Ship vs Meteors
    const shipBox = new THREE.Box3().setFromObject(shipMesh);
    // Shrink box slightly for forgiveness
    shipBox.expandByScalar(-0.2);

    for (let i = meteorList.length - 1; i >= 0; i--) {
        const meteor = meteorList[i];
        const meteorBox = new THREE.Box3().setFromObject(meteor);

        if (shipBox.intersectsBox(meteorBox)) {
            explosions.explode(shipMesh.position);
            gameOver();
            // Remove meteor that hit us
            scene.remove(meteor);
            meteorList.splice(i, 1);
        }
    }
}

animate();
