import * as THREE from 'three';

export class Starfield {
    constructor(scene, count = 2000) {
        this.scene = scene;
        this.count = count;
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.075,
            transparent: true,
            opacity: 0.7
        });

        this.init();
    }

    init() {
        const positions = new Float32Array(this.count * 3);

        for (let i = 0; i < this.count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100; // x
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100; // y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100; // z
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.stars = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.stars);
    }

    update() {
        // Simple animation: move stars towards camera to simulate forward movement
        const positions = this.geometry.attributes.position.array;

        for (let i = 0; i < this.count; i++) {
            // Move z coordinate
            positions[i * 3 + 2] += 0.2;

            // Reset if behind camera
            if (positions[i * 3 + 2] > 5) {
                positions[i * 3 + 2] = -50;
            }
        }

        this.geometry.attributes.position.needsUpdate = true;
    }
}
