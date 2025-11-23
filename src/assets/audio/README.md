# Audio Assets Structure

This directory contains all audio assets for the space shooter game.

## Directory Structure

### 📁 `music/`
Background music and soundtracks
- `menu-theme.mp3` - Main menu background music
- `level-1-theme.mp3` - Level 1 gameplay music
- `level-2-theme.mp3` - Level 2 gameplay music
- `boss-theme.mp3` - Boss battle music
- `game-over-theme.mp3` - Game over screen music
- `victory-theme.mp3` - Victory/level complete music

### 📁 `sfx/weapons/`
Weapon and shooting sounds
- `laser-shot.mp3` - Player laser firing sound
- `laser-shot-alt.mp3` - Alternative laser sound (for variety)
- `rapid-fire.mp3` - Rapid fire weapon sound
- `missile-launch.mp3` - Missile/rocket launch sound
- `weapon-charge.mp3` - Weapon charging sound

### 📁 `sfx/explosions/`
Explosion and destruction sounds
- `explosion-small.mp3` - Small meteor/enemy explosion
- `explosion-medium.mp3` - Medium explosion
- `explosion-large.mp3` - Large explosion (boss, big meteors)
- `player-explosion.mp3` - Player ship destruction

### 📁 `sfx/enemies/`
Enemy-specific sounds
- `ufo-beep.mp3` - UFO movement/detection beep
- `ufo-boop.mp3` - UFO secondary sound
- `enemy-laser.mp3` - Enemy weapon fire
- `boss-roar.mp3` - Boss appearance/attack sound

### 📁 `sfx/player/`
Player ship sounds
- `player-death.mp3` - Player death sound (separate from explosion)
- `ship-engine.mp3` - Continuous engine hum (loopable)
- `shield-hit.mp3` - Shield taking damage
- `shield-down.mp3` - Shield depleted warning

### 📁 `sfx/powerups/`
Power-up and collectible sounds
- `powerup-collect.mp3` - Generic power-up collection
- `health-pickup.mp3` - Health/life restoration
- `weapon-upgrade.mp3` - Weapon upgrade pickup
- `shield-pickup.mp3` - Shield power-up
- `score-bonus.mp3` - Bonus points collection

### 📁 `sfx/ui/`
User interface sounds
- `menu-click.mp3` - Menu button click
- `menu-hover.mp3` - Menu button hover
- `menu-back.mp3` - Back/cancel button
- `pause.mp3` - Game pause sound
- `unpause.mp3` - Game resume sound
- `level-complete.mp3` - Level completion sound
- `game-over.mp3` - Game over sound

### 📁 `sfx/environment/`
Environmental and ambient sounds
- `comet-whoosh.mp3` - Comet/meteor passing sound
- `meteor-impact.mp3` - Meteor hitting something
- `level-start.mp3` - Level transition/start
- `warning-alarm.mp3` - Danger/warning sound
- `warp-jump.mp3` - Level transition warp effect

## Audio Format Recommendations

- **Format**: MP3 or OGG for broad browser compatibility
- **Sample Rate**: 44.1kHz
- **Bit Rate**: 128-192 kbps for music, 96-128 kbps for SFX
- **Channels**: Stereo for music, mono for most SFX

## Implementation Notes

1. Use Web Audio API for better control and performance
2. Preload critical sounds (weapons, explosions) during game load
3. Implement volume controls for music and SFX separately
4. Consider using audio sprites for small, frequently-used sounds
5. Add mute/unmute functionality
6. Loop background music seamlessly

## File Naming Convention

- Use lowercase with hyphens
- Be descriptive but concise
- Group related sounds with prefixes when applicable
- Use consistent file extensions (.mp3 recommended)
