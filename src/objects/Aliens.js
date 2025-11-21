import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import ufoMtl from '../assets/UFO/UFO.mtl?url';
import ufoObj from '../assets/UFO/UFO.obj?url';

export class Aliens {
    constructor(scene, playerShip) {
        this.scene = scene;
        this.playerShip = playerShip;
        this.aliens = [];
        this.spawnRate = 0.003; // Lower spawn rate than meteors
        this.speed = 0.10;
        this.modelLoaded = false;
        this.ufoModel = null;

        // Load the OBJ model with MTL materials
        const mtlLoader = new MTLLoader();
        mtlLoader.setResourcePath('/src/assets/UFO/');
        mtlLoader.load(ufoMtl, (materials) => {
            materials.preload();

            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load(ufoObj, (object) => {
                this.ufoModel = object;
                this.modelLoaded = true;
            });
        });
    }

    spawnAlien() {
        // Only spawn if model is loaded
        if (!this.modelLoaded || !this.ufoModel) return;

        // Clone the loaded model
        const alien = this.ufoModel.clone();

        // Random position at top
        const x = (Math.random() - 0.5) * 20;
        const y = (Math.random() - 0.5) * 10;
        const z = -50;

        alien.position.set(x, y, z);

        this.scene.add(alien);
        this.aliens.push(alien);
    }

    update() {
        // Spawn
        if (Math.random() < this.spawnRate) {
            this.spawnAlien();
        }

        // Move
        for (let i = this.aliens.length - 1; i >= 0; i--) {
            const alien = this.aliens[i];

            // Move forward
            alien.position.z += this.speed;

            // Simple tracking of player X
            if (this.playerShip && this.playerShip.mesh) {
                if (alien.position.x < this.playerShip.mesh.position.x) {
                    alien.position.x += 0.02;
                } else {
                    alien.position.x -= 0.02;
                }
            }

            // Rotate
            alien.rotation.y += 0.05;

            // Remove if behind camera
            if (alien.position.z > 10) {
                this.scene.remove(alien);
                this.aliens.splice(i, 1);
            }
        }
    }
}
