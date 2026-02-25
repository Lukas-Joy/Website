/**
 * scene.js — Three.js 3D scene
 *
 * Void outside monitor: warm sepia / dusty beige palette
 * Monitor: static (no float), brighter contrast against bg
 * Project icons: auto-grid either side, isometric spin, custom mesh/texture support
 */

var Scene = (function () {

  var camera, renderer, threeScene, monitorGroup;
  var projectMeshGroup;    // group holding all 3D project icons
  var projectMeshes = [];  // [{mesh, projKey, rotSpeed}]

  // Screen face corners in local monitor space
  var SCREEN_W   = 1.65;
  var SCREEN_H   = 1.45;
  var SCREEN_Z   = 1;

  var localCorners = [
    new THREE.Vector3(-SCREEN_W / 2,  SCREEN_H / 2, SCREEN_Z),
    new THREE.Vector3( SCREEN_W / 2,  SCREEN_H / 2, SCREEN_Z),
    new THREE.Vector3(-SCREEN_W / 2, -SCREEN_H / 2, SCREEN_Z),
    new THREE.Vector3( SCREEN_W / 2, -SCREEN_H / 2, SCREEN_Z),
  ];

  var screenRect = { left: 0, top: 0, width: 0, height: 0 };

  // Monitor mesh configuration
  var MONITOR_SCALE = 1.4;    // Adjust if mesh needs scaling
  var MONITOR_ROT_X = 0;
  var MONITOR_ROT_Y = -Math.PI * 0.5;

  // Warm sepia palette for outside-monitor world
  var COL_BG          = 0x14100a;
  var COL_AMBIENT     = 0x2a1e10;
  var COL_STAR        = 0x9a8060;
  var COL_BEZEL       = 0x222222;

  // ── INIT ──────────────────────────────────────────────────
  function init() {
    var canvas = document.getElementById('three-canvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(COL_BG, 1);

    threeScene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.05, 5.8);
    camera.lookAt(0, 0, 0);

    // Warm ambient (sepia room light)
    threeScene.add(new THREE.AmbientLight(COL_AMBIENT, 1.5));

    // Strong screen glow light — makes monitor bright against warm bg
    var screenGlow = new THREE.PointLight(0x39ff5a, 3.5, 10);
    screenGlow.position.set(0, 0.1, 1.6);
    threeScene.add(screenGlow);

    // Warm fill from above-right (room light)
    var roomLight = new THREE.PointLight(0x6b4c28, 0.9, 14);
    roomLight.position.set(3, 4, 4);
    threeScene.add(roomLight);

    // Subtle warm rim behind monitor (makes bezel edges pop)
    var rimLight = new THREE.PointLight(0x4a3018, 0.6, 8);
    rimLight.position.set(0, 2, -2);
    threeScene.add(rimLight);

    buildMonitor();
    buildStarfield();
    buildVoidParticles();
    buildProjectIcons();   // 3D floating icons in grid

    window.addEventListener('resize', onResize);

    // One synchronous render + overlay update before boot sequence begins
    renderer.render(threeScene, camera);
    updateOverlay();

    requestAnimationFrame(renderLoop);
    // initScreenCornerDebug();  // Add this at end of init()
  }

    // ── DEBUG: VISUAL SCREEN CORNER HELPER ─────────────────────
  function initScreenCornerDebug() {
    var debugContainer = document.createElement('div');
    debugContainer.id = 'screen-debug';
    debugContainer.style.cssText = 'position:fixed;top:10px;left:10px;background:rgba(0,0,0,0.9);color:#0f0;font-family:monospace;font-size:11px;padding:10px;z-index:9999;width:350px;max-height:500px;overflow-y:auto;';
    document.body.appendChild(debugContainer);

    var inputs = {
      SCREEN_W: SCREEN_W,
      SCREEN_H: SCREEN_H,
      SCREEN_Z: SCREEN_Z,
      ROT_X: MONITOR_ROT_X,
      ROT_Y: MONITOR_ROT_Y,
      SCALE: MONITOR_SCALE,
    };

    function updateDebug() {
      var html = '<strong>Screen Debug (2D px)</strong><br>';
      html += 'Screen Rect: ' + screenRect.width.toFixed(0) + 'x' + screenRect.height.toFixed(0) + '<br>';
      html += '<br><strong>3D Corners (world)</strong><br>';
      
      // Show world-space corners for reference
      localCorners.forEach(function (c, i) {
        var world = c.clone().applyMatrix4(monitorGroup.matrixWorld);
        html += 'C' + i + ': (' + world.x.toFixed(2) + ', ' + world.y.toFixed(2) + ', ' + world.z.toFixed(2) + ')<br>';
      });

      html += '<br>';
      Object.keys(inputs).forEach(function (key) {
        html += '<label>' + key + ':<br><input type="number" step="0.1" value="' + inputs[key].toFixed(2) + 
          '" onchange="window.updateScreenCorners(\'' + key + '\', this.value)" style="width:100%;background:#222;color:#0f0;border:1px solid #0f0;padding:4px;font-family:monospace;"/><br></label>';
      });

      debugContainer.innerHTML = html;
    }

    window.inputs = inputs;
    window.updateDebug = updateDebug;
    updateDebug();

    window.updateScreenCorners = function (key, value) {
      inputs[key] = parseFloat(value);
      SCREEN_W = inputs.SCREEN_W;
      SCREEN_H = inputs.SCREEN_H;
      SCREEN_Z = inputs.SCREEN_Z;
      MONITOR_ROT_X = inputs.ROT_X;
      MONITOR_ROT_Y = inputs.ROT_Y;
      MONITOR_SCALE = inputs.SCALE;

      // Apply rotation to mesh children, not the group
      monitorGroup.children.forEach(function (child) {
        if (child.userData.isLed) return;  // skip LED
        child.rotation.x = MONITOR_ROT_X;
        child.rotation.y = MONITOR_ROT_Y;
      });

      localCorners = [
        new THREE.Vector3(-SCREEN_W / 2,  SCREEN_H / 2, SCREEN_Z),
        new THREE.Vector3( SCREEN_W / 2,  SCREEN_H / 2, SCREEN_Z),
        new THREE.Vector3(-SCREEN_W / 2, -SCREEN_H / 2, SCREEN_Z),
        new THREE.Vector3( SCREEN_W / 2, -SCREEN_H / 2, SCREEN_Z),
      ];

      // Update matrix before recalculating screen rect
      monitorGroup.updateMatrixWorld(true);
      updateScreenRect();
      updateDebug();
    };

    window.updateScreenCorners('SCREEN_W', inputs.SCREEN_W);
  }

  // ── MONITOR ───────────────────────────────────────────────
  function buildMonitor() {
    monitorGroup = new THREE.Group();

    // Load custom monitor mesh instead of building it
    var loader = new THREE.GLTFLoader();
    loader.load(
      'mesh/Display.glb',
      function (gltf) {
        var mesh = gltf.scene;
        mesh.scale.set(MONITOR_SCALE, MONITOR_SCALE, MONITOR_SCALE);
        // Apply rotation only to the mesh, not the group
        mesh.rotation.x = MONITOR_ROT_X;
        mesh.rotation.y = MONITOR_ROT_Y;
        monitorGroup.add(mesh);
          
        // Store original positions for jitter effect if geometry exists
        mesh.traverse(function (child) {
          if (child.geometry) storeOrig(child.geometry);
        });
      },
      undefined,
      function (error) {
        console.error('Failed to load Display.glb:', error);
      }
    );

    // Power LED (always add)
    var led = new THREE.Mesh(
      new THREE.SphereGeometry(0.034, 4, 4),
      new THREE.MeshBasicMaterial({ color: 0x39ff5a })
    );
    led.position.set(1.7, -1.29, -1.05);
    led.userData.isLed = true;
    monitorGroup.add(led);

    // Don't apply rotation to group — screen corners stay in unrotated space
    threeScene.add(monitorGroup);
  }

  // ── STARFIELD (warm sepia dots) ────────────────────────────
  function buildStarfield() {
    var positions = [];
    for (var i = 0; i < 550; i++) {
      positions.push(
        (Math.random() - 0.5) * 55,
        (Math.random() - 0.5) * 36,
        (Math.random() - 0.5) * 26 - 6
      );
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    var mat = new THREE.PointsMaterial({ color: COL_STAR, size: 0.05, sizeAttenuation: true, transparent: true, opacity: 0.38 });
    threeScene.add(new THREE.Points(geo, mat));
  }

  // ── VOID PARTICLES (CSS) ──────────────────────────────────
  function buildVoidParticles() {
    var c = document.getElementById('particles');
    if (!c) return;
    for (var i = 0; i < 18; i++) {
      var p = document.createElement('div');
      p.className = 'void-particle';
      p.style.left             = (Math.random() * 100) + 'vw';
      p.style.bottom           = (-Math.random() * 8) + 'vh';
      p.style.animationDuration = (9 + Math.random() * 11) + 's';
      p.style.animationDelay   = (-Math.random() * 14) + 's';
      c.appendChild(p);
    }
  }

  // ── PROJECT ICON MESHES (auto-grid, isometric spin) ────────
  function buildProjectIcons() {
    projectMeshGroup = new THREE.Group();
    projectMeshGroup.visible = false;  // Hidden until ProjectApp opens
    threeScene.add(projectMeshGroup);

    var projects = SITE_DATA.projects;
    var n        = projects.length;
    var nLeft    = Math.ceil(n / 2);
    var nRight   = n - nLeft;

    var texLoader = new THREE.TextureLoader();

    projects.forEach(function (proj, idx) {
      var isLeft    = idx < nLeft;
      var localIdx  = isLeft ? idx : idx - nLeft;
      var colSize   = isLeft ? nLeft : nRight;
      var colX      = isLeft ? -3 : 3;

      var ySpacing  = colSize > 1 ? Math.min(1.7, 3.0 / (colSize - 1)) : 0;
      var yPos      = colSize > 1 ? (localIdx - (colSize - 1) / 2) * ySpacing : 0;

      var pos = new THREE.Vector3(colX, yPos, 0.0);
      proj._scenePos = pos;   // cached for HTML overlay projection

      // Default geometry: low-poly card/tile
      var geo = new THREE.BoxGeometry(0.88, 0.88, 0.10, 2, 2, 1);
      var mat = new THREE.MeshLambertMaterial({ color: 0x1a2e1d });

      var mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      // Isometric tilt — angle down 10 degrees
      mesh.rotation.x = 10 * (Math.PI / 180);  // 45 degrees in radians

      var rotSpeed = (0.007 + Math.random() * 0.004) * (Math.random() > 0.5 ? 1 : -1);
      var rotSpeedX = (0.003 + Math.random() * 0.003) * (Math.random() > 0.5 ? 1 : -1);
      var rotSpeedZ = (0.003 + Math.random() * 0.003) * (Math.random() > 0.5 ? 1 : -1);
      mesh.userData.rotSpeed = rotSpeed;
      mesh.userData.rotSpeedX = rotSpeedX;
      mesh.userData.rotSpeedZ = rotSpeedZ;
      mesh.userData.projKey  = proj.key;

      projectMeshGroup.add(mesh);
      projectMeshes.push(mesh);

      // ── Load texture: img/{key}.png → img/No_Texture.webp ──
      texLoader.load(
        'img/' + proj.key + '.png',
        function (tex) { mat.map = tex; mat.color.set(0xffffff); mat.needsUpdate = true; },
        undefined,
        function () {
          texLoader.load('img/No_Texture.webp',
            function (tex) { mat.map = tex; mat.needsUpdate = true; });
        }
      );

      // ── Try to load custom GLB mesh ───────────────────────
      loadMesh(proj, mesh, mat, pos);
    });
  }

  function loadMesh(proj, defaultMesh, defaultMat, pos) {
    if (typeof THREE.GLTFLoader === 'undefined') return;
    var loader = new THREE.GLTFLoader();
    loader.load(
      'mesh/' + proj.key + '.glb',
      function (gltf) {
        // Replace default box with loaded mesh
        projectMeshGroup.remove(defaultMesh);
        var loaded = gltf.scene;
        
        // Auto-scale to fit bounding box (0.88 x 0.88 x 0.10)
        var bbox = new THREE.Box3().setFromObject(loaded);
        var size = bbox.getSize(new THREE.Vector3());
        var maxDim = Math.max(size.x, size.y, size.z);
        var scale = 0.88 / maxDim;  // Scale to match default box width
        loaded.scale.multiplyScalar(scale);
        
        // Recenter after scaling
        bbox.setFromObject(loaded);
        var center = bbox.getCenter(new THREE.Vector3());
        loaded.position.sub(center);
        
        loaded.position.copy(pos);
        loaded.rotation.x = 10 * (Math.PI / 180);  // 10 degrees initial tilt
        loaded.userData.rotSpeed = defaultMesh.userData.rotSpeed;
        loaded.userData.rotSpeedX = defaultMesh.userData.rotSpeedX;
        loaded.userData.rotSpeedZ = defaultMesh.userData.rotSpeedZ;
        loaded.userData.projKey  = proj.key;
        projectMeshGroup.add(loaded);
        // Swap reference in array
        var idx = projectMeshes.indexOf(defaultMesh);
        if (idx !== -1) projectMeshes[idx] = loaded;
      },
      undefined,
      function () { /* silently keep default box */ }
    );
  }

  // ── RESIZE ────────────────────────────────────────────────
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ── SCREEN OVERLAY TRACKING ───────────────────────────────
  function updateOverlay() {
    monitorGroup.updateMatrixWorld(true);

    var minX = Infinity, maxX = -Infinity;
    var minY = Infinity, maxY = -Infinity;

    for (var i = 0; i < localCorners.length; i++) {
      var world = localCorners[i].clone().applyMatrix4(monitorGroup.matrixWorld);
      var ndc   = world.project(camera);
      var sx    = (ndc.x + 1) / 2 * window.innerWidth;
      var sy    = (-ndc.y + 1) / 2 * window.innerHeight;
      if (sx < minX) minX = sx;
      if (sx > maxX) maxX = sx;
      if (sy < minY) minY = sy;
      if (sy > maxY) maxY = sy;
    }

    var overlay = document.getElementById('screen-overlay');
    if (overlay) {
      overlay.style.left   = minX + 'px';
      overlay.style.top    = minY + 'px';
      overlay.style.width  = (maxX - minX) + 'px';
      overlay.style.height = (maxY - minY + 26) + 'px';  // Add 26px for taskbar height
    }
    screenRect.left   = minX;
    screenRect.top    = minY;
    screenRect.width  = maxX - minX;
    screenRect.height = maxY - minY + 26;  // Include taskbar height
  }

  // ── VOID ICON HTML OVERLAY (project icon labels + click targets) ──
  function updateVoidIcons() {
    var projects = SITE_DATA.projects;
    for (var i = 0; i < projects.length; i++) {
      var proj = projects[i];
      var el   = document.getElementById('void-icon-' + proj.key);
      if (!el || !proj._scenePos) continue;

      var ndc = proj._scenePos.clone().project(camera);
      var sx  = (ndc.x + 1) / 2 * window.innerWidth;
      var sy  = (-ndc.y + 1) / 2 * window.innerHeight;
      el.style.left = sx + 'px';
      el.style.top  = sy + 'px';
    }
  }

  // ── VERTEX JITTER (PSX wobble) ────────────────────────────
  function applyJitter() {
    if (!monitorGroup) return;
    monitorGroup.children.forEach(function (mesh) {
      var amt = mesh.userData.jitter;
      if (!amt) return;
      var geo  = mesh.geometry;
      var orig = geo.userData.origPos;
      if (!orig) return;
      var pos = geo.attributes.position;
      for (var i = 0; i < pos.count; i++) {
        pos.setX(i, orig[i * 3]     + (Math.random() - 0.5) * amt);
        pos.setY(i, orig[i * 3 + 1] + (Math.random() - 0.5) * amt);
        pos.setZ(i, orig[i * 3 + 2] + (Math.random() - 0.5) * amt);
      }
      pos.needsUpdate = true;
    });
  }

  // ── RENDER LOOP ───────────────────────────────────────────
  var jitterCnt = 0;
  function renderLoop() {
    requestAnimationFrame(renderLoop);
    var t = Date.now() * 0.001;

    // LED pulse (monitor is otherwise static — no Y float)
    monitorGroup.children.forEach(function (m) {
      if (!m.userData.isLed) return;
      var v = 0.6 + 0.4 * Math.sin(t * 2.0);
      m.material.color.setRGB(0, v, v * 0.12);
    });

    // Rotate project icon meshes on all axes with random speeds/directions
    projectMeshes.forEach(function (mesh) {
      mesh.rotation.x += mesh.userData.rotSpeedX || ((Math.random() > 0.5 ? 1 : -1) * 0.004);
      mesh.rotation.y += mesh.userData.rotSpeed || (Math.random() > 0.5 ? 0.008 : -0.008);
      mesh.rotation.z += mesh.userData.rotSpeedZ || ((Math.random() > 0.5 ? 1 : -1) * 0.004);
    });

    jitterCnt++;
    if (jitterCnt % 8 === 0) applyJitter();

    renderer.render(threeScene, camera);
    updateOverlay();
    updateVoidIcons();
  }

  function showProjectMeshes(on) {
    projectMeshGroup.visible = on;
  }

  return { init: init, screenRect: screenRect, showProjectMeshes: showProjectMeshes };

}());