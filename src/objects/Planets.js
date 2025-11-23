import * as THREE from 'three';
import planetTextureUrl from '../assets/textures/planet.jpg';
import moonTextureUrl from '../assets/textures/moon.jpg';

export class Planets {
    constructor(scene) {
        this.scene = scene;
        this.planets = [];
        this.spawnRate = 0.002; // Rare
        this.speed = 0.05; // Slow moving background objects essentially

        // Load textures
        const textureLoader = new THREE.TextureLoader();
        const planetTexture = textureLoader.load(planetTextureUrl);
        const moonTexture = textureLoader.load(moonTextureUrl);

        this.planetGeometry = new THREE.SphereGeometry(4, 32, 32);
        this.planetMaterial = new THREE.MeshStandardMaterial({
            map: planetTexture,
            roughness: 0.8,
            metalness: 0.1
        });

        this.moonGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        this.moonMaterial = new THREE.MeshStandardMaterial({
            map: moonTexture,
            roughness: 0.7
        });
    }

    spawnPlanet() {
        const planetGroup = new THREE.Group();

        const planet = new THREE.Mesh(this.planetGeometry, this.planetMaterial);
        planet.userData.type = 'planet';
        planet.userData.gravityRadius = 10; // Reduced from 15
        planet.userData.gravityStrength = 0.04; // Reduced from 0.05
        planetGroup.add(planet);

        // Add Moon
        const moon = new THREE.Mesh(this.moonGeometry, this.moonMaterial);
        moon.position.set(6, 0, 0);
        moon.userData.type = 'moon';
        moon.userData.parentPlanet = planetGroup;
        planetGroup.add(moon);
        planetGroup.userData.moon = moon; // Reference for rotation

        // Random position
        const x = (Math.random() - 0.5) * 40;
        const y = (Math.random() - 0.5) * 20;
        const z = -80;

        planetGroup.position.set(x, y, z);

        this.scene.add(planetGroup);
        this.planets.push(planetGroup);
    }

    update() {
        if (Math.random() < this.spawnRate && this.planets.length < 1) { // Limit to 1 planet at a time for now
            this.spawnPlanet();
        }

        for (let i = this.planets.length - 1; i >= 0; i--) {
            const planetGroup = this.planets[i];

            // Move forward slowly
            planetGroup.position.z += this.speed;

            // Rotate planet
            planetGroup.children[0].rotation.y += 0.005;

            // Orbit moon
            if (planetGroup.userData.moon) {
                const moon = planetGroup.userData.moon;
                const time = Date.now() * 0.001;
                moon.position.x = Math.cos(time) * 6;
                moon.position.z = Math.sin(time) * 6;
            }

            // Remove if behind camera
            if (planetGroup.position.z > 20) {
                this.scene.remove(planetGroup);
                this.planets.splice(i, 1);
            }
        }
    }
}
