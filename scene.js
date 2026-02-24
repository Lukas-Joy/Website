/**
 * scene.js — Three.js 3D scene
 * Handles: monitor mesh, lighting, render loop, screen overlay tracking, void particles
 */

const Scene = (() => {

  let camera, renderer, scene, monitorGroup;
  let screenCorners = [];
  const SCREEN_W = 3.2;
  const SCREEN_H = 2.2;
  const SCREEN_Z_LOCAL = 0.21; // slightly in front of bezel face

  // Animated 3D positions for void project icons
  const voidIconMeta = {};

  function init() {
    const canvas = document.getElementById('three-canvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000204, 1);

    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.1, 5.6);
    camera.lookAt(0, 0, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0a1a0d, 1.0);
    scene.add(ambientLight);

    // Screen glow point light
    const screenLight = new THREE.PointLight(0x39ff5a, 1.4, 7);
    screenLight.position.set(0, 0.1, 1.2);
    scene.add(screenLight);

    // Subtle fill light from slightly off angle
    const fillLight = new THREE.PointLight(0x1a3320, 0.5, 10);
    fillLight.position.set(-2, 2, 3);
    scene.add(fillLight);

    buildMonitor();
    buildStarfield();
    setupScreenCorners();
    spawnParticles();

    window.addEventListener('resize', onResize);

    // Do one render immediately so screen overlay is positioned before boot text appears
    renderer.render(scene, camera);
    updateScreenOverlay();

    render();
  }

  // ── BUILD MONITOR ─────────────────────────────────────────
  function buildMonitor() {
    monitorGroup = new THREE.Group();

    const darkGray = new THREE.MeshLambertMaterial({ color: 0x0e0e0e });
    const midGray  = new THREE.MeshLambertMaterial({ color: 0x181818 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x010a03 }); // very dark green-black

    // ── Outer bezel body (low-poly, will jitter)
    const bezelGeo = new THREE.BoxGeometry(4.0, 2.85, 0.38, 3, 3, 2);
    _storeOriginals(bezelGeo);
    const bezel = new THREE.Mesh(bezelGeo, darkGray);
    bezel.userData.jitter = 0.005;

    // ── Inner screen recess
    const recessGeo = new THREE.BoxGeometry(3.4, 2.4, 0.12);
    const recess = new THREE.Mesh(recessGeo, midGray);
    recess.position.z = 0.14;

    // ── Screen plane (HTML overlay sits on top of this)
    const screenGeo = new THREE.PlaneGeometry(SCREEN_W, SCREEN_H);
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 0, SCREEN_Z_LOCAL);

    // ── Power LED glow (small emissive sphere)
    const ledGeo = new THREE.SphereGeometry(0.035, 4, 4);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x39ff5a });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(1.7, -1.35, 0.21);
    led.userData.pulse = true;

    // ── Monitor brand text plane (tiny)
    // (we skip actual text geometry for perf, just a thin strip)
    const brandGeo = new THREE.BoxGeometry(0.8, 0.04, 0.01);
    const brandMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const brand = new THREE.Mesh(brandGeo, brandMat);
    brand.position.set(0, -1.37, 0.2);

    // ── Neck
    const neckGeo = new THREE.BoxGeometry(0.38, 0.7, 0.22, 1, 2, 1);
    _storeOriginals(neckGeo);
    const neck = new THREE.Mesh(neckGeo, darkGray);
    neck.position.set(0, -1.75, -0.04);
    neck.userData.jitter = 0.004;

    // ── Base
    const baseGeo = new THREE.BoxGeometry(2.0, 0.12, 0.75, 2, 1, 2);
    _storeOriginals(baseGeo);
    const base = new THREE.Mesh(baseGeo, darkGray);
    base.position.set(0, -2.12, -0.06);
    base.userData.jitter = 0.003;

    monitorGroup.add(bezel, recess, screenMesh, led, brand, neck, base);
    monitorGroup.rotation.x = 0.04;
    monitorGroup.rotation.y = -0.07;

    scene.add(monitorGroup);
  }

  // Store original vertex positions for jitter restoration
  function _storeOriginals(geo) {
    geo.userData.origPos = new Float32Array(geo.attributes.position.array);
  }

  // ── SCREEN CORNERS (for overlay projection) ───────────────
  function setupScreenCorners() {
    screenCorners = [
      new THREE.Vector3(-SCREEN_W / 2,  SCREEN_H / 2, SCREEN_Z_LOCAL),
      new THREE.Vector3( SCREEN_W / 2,  SCREEN_H / 2, SCREEN_Z_LOCAL),
      new THREE.Vector3(-SCREEN_W / 2, -SCREEN_H / 2, SCREEN_Z_LOCAL),
      new THREE.Vector3( SCREEN_W / 2, -SCREEN_H / 2, SCREEN_Z_LOCAL),
    ];
  }

  // ── STARFIELD ─────────────────────────────────────────────
  function buildStarfield() {
    const geo = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 600; i++) {
      positions.push(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30 - 5
      );
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0x39ff5a, size: 0.04, sizeAttenuation: true, transparent: true, opacity: 0.35 });
    scene.add(new THREE.Points(geo, mat));
  }

  // ── VOID PARTICLES (CSS) ──────────────────────────────────
  function spawnParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'void-particle';
      p.style.left = (Math.random() * 100) + 'vw';
      p.style.top = (100 + Math.random() * 10) + 'vh';
      p.style.animationDuration = (8 + Math.random() * 12) + 's';
      p.style.animationDelay = (-Math.random() * 12) + 's';
      container.appendChild(p);
    }
  }

  // ── RESIZE ────────────────────────────────────────────────
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ── UPDATE SCREEN OVERLAY POSITION ────────────────────────
  function updateScreenOverlay() {
    const overlay = document.getElementById('screen-overlay');
    monitorGroup.updateMatrixWorld(true);

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    screenCorners.forEach(localCorner => {
      const worldCorner = localCorner.clone().applyMatrix4(monitorGroup.matrixWorld);
      const ndc = worldCorner.project(camera);
      const sx = (ndc.x + 1) / 2 * window.innerWidth;
      const sy = (-ndc.y + 1) / 2 * window.innerHeight;
      minX = Math.min(minX, sx);
      maxX = Math.max(maxX, sx);
      minY = Math.min(minY, sy);
      maxY = Math.max(maxY, sy);
    });

    overlay.style.left   = minX + 'px';
    overlay.style.top    = minY + 'px';
    overlay.style.width  = (maxX - minX) + 'px';
    overlay.style.height = (maxY - minY) + 'px';

    // Store rect for Desktop and Windows to use
    Scene.screenRect = { left: minX, top: minY, width: maxX - minX, height: maxY - minY };
  }

  // ── UPDATE VOID ICON POSITIONS ────────────────────────────
  function updateVoidIcons(t) {
    const data = window.SITE_DATA;
    if (!data) return;

    data.projects.forEach((proj, i) => {
      const el = document.getElementById('void-icon-' + proj.key);
      if (!el) return;

      const [bx, by, bz] = proj.voidPos;
      // Add gentle float offset per icon
      const floatY = Math.sin(t * 0.5 + i * 1.3) * 0.18;
      const floatX = Math.cos(t * 0.3 + i * 0.9) * 0.06;

      const worldPos = new THREE.Vector3(bx + floatX, by + floatY, bz);
      const ndc = worldPos.project(camera);
      const sx = (ndc.x + 1) / 2 * window.innerWidth;
      const sy = (-ndc.y + 1) / 2 * window.innerHeight;

      // Depth-based scale (simple perspective feel)
      const depth = (bz + 5) / 10; // 0..1
      const scale = 0.7 + depth * 0.5;
      el.style.left = sx + 'px';
      el.style.top  = sy + 'px';
      el.style.transform = `translate(-50%, -50%) scale(${scale})`;
    });
  }

  // ── PSX VERTEX JITTER ─────────────────────────────────────
  function applyVertexJitter(t) {
    // Only jitter occasionally for that PSX instability
    if (Math.floor(t * 12) % 2 !== 0) return;

    monitorGroup.children.forEach(mesh => {
      if (!mesh.userData.jitter || !mesh.geometry?.attributes?.position) return;
      const pos = mesh.geometry.attributes.position;
      const orig = mesh.geometry.userData.origPos;
      if (!orig) return;
      const amt = mesh.userData.jitter;
      for (let i = 0; i < pos.count; i++) {
        pos.setX(i, orig[i * 3]     + (Math.random() - 0.5) * amt);
        pos.setY(i, orig[i * 3 + 1] + (Math.random() - 0.5) * amt);
        pos.setZ(i, orig[i * 3 + 2] + (Math.random() - 0.5) * amt);
      }
      pos.needsUpdate = true;
    });
  }

  // ── RENDER LOOP ───────────────────────────────────────────
  function render() {
    requestAnimationFrame(render);
    const t = Date.now() * 0.001;

    // Float monitor
    monitorGroup.position.y = Math.sin(t * 0.45) * 0.09;
    monitorGroup.rotation.y = -0.07 + Math.sin(t * 0.28) * 0.018;
    monitorGroup.rotation.x = 0.04 + Math.sin(t * 0.35) * 0.008;

    // Pulse LED
    monitorGroup.children.forEach(m => {
      if (m.userData.pulse) {
        const intensity = 0.5 + 0.5 * Math.sin(t * 2.1);
        m.material.color.setRGB(0, 0.8 + 0.2 * intensity, 0.1 + 0.1 * intensity);
      }
    });

    applyVertexJitter(t);

    renderer.render(scene, camera);

    // Update HTML overlay positions
    updateScreenOverlay();
    updateVoidIcons(t);
  }

  return { init, screenRect: null };

})();
