# Lukas Joy — Retro Desktop 3D Hub

An interactive 3D portfolio site with a PSX aesthetic. Built with Three.js + vanilla JS/CSS.

## File Structure

```
index.html              Main entry point
data.js                 ← EDIT THIS FILE to update all site content
css/
  style.css             All styles
js/
  scene.js              Three.js 3D scene, monitor mesh, render loop
  desktop.js            Desktop icons, drag behaviour, taskbar
  windows.js            Popup windows (about, contact, cv)
  project-app.js        project.exe application + canvas previews
  main.js               Boot sequence & initialisation
```

## Editing Content

**All site text lives in `data.js`.** Open it and edit:

- `identity` — your name and tagline
- `about.paragraphs` — about section text
- `about.skills` — skill tags
- `contact.email` — your email
- `contact.links` — social/portfolio links (add or remove as needed)
- `cv.experience` — work history entries
- `cv.education` — education entries
- `cv.awards` — award list
- `cv.downloadUrl` — link to your actual CV PDF
- `projects` — each project entry (see below)
- `bootLines` — text shown during the startup sequence

### Adding a Project

Add an entry to the `projects` array in `data.js`:

```js
{
  key: "myproject",           // unique identifier (no spaces)
  title: "MY PROJECT",        // displayed title
  subtitle: "myproject.exe",  // small subtitle
  icon: "🎮",                 // emoji shown as void icon
  year: "2024",
  type: "GAME",               // or "DESIGN", etc.
  tags: ["TAG1", "TAG2"],
  voidPos: [-4.5, 1.2, 0],   // [x, y, z] position in 3D void
  previewType: "platformer",  // see preview types below
  shortDesc: "Short description shown in catalogue.",
  fullDesc: [
    "Paragraph one of full description.",
    "Paragraph two.",
  ],
  playUrl: "https://...",
  platform: "Browser / Windows",
  duration: "~30 min",
}
```

**Preview types** (canvas-animated):
- `"platformer"` — side-scrolling PSX platformer look
- `"horror"` — dark forest creature horror
- `"corridor"` — infinite brutalist corridor
- `"brand"` — minimal rotating brand mark

To add a custom preview, add a new `renderMyPreview(ctx, W, H, frame)` function in `js/project-app.js` and reference it in the `renderers` map.

## Deploying to GitHub Pages

1. Push all files to a GitHub repo
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch → main → / (root)**
4. Your site will be live at `https://yourusername.github.io/repo-name`

No build step required. All dependencies load from CDN.
