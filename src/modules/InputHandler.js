export function initInput(camera, renderer, ship, callbacks) {
    // Handle Enter key for pause
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Enter') {
            callbacks.onPause();
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        const aspect = window.innerWidth / window.innerHeight;
        camera.aspect = aspect;

        // Adjust FOV for portrait mode (mobile devices)
        if (aspect < 1) {
            // Portrait mode - increase FOV to show more of the scene
            camera.fov = 75 + (1 - aspect) * 20; // Gradually increase FOV for narrower screens
        } else {
            // Landscape mode - use default FOV
            camera.fov = 75;
        }

        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Update ship scale for responsive sizing
        if (ship && ship.updateScale) {
            ship.updateScale();
        }
    });

    // Mobile shoot button
    const shootButton = document.getElementById('shoot-button');
    if (shootButton) {
        shootButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            ship.shoot();
        });

        // Also support click for testing on desktop
        shootButton.addEventListener('click', (e) => {
            e.preventDefault();
            ship.shoot();
        });
    }
}
