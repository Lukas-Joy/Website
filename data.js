/**
 * ============================================================
 * SITE DATA — data.js (Placeholder Text)
 * ============================================================
 */

const SITE_DATA = {

  // ── IDENTITY ──────────────────────────────────────────────
  identity: {
    name: "Lorem Ipsum",
    tagline: "Designer · Game Developer",
    systemName: "LJSYS v2.0",
  },

  // ── ABOUT ─────────────────────────────────────────────────
  about: {
    title: "about.html",
    paragraphs: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    ],
    skills: ["LOREM", "IPSUM", "DOLOR", "SIT AMET", "CONSECTETUR", "ADIPISCING"],
  },

  // ── CONTACT / LINKS ───────────────────────────────────────
  contact: {
    title: "contact.txt",
    email: "lorem@ipsum.com",
    links: [
      { label: "itch.io", icon: "🎮", url: "https://example.com", display: "example.com" },
      { label: "YouTube", icon: "▶", url: "https://youtube.com", display: "@example" },
      { label: "GitHub", icon: "⌥", url: "https://github.com/example", display: "github.com/example" }
    ],
    note: "Response time: lorem ipsum.",
  },

  // ── CV / RESUME ───────────────────────────────────────────
  cv: {
    title: "CV.pdf",
    downloadUrl: "#",
    experience: [
      {
        role: "Lorem Role 1",
        company: "Lorem Company 1",
        period: "2020 - 2021",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      },
      {
        role: "Lorem Role 2",
        company: "Lorem Company 2",
        period: "2021 - 2022",
        description: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      },
    ],
    education: [
      {
        degree: "Bachelor of Lorem Ipsum",
        institution: "University of Dolor Sit",
        year: "2019",
      },
    ],
    awards: [
      "Lorem Award 1",
      "Lorem Award 2",
    ],
  },

  // ── PROJECTS ──────────────────────────────────────────────
  projects: [
    {
      key: "game1",
      title: "LOREM_GAME_1",
      subtitle: "project.exe",
      icon: "🎮",
      year: "2024",
      type: "GAME",
      tags: ["LOREM", "IPSUM", "GAME", "JAM"],
      voidPos: [-4.8, 1.6, 0.2],
      previewType: "platformer",
      shortDesc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      fullDesc: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      ],
      playUrl: "#",
      platform: "Browser / Windows",
      duration: "~30 min",
    },
    {
      key: "game2",
      title: "LOREM_GAME_2",
      subtitle: "static_fauna.exe",
      icon: "👾",
      year: "2023",
      type: "GAME",
      tags: ["LOREM", "HORROR", "EXPLORATION"],
      voidPos: [4.8, 0.8, -0.3],
      previewType: "horror",
      shortDesc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      fullDesc: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      ],
      playUrl: "#",
      platform: "Browser / Windows / Mac",
      duration: "~35 min",
    },
    {
      key: "game3",
      title: "LOREM_GAME_3",
      subtitle: "corridor.exe",
      icon: "🕹️",
      year: "2022",
      type: "GAME",
      tags: ["LOREM", "WALKING SIM", "BRUTALIST"],
      voidPos: [-4.5, -1.4, 0.4],
      previewType: "corridor",
      shortDesc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      fullDesc: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      ],
      playUrl: "#",
      platform: "Browser",
      duration: "∞",
    },
    {
      key: "design1",
      title: "LOREM_DESIGN_1",
      subtitle: "brand_null.pdf",
      icon: "✦",
      year: "2024",
      type: "DESIGN",
      tags: ["BRANDING", "IDENTITY", "PRINT"],
      voidPos: [4.2, -1.8, 0.1],
      previewType: "brand",
      shortDesc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      fullDesc: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
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