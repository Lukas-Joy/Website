/**
 * desktop.js — Desktop icons, drag-within-bounds, app launching
 */

const Desktop = (() => {

  const ICONS = [
    { id: 'icon-projects', file: 'project.exe', glyph: '📁', startX: 12, startY: 14, action: 'app:project' },
    { id: 'icon-about',    file: 'about.html',  glyph: '📄', startX: 12, startY: 92, action: 'window:about' },
    { id: 'icon-contact',  file: 'contact.txt', glyph: '📬', startX: 12, startY: 170, action: 'window:contact' },
    { id: 'icon-cv',       file: 'CV.pdf',      glyph: '📋', startX: 12, startY: 248, action: 'window:cv' },
  ];

  let draggingIcon = null;
  let dragStartX = 0, dragStartY = 0;
  let iconOrigX = 0, iconOrigY = 0;

  function init() {
    buildIcons();
    updateClock();
    setInterval(updateClock, 15000);
    buildTaskbar();
    buildVoidIcons();
  }

  function buildIcons() {
    const desktop = document.getElementById('desktop');
    ICONS.forEach(cfg => {
      const el = document.createElement('div');
      el.className = 'desk-icon';
      el.id = cfg.id;
      el.style.left = cfg.startX + 'px';
      el.style.top  = cfg.startY + 'px';
      el.innerHTML = `
        <span class="desk-icon-img">${cfg.glyph}</span>
        <span class="desk-icon-label">${cfg.file}</span>
      `;

      // Single click = select
      el.addEventListener('mousedown', e => startIconDrag(e, el, cfg));
      // Double click = activate
      el.addEventListener('dblclick', e => {
        e.stopPropagation();
        activateIcon(cfg);
      });

      desktop.appendChild(el);
    });

    // Deselect on desktop click
    desktop.addEventListener('mousedown', e => {
      if (e.target === desktop || e.target.id === 'desktop-bg-grid') {
        document.querySelectorAll('.desk-icon').forEach(i => i.classList.remove('selected'));
      }
    });
  }

  function startIconDrag(e, el, cfg) {
    e.stopPropagation();

    // Select on mouse down
    document.querySelectorAll('.desk-icon').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');

    draggingIcon = el;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    iconOrigX = parseInt(el.style.left) || 0;
    iconOrigY = parseInt(el.style.top)  || 0;
    el.classList.add('dragging');

    document.addEventListener('mousemove', onIconMouseMove);
    document.addEventListener('mouseup',   onIconMouseUp, { once: true });
  }

  function onIconMouseMove(e) {
    if (!draggingIcon) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    // Constrain within desktop div bounds
    const desktop = document.getElementById('desktop');
    const dRect = desktop.getBoundingClientRect();
    const iconW = draggingIcon.offsetWidth;
    const iconH = draggingIcon.offsetHeight;

    const maxX = dRect.width  - iconW - 2;
    const maxY = dRect.height - iconH - 2;

    const newX = Math.max(0, Math.min(iconOrigX + dx, maxX));
    const newY = Math.max(0, Math.min(iconOrigY + dy, maxY));

    draggingIcon.style.left = newX + 'px';
    draggingIcon.style.top  = newY + 'px';
  }

  function onIconMouseUp() {
    if (!draggingIcon) return;
    draggingIcon.classList.remove('dragging');
    document.removeEventListener('mousemove', onIconMouseMove);
    draggingIcon = null;
  }

  function activateIcon(cfg) {
    const [type, target] = cfg.action.split(':');
    if (type === 'app') {
      ProjectApp.open();
    } else if (type === 'window') {
      Windows.open(target);
    }

    // Taskbar running indicator
    const tbBtn = document.querySelector(`.tb-icon[data-app="${cfg.id}"]`);
    if (tbBtn) tbBtn.classList.add('running');
  }

  // ── TASKBAR ───────────────────────────────────────────────
  function buildTaskbar() {
    const tb = document.getElementById('taskbar');
    tb.innerHTML = `
      <button id="start-btn">▶ START</button>
      <div class="tb-sep"></div>
      <span class="tb-icon" data-app="icon-projects" title="project.exe" onclick="ProjectApp.toggle()">📁 project.exe</span>
      <span class="tb-icon" data-app="icon-about"    title="about.html"  onclick="Windows.toggle('about')">📄 about</span>
      <span class="tb-icon" data-app="icon-contact"  title="contact.txt" onclick="Windows.toggle('contact')">📬 contact</span>
      <span class="tb-icon" data-app="icon-cv"       title="CV.pdf"      onclick="Windows.toggle('cv')">📋 cv</span>
      <div id="taskbar-right">
        <div id="taskbar-clock">00:00</div>
      </div>
    `;

    document.getElementById('start-btn').addEventListener('click', () => {
      showToast('START MENU: [under construction since 1994] ■');
    });
  }

  // ── VOID PROJECT ICONS ────────────────────────────────────
  // These appear in the 3D void when project.exe is open.
  // Positioned via Scene's render loop (3D projection).
  function buildVoidIcons() {
    const layer = document.getElementById('void-layer');
    SITE_DATA.projects.forEach(proj => {
      const el = document.createElement('div');
      el.className = 'void-icon';
      el.id = 'void-icon-' + proj.key;
      el.innerHTML = `
        <span class="void-icon-glyph">${proj.icon}</span>
        <span class="void-icon-label">${proj.title}</span>
      `;
      el.addEventListener('click', () => ProjectApp.selectProject(proj.key));
      layer.appendChild(el);
    });
  }

  function showVoidIcons(visible) {
    document.querySelectorAll('.void-icon').forEach(el => {
      el.classList.toggle('visible', visible);
    });
  }

  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const el = document.getElementById('taskbar-clock');
    if (el) el.textContent = h + ':' + m;
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.display = 'block';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.style.display = 'none', 3500);
  }

  // Expose taskbar running state
  function setTaskbarRunning(appId, running) {
    const el = document.querySelector(`.tb-icon[data-app="${appId}"]`);
    if (el) el.classList.toggle('running', running);
  }

  return { init, showVoidIcons, setTaskbarRunning, showToast };

})();
