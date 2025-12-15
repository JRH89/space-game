import * as THREE from 'three';

export class PowerUps {
    constructor(scene) {
        this.scene = scene;
        this.powerups = [];
        this.spawnRate = 0.003; // Low spawn rate

        // Power-up types with colors and geometries
        this.types = {
            extraLife: {
                color: 0x00ffcc,
                geometry: new THREE.ConeGeometry(0.3, 0.6, 5),
                effect: 'extraLife'
            },
            health: {
                color: 0x00ff00,
                geometry: new THREE.BoxGeometry(0.5, 0.5, 0.1),
                effect: 'health'
            },
            shield: {
                color: 0x0088ff,
                geometry: new THREE.SphereGeometry(0.4, 16, 16),
                effect: 'shield'
            },
            rapidFire: {
                color: 0xff8800,
                geometry: new THREE.TetrahedronGeometry(0.4),
                effect: 'rapidFire'
            },
            scoreMultiplier: {
                color: 0xffdd00,
                geometry: new THREE.OctahedronGeometry(0.4),
                effect: 'scoreMultiplier'
            },
            hyperspace: {
                color: 0xff00ff, // Magenta
                geometry: new THREE.TorusKnotGeometry(0.25, 0.1, 64, 8),
                effect: 'hyperspace'
            }
        };
    }

    spawnPowerUp() {
        // Randomly select a power-up type
        const typeKeys = Object.keys(this.types);
        const randomType = typeKeys[Math.floor(Math.random() * typeKeys.length)];
        const powerUpData = this.types[randomType];

        // Create glowing material
        const material = new THREE.MeshStandardMaterial({
            color: powerUpData.color,
            emissive: powerUpData.color,
            emissiveIntensity: 0.5,
            metalness: 0.3,
            roughness: 0.3
        });

        const powerUp = new THREE.Mesh(powerUpData.geometry, material);

        // Random position
        const x = (Math.random() - 0.5) * 20;
        const y = (Math.random() - 0.5) * 10;
        const z = -50;

        powerUp.position.set(x, y, z);
        powerUp.userData.type = powerUpData.effect;
        powerUp.userData.rotationSpeed = Math.random() * 0.02 + 0.01;

        this.scene.add(powerUp);
        this.powerups.push(powerUp);
    }

    update() {
        // Spawn new power-ups
        if (Math.random() < this.spawnRate && this.powerups.length < 3) {
            this.spawnPowerUp();
        }

        // Update existing power-ups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerUp = this.powerups[i];

            // Move forward
            powerUp.position.z += 0.15;

            // Rotate for visual effect
            powerUp.rotation.x += powerUp.userData.rotationSpeed;
            powerUp.rotation.y += powerUp.userData.rotationSpeed * 1.5;

            // Remove if past camera
            if (powerUp.position.z > 10) {
                this.scene.remove(powerUp);
                this.powerups.splice(i, 1);
            }
        }
    }

    collect(powerUp) {
        const index = this.powerups.indexOf(powerUp);
        if (index > -1) {
            this.scene.remove(powerUp);
            this.powerups.splice(index, 1);
            return powerUp.userData.type;
        }
        return null;
    }
}
