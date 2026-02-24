/**
 * main.js — Bootstrap
 * Initialises the scene, then runs the boot sequence on the monitor screen,
 * then reveals the desktop.
 */

(function () {

  function init() {
    // 1. Start Three.js scene (monitor is visible immediately)
    Scene.init();

    // 2. Show boot screen on the monitor
    runBootSequence(() => {
      // 3. After boot → show desktop
      revealDesktop();
    });
  }

  // ── BOOT SEQUENCE ON MONITOR ──────────────────────────────
  function runBootSequence(onComplete) {
    const bootScreen = document.getElementById('boot-screen');
    bootScreen.innerHTML = ''; // clear
    bootScreen.style.display = 'flex';

    const lines = SITE_DATA.bootLines;
    let i = 0;

    function addLine() {
      if (i >= lines.length) {
        // Done — wait a moment then fade out
        setTimeout(() => {
          bootScreen.classList.add('hidden');
          setTimeout(onComplete, 350);
        }, 500);
        return;
      }

      const el = document.createElement('div');
      el.className = 'boot-line';
      if (i === lines.length - 1) el.classList.add('cursor');
      if (lines[i].includes('OK') || lines[i].includes('starting')) el.classList.add('ok');
      if (lines[i].includes('//') || lines[i].includes('PSX')) el.classList.add('dim');
      el.textContent = lines[i];
      el.style.animationDelay = '0s';
      bootScreen.appendChild(el);
      i++;

      setTimeout(addLine, 170 + Math.random() * 80);
    }

    addLine();
  }

  // ── REVEAL DESKTOP ────────────────────────────────────────
  function revealDesktop() {
    const bootScreen = document.getElementById('boot-screen');
    // Remove from DOM after fade animation
    bootScreen.addEventListener('animationend', () => {
      bootScreen.style.display = 'none';
    }, { once: true });

    const desktop = document.getElementById('desktop');
    desktop.classList.add('visible');

    // Initialise subsystems now that desktop is live
    Windows.init();
    ProjectApp.init();
    Desktop.init();
  }

  // ── GLOBAL UTILITY ────────────────────────────────────────
  window.showToast = function (msg) { Desktop.showToast(msg); };

  // Run on load
  window.addEventListener('load', init);

})();
