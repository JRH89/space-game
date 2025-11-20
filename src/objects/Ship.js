import * as THREE from 'three';

export class Ship {
    constructor(scene, lasers) {
        this.scene = scene;
        this.lasers = lasers;
        this.mesh = new THREE.Group();

        // Body
        const geometry = new THREE.ConeGeometry(0.5, 2, 8);
        const material = new THREE.MeshNormalMaterial(); // Use Normal material for now to see orientation
        const body = new THREE.Mesh(geometry, material);

        // Rotate cone to point forward (negative Z)
        body.rotation.x = -Math.PI / 2;

        this.mesh.add(body);

        // Wings (optional simple addition)
        const wingGeo = new THREE.BoxGeometry(2, 0.1, 0.5);
        const wingMat = new THREE.MeshNormalMaterial();
        const wings = new THREE.Mesh(wingGeo, wingMat);
        wings.position.z = 0.5;
        this.mesh.add(wings);

        this.scene.add(this.mesh);

        // Initial position
        this.mesh.position.set(0, 0, 0);

        // Movement
        this.speed = 0.1;
        this.velocity = new THREE.Vector3();
        this.keys = {
            ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
            w: false, a: false, s: false, d: false
        };

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onKeyDown(event) {
        if (this.keys.hasOwnProperty(event.key)) {
            this.keys[event.key] = true;
        }
        if (event.code === 'Space') {
            this.shoot();
        }
    }

    onKeyUp(event) {
        if (this.keys.hasOwnProperty(event.key)) {
            this.keys[event.key] = false;
        }
    }

    shoot() {
        if (this.lasers) {
            this.lasers.shoot(this.mesh.position);
        }
    }

    update() {
        // Idle animation
        this.mesh.rotation.z = 0; // Reset roll for banking effect later

        // Movement Logic
        if (this.keys.ArrowUp || this.keys.w) this.mesh.position.y += this.speed;
        if (this.keys.ArrowDown || this.keys.s) this.mesh.position.y -= this.speed;
        if (this.keys.ArrowLeft || this.keys.a) {
            this.mesh.position.x -= this.speed;
            this.mesh.rotation.z = 0.5; // Bank left
        }
        if (this.keys.ArrowRight || this.keys.d) {
            this.mesh.position.x += this.speed;
            this.mesh.rotation.z = -0.5; // Bank right
        }

        // Boundaries (approximate for Z=0)
        this.mesh.position.x = Math.max(-8, Math.min(8, this.mesh.position.x));
        this.mesh.position.y = Math.max(-4, Math.min(4, this.mesh.position.y));
    }
}
