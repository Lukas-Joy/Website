/**
 * windows.js — Popup window management
 * Windows start within monitor screen bounds but can be moved/resized freely.
 */

const Windows = (() => {

  let highestZ = 600;

  // ── WINDOW CONFIGS ────────────────────────────────────────
  const WINDOW_DEFS = {
    about:   { title: '📄 about.html',  buildFn: buildAbout  },
    contact: { title: '📬 contact.txt', buildFn: buildContact },
    cv:      { title: '📋 CV.pdf',      buildFn: buildCV     },
  };

  const openWindows = {};

  function init() {
    // Pre-build all windows into the DOM
    Object.entries(WINDOW_DEFS).forEach(([key, def]) => {
      const win = createWindowEl(key, def.title, def.buildFn());
      document.getElementById('windows-layer').appendChild(win);
    });
  }

  // ── CREATE WINDOW ELEMENT ─────────────────────────────────
  function createWindowEl(key, title, bodyHTML) {
    const win = document.createElement('div');
    win.className = 'popup-window';
    win.id = 'win-' + key;
    win.innerHTML = `
      <div class="win-titlebar" onmousedown="Windows._dragStart(event,'${key}')">
        <span>${title}</span>
        <div class="win-controls">
          <div class="wbtn" onclick="Windows.close('${key}')">✕</div>
        </div>
      </div>
      <div class="win-body">${bodyHTML}</div>
    `;

    // Focus on click
    win.addEventListener('mousedown', () => focus(key));

    return win;
  }

  // ── OPEN / CLOSE / TOGGLE ─────────────────────────────────
  function open(key) {
    const win = document.getElementById('win-' + key);
    if (!win) return;

    if (!win.classList.contains('open')) {
      // Position initially within monitor screen bounds
      const rect = Scene.screenRect || { left: 100, top: 100, width: 500, height: 340 };
      const offsetMap = { about: [30, 30], contact: [50, 50], cv: [70, 70] };
      const [ox, oy] = offsetMap[key] || [30, 30];

      win.style.left = (rect.left + ox) + 'px';
      win.style.top  = (rect.top  + oy) + 'px';
      win.style.width = '';
      win.style.height = '';
    }

    win.classList.add('open');
    focus(key);

    Desktop.setTaskbarRunning('icon-' + key, true);
  }

  function close(key) {
    const win = document.getElementById('win-' + key);
    if (!win) return;
    win.classList.remove('open', 'focused');
    Desktop.setTaskbarRunning('icon-' + key, false);
  }

  function toggle(key) {
    const win = document.getElementById('win-' + key);
    if (!win) return;
    if (win.classList.contains('open')) {
      close(key);
    } else {
      open(key);
    }
  }

  function focus(key) {
    document.querySelectorAll('.popup-window').forEach(w => w.classList.remove('focused'));
    const win = document.getElementById('win-' + key);
    if (!win) return;
    win.classList.add('focused');
    win.style.zIndex = ++highestZ;
  }

  // ── DRAGGING ──────────────────────────────────────────────
  let _dragging = null, _dOffX = 0, _dOffY = 0;

  function _dragStart(e, key) {
    focus(key);
    const win = document.getElementById('win-' + key);
    _dragging = win;
    _dOffX = e.clientX - win.getBoundingClientRect().left;
    _dOffY = e.clientY - win.getBoundingClientRect().top;
    e.preventDefault();

    document.addEventListener('mousemove', _onDragMove);
    document.addEventListener('mouseup', _onDragEnd, { once: true });
  }

  function _onDragMove(e) {
    if (!_dragging) return;
    // Windows can go anywhere on the full viewport
    const x = Math.max(-200, Math.min(e.clientX - _dOffX, window.innerWidth - 60));
    const y = Math.max(0,    Math.min(e.clientY - _dOffY, window.innerHeight - 30));
    _dragging.style.left = x + 'px';
    _dragging.style.top  = y + 'px';
  }

  function _onDragEnd() {
    document.removeEventListener('mousemove', _onDragMove);
    _dragging = null;
  }

  // ── WINDOW BODY BUILDERS ──────────────────────────────────
  function buildAbout() {
    const d = SITE_DATA.about;
    const paras = d.paragraphs.map(p => `<p>${p}</p>`).join('');
    const skills = d.skills.map(s => `<span class="skill-tag">${s}</span>`).join('');
    return `
      <h2>WHOAMI</h2>
      ${paras}
      <hr class="win-sep">
      <div style="margin-top:8px">${skills}</div>
    `;
  }

  function buildContact() {
    const d = SITE_DATA.contact;
    const rows = d.links.map(l =>
      `<div class="link-row">
        <span class="licon">${l.icon}</span>
        <span class="llabel">${l.label}</span>
        <a href="${l.url}" target="_blank">${l.display}</a>
      </div>`
    ).join('');
    return `
      <h2>FIND ME</h2>
      <p style="font-size:14px;margin-bottom:10px">✉ <a href="mailto:${d.email}">${d.email}</a></p>
      ${rows}
      <p style="margin-top:10px;font-size:12px;color:var(--phosphor-dim)">${d.note}</p>
    `;
  }

  function buildCV() {
    const d = SITE_DATA.cv;
    const exp = d.experience.map(e => `
      <div class="cv-entry">
        <div class="cv-role">${e.role}</div>
        <div class="cv-period">${e.company} · ${e.period}</div>
        <div class="cv-desc">${e.description}</div>
      </div>
    `).join('');
    const edu = d.education.map(e => `
      <div class="cv-entry">
        <div class="cv-role">${e.degree}</div>
        <div class="cv-period">${e.institution} · ${e.year}</div>
      </div>
    `).join('');
    const awards = d.awards.map(a => `<p style="font-size:13px">✦ ${a}</p>`).join('');
    return `
      <h2>EXPERIENCE</h2>
      ${exp}
      <hr class="win-sep">
      <h2 style="margin-top:8px">EDUCATION</h2>
      ${edu}
      <hr class="win-sep">
      <h2 style="margin-top:8px">AWARDS</h2>
      ${awards}
      <a href="${d.downloadUrl}" class="dl-btn" target="_blank">↓ DOWNLOAD CV.pdf</a>
    `;
  }

  return { init, open, close, toggle, focus, _dragStart };

})();
