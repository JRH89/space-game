// Lightweight bootstrap to control when the main Three.js game loads

const introContainer = document.getElementById('intro-container');
const introVideo = document.getElementById('intro-video');
const mainMenu = document.getElementById('main-menu');

function showMenu() {
  if (introContainer) introContainer.style.display = 'none';
  if (mainMenu) mainMenu.style.display = 'flex';
}

function loadGameScript() {
  // Avoid loading multiple times
  if (document.querySelector('script[data-game-loaded="true"]')) return;

  const script = document.createElement('script');
  script.type = 'module';
  script.src = './src/main.js';
  script.dataset.gameLoaded = 'true';
  document.body.appendChild(script);
}

// Handle intro video flow
if (introVideo) {
  // If the video can play, wait for it to end, then show menu + load game
  introVideo.onended = () => {
    showMenu();
    loadGameScript();
  };

  // Start playback. If autoplay is blocked, fall back to showing menu and loading game once user interacts.
  introVideo.play().catch(() => {
    // Autoplay blocked: show menu immediately but do NOT load game yet.
    showMenu();
  });

  // On first user interaction, if game hasn't been loaded yet, load it.
  window.addEventListener(
    'click',
    () => {
      loadGameScript();
    },
    { once: true }
  );
} else {
  // No video element: just show menu and load game immediately
  showMenu();
  loadGameScript();
}
