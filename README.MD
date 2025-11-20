# Space Game

A fast-paced 3D arcade shooter built with web technologies and Three.js. Pilot a glowing starfighter through deep space, dodge meteors and comets, fight aliens, and surf the gravity wells of giant planets while chasing high scores and power‑ups.

---

## Gameplay Overview

You control a single ship in a forward‑scrolling starfield. Objects stream toward you in 3D: meteors, planets with orbiting moons, alien ships, comets, and collectible power‑ups.

Your goals:

- **Survive** with your limited lives and health bar.  
- **Score big** by shooting threats and chaining kills with power‑ups.  
- **Progress through levels** by hitting score thresholds. Each level adds new enemies or mechanics and ramps difficulty.

### Controls

- **Move**  
  - Arrow keys: `↑`, `↓`, `←`, `→`  
  - Or `W`, `A`, `S`, `D`
- **Shoot**  
  - `Space` – fires your laser (rate can be boosted by power‑ups).
- **Pause / Resume**  
  - `Enter` – toggle pause menu during gameplay.

The ship uses smooth, bounded movement in the play area. Horizontal movement also banks/rolls the model slightly for a more dynamic flight feel.

---

## Scoring

Score is tracked in the HUD and drives both your **level progression** and how satisfying each run feels.

From the code:

- **Meteor destroyed**: `100` points  
- **Alien ship destroyed**: `200` points  
- **Comet destroyed**: `300` points  
- **Moon destroyed**: `500` points

All of these values are additionally multiplied by the current **score multiplier** (see Power‑Ups below).

Score thresholds that advance levels (base values, pre‑multiplier):

- **Level 2**: `1,000` points  
- **Level 3**: `2,500` points  
- **Level 4**: `5,000` points  
- (A value is defined for Level 5 in code at `10,000`, but the core design focuses on four main levels.)

Whenever you cross a threshold, the HUD updates and a big **"LEVEL X!"** notification animates in the center of the screen.

---

## Lives, Health, and Damage

You have **5 lives** at the start of a run.

- **Lives UI**: rendered as a row of life icons in the HUD.  
- **Health**: represented as a percentage (`0–100`). Collisions reduce health; when it hits `0`, you lose a life.

Typical damage values (from collision handling logic):

- **Meteor collision**: −25 health  
- **Alien collision**: −30 health  
- **Comet collision**: −40 health  
- **Planet crash**: sets health directly to `0` (essentially instant death)

When health reaches `0`:

1. The ship explodes and becomes invisible briefly.  
2. After a short delay, `loseLife()` runs, decrementing your lives and resetting state as appropriate.  
3. Running out of lives triggers game over and the **Game Over** UI screen.

---

## Power-Ups

Throughout the run, glowing 3D power‑ups drift toward you. Picking them up can save a doomed run or supercharge your score.

Power‑ups are spawned at a low rate and limited on‑screen at once to keep them meaningful. Each one has its own color/shape language and effect:

- **Extra Life** (`extraLife`)  
  - Color: cyan/teal.  
  - Effect: `+1` life, immediately reflected in the lives UI.

- **Health Pack** (`health`)  
  - Color: green.  
  - Effect: restores `+25` health, capped at `100`.

- **Shield** (`shield`)  
  - Color: blue sphere.  
  - Effect: temporary invincibility (~5 seconds).  
  - While active:  
    - Collisions do not damage you.  
    - **"SHIELD ACTIVE"** appears in the power‑up HUD.

- **Rapid Fire** (`rapidFire`)  
  - Color: orange tetrahedron.  
  - Effect: dramatically reduces the ship’s `fireRate` (e.g., from `400ms` to `100ms` between shots) for ~5 seconds.  
  - Displays **"RAPID FIRE"** in the power‑up HUD.

- **Score Multiplier** (`scoreMultiplier`)  
  - Color: yellow.  
  - Effect: doubles your global `scoreMultiplier` to `2x` for ~10 seconds.  
  - All points (meteors, aliens, comets, moons) are doubled while active.  
  - Displays **"2X SCORE"** in the power‑up HUD.

All timed power‑ups:

- Store their expiry timestamps.  
- Show a clear text indicator under a small Power‑Ups HUD container.  
- Automatically revert and remove their indicators when time runs out.

---

## Levels & Progression

The game uses dynamic difficulty based on your score. Internally, a `level` variable and score thresholds drive when new content is introduced.

### Level 1 – Core Space Gauntlet

- **Enemies/Objects**:  
  - Starfield background.  
  - Constant stream of meteors.  
  - Planets with orbiting moons and gravity.
- **Mechanics**:  
  - Learn movement and shooting.  
  - Gravity fields gently pull the ship toward planets when you’re in range.  
  - Moons orbit around planets and can be targeted.
- **Strategy**:  
  - Farm meteors (`100` pts each).  
  - Practice dodging and recognizing gravity zones.  
  - Use planets and moons to get used to the 3D space and depth perception.

### Level 2 – Alien Threat

Unlocked at **1,000+ points**.

- **New elements**:  
  - Alien ships spawn and move through the play area.
- **Scoring**:  
  - Aliens are worth `200` points each (before multipliers).
- **Impact**:  
  - You now have to track both inert threats (meteors) and active ones (aliens).  
  - Collisions with aliens deal extra damage compared to meteors.
- **Strategy**:  
  - Prioritize aliens when they overlap with other hazards.  
  - Power‑ups like shield and health become more valuable.

### Level 3 – Comet Storm

Unlocked at **2,500+ points**.

- **New elements**:  
  - Comets spawn, usually faster and more dangerous than regular meteors.
- **Scoring**:  
  - Comets are worth `300` points each.
- **Impact**:  
  - Much higher object density and velocity.  
  - Navigating safely while also aiming at high‑value targets becomes tough.
- **Strategy**:  
  - Combine Rapid Fire with Score Multiplier for big bursts of points.  
  - Avoid direct hits: comets deal significant health damage.

### Level 4 – Full Chaos / Endgame Loop

Unlocked at **5,000+ points**.

- **Environment**:  
  - All prior content is active: meteors, planets + moons, aliens, comets, and power‑ups.
- **Game Loop**:  
  - Difficulty continues to scale via spawn rates and object density.  
  - Level 4 is effectively the core loop where the game keeps you on the edge.
- **Strategy**:  
  - Runs become about endurance and maximizing power‑up uptime.  
  - Score runs rely heavily on chaining multipliers and staying alive under pressure.

(There is a Level 5 threshold in the code, but the core experience and balancing is centered around the first four levels above.)

---

## Core Systems & Implementation

### Tech Stack

- **Language**: JavaScript (ES modules)  
- **Rendering**: [Three.js](https://threejs.org/)  
- **Models and Assets**:  
  - OBJ/MTL ship model loaded via `OBJLoader` + `MTLLoader`.  
  - Materials tweaked to be emissive for a glowy, arcade look.  
- **UI / DOM**:  
  - HTML elements for score, lives, health bar, power‑up indicators, game over screen, pause menu, and main menu.

### Project Structure (High Level)

Typical core files (based on the current codebase):

- `index.html` – Base page, canvas, menus, and UI containers.  
- `src/main.js` – Game initialization, render loop, level logic, scoring, collision detection, and power‑up activation.  
- `src/objects/Ship.js` – Player ship model, controls, movement, and shooting.  
- `src/objects/PowerUps.js` – Spawning, updating, and collecting power‑up objects.  
- Additional object modules (not all shown above) such as meteors, planets, aliens, comets, lasers, explosions, starfield, etc.

### Game Loop & Rendering

- Uses `requestAnimationFrame` (`animate()` function) to:  
  - Skip updates when the game is paused or over.  
  - Update all active game objects each frame.  
  - Apply planet gravity.  
  - Run collision detection.  
  - Render the Three.js scene and camera.
- The ship is placed at or near `z = 0` and things stream from negative `z` toward the camera to create motion.

### Input Handling

- Global `keydown` / `keyup` listeners on `window`.  
- Movement keys set boolean flags in the ship, processed every frame in `update()`.  
- Spacebar is handled on `keydown` to call `ship.shoot()` while respecting `fireRate`.  
- Enter toggles an `isPaused` flag and shows/hides the pause menu.

---

## Building the Game

This project was built as a custom Three.js arcade shooter rather than relying on a full game engine.

### Key Design Goals

- **Arcade feel**:  
  - Instant response to movement and shooting.  
  - Clear, juicy feedback: explosions on every kill, emissive/glowing materials, starfield motion.
- **Simple but deep loop**:  
  - One core action (aim + shoot), layered with:  
    - Gravity mechanics (planets + moons).  
    - Multiple enemy types and damage values.  
    - Score‑driven level progression and power‑ups.

### Visual & Interaction Choices

- **Ship model**:  
  - Loaded from an external OBJ with MTL materials.  
  - Materials made emissive to give the ship a glow effect.  
  - Extra point light attached in front of the ship to highlight it in the scene.
- **Boundaries**:  
  - Clamps horizontal/vertical movement so you can’t leave the playable area.
- **Gravity around planets**:  
  - Each planet has a `gravityRadius` and `gravityStrength`.  
  - When the ship is inside the radius, a normalized direction vector pulls the ship toward the planet, giving a gravity‑well effect.