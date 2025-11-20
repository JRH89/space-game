import * as THREE from 'three';

export class Meteors {
    constructor(scene) {
        this.scene = scene;
        this.meteors = [];
        this.spawnRate = 0.01; // Chance to spawn per frame
        this.speed = 0.2;

        // Reuse geometry and material for performance (basic)
        this.geometry = new THREE.IcosahedronGeometry(1, 0);
        this.material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.8,
            flatShading: true
        });
    }

    spawnMeteor() {
        const meteor = new THREE.Mesh(this.geometry, this.material);

        // Random position
        const x = (Math.random() - 0.5) * 20;
        const y = (Math.random() - 0.5) * 10;
        const z = -50; // Start far away

        meteor.position.set(x, y, z);

        // Random rotation and scale
        meteor.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        const scale = 0.5 + Math.random() * 1.5;
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
