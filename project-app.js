/**
 * project-app.js — project.exe
 * Full-screen application running on the monitor.
 * States: EMPTY → PREVIEW (click icon) → INFO (click same icon again) → PREVIEW (click again)
 */

const ProjectApp = (() => {

  let isOpen = false;
  let selectedKey = null;  // currently selected project
  let state = 'empty';     // 'empty' | 'preview' | 'info'
  let previewAnimId = null;

  // ── INIT ─────────────────────────────────────────────────
  function init() {
    _buildDOM();
  }

  function _buildDOM() {
    const app = document.getElementById('project-app');

    // ── Empty state
    const empty = document.createElement('div');
    empty.id = 'project-empty';
    empty.innerHTML = `
      <div class="empty-title">PROJECT.EXE</div>
      <div class="empty-sub">Select a project from the void.<span class="blink-cursor">█</span></div>
    `;

    // ── Preview state
    const preview = document.createElement('div');
    preview.id = 'project-preview';
    preview.innerHTML = `
      <div id="preview-canvas-wrap">
        <canvas id="preview-canvas"></canvas>
      </div>
      <div id="project-preview-bar">
        <span id="preview-project-title">—</span>
        <span class="preview-hint">[ CLICK ICON AGAIN FOR INFO ]</span>
      </div>
    `;

    // ── Info state
    const info = document.createElement('div');
    info.id = 'project-info';

    app.querySelector('#project-app-body').appendChild(empty);
    app.querySelector('#project-app-body').appendChild(preview);
    app.querySelector('#project-app-body').appendChild(info);

    // Titlebar close/minimise
    document.querySelector('.app-btn[data-action="close"]').onclick = close;
    document.querySelector('.app-btn[data-action="min"]').onclick   = minimise;
  }

  // ── OPEN / CLOSE ─────────────────────────────────────────
  function open() {
    const app = document.getElementById('project-app');
    app.classList.add('open');
    isOpen = true;
    Desktop.showVoidIcons(true);
    Desktop.setTaskbarRunning('icon-projects', true);
    _setState('empty');
  }

  function close() {
    const app = document.getElementById('project-app');
    app.classList.remove('open');
    isOpen = false;
    selectedKey = null;
    Desktop.showVoidIcons(false);
    Desktop.setTaskbarRunning('icon-projects', false);
    _cancelPreview();
    // Deselect all void icons
    document.querySelectorAll('.void-icon').forEach(e => e.classList.remove('selected'));
  }

  function minimise() {
    close();
  }

  function toggle() {
    if (isOpen) close(); else open();
  }

  // ── SELECT PROJECT (called by void icon click) ────────────
  function selectProject(key) {
    if (!isOpen) return;

    if (selectedKey === key) {
      // Same icon clicked again → toggle between preview and info
      if (state === 'preview') {
        _setState('info', key);
      } else if (state === 'info') {
        _setState('preview', key);
      }
    } else {
      // New project selected → show preview
      selectedKey = key;
      // Update void icon selection highlight
      document.querySelectorAll('.void-icon').forEach(el => {
        el.classList.toggle('selected', el.id === 'void-icon-' + key);
      });
      _setState('preview', key);
    }
  }

  // ── STATE MACHINE ────────────────────────────────────────
  function _setState(newState, key) {
    state = newState;
    if (key) selectedKey = key;

    document.getElementById('project-empty').style.display   = 'none';
    document.getElementById('project-preview').style.display = 'none';
    document.getElementById('project-info').style.display    = 'none';

    if (state === 'empty') {
      document.getElementById('project-empty').style.display = 'flex';
      _cancelPreview();

    } else if (state === 'preview') {
      document.getElementById('project-preview').style.display = 'flex';
      _startPreview(selectedKey);

    } else if (state === 'info') {
      document.getElementById('project-info').style.display = 'flex';
      _cancelPreview();
      _buildInfo(selectedKey);
    }
  }

  // ── PREVIEW ANIMATIONS ────────────────────────────────────
  function _startPreview(key) {
    _cancelPreview();
    const proj = SITE_DATA.projects.find(p => p.key === key);
    if (!proj) return;

    document.getElementById('preview-project-title').textContent = proj.title + ' · ' + proj.type;

    const canvas = document.getElementById('preview-canvas');
    const wrap   = document.getElementById('preview-canvas-wrap');

    // Resize canvas to wrap
    const resize = () => {
      canvas.width  = wrap.clientWidth;
      canvas.height = wrap.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    canvas._resizeFn = resize;

    const ctx = canvas.getContext('2d');
    const renderers = {
      platformer: renderPlatformer,
      horror:     renderHorror,
      corridor:   renderCorridor,
      brand:      renderBrand,
    };
    const fn = renderers[proj.previewType] || renderPlatformer;
    let frame = 0;

    function loop() {
      previewAnimId = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      fn(ctx, canvas.width, canvas.height, frame);
      frame++;
    }
    loop();
  }

  function _cancelPreview() {
    if (previewAnimId) { cancelAnimationFrame(previewAnimId); previewAnimId = null; }
    const canvas = document.getElementById('preview-canvas');
    if (canvas?._resizeFn) {
      window.removeEventListener('resize', canvas._resizeFn);
      canvas._resizeFn = null;
    }
  }

  // ── PREVIEW: PLATFORMER (VOID_RUNNER) ────────────────────
  function renderPlatformer(ctx, W, H, f) {
    // PSX low-res feel: render at 1/3 resolution then scale up
    const SW = Math.floor(W / 3), SH = Math.floor(H / 3);
    const offscreen = document.createElement('canvas');
    offscreen.width = SW; offscreen.height = SH;
    const g = offscreen.getContext('2d');

    // Sky — dark void gradient
    const sky = g.createLinearGradient(0, 0, 0, SH);
    sky.addColorStop(0, '#000');
    sky.addColorStop(1, '#020d04');
    g.fillStyle = sky;
    g.fillRect(0, 0, SW, SH);

    // Scanline-style ground
    g.fillStyle = '#0a1f0d';
    g.fillRect(0, SH - 12, SW, 12);
    g.fillStyle = '#39ff5a22';
    for (let x = 0; x < SW; x += 4) {
      g.fillRect(x, SH - 12, 1, 12);
    }

    // Platforms (scrolling)
    const platforms = [
      { x: 5,  y: SH - 24, w: 18, h: 3 },
      { x: 28, y: SH - 32, w: 14, h: 3 },
      { x: 50, y: SH - 22, w: 20, h: 3 },
      { x: 72, y: SH - 38, w: 12, h: 3 },
    ];
    const scroll = (f * 0.5) % SW;
    platforms.forEach(p => {
      const px = ((p.x - scroll % SW) + SW) % SW;
      g.fillStyle = '#39ff5a';
      g.fillRect(px, p.y, p.w, p.h);
      // Platform glow
      g.fillStyle = '#39ff5a22';
      g.fillRect(px - 1, p.y + p.h, p.w + 2, 2);
    });

    // Character — simple 4x6 pixel sprite
    const charX = Math.floor(SW * 0.35);
    const bounceY = SH - 26 + Math.round(Math.sin(f * 0.18) * 5);
    const sprite = [
      [0,1,1,0],
      [1,1,1,1],
      [0,1,1,0],
      [1,0,0,1],
      [1,0,0,1],
      [1,0,0,1],
    ];
    sprite.forEach((row, r) => row.forEach((px, c) => {
      if (px) { g.fillStyle = '#fff'; g.fillRect(charX + c, bounceY + r, 1, 1); }
    }));

    // Particles / bits
    for (let i = 0; i < 6; i++) {
      const px = (((f * 0.7 + i * 17) % SW));
      const py = ((Math.sin(f * 0.1 + i) + 1) / 2) * (SH - 15);
      g.fillStyle = '#39ff5a';
      g.fillRect(Math.floor(px), Math.floor(py), 1, 1);
    }

    // Corruption — random pixel noise at edges
    if (f % 8 < 2) {
      for (let i = 0; i < 8; i++) {
        g.fillStyle = '#39ff5a';
        g.fillRect(Math.floor(Math.random() * SW), Math.floor(Math.random() * SH), 2, 1);
      }
    }

    // Draw upscaled to canvas (pixelated)
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offscreen, 0, 0, W, H);

    // HUD overlay
    ctx.fillStyle = '#39ff5a';
    ctx.font = '9px "Share Tech Mono"';
    ctx.fillText('VOID_RUNNER — LEVEL 3', 8, 18);
    ctx.fillText(`SCORE: ${String(f * 37).padStart(6,'0')}`, 8, 32);
  }

  // ── PREVIEW: HORROR (STATIC_FAUNA) ───────────────────────
  function renderHorror(ctx, W, H, f) {
    const SW = Math.floor(W / 3), SH = Math.floor(H / 3);
    const off = document.createElement('canvas');
    off.width = SW; off.height = SH;
    const g = off.getContext('2d');

    // Dark forest bg
    g.fillStyle = '#010805';
    g.fillRect(0, 0, SW, SH);

    // Trees
    for (let i = 0; i < 8; i++) {
      const tx = (i * 14 + 2) % SW;
      const th = 20 + (i * 7) % 14;
      g.fillStyle = '#0a1a0d';
      g.fillRect(tx, SH - th, 5, th);
      // tree crown
      g.fillStyle = '#0d2210';
      g.fillRect(tx - 3, SH - th - 6, 11, 8);
    }

    // Creature — glitching silhouette
    const cx = SW / 2 + Math.sin(f * 0.05) * 6;
    const cy = SH - 25;
    const glitch = (f % 16 < 3) ? Math.floor(Math.random() * 4) - 2 : 0;
    g.fillStyle = '#1a1a1a';
    // body
    g.fillRect(cx - 4 + glitch, cy, 8, 12);
    // wrong-proportioned head
    g.fillRect(cx - 5 + glitch, cy - 10, 10, 10);
    // too-long limbs
    g.fillRect(cx - 12 + glitch, cy + 4, 8, 2);
    g.fillRect(cx + 4 + glitch, cy + 4, 8, 2);
    // eye glow
    if (f % 40 < 30) {
      g.fillStyle = '#ff0000';
      g.fillRect(cx - 2 + glitch, cy - 6, 2, 2);
      g.fillRect(cx + 1 + glitch, cy - 6, 2, 2);
    }

    // Static noise overlay
    if (f % 4 < 2) {
      for (let i = 0; i < 20; i++) {
        g.fillStyle = `rgba(57,255,90,${Math.random() * 0.4})`;
        g.fillRect(Math.floor(Math.random() * SW), Math.floor(Math.random() * SH), Math.floor(Math.random()*3)+1, 1);
      }
    }

    // Camera viewfinder corners
    g.strokeStyle = '#39ff5a';
    g.lineWidth = 1;
    const m = 4;
    g.beginPath();
    g.moveTo(m, m + 5); g.lineTo(m, m); g.lineTo(m + 5, m);
    g.moveTo(SW - m - 5, m); g.lineTo(SW - m, m); g.lineTo(SW - m, m + 5);
    g.moveTo(m, SH - m - 5); g.lineTo(m, SH - m); g.lineTo(m + 5, SH - m);
    g.moveTo(SW - m - 5, SH - m); g.lineTo(SW - m, SH - m); g.lineTo(SW - m, SH - m - 5);
    g.stroke();

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, W, H);

    ctx.fillStyle = '#39ff5a';
    ctx.font = '9px "Share Tech Mono"';
    ctx.fillText('STATIC_FAUNA — REC', 8, 18);
    ctx.fillStyle = '#ff000099';
    ctx.fillRect(W - 22, 8, 10, 10);
    ctx.fillStyle = '#39ff5a';
    ctx.fillText(`${String(Math.floor(f/30)).padStart(2,'0')}:${String(f%30).padStart(2,'0')}`, W - 40, H - 10);
  }

  // ── PREVIEW: CORRIDOR (CORRIDOR_NULL) ─────────────────────
  function renderCorridor(ctx, W, H, f) {
    const SW = Math.floor(W / 3), SH = Math.floor(H / 3);
    const off = document.createElement('canvas');
    off.width = SW; off.height = SH;
    const g = off.getContext('2d');

    g.fillStyle = '#020a03';
    g.fillRect(0, 0, SW, SH);

    // Perspective corridor — concentric rectangles shrinking to vanishing point
    const vx = SW / 2, vy = SH / 2;
    const depth = ((f * 0.3) % 20);

    for (let d = 8; d > 0; d--) {
      const t = (d / 8);
      const spread = t * 0.9;
      const brightness = Math.floor(t * 30);
      g.strokeStyle = `rgb(0,${brightness},0)`;
      g.lineWidth = 1;

      const x0 = vx - SW * spread * 0.5;
      const y0 = vy - SH * spread * 0.5;
      const x1 = vx + SW * spread * 0.5;
      const y1 = vy + SH * spread * 0.5;

      g.strokeRect(x0, y0, x1 - x0, y1 - y0);

      // Floor line
      g.beginPath();
      g.moveTo(x0, vy);
      g.lineTo(x1, vy);
      g.stroke();
    }

    // Corridor walls — repeating panels
    for (let i = 0; i < 4; i++) {
      const t = ((i + depth / 20) % 4) / 4;
      const w = SW * t * 0.8;
      const h = SH * t * 0.8;
      const x = (SW - w) / 2;
      const y = (SH - h) / 2;
      g.strokeStyle = `rgba(0,${Math.floor(t * 60 + 10)},0,0.8)`;
      g.strokeRect(x, y, w, h);
    }

    // Ceiling lights — strip
    const lightX = vx + (Math.sin(f * 0.02) * 2);
    g.fillStyle = '#39ff5a22';
    g.fillRect(lightX - 1, 0, 2, SH);

    // Office chair silhouette at end
    g.fillStyle = '#0d1a0d';
    g.fillRect(vx - 2, vy - 4, 4, 6);
    g.fillRect(vx - 3, vy + 1, 6, 1);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, W, H);

    ctx.fillStyle = '#39ff5a99';
    ctx.font = '9px "Share Tech Mono"';
    ctx.fillText('CORRIDOR_NULL', 8, 18);
    ctx.fillText(`LOOP ${Math.floor(f / 120) + 1}`, 8, 32);
  }

  // ── PREVIEW: BRAND (BRAND_NULL) ───────────────────────────
  function renderBrand(ctx, W, H, f) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    // Minimalist rotating mark
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(f * 0.005);

    // Outer square — very thin
    ctx.strokeStyle = '#39ff5a';
    ctx.lineWidth = 1;
    const size = Math.min(W, H) * 0.28;
    ctx.strokeRect(-size / 2, -size / 2, size, size);

    // Inner rotated square
    ctx.save();
    ctx.rotate(Math.PI / 4 + f * 0.003);
    const innerSize = size * 0.55;
    ctx.strokeRect(-innerSize / 2, -innerSize / 2, innerSize, innerSize);
    ctx.restore();

    // Center void
    ctx.fillStyle = '#39ff5a';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Brand text
    ctx.fillStyle = '#39ff5a';
    ctx.font = `${Math.floor(W * 0.04)}px "Press Start 2P"`;
    ctx.textAlign = 'center';
    ctx.fillText('BRAND', W / 2, H * 0.72);
    ctx.fillStyle = '#39ff5a44';
    ctx.fillText('NULL', W / 2, H * 0.82);
    ctx.textAlign = 'left';

    // Tagline fade in/out
    const alpha = 0.3 + 0.3 * Math.sin(f * 0.04);
    ctx.fillStyle = `rgba(57,255,90,${alpha})`;
    ctx.font = '10px "Share Tech Mono"';
    ctx.textAlign = 'center';
    ctx.fillText('Experience the Absence.', W / 2, H * 0.9);
    ctx.textAlign = 'left';
  }

  // ── BUILD INFO PANEL ─────────────────────────────────────
  function _buildInfo(key) {
    const proj = SITE_DATA.projects.find(p => p.key === key);
    if (!proj) return;

    const infoEl = document.getElementById('project-info');
    const tags   = proj.tags.map(t => `<span class="itag">${t}</span>`).join('');
    const paras  = proj.fullDesc.map(p => `<p>${p}</p>`).join('');

    infoEl.innerHTML = `
      <h1>${proj.title}</h1>
      <div class="info-year">${proj.type} · ${proj.year}</div>
      ${paras}
      <div class="info-tags">${tags}</div>
      <div class="info-meta">
        Platform: ${proj.platform}<br>
        Duration: ${proj.duration}
      </div>
      <a href="${proj.playUrl}" target="_blank" class="info-link">▶ VIEW PROJECT</a>
      <div class="info-back-hint">[ CLICK ICON AGAIN FOR PREVIEW ]</div>
    `;
  }

  return { init, open, close, toggle, minimise, selectProject };

})();
