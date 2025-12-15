/**
 * AudioManager - Handles all game sound effects and music
 * Follows C.O.R.E. principles: lightweight, minimal dependencies
 */

class AudioManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;
        this.audioContext = null;
        this.initialized = false;
    }

    /**
     * Initialize audio system (call after user interaction)
     */
    async init() {
        if (this.initialized) return;
        
        try {
            // Create audio context on first user interaction
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Load all sound files
            await this.loadSounds();
            
            this.initialized = true;
            console.log('AudioManager initialized');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
            this.enabled = false;
        }
    }

    /**
     * Load all sound files
     */
    async loadSounds() {
        const soundFiles = {
            laser: '/sounds/laser.mp3',
            explosion: '/sounds/explosion.mp3',
            levelup: '/sounds/levelup.mp3',
            powerup: '/sounds/powerup.mp3'
        };

        for (const [name, path] of Object.entries(soundFiles)) {
            try {
                const audio = new Audio(path);
                audio.volume = this.volume;
                await audio.load();
                this.sounds[name] = audio;
            } catch (error) {
                console.warn(`Failed to load sound ${name}:`, error);
            }
        }
    }

    /**
     * Play a sound effect
     * @param {string} soundName - Name of the sound to play
     * @param {number} volume - Optional volume override (0-1)
     */
    play(soundName, volume = null) {
        if (!this.enabled || !this.initialized) return;
        
        const sound = this.sounds[soundName];
        if (!sound) {
            console.warn(`Sound not found: ${soundName}`);
            return;
        }

        try {
            // Clone the audio to allow overlapping sounds
            const audioClone = sound.cloneNode();
            audioClone.volume = volume !== null ? volume : this.volume;
            
            // Play the sound
            const playPromise = audioClone.play();
            
            // Handle autoplay policy
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`Audio play failed for ${soundName}:`, error);
                });
            }
        } catch (error) {
            console.warn(`Error playing sound ${soundName}:`, error);
        }
    }

    /**
     * Set master volume
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Update volume for all loaded sounds
        for (const sound of Object.values(this.sounds)) {
            sound.volume = this.volume;
        }
    }

    /**
     * Enable/disable all sounds
     * @param {boolean} enabled - Whether sounds should play
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Resume audio context if suspended (for autoplay policies)
     */
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
}

// Create singleton instance
export const audioManager = new AudioManager();

// Convenience functions for direct access
export const playSound = (soundName, volume = null) => audioManager.play(soundName, volume);
export const setVolume = (volume) => audioManager.setVolume(volume);
export const setAudioEnabled = (enabled) => audioManager.setEnabled(enabled);
export const initAudio = () => audioManager.init();
