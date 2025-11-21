import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import meteorMtl from '../assets/Meteor/Meteor.mtl?url';
import meteorObj from '../assets/Meteor/Meteor.obj?url';

export class Meteors {
    constructor(scene) {
        this.scene = scene;
        this.meteors = [];
        this.spawnRate = 0.01; // Chance to spawn per frame
        this.speed = 0.2;
        this.modelLoaded = false;
        this.meteorModel = null;

        // Load the OBJ model with MTL materials
        const mtlLoader = new MTLLoader();
        mtlLoader.setResourcePath('/src/assets/Meteor/');
        mtlLoader.load(meteorMtl, (materials) => {
            materials.preload();

            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load(meteorObj, (object) => {
                this.meteorModel = object;
                this.modelLoaded = true;
            });
        });
    }

    spawnMeteor() {
        // Only spawn if model is loaded
        if (!this.modelLoaded || !this.meteorModel) return;

        // Clone the loaded model
        const meteor = this.meteorModel.clone();

        // Random position
        const x = (Math.random() - 0.5) * 20;
        const y = (Math.random() - 0.5) * 10;
        const z = -80; // Start far away

        meteor.position.set(x, y, z);

        // Random rotation and scale
        meteor.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        const scale = 1.0 + Math.random() * 2;
        meteor.scale.set(scale, scale, scale);

        this.scene.add(meteor);
        this.meteors.push(meteor);
    }

    update() {
        // Spawn new meteors
        if (Math.random() < this.spawnRate) {
            this.spawnMeteor();
        }

        // Move and rotate existing meteors
        for (let i = this.meteors.length - 1; i >= 0; i--) {
            const meteor = this.meteors[i];

            meteor.position.z += this.speed;
            meteor.rotation.x += 0.01;
            meteor.rotation.y += 0.01;

            // Remove if behind camera
            if (meteor.position.z > 10) {
                this.scene.remove(meteor);
                this.meteors.splice(i, 1);
            }
        }
    }
}
