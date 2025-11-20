import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import fighterMtl from '../assets/Fighter_02_Obj/Fighter_02.mtl?url';
import fighterObj from '../assets/Fighter_02_Obj/Fighter_02.obj?url';

export class Ship {
    constructor(scene, lasers) {
        this.scene = scene;
        this.lasers = lasers;
        this.mesh = new THREE.Group();

        // Load the OBJ model with MTL materials, then make them emissive
        const mtlLoader = new MTLLoader();
        mtlLoader.setResourcePath('/src/assets/Fighter_02_Obj/');
        mtlLoader.load(fighterMtl, (materials) => {
            materials.preload();

            // Make all materials emissive (glow)
            for (let materialName in materials.materials) {
                const mat = materials.materials[materialName];
                mat.emissive = mat.color.clone();
                mat.emissiveIntensity = 0.1;
            }

            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load(fighterObj, (object) => {
                // Scale and rotate the model to fit the game
                object.scale.set(0.3, 0.3, 0.3);
                object.rotation.y = Math.PI; // Rotate to face forward

                this.mesh.add(object);
            });
        });

        this.scene.add(this.mesh);

        // Add a point light to brighten the ship
        this.shipLight = new THREE.PointLight(0xffffff, 2, 10);
        this.shipLight.position.set(0, 2, 2); // Above and in front of ship
        this.mesh.add(this.shipLight);

        // Initial position
        this.mesh.position.set(0, 0, 0);

        // Movement
        this.speed = 0.1;
        this.velocity = new THREE.Vector3();
        this.keys = {
            ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
            w: false, a: false, s: false, d: false
        };

        this.lastShotTime = 0;
        this.fireRate = 400; // Default fire rate (ms)

        // Touch controls
        this.touchActive = false;
        this.touchStartPos = { x: 0, y: 0 };
        this.touchCurrentPos = { x: 0, y: 0 };
        this.joystickBase = null;
        this.joystickKnob = null;

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Initialize touch controls after DOM is ready
        this.initTouchControls();
    }

    initTouchControls() {
        this.joystickBase = document.getElementById('joystick-base');
        this.joystickKnob = document.getElementById('joystick-knob');

        if (this.joystickBase) {
            this.joystickBase.addEventListener('touchstart', (e) => this.onJoystickTouchStart(e));
            this.joystickBase.addEventListener('touchmove', (e) => this.onJoystickTouchMove(e));
            this.joystickBase.addEventListener('touchend', (e) => this.onJoystickTouchEnd(e));
        }
    }

    onJoystickTouchStart(event) {
        event.preventDefault();
        this.touchActive = true;
        const rect = this.joystickBase.getBoundingClientRect();
        this.touchStartPos.x = rect.left + rect.width / 2;
        this.touchStartPos.y = rect.top + rect.height / 2;
    }

    onJoystickTouchMove(event) {
        if (!this.touchActive) return;
        event.preventDefault();

        const touch = event.touches[0];
        const deltaX = touch.clientX - this.touchStartPos.x;
        const deltaY = touch.clientY - this.touchStartPos.y;

        // Limit joystick movement to base radius
        const maxDistance = 45; // Half of base width minus knob radius
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance > maxDistance) {
            const angle = Math.atan2(deltaY, deltaX);
            this.touchCurrentPos.x = Math.cos(angle) * maxDistance;
            this.touchCurrentPos.y = Math.sin(angle) * maxDistance;
        } else {
            this.touchCurrentPos.x = deltaX;
            this.touchCurrentPos.y = deltaY;
        }

        // Update knob position
        if (this.joystickKnob) {
            this.joystickKnob.style.transform = `translate(calc(-50% + ${this.touchCurrentPos.x}px), calc(-50% + ${this.touchCurrentPos.y}px))`;
        }
    }

    onJoystickTouchEnd(event) {
        event.preventDefault();
        this.touchActive = false;
        this.touchCurrentPos.x = 0;
        this.touchCurrentPos.y = 0;

        // Reset knob position
        if (this.joystickKnob) {
            this.joystickKnob.style.transform = 'translate(-50%, -50%)';
        }
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
        const now = Date.now();
        if (this.lasers && now - this.lastShotTime > this.fireRate) {
            this.lasers.shoot(this.mesh.position);
            this.lastShotTime = now;
        }
    }

    update() {
        // Idle animation
        this.mesh.rotation.z = 0; // Reset roll for banking effect later

        // Touch controls movement
        if (this.touchActive) {
            const sensitivity = 0.03; // Reduced sensitivity for better control
            this.mesh.position.x += this.touchCurrentPos.x * sensitivity;
            this.mesh.position.y -= this.touchCurrentPos.y * sensitivity; // Invert Y for natural feel

            // Banking effect for touch
            if (Math.abs(this.touchCurrentPos.x) > 10) {
                this.mesh.rotation.z = -this.touchCurrentPos.x * 0.01;
            }
        }

        // Keyboard Movement Logic
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
