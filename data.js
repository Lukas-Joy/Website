/**
 * ============================================================
 * SITE DATA — data.js
 * Edit this file to update all content across the site.
 * ============================================================
 */

const SITE_DATA = {

  // ── IDENTITY ──────────────────────────────────────────────
  identity: {
    name: "Lukas Joy",
    tagline: "Designer · Game Developer · Digital Void Dweller",
    systemName: "LJSYS v2.0",
  },

  // ── ABOUT ─────────────────────────────────────────────────
  about: {
    title: "about.html",
    paragraphs: [
      "Hi. I'm Lukas Joy.",
      "Designer and game developer operating somewhere between a CRT monitor and the void. I make games that feel wrong in interesting ways, and brands that look right for all the wrong reasons.",
      "Currently: open to weird projects. Previously: making weird projects elsewhere.",
      "I'm drawn to the aesthetics of broken technology, deleted things, and digital spaces that feel like they were authored by someone who forgot they were mortal.",
    ],
    skills: ["GAME DESIGN", "BRANDING", "3D", "UI/UX", "PSX AESTHETIC", "MOTION", "GODOT", "UNITY"],
  },

  // ── CONTACT / LINKS ───────────────────────────────────────
  contact: {
    title: "contact.txt",
    email: "lukas@lukasjoy.com",
    links: [
      { label: "itch.io",     icon: "🎮", url: "https://lukasjoy.itch.io",           display: "lukasjoy.itch.io" },
      { label: "YouTube",     icon: "▶",  url: "https://youtube.com/@lukasjoy",       display: "@lukasjoy" },
      { label: "Instagram",   icon: "◈",  url: "https://instagram.com/lukasjoy",      display: "@lukasjoy" },
      { label: "GitHub",      icon: "⌥",  url: "https://github.com/lukasjoy",         display: "github.com/lukasjoy" },
      { label: "Twitter/X",   icon: "✦",  url: "https://x.com/lukasjoy",              display: "@lukasjoy" },
    ],
    note: "Response time: eventually. Timezone: chaotic.",
  },

  // ── CV / RESUME ───────────────────────────────────────────
  cv: {
    title: "CV.pdf",
    downloadUrl: "#", // Replace with actual PDF URL
    experience: [
      {
        role: "Freelance Designer & Developer",
        company: "Self",
        period: "2022 — present",
        description: "Building weird stuff for interesting people. Game dev, brand identity, interactive experiences.",
      },
      {
        role: "Junior Designer",
        company: "NEON STUDIO",
        period: "2020 — 2022",
        description: "Brand identity, motion graphics, digital experiences for mid-sized tech clients.",
      },
    ],
    education: [
      {
        degree: "BA Graphic Design",
        institution: "University of the Arts",
        year: "2020",
      },
    ],
    awards: [
      "RGD Gold Award — Brand Identity, 2024",
      "LDJAM 54 — Best Aesthetic, 2023",
    ],
  },

  // ── PROJECTS ──────────────────────────────────────────────
  // voidPos: [x, y, z] position in 3D space around the monitor
  // previewType: determines which canvas animation to play
  projects: [
    {
      key: "game1",
      title: "VOID_RUNNER",
      subtitle: "project.exe",
      icon: "🎮",
      year: "2024",
      type: "GAME",
      tags: ["UNITY", "PSX", "PLATFORMER", "GAME JAM"],
      voidPos: [-4.8, 1.6, 0.2],
      previewType: "platformer",
      shortDesc: "PSX-aesthetic platformer with procedurally deleted levels.",
      fullDesc: [
        "A PSX-aesthetic platformer where every level generates from deleted data. The protagonist is a player character who slowly realises she exists inside an uninstalled game.",
        "Each level is procedurally assembled from corrupted file fragments — platforms that flicker in and out, geometry that remembers being something else.",
        "Made in 48 hours for LDJAM 54. Won 'Best Aesthetic'.",
      ],
      playUrl: "https://lukasjoy.itch.io/void-runner",
      platform: "Browser / Windows",
      duration: "~30 min",
    },
    {
      key: "game2",
      title: "STATIC_FAUNA",
      subtitle: "static_fauna.exe",
      icon: "👾",
      year: "2023",
      type: "GAME",
      tags: ["GODOT", "HORROR", "EXPLORATION"],
      voidPos: [4.8, 0.8, -0.3],
      previewType: "horror",
      shortDesc: "Wildlife photography horror. The wildlife is not what it was.",
      fullDesc: [
        "You photograph wildlife in a national park. At dusk the fauna stops following normal rules of geometry.",
        "A slow-burn first-person horror game about observation, documentation, and the creeping sense that you are also being documented.",
        "Playtime ~35 minutes. 4.8★ on itch.io.",
      ],
      playUrl: "https://lukasjoy.itch.io/static-fauna",
      platform: "Browser / Windows / Mac",
      duration: "~35 min",
    },
    {
      key: "game3",
      title: "CORRIDOR_NULL",
      subtitle: "corridor.exe",
      icon: "🕹️",
      year: "2022",
      type: "GAME",
      tags: ["UNITY", "WALKING SIM", "BRUTALIST"],
      voidPos: [-4.5, -1.4, 0.4],
      previewType: "corridor",
      shortDesc: "Infinite brutalist office. Meditation on corporate meaninglessness.",
      fullDesc: [
        "Walking sim set inside a brutalist office building that loops infinitely. Each loop the furniture shifts slightly. The exits lead back in.",
        "A meditation on corporate meaninglessness and the slow horror of routine.",
        "2.1k plays. Featured on Itch.io front page.",
      ],
      playUrl: "https://lukasjoy.itch.io/corridor-null",
      platform: "Browser",
      duration: "∞",
    },
    {
      key: "design1",
      title: "BRAND_NULL",
      subtitle: "brand_null.pdf",
      icon: "✦",
      year: "2024",
      type: "DESIGN",
      tags: ["BRANDING", "IDENTITY", "PRINT", "AWARD"],
      voidPos: [4.2, -1.8, 0.1],
      previewType: "brand",
      shortDesc: "Brand identity for a startup that sold nothing. Won gold.",
      fullDesc: [
        "Complete brand identity for a conceptual tech startup whose product was literally nothing. Tagline: \"Experience the Absence.\"",
        "Full identity system: logo, type system, packaging, website, and a 48-page brand guidelines document for a product that does not exist.",
        "Won gold at RGD Awards 2024.",
      ],
      playUrl: "#",
      platform: "Print / Digital",
      duration: "N/A",
    },
  ],

  // ── BOOT SEQUENCE ─────────────────────────────────────────
  bootLines: [
    "LJSYS v2.0 BIOS — Initializing...",
    "MEMORY CHECK: ████████████████ 64MB OK",
    "VOID ENGINE: loading renderer...",
    "PSX MODE: vertex jitter enabled",
    "DESKTOP ENVIRONMENT: starting...",
    "Welcome to LJSYS Desktop",
    "> _",
  ],

};
