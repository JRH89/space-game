import * as THREE from 'three';

export class Lasers {
    constructor(scene) {
        this.scene = scene;
        this.lasers = [];
        this.speed = 0.5;

        this.geometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
        this.geometry.rotateX(-Math.PI / 2); // Point forward
        this.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    }

    shoot(position) {
        const laser = new THREE.Mesh(this.geometry, this.material);
        laser.position.copy(position);
        laser.position.z -= 1; // Start slightly in front of ship

        this.scene.add(laser);
        this.lasers.push(laser);
    }

    update() {
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];

            laser.position.z -= this.speed;

            // Remove if too far
            if (laser.position.z < -100) {
                this.scene.remove(laser);
                this.lasers.splice(i, 1);
            }
        }
    }
}
