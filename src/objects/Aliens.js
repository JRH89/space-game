import * as THREE from 'three';

export class Aliens {
    constructor(scene, playerShip) {
        this.scene = scene;
        this.playerShip = playerShip;
        this.aliens = [];
        this.spawnRate = 0.003; // Lower spawn rate than meteors
        this.speed = 0.10;

        // Saucer geometry
        this.geometry = new THREE.Group();
        const saucerBody = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0x00ff00, metalness: 0.9, roughness: 0.1 })
        );
        saucerBody.scale.y = 0.5;
        this.geometry.add(saucerBody);

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.8, 0.15, 8, 16),
            new THREE.MeshStandardMaterial({ color: 0x00ff00, metalness: 0.9, roughness: 0.1 })
        );
        ring.rotation.x = Math.PI / 2;
        this.geometry.add(ring);
    }

    spawnAlien() {
        const alien = this.geometry.clone();

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
