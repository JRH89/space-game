# Save/Load Game Feature - HTML Changes Needed

The JavaScript code for save/load functionality has been implemented. You need to add two buttons to your HTML:

## 1. Add "LOAD GAME" button to Main Menu
In `index.html`, find the main menu section (around line 22-30) and add this button after the START button:

```html
<button id="load-btn" style="display: none;">LOAD GAME</button>
```

The complete main menu should look like:
```html
<div id="main-menu" style="display: none;">
    <h1>SPACE GAME</h1>
    <div id="high-score-main">High Score: 0</div>
    <button id="start-btn">START</button>
    <button id="load-btn" style="display: none;">LOAD GAME</button>
    <button id="howto-btn">HOW TO PLAY</button>
    <button id="about-btn">ABOUT</button>
    <button id="credits-btn">CREDITS</button>
    <button id="exit-btn">EXIT</button>
</div>
```

## 2. Add "SAVE GAME" button to Pause Menu
In `index.html`, find the pause menu section (around line 87-93) and add this button after the Resume button:

```html
<button id="save-btn">Save Game</button>
```

The complete pause menu should look like:
```html
<div id="pause-menu" style="display: none;">
    <div class="inner">
        <h1>PAUSED</h1>
        <button id="resume-btn">Resume</button>
        <button id="save-btn">Save Game</button>
        <button id="quit-btn">Quit to Menu</button>
    </div>
</div>
```

## How It Works

- **Save Game**: Press Enter to pause, then click "Save Game" to save your current progress (lives, score, level, health)
- **Load Game**: The "LOAD GAME" button will automatically appear on the main menu when you have a saved game
- **Auto-save notification**: When you save, you'll see a green "GAME SAVED!" message
- **Data stored**: Lives, Score, Level, and Health are all saved to browser localStorage
