import * as THREE from 'three';
import { playSound } from '../modules/AudioManager.js';

export class Explosions {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];

        // Reuse geometry/material
        this.geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        this.material = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    }

    explode(position) {
        playSound('explosion'); // Play explosion sound
        
        const particleCount = 10;
        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(this.geometry, this.material.clone()); // Clone material to fade individually if needed
            particle.position.copy(position);

            // Random velocity
            particle.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
            );

            // Random lifetime
            particle.userData.life = 1.0;

            this.scene.add(particle);
            this.particles.push(particle);
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];

            // Move
            particle.position.add(particle.userData.velocity);

            // Fade/Age
            particle.userData.life -= 0.02;
            particle.scale.setScalar(particle.userData.life);

            if (particle.userData.life <= 0) {
                this.scene.remove(particle);
                this.particles.splice(i, 1);
            }
        }
    }
}
