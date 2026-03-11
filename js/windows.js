/**
 * windows.js — Popup windows (about, contact, cv)
 * Start within monitor bounds; freely draggable + resizable anywhere after.
 * CRT scanline overlay is baked into .popup-win via CSS.
 */

var Windows = (function () {

  var zTop = 600;

  var DEFS = {
    about:   { title:'\uD83D\uDCC4 about.html',  build:buildAbout   },
    contact: { title:'\uD83D\uDCEC contact.txt', build:buildContact },
    cv:      { title:'\uD83D\uDCCB CV.pdf',      build:buildCV      },
  };

  function init() {
    Object.keys(DEFS).forEach(function (key) {
      var def = DEFS[key];
      var build = def.build();
      var win = makeWin(key, build.title, build.html);
      document.getElementById('windows-layer').appendChild(win);
    });
    initDrag();
  }

  function makeWin(key, contentTitle, bodyHTML) {
    var win = document.createElement('div');
    win.className = 'popup-win';
    win.id        = 'win-' + key;
    win.innerHTML =
      '<div class="win-bar">' +
        '<span class="win-title">' + contentTitle + '</span>' +
        '<div class="win-btns"><div class="win-btn" onclick="Windows.close(\'' + key + '\')">&#x2715;</div></div>' +
      '</div>' +
      '<div class="win-body-wrap">' +
        '<div class="win-body" id="winbody-' + key + '">' + bodyHTML + '</div>' +
        '<div class="win-scrollbar" id="winscroll-' + key + '"></div>' +
      '</div>';
    win.addEventListener('mousedown', function(){ focus(key); });
    return win;
  }

  function open(key) {
    var win = document.getElementById('win-' + key);
    if (!win) return;
    if (!win.classList.contains('open')) {
      var r   = Scene.screenRect;
      var off = {about:[28,28], contact:[44,44], cv:[60,60]}[key] || [28,28];
      win.style.left  = (r.left + off[0]) + 'px';
      win.style.top   = (r.top  + off[1]) + 'px';
      win.style.width = ''; win.style.height = '';
    }
    win.classList.add('open');
    focus(key);
    Desktop.setRunning('ic-' + key, true);
    // Init dot scrollbar after window is visible
    setTimeout(function () { initScrollbar(key); }, 50);
  }

  function close(key) {
    var win = document.getElementById('win-' + key);
    if (!win) return;
    win.classList.remove('open','focused');
    Desktop.setRunning('ic-' + key, false);
  }

  function toggle(key) {
    var win = document.getElementById('win-' + key);
    if (!win) return;
    if (win.classList.contains('open')) close(key); else open(key);
  }

  function focus(key) {
    document.querySelectorAll('.popup-win').forEach(function(w){ w.classList.remove('focused'); });
    var win = document.getElementById('win-' + key);
    if (!win) return;
    win.classList.add('focused');
    win.style.zIndex = ++zTop;
  }

  // ── DRAG ──────────────────────────────────────────────────
  var _drag = null, _dox = 0, _doy = 0;
  function initDrag() {
    document.getElementById('windows-layer').addEventListener('mousedown', function(e) {
      var bar = e.target.closest('.win-bar');
      if (!bar) return;
      var win = bar.closest('.popup-win');
      if (!win) return;
      focus(win.id.replace('win-',''));
      _drag = win;
      _dox  = e.clientX - win.getBoundingClientRect().left;
      _doy  = e.clientY - win.getBoundingClientRect().top;
      e.preventDefault();
    });
    document.addEventListener('mousemove', function(e) {
      if (!_drag) return;
      var x = Math.max(-240, Math.min(e.clientX - _dox, window.innerWidth  - 40));
      var y = Math.max(0,    Math.min(e.clientY - _doy, window.innerHeight - 24));
      _drag.style.left = x + 'px';
      _drag.style.top  = y + 'px';
    });
    document.addEventListener('mouseup', function(){ _drag = null; });
  }

  // ── DOT SCROLLBAR ─────────────────────────────────────────
  var DOT_SIZE = 6;   // dot width/height in px
  var DOT_GAP = 3;    // gap between dots in px
  var SCROLLBAR_PADDING = 8; // 4px top + 4px bottom padding

  function initScrollbar(key) {
    var body    = document.getElementById('winbody-' + key);
    var sb      = document.getElementById('winscroll-' + key);
    if (!body || !sb) return;

    sb.innerHTML = '';

    // Calculate how many dots fit in the scrollbar height
    // Each dot is DOT_SIZE px, plus DOT_GAP between them (except after last)
    // Formula: n dots = (available_height + gap) / (dot_size + gap)
    var sbHeight = sb.getBoundingClientRect().height;
    var availableHeight = sbHeight - SCROLLBAR_PADDING;
    var dotCount = Math.max(1, Math.ceil((availableHeight + DOT_GAP) / (DOT_SIZE + DOT_GAP)));

    // Build dots to fill the scrollbar
    var dots = [];
    for (var i = 0; i < dotCount; i++) {
      var d = document.createElement('div');
      d.className = 'scrollbar-dot';
      sb.appendChild(d);
      dots.push(d);
    }

    function updateDots() {
      var scrollRatio   = body.scrollTop / (body.scrollHeight - body.clientHeight || 1);
      var thumbSize     = Math.max(1, Math.round(dotCount * (body.clientHeight / (body.scrollHeight || 1))));
      var thumbStart    = Math.round(scrollRatio * (dotCount - thumbSize));

      dots.forEach(function (dot, idx) {
        if (idx >= thumbStart && idx < thumbStart + thumbSize) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    // Scrollbar drag-to-scroll
    var draggingSB = false;
    sb.addEventListener('mousedown', function (e) {
      draggingSB = true;
      scrollFromMouse(e);
      e.preventDefault();
    });
    document.addEventListener('mousemove', function (e) {
      if (!draggingSB) return;
      scrollFromMouse(e);
    });
    document.addEventListener('mouseup', function () { draggingSB = false; });

    function scrollFromMouse(e) {
      var rect  = sb.getBoundingClientRect();
      var ratio = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      body.scrollTop = ratio * (body.scrollHeight - body.clientHeight);
    }

    body.addEventListener('scroll', updateDots);
    updateDots();

    // Also run once after a tick (in case content reflows)
    setTimeout(updateDots, 100);
  }

  // ── DRAG ──────────────────────────────────────────────────

  // ── BODY BUILDERS ─────────────────────────────────────────
  function buildAbout() {
    var d    = SITE_DATA.about;
    var pars = d.paragraphs.map(function(p){ return '<p>' + p + '</p>'; }).join('');
    var tags = d.skills.map(function(s){ return '<span class="wtag">' + s + '</span>'; }).join('');
    return {
      title: 'WHO AM I',
      html: pars + '<hr class="wsep">' + tags
    };
  }

  function buildContact() {
    var d    = SITE_DATA.contact;
    var rows = d.links.map(function(l){
      return '<div class="link-row">' +
        '<span class="lr-icon">' + l.icon + '</span>' +
        '<span class="lr-lbl">' + l.label + '</span>' +
        '<a href="' + l.url + '" target="_blank">' + l.display + '</a>' +
      '</div>';
    }).join('');
    return {
      title: 'FIND ME',
      html: '<p>&#x2709; <a href="mailto:' + d.email + '">' + d.email + '</a></p>' +
        rows +
        '<p class="wnote">' + d.note + '</p>'
    };
  }

  function buildCV() {
    var d   = SITE_DATA.cv;
    var exp = d.experience.map(function(e){
      return '<div class="cv-e"><div class="cv-role">' + e.role + '</div>' +
        '<div class="cv-period">' + e.company + ' &middot; ' + e.period + '</div>' +
        '<div class="cv-desc">' + e.description + '</div></div>';
    }).join('');
    var edu = d.education.map(function(e){
      return '<div class="cv-e"><div class="cv-role">' + e.degree + '</div>' +
        '<div class="cv-period">' + e.institution + ' &middot; ' + e.year + '</div></div>';
    }).join('');
    var awards = d.awards.map(function(a){ return '<p class="cv-award">&#x2756; ' + a + '</p>'; }).join('');
    return {
      title: 'CV',
      html: '<h2>EXPERIENCE</h2>' + exp +
        '<hr class="wsep"><h2>EDUCATION</h2>' + edu +
        '<hr class="wsep"><h2>AWARDS</h2>' + awards +
        '<a href="' + d.downloadUrl + '" class="dl-btn" target="_blank">&#x2193; DOWNLOAD CV.pdf</a>'
    };
  }

  return { init:init, open:open, close:close, toggle:toggle };

}());