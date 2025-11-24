import * as THREE from 'three';

export function applyGravity(ship, planets) {
    const shipMesh = ship.mesh;

    for (const planetGroup of planets.planets) {
        const planet = planetGroup.children[0]; // First child is planet mesh

        // Calculate distance
        const distance = shipMesh.position.distanceTo(planetGroup.position);

        if (distance < planet.userData.gravityRadius) {
            // Pull ship towards planet
            const direction = new THREE.Vector3().subVectors(planetGroup.position, shipMesh.position).normalize();
            shipMesh.position.add(direction.multiplyScalar(planet.userData.gravityStrength));
        }
    }
}

export function checkCollisions({
    scene,
    ship,
    lasers,
    meteors,
    aliens,
    comets,
    planets,
    powerUps,
    explosions,
    gameState,
    callbacks
}) {
    const laserList = lasers.lasers;
    const meteorList = meteors.meteors;
    const alienList = aliens.aliens;
    const cometList = comets.comets;
    const planetList = planets.planets;
    const shipMesh = ship.mesh;

    // Lasers vs Meteors & Aliens & Comets & Moons
    for (let i = laserList.length - 1; i >= 0; i--) {
        const laser = laserList[i];
        const laserBox = new THREE.Box3().setFromObject(laser);
        let laserHit = false;

        // Check Meteors
        for (let j = meteorList.length - 1; j >= 0; j--) {
            const meteor = meteorList[j];
            const meteorBox = new THREE.Box3().setFromObject(meteor);
            meteorBox.expandByScalar(-0.3); // Tighten collision

            if (laserBox.intersectsBox(meteorBox)) {
                explosions.explode(meteor.position);
                scene.remove(laser);
                scene.remove(meteor);
                laserList.splice(i, 1);
                meteorList.splice(j, 1);
                callbacks.onScore(100);
                laserHit = true;
                break;
            }
        }
        if (laserHit) continue;

        // Check Aliens
        for (let k = alienList.length - 1; k >= 0; k--) {
            const alien = alienList[k];
            const alienBox = new THREE.Box3().setFromObject(alien);
            alienBox.expandByScalar(-0.4); // Tighten collision

            if (laserBox.intersectsBox(alienBox)) {
                explosions.explode(alien.position);
                scene.remove(laser);
                scene.remove(alien);
                laserList.splice(i, 1);
                alienList.splice(k, 1);
                callbacks.onScore(200);
                laserHit = true;
                break;
            }
        }
        if (laserHit) continue;

        // Check Comets
        for (let l = cometList.length - 1; l >= 0; l--) {
            const comet = cometList[l];
            const cometBox = new THREE.Box3().setFromObject(comet);

            if (laserBox.intersectsBox(cometBox)) {
                explosions.explode(comet.position);
                scene.remove(laser);
                scene.remove(comet);
                laserList.splice(i, 1);
                cometList.splice(l, 1);
                callbacks.onScore(300);
                laserHit = true;
                break;
            }
        }
        if (laserHit) continue;

        // Check Moons
        for (let m = 0; m < planetList.length; m++) {
            const planetGroup = planetList[m];
            const moon = planetGroup.userData.moon;

            if (moon) {
                // Need world position for collision check since moon is child of planetGroup
                const moonWorldPos = new THREE.Vector3();
                moon.getWorldPosition(moonWorldPos);
                const moonBox = new THREE.Box3().setFromCenterAndSize(moonWorldPos, new THREE.Vector3(1.6, 1.6, 1.6)); // Approx size

                if (laserBox.intersectsBox(moonBox)) {
                    explosions.explode(moonWorldPos);
                    scene.remove(laser);
                    planetGroup.remove(moon);
                    planetGroup.userData.moon = null; // Remove reference

                    laserList.splice(i, 1);
                    callbacks.onScore(500);
                    laserHit = true;

                    // Disable gravity for this planet if moon destroyed
                    planetGroup.children[0].userData.gravityStrength = 0;

                    break;
                }
            }
        }
    }

    // Ship vs Meteors & Aliens & Comets & Planets
    const shipBox = new THREE.Box3().setFromObject(shipMesh);
    shipBox.expandByScalar(-0.2);

    // Check Meteors
    for (let i = meteorList.length - 1; i >= 0; i--) {
        const meteor = meteorList[i];
        const meteorBox = new THREE.Box3().setFromObject(meteor);
        meteorBox.expandByScalar(-0.3); // Tighten collision

        if (shipBox.intersectsBox(meteorBox) && !gameState.isInvincible) {
            explosions.explode(shipMesh.position);
            scene.remove(meteor);
            meteorList.splice(i, 1);

            // Reduce health
            callbacks.onDamage(25);
        }
    }

    // Check Aliens
    for (let i = alienList.length - 1; i >= 0; i--) {
        const alien = alienList[i];
        const alienBox = new THREE.Box3().setFromObject(alien);
        alienBox.expandByScalar(-0.5); // Tighten collision

        if (shipBox.intersectsBox(alienBox) && !gameState.isInvincible) {
            explosions.explode(shipMesh.position);
            scene.remove(alien);
            alienList.splice(i, 1);

            // Reduce health
            callbacks.onDamage(30);
        }
    }

    // Check Comets
    for (let i = cometList.length - 1; i >= 0; i--) {
        const comet = cometList[i];
        const cometBox = new THREE.Box3().setFromObject(comet);
        cometBox.expandByScalar(-0.3); // Tighten collision

        if (shipBox.intersectsBox(cometBox) && !gameState.isInvincible) {
            explosions.explode(shipMesh.position);
            scene.remove(comet);
            cometList.splice(i, 1);

            // Reduce health
            callbacks.onDamage(40);
        }
    }

    // Check Planets (Crash)
    for (let i = 0; i < planetList.length; i++) {
        const planetGroup = planetList[i];
        const planet = planetGroup.children[0];
        const planetWorldPos = new THREE.Vector3();
        planet.getWorldPosition(planetWorldPos);

        // Reduced collision radius - gives more time to destroy moon before crash
        if (shipMesh.position.distanceTo(planetWorldPos) < 3.2) { // Smaller = more time
            explosions.explode(shipMesh.position);

            // Reduce health massively
            callbacks.onDamage(1000); // Instant kill essentially
        }
    }

    // Check Power-ups
    for (let i = powerUps.powerups.length - 1; i >= 0; i--) {
        const powerUp = powerUps.powerups[i];
        const powerUpBox = new THREE.Box3().setFromObject(powerUp);

        if (shipBox.intersectsBox(powerUpBox)) {
            const type = powerUps.collect(powerUp);
            callbacks.onPowerUp(type);
        }
    }
}
