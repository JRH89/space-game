import * as THREE from 'three';

export class Starfield {
    constructor(scene, count = 2000) {
        this.scene = scene;
        this.count = count;
        this.geometry = new THREE.BufferGeometry();
        this.baseSpeed = 0.2;
        this.currentSpeed = this.baseSpeed;
        this.hyperspeedMode = false;
        this.hyperspeedIntensity = 0;
        this.streakLines = [];

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

        // Create streak material for hyperspeed effect
        this.streakMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending
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
        // Update hyperspeed intensity
        if (this.hyperspeedMode) {
            this.hyperspeedIntensity = Math.min(1, this.hyperspeedIntensity + 0.05);
            this.currentSpeed = this.baseSpeed + (this.hyperspeedIntensity * 4); // Max 5x speed
        } else {
            this.hyperspeedIntensity = Math.max(0, this.hyperspeedIntensity - 0.05);
            this.currentSpeed = this.baseSpeed + (this.hyperspeedIntensity * 4);
        }

        // Update star positions
        const positions = this.geometry.attributes.position.array;

        for (let i = 0; i < this.count; i++) {
            // Move z coordinate with current speed
            positions[i * 3 + 2] += this.currentSpeed;

            // Reset if behind camera
            if (positions[i * 3 + 2] > 5) {
                positions[i * 3 + 2] = -50;
                // Randomize x,y for variety
                positions[i * 3] = (Math.random() - 0.5) * 100;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            }
        }

        this.geometry.attributes.position.needsUpdate = true;

        // Update visual effects for hyperspeed
        this.updateHyperspeedEffects();
    }

    updateHyperspeedEffects() {
        // Adjust star size and opacity based on hyperspeed
        const targetSize = this.hyperspeedMode ? 0.3 : 0.1;
        const targetOpacity = this.hyperspeedMode ? 1.0 : 0.85;
        
        this.material.size += (targetSize - this.material.size) * 0.1;
        this.material.opacity += (targetOpacity - this.material.opacity) * 0.1;

        // Create motion streaks during hyperspeed
        if (this.hyperspeedIntensity > 0.3) {
            this.createMotionStreaks();
        } else {
            this.clearMotionStreaks();
        }

        // Update streak opacity
        this.streakMaterial.opacity = this.hyperspeedIntensity * 0.6;
    }

    createMotionStreaks() {
        // Clear old streaks
        this.clearMotionStreaks();

        // Create new streak lines for some stars
        const positions = this.geometry.attributes.position.array;
        const streakCount = Math.floor(this.count * 0.1); // 10% of stars get streaks

        for (let i = 0; i < streakCount; i++) {
            const starIndex = Math.floor(Math.random() * this.count);
            const x = positions[starIndex * 3];
            const y = positions[starIndex * 3 + 1];
            const z = positions[starIndex * 3 + 2];

            // Create line geometry for streak
            const streakGeometry = new THREE.BufferGeometry();
            const streakPositions = new Float32Array(6); // 2 points * 3 coordinates
            
            // Start point (current star position)
            streakPositions[0] = x;
            streakPositions[1] = y;
            streakPositions[2] = z;
            
            // End point (trailing behind)
            streakPositions[3] = x;
            streakPositions[4] = y;
            streakPositions[5] = z - (this.currentSpeed * 10); // Trail length based on speed

            streakGeometry.setAttribute('position', new THREE.BufferAttribute(streakPositions, 3));
            
            const streakLine = new THREE.Line(streakGeometry, this.streakMaterial);
            this.scene.add(streakLine);
            this.streakLines.push(streakLine);
        }
    }

    clearMotionStreaks() {
        // Remove all streak lines
        for (const streak of this.streakLines) {
            this.scene.remove(streak);
            streak.geometry.dispose();
        }
        this.streakLines = [];
    }

    setHyperspeedMode(enabled) {
        this.hyperspeedMode = enabled;
    }
}
