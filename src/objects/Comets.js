import * as THREE from 'three';

export class Comets {
    constructor(scene) {
        this.scene = scene;
        this.comets = [];
        this.spawnRate = 0.005; // Occasional
        this.speed = 0.5; // Fast

        // Comet Head
        this.headGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        this.headMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });

        // Comet Tail (Simple Cylinder)
        this.tailGeometry = new THREE.CylinderGeometry(0.1, 0.5, 4, 8);
        this.tailGeometry.rotateX(Math.PI / 2); // Point back
        this.tailGeometry.translate(0, 0, 2); // Offset behind head
        this.tailMaterial = new THREE.MeshBasicMaterial({ color: 0x00aaaa, transparent: true, opacity: 0.5 });
    }

    spawnComet() {
        const comet = new THREE.Group();

        const head = new THREE.Mesh(this.headGeometry, this.headMaterial);
        const tail = new THREE.Mesh(this.tailGeometry, this.tailMaterial);

        comet.add(head);
        comet.add(tail);

        // Random position
        const x = (Math.random() - 0.5) * 30; // Wider range
        const y = (Math.random() - 0.5) * 15;
        const z = -60;

        comet.position.set(x, y, z);

        // Random trajectory angle (slight)
        comet.rotation.x = (Math.random() - 0.5) * 0.5;
        comet.rotation.y = (Math.random() - 0.5) * 0.5;

        this.scene.add(comet);
        this.comets.push(comet);
    }

    update() {
        if (Math.random() < this.spawnRate) {
            this.spawnComet();
        }

        for (let i = this.comets.length - 1; i >= 0; i--) {
            const comet = this.comets[i];

            // Move along local Z axis (forward)
            comet.translateZ(this.speed);

            // Remove if behind camera
            if (comet.position.z > 10) {
                this.scene.remove(comet);
                this.comets.splice(i, 1);
            }
        }
    }
}
