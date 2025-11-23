import * as THREE from 'three';

export class Starfield {
    constructor(scene, count = 2000) {
        this.scene = scene;
        this.count = count;
        this.geometry = new THREE.BufferGeometry();

        // Create a circular texture for round stars
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        // Draw a radial gradient circle
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);

        const texture = new THREE.CanvasTexture(canvas);

        this.material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            transparent: true,
            opacity: 0.85,
            map: texture,
            blending: THREE.AdditiveBlending,
            depthWrite: false
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
