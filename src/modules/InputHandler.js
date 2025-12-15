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

    // Initialize gamepad support
    initGamepadSupport(ship, callbacks);
}

// Gamepad support implementation
function initGamepadSupport(ship, callbacks) {
    let gamepads = {};
    let gamepadConnected = false;
    let gamepadLoopStarted = false;

    // Handle gamepad connection
    window.addEventListener('gamepadconnected', (e) => {
        console.log('Gamepad connected:', e.gamepad.id);
        gamepadConnected = true;
        gamepads[e.gamepad.index] = e.gamepad;
        
        // Start the gamepad loop if not already started
        if (!gamepadLoopStarted) {
            gamepadLoopStarted = true;
            updateGamepads();
        }
        
        // Show gamepad connected notification
        showGamepadNotification('Gamepad Connected!', 'success');
    });

    // Handle gamepad disconnection
    window.addEventListener('gamepaddisconnected', (e) => {
        console.log('Gamepad disconnected:', e.gamepad.id);
        delete gamepads[e.gamepad.index];
        gamepadConnected = Object.keys(gamepads).length > 0;
        
        // Show gamepad disconnected notification
        showGamepadNotification('Gamepad Disconnected', 'warning');
    });

    // Gamepad update loop
    function updateGamepads() {
        // Always run the loop to check for new gamepads
        const freshGamepads = navigator.getGamepads();
        
        for (let i = 0; i < freshGamepads.length; i++) {
            const gamepad = freshGamepads[i];
            if (gamepad && gamepad.connected) {
                gamepads[i] = gamepad;
                gamepadConnected = true;
                processGamepadInput(gamepad, ship, callbacks);
            }
        }

        requestAnimationFrame(updateGamepads);
    }

    // Try to start the gamepad loop immediately in case gamepads are already connected
    const initialGamepads = navigator.getGamepads();
    for (let i = 0; i < initialGamepads.length; i++) {
        if (initialGamepads[i] && initialGamepads[i].connected) {
            gamepadConnected = true;
            gamepads[i] = initialGamepads[i];
            if (!gamepadLoopStarted) {
                gamepadLoopStarted = true;
                updateGamepads();
            }
            break;
        }
    }
}

function processGamepadInput(gamepad, ship, callbacks) {
    // Movement controls (left stick)
    const leftStickX = gamepad.axes[0]; // Horizontal movement
    const leftStickY = gamepad.axes[1]; // Vertical movement
    const deadzone = 0.15; // Deadzone to prevent drift

    // Debug logging
    if (Math.abs(leftStickX) > deadzone || Math.abs(leftStickY) > deadzone) {
        console.log('Gamepad input:', { x: leftStickX, y: leftStickY });
    }

    // Update ship movement based on left stick
    if (Math.abs(leftStickX) > deadzone) {
        ship.gamepadInput.x = leftStickX;
    } else {
        ship.gamepadInput.x = 0;
    }

    if (Math.abs(leftStickY) > deadzone) {
        ship.gamepadInput.y = -leftStickY; // Invert Y for natural feel
    } else {
        ship.gamepadInput.y = 0;
    }

    // Shooting controls
    if (gamepad.buttons[0].pressed) { // A button (usually bottom button)
        ship.shoot();
        console.log('Gamepad shoot button pressed');
    }

    // Pause button (Start button)
    if (gamepad.buttons[9].pressed && !ship.gamepadInput.pausePressed) {
        ship.gamepadInput.pausePressed = true;
        callbacks.onPause();
        console.log('Gamepad pause button pressed');
    } else if (!gamepad.buttons[9].pressed) {
        ship.gamepadInput.pausePressed = false;
    }
}

function showGamepadNotification(message, type) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('gamepad-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'gamepad-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 14px;
            font-weight: bold;
            z-index: 10000;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        document.body.appendChild(notification);
    }

    // Set notification style based on type
    if (type === 'success') {
        notification.style.backgroundColor = '#4CAF50';
        notification.style.color = 'white';
    } else if (type === 'warning') {
        notification.style.backgroundColor = '#FF9800';
        notification.style.color = 'white';
    }

    notification.textContent = message;
    notification.style.opacity = '1';

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}
