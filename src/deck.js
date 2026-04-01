/**
 * BITCOINCIERGE PITCH DECK — WEEK 11
 * SofB Accelerator Pitch · 2026
 * ─────────────────────────────────────────────────────────────────────────────
 * SLIDE MAP:
 *   slide01_AudienceQuestion     Slide 1  — "Building a Bitcoin startup?"
 *   slide02_BossBattle           Slide 2  — YOU DIED / Hardest boss battle
 *   slide03_ExBitcoiners         Slide 3  — McDonald's meme / bear market
 *   slide04_Normies              Slide 4  — "Is Bitcoin in the room with us?"
 *   slide05a_AdsCompliance       Slide 5a — Ads blocked by compliance
 *   slide05b_SocialFatigue       Slide 5b — High CAC, AI slop, fatigue
 *   slide05c_Conferences         Slide 5c — Expensive influencers & sponsorships
 *   slide06_CurrentWorkarounds   Slide 6  — Community logos + brands
 *   slide07_Limitations          Slide 7  — 5 pain points
 *   slide08_ProblemStatement     Slide 8  — The Problem
 *   slide09_Cover                Slide 9  — Bitcoincierge title
 *   slide10_Solution             Slide 10 — 4 pillars
 *   slide11_WhyNow               Slide 11 — Two forces
 *   slide12_IndiaMap             Slide 12 — Bitcoin mentors seeded
 *   slide13_AIFatigue            Slide 13 — Pendulum swinging offline
 *   slide14_MarketTraction       Slide 14 — Market & Traction stats
 *   slide15_GTM                  Slide 15 — Go-to-Market
 *   slide16_BusinessModel        Slide 16 — Fixed + Variable fees
 *   slide17_ProofOfWork          Slide 17 — Brands on India map
 *   slide18_Ask                  Slide 18 — The Ask
 *   slide19_QandA                Slide 19 — Q&A
 * ─────────────────────────────────────────────────────────────────────────────
 * TO EDIT: each slide is its own function. Tell Claude:
 *   "In slide06_CurrentWorkarounds, update the brand name under B4I logo to..."
 * ─────────────────────────────────────────────────────────────────────────────
 */

const pptxgen = require("pptxgenjs");
const path    = require("path");
const fs      = require("fs");
const IMGS    = require("../assets/images_b64.js");

// ─── THEMES ──────────────────────────────────────────────────────────────────
const THEMES = {
  "dark-bitcoin": {
    name: "Dark Bitcoin",
    bgDark:    "111111",
    bgLight:   "FAF9F6",
    bgPanel:   "1A1A1A",
    bgPanelDk: "0F0F0F",   // deeper dark panel (cards on dark slides)
    bgCard:    "FFFFFF",
    bgCardBorder: "E5E7EB",
    panelBorder:  "2A2A2A",   // border on dark panel cards
    separator:    "333333",   // thin divider line
    accent:    "F26522",
    accentDk:  "D54E10",
    textOnDark:  "FFFFFF",
    textOnLight: "111827",
    textMuted:   "6B7280",
    textSubtle:  "374151",
    red:   "DC2626",
    blue:  "3B82F6",
    green: "10B981",
    purple:"8B5CF6",
    pink:  "EC4899",
    teal:  "14B8A6",
  },
  "white-orange": {
    name: "White & Orange",
    bgDark:    "FFFFFF",
    bgLight:   "FFF7F0",
    bgPanel:   "FEF0E6",
    bgPanelDk: "FCE8D5",   // warm light card on white slides
    bgCard:    "FFFFFF",
    bgCardBorder: "FDDAB5",
    panelBorder:  "F5C49A",   // warm orange border
    separator:    "FDDAB5",   // warm divider
    accent:    "F26522",
    accentDk:  "D54E10",
    textOnDark:  "1A1A1A",
    textOnLight: "1A1A1A",
    textMuted:   "8C5A3A",
    textSubtle:  "5C3A20",
    red:   "DC2626",
    blue:  "1D4ED8",
    green: "15803D",
    purple:"7C3AED",
    pink:  "DB2777",
    teal:  "0F766E",
  },
  "navy-blue": {
    name: "Navy & Gold",
    bgDark:    "0F172A",
    bgLight:   "F0F4FF",
    bgPanel:   "1E293B",
    bgPanelDk: "0F172A",
    bgCard:    "FFFFFF",
    bgCardBorder: "CBD5E1",
    panelBorder:  "334155",
    separator:    "1E293B",
    accent:    "F59E0B",
    accentDk:  "D97706",
    textOnDark:  "F1F5F9",
    textOnLight: "0F172A",
    textMuted:   "64748B",
    textSubtle:  "334155",
    red:   "EF4444",
    blue:  "3B82F6",
    green: "10B981",
    purple:"8B5CF6",
    pink:  "EC4899",
    teal:  "14B8A6",
  },
  "green-bitcoin": {
    name: "Forest Green",
    bgDark:    "0D1F1A",
    bgLight:   "F0FDF4",
    bgPanel:   "14291F",
    bgPanelDk: "0D1F1A",
    bgCard:    "FFFFFF",
    bgCardBorder: "BBF7D0",
    panelBorder:  "166534",
    separator:    "14532D",
    accent:    "16A34A",
    accentDk:  "15803D",
    textOnDark:  "ECFDF5",
    textOnLight: "052E16",
    textMuted:   "6B7280",
    textSubtle:  "374151",
    red:   "DC2626",
    blue:  "3B82F6",
    green: "16A34A",
    purple:"8B5CF6",
    pink:  "EC4899",
    teal:  "14B8A6",
  },
};

// ─── LOAD ACTIVE THEME ───────────────────────────────────────────────────────
function loadTheme() {
  var themePath = path.join(__dirname, "..", "theme.json");
  var themeKey = "dark-bitcoin";
  try {
    if (fs.existsSync(themePath)) {
      var saved = JSON.parse(fs.readFileSync(themePath, "utf8"));
      if (saved.theme && THEMES[saved.theme]) themeKey = saved.theme;
    }
  } catch (e) { /* ignore */ }
  return THEMES[themeKey];
}



// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
// C is populated from the active theme so every function reads it correctly.
var T = loadTheme();
const C = {
  cream:        T.bgLight,
  black:        T.bgDark,
  darkPanel:    T.bgPanel,
  panelDk:      T.bgPanelDk,   // deeper dark-slide card fill
  panelBorder:  T.panelBorder, // border on dark-slide cards
  separator:    T.separator,   // thin divider line
  orange:       T.accent,
  orangeDk:     T.accentDk,
  white:        T.bgCard,      // card / shape fill — always a fill color, not text
  onDark:       T.textOnDark,  // text sitting on a dark-background slide
  gray500:      T.textMuted,
  gray700:      T.textSubtle,
  gray900:      T.textOnLight,
  red:          T.red,
  blue:         T.blue,
  green:        T.green,
  purple:       T.purple,
  pink:         T.pink,
  teal:         T.teal,
};


const F = { serif: "Georgia", sans: "Calibri" };


// Brand color legend for Proof of Work slide
const BRAND_COLORS = {
  "GetBit":   C.orange,
  "Ourpool":  C.blue,
  "Cryobrick":C.green,
  "Jetking":  C.purple,
  "Bitasha":  C.pink,
  "Zebpay":   C.teal,
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function makeShadow() {
  return { type: "outer", color: "000000", blur: 6, offset: 2, angle: 135, opacity: 0.08 };
}
function addLabel(s, text) {
  s.addText(text, { x: 0.5, y: 0.35, w: 9, h: 0.22,
    fontFace: F.sans, fontSize: 8.5, bold: true, color: C.orange,
    charSpacing: 3, align: "left", margin: 0 });
}
function addHeadline(s, text, opts) {
  var y    = (opts && opts.y     != null) ? opts.y     : 0.68;
  var h    = (opts && opts.h     != null) ? opts.h     : 1.35;
  var size = (opts && opts.size  != null) ? opts.size  : 36;
  // Default to gray900 (textOnLight) so it's always readable on light slides;
  // callers on dark slides must pass an explicit color if needed.
  var col  = (opts && opts.color != null) ? opts.color : C.gray900;
  s.addShape("rect", { x: 0.45, y: y, w: 0.055, h: h, fill: { color: C.orange } });
  s.addText(text, { x: 0.65, y: y, w: 8.8, h: h,
    fontFace: F.serif, fontSize: size, italic: true,
    color: col, align: "left", margin: 0 });
}
function addLightFooter(s) {
  s.addShape("rect", { x: 0, y: 5.45, w: 10, h: 0.18, fill: { color: C.cream } });
  s.addText("bitcoincierge.in", { x: 0.5, y: 5.46, w: 9, h: 0.16,
    fontFace: F.sans, fontSize: 7.5, color: C.gray500, align: "left", margin: 0 });
}
function addDarkFooter(s) {
  s.addText("bitcoincierge.in", { x: 0.5, y: 5.35, w: 9, h: 0.22,
    fontFace: F.sans, fontSize: 9, color: C.orange, italic: true,
    align: "left", margin: 0 });
}

// ─── INDIA MAP HELPER ────────────────────────────────────────────────────────
// Exact coordinates extracted from original PPTX slide 12
const MAP = {
  x: 1.85, y: 0.047, w: 6.945, h: 6.371,
  cities: {
    Delhi:     { x: 4.408, y: 1.700, labelDir: "right" },
    Ahmedabad: { x: 3.393, y: 2.943, labelDir: "left"  },
    Mumbai:    { x: 3.607, y: 3.409, labelDir: "left"  },
    Goa:       { x: 3.726, y: 3.952, labelDir: "left"  },
    Hyderabad: { x: 5.101, y: 3.710, labelDir: "right" },
    Bangalore: { x: 4.500, y: 4.192, labelDir: "right" },
    Chennai:   { x: 4.872, y: 4.721, labelDir: "right" },
  }
};

function placeMapDot(s, city, color, dotSize, label) {
  var c = MAP.cities[city];
  if (!c) return;
  var ds = dotSize || 0.18;
  s.addText("●", {
    x: c.x, y: c.y - 0.02, w: ds, h: ds + 0.04,
    fontFace: F.sans, fontSize: 18, color: color,
    align: "center", valign: "middle", margin: 0,
  });
  if (label) {
    var lx = c.labelDir === "right" ? c.x + ds + 0.05 : c.x - 1.1;
    var align = c.labelDir === "right" ? "left" : "right";
    s.addText(label, {
      x: lx, y: c.y + 0.01, w: 1.05, h: 0.2,
      fontFace: F.sans, fontSize: 8, bold: true, color: C.gray900,
      align: align, margin: 0,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 1 — Audience Question
// ─────────────────────────────────────────────────────────────────────────────
function slide01_AudienceQuestion(pres) {
  var s = pres.addSlide();
  s.background = { color: C.black };
  s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.orange } });

  // Big centered question
  s.addText("Building or planning\na Bitcoin startup?", {
    x: 0.6, y: 1.0, w: 8.8, h: 2.4,
    fontFace: F.serif, fontSize: 56, italic: true, color: C.onDark,
    align: "left", margin: 0,
  });

  // Raise your hand prompt
  s.addText("🙋  Raise your hand.", {
    x: 0.6, y: 3.65, w: 8, h: 0.65,
    fontFace: F.sans, fontSize: 22, bold: true, color: C.orange,
    align: "left", margin: 0,
  });

  s.addText("Boy! You've chosen an interesting problem for yourself.", {
    x: 0.6, y: 4.45, w: 8, h: 0.4,
    fontFace: F.sans, fontSize: 12, color: C.gray500,
    align: "left", margin: 0, italic: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 2 — Boss Battle (YOU DIED style)
// ─────────────────────────────────────────────────────────────────────────────
function slide02_BossBattle(pres) {
  var s = pres.addSlide();
  s.background = { color: C.black };

  // Red glow top bar
  s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.09, fill: { color: C.red } });

  // "YOU CHOSE..." small text
  s.addText("C O N G R A T U L A T I O N S .   Y O U   C H O S E . . .", {
    x: 0.5, y: 0.55, w: 9, h: 0.3,
    fontFace: F.sans, fontSize: 10, bold: true, color: C.gray500,
    charSpacing: 2, align: "center", margin: 0,
  });

  // "THE HARDEST" in huge white
  s.addText("THE HARDEST", {
    x: 0.3, y: 0.95, w: 9.4, h: 1.1,
    fontFace: F.serif, fontSize: 56, bold: true, color: C.onDark,
    align: "center", margin: 0,
  });

  // "BOSS BATTLE." in orange
  s.addText("BOSS BATTLE.", {
    x: 0.3, y: 2.1, w: 9.4, h: 1.1,
    fontFace: F.serif, fontSize: 56, bold: true, color: C.orange,
    align: "center", margin: 0,
  });

  // Difficulty bar
  s.addText("Difficulty Level:", {
    x: 2.5, y: 3.65, w: 3, h: 0.35,
    fontFace: F.sans, fontSize: 13, color: C.gray500, align: "right", margin: 0,
  });
  // Orange filled blocks
  s.addShape("rect", { x: 5.65, y: 3.72, w: 2.2, h: 0.22, fill: { color: C.orange } });
  s.addText("500%", {
    x: 5.7, y: 3.72, w: 2.1, h: 0.22,
    fontFace: F.sans, fontSize: 12, bold: true, color: C.onDark,
    align: "center", valign: "middle", margin: 0,
  });

  // Subtext
  s.addText("Customers don't care. Marketing doesn't work. Distribution is broken.", {
    x: 0.5, y: 4.25, w: 9, h: 0.35,
    fontFace: F.sans, fontSize: 11, color: C.gray500, italic: true,
    align: "center", margin: 0,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 3 — Ex-Bitcoiners (McDonald's meme)
// ─────────────────────────────────────────────────────────────────────────────
function slide03_ExBitcoiners(pres) {
  var s = pres.addSlide();
  s.background = { color: C.black };

  // Full-bleed meme image centered
  s.addImage({
    data: IMGS.IMG_MEME_MCDONALDS,
    x: 2.5, y: 0.3, w: 5.0, h: 4.2,
  });

  // Dark overlay at bottom for text
  s.addShape("rect", { x: 0, y: 4.6, w: 10, h: 1.0,
    fill: { color: C.black, transparency: 10 } });

  // Label top
  s.addText("THE EX-BITCOINER PROBLEM", {
    x: 0.5, y: 0.12, w: 9, h: 0.28,
    fontFace: F.sans, fontSize: 9, bold: true, color: C.orange,
    charSpacing: 3, align: "center", margin: 0,
  });

  // Bottom punchline
  s.addText("Came for the bull. Clocked out for the bear.", {
    x: 0.5, y: 4.65, w: 9, h: 0.42,
    fontFace: F.serif, fontSize: 18, italic: true, color: C.onDark,
    align: "center", margin: 0,
  });
  s.addText("Many bitcoiners stop caring in the bear cycle — which we are in.", {
    x: 0.5, y: 5.1, w: 9, h: 0.28,
    fontFace: F.sans, fontSize: 10, color: C.gray500,
    align: "center", margin: 0,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 4 — Normies ("Is Bitcoin still in the room with us?")
// ─────────────────────────────────────────────────────────────────────────────
function slide04_Normies(pres) {
  var s = pres.addSlide();
  s.background = { color: C.black };

  // Full meme image
  s.addImage({
    data: IMGS.IMG_MEME_NORMIE,
    x: 1.8, y: 0.3, w: 6.4, h: 4.6,
  });

  // Top label
  s.addText("THE NORMIE PROBLEM", {
    x: 0.5, y: 0.08, w: 9, h: 0.28,
    fontFace: F.sans, fontSize: 9, bold: true, color: C.orange,
    charSpacing: 3, align: "center", margin: 0,
  });

  // Bottom punchline
  s.addShape("rect", { x: 0, y: 4.95, w: 10, h: 0.68,
    fill: { color: C.black } });
  s.addText("The other 1.4 billion Indians? They've never thought about Bitcoin. Not once.", {
    x: 0.5, y: 5.0, w: 9, h: 0.38,
    fontFace: F.serif, fontSize: 16, italic: true, color: C.onDark,
    align: "center", margin: 0,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 5a — Ads + Compliance
// ─────────────────────────────────────────────────────────────────────────────
function slide05a_AdsCompliance(pres) {
  var s = pres.addSlide();
  s.background = { color: C.black };
  s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.orange } });
  addLabel(s, "M A R K E T I N G   C H A N N E L   1   /   3");

  // Big label: "RUN ADS?"
  s.addText("Want to run Bitcoin ads?", {
    x: 0.5, y: 0.55, w: 9, h: 0.65,
    fontFace: F.serif, fontSize: 32, italic: true, color: C.onDark,
    align: "center", margin: 0,
  });

  // Giant REJECTED in red
  s.addShape("rect", { x: 1.8, y: 1.35, w: 6.4, h: 1.55,
    fill: { color: C.panelDk }, line: { color: C.red, width: 5 } });
  s.addText("REJECTED.", {
    x: 1.8, y: 1.35, w: 6.4, h: 1.55,
    fontFace: F.serif, fontSize: 72, bold: true, color: C.red,
    align: "center", valign: "middle", margin: 0,
  });

  // Three platform restrictions
  var platforms = [
    { name: "Google Ads",  note: "Crypto advertising requires certification & ongoing compliance" },
    { name: "Meta / Instagram", note: "Crypto ads require prior written permission. Often denied." },
    { name: "Twitter / X", note: "Allowed but requires financial services certification per market" },
  ];
  platforms.forEach(function(p, i) {
    var py = 3.12 + i * 0.55;
    s.addShape("rect", { x: 0.5, y: py, w: 9.0, h: 0.45,
      fill: { color: C.darkPanel }, line: { color: C.separator, width: 0.5 } });
    s.addText("✕", { x: 0.65, y: py + 0.07, w: 0.3, h: 0.3,
      fontFace: F.sans, fontSize: 12, bold: true, color: C.red, margin: 0 });
    s.addText(p.name, { x: 1.05, y: py + 0.07, w: 2.5, h: 0.3,
      fontFace: F.sans, fontSize: 10, bold: true, color: C.onDark, margin: 0 });
    s.addText(p.note, { x: 3.7, y: py + 0.07, w: 5.7, h: 0.3,
      fontFace: F.sans, fontSize: 9.5, color: C.gray500, margin: 0 });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 5b — High CAC, AI Slop, Social Media Fatigue
// ─────────────────────────────────────────────────────────────────────────────
function slide05b_SocialFatigue(pres) {
  var s = pres.addSlide();
  s.background = { color: C.black };
  s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.orange } });
  addLabel(s, "M A R K E T I N G   C H A N N E L   2   /   3");

  s.addText("Go organic? 📱", {
    x: 0.5, y: 0.52, w: 9, h: 0.7,
    fontFace: F.serif, fontSize: 36, italic: true, color: C.onDark,
    align: "center", margin: 0,
  });

  // Three problems as big dark cards
  var problems = [
    { emoji: "📉", big: "High CAC", sub: "Cost per Bitcoin-curious user is 3–5× a regular fintech customer — a niche audience in a restricted channel." },
    { emoji: "🤖", big: "AI Slop", sub: "Feeds are flooded with AI-generated content. Organic reach is dying. Your post disappears in seconds." },
    { emoji: "😮‍💨", big: "Fatigue", sub: "People have learned to scroll past anything that looks like marketing. Especially in crypto." },
  ];
  problems.forEach(function(p, i) {
    var px = 0.4 + i * 3.1;
    s.addShape("rect", { x: px, y: 1.45, w: 2.95, h: 3.5,
      fill: { color: C.panelDk }, line: { color: C.panelBorder, width: 1 } });
    s.addShape("rect", { x: px, y: 1.45, w: 2.95, h: 0.055,
      fill: { color: C.red } });
    s.addText(p.emoji, { x: px + 0.2, y: 1.65, w: 0.7, h: 0.7,
      fontFace: F.sans, fontSize: 28, margin: 0 });
    s.addText(p.big, { x: px + 0.2, y: 2.45, w: 2.6, h: 0.5,
      fontFace: F.sans, fontSize: 18, bold: true, color: C.onDark, margin: 0 });
    s.addText(p.sub, { x: px + 0.2, y: 3.0, w: 2.6, h: 1.8,
      fontFace: F.sans, fontSize: 9.5, color: C.gray500, margin: 0 });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 5c — Expensive Influencers & Conferences
// ─────────────────────────────────────────────────────────────────────────────
function slide05c_Conferences(pres) {
  var s = pres.addSlide();
  s.background = { color: C.black };
  s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.orange } });
  addLabel(s, "M A R K E T I N G   C H A N N E L   3   /   3");

  s.addText("Pay to play? 💸", {
    x: 0.5, y: 0.52, w: 9, h: 0.7,
    fontFace: F.serif, fontSize: 36, italic: true, color: C.onDark,
    align: "center", margin: 0,
  });

  // Two options with prices
  var opts = [
    {
      icon: "🎙️",
      head: "Bitcoin Conference",
      price: "$250,000+",
      priceLabel: "to sponsor the mainstage",
      who: "Bitcoin Nashville 2025",
      note: "For Coinbase. Not for your seed-stage startup.",
    },
    {
      icon: "🌟",
      head: "Bitcoin Influencer",
      price: "₹5L – ₹25L",
      priceLabel: "per campaign, per creator",
      who: "Top 10 Indian Bitcoin creators",
      note: "No guaranteed conversion. No attribution. No retargeting.",
    },
  ];
  opts.forEach(function(o, i) {
    var ox = 0.5 + i * 4.85;
    s.addShape("rect", { x: ox, y: 1.42, w: 4.6, h: 3.65,
      fill: { color: C.panelDk }, line: { color: C.panelBorder, width: 1 } });
    s.addShape("rect", { x: ox, y: 1.42, w: 4.6, h: 0.055,
      fill: { color: C.red } });
    s.addText(o.icon, { x: ox + 0.25, y: 1.6, w: 0.7, h: 0.65,
      fontFace: F.sans, fontSize: 26, margin: 0 });
    s.addText(o.head, { x: ox + 0.25, y: 2.38, w: 4.1, h: 0.42,
      fontFace: F.sans, fontSize: 13, bold: true, color: C.onDark, margin: 0 });
    s.addText(o.price, { x: ox + 0.25, y: 2.85, w: 4.1, h: 0.72,
      fontFace: F.serif, fontSize: 36, italic: true, color: C.orange, margin: 0 });
    s.addText(o.priceLabel, { x: ox + 0.25, y: 3.58, w: 4.1, h: 0.3,
      fontFace: F.sans, fontSize: 9, color: C.gray700, margin: 0 });
    s.addText(o.who, { x: ox + 0.25, y: 3.92, w: 4.1, h: 0.28,
      fontFace: F.sans, fontSize: 9, bold: true, color: C.gray500, margin: 0 });
    s.addShape("rect", { x: ox + 0.25, y: 4.28, w: 4.1, h: 0.05,
      fill: { color: C.separator } });
    s.addText(o.note, { x: ox + 0.25, y: 4.4, w: 4.1, h: 0.48,
      fontFace: F.sans, fontSize: 9, italic: true, color: C.red, margin: 0 });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 6 — Current Workarounds (3 logo pairs)
// ─────────────────────────────────────────────────────────────────────────────
function slide06_CurrentWorkarounds(pres) {
  var s = pres.addSlide();
  s.background = { color: C.cream };
  addLabel(s, "C U R R E N T   W O R K A R O U N D S");
  addHeadline(s, "Smart founders already\nfigured it out.", { y: 0.52, h: 1.1, size: 30 });

  var pairs = [
    {
      commLogo: IMGS.IMG_B4I_LOGO,
      commName: "B4I Community",
      brand:    "Bitcoin Keeper",
      logic:    "Keeper built B4I to demo their custody product to a warm, pre-qualified Bitcoin audience — without paying for ads.",
    },
    {
      commLogo: IMGS.IMG_BTC_BHARAT,
      commName: "Bitcoin Bharat",
      brand:    "SwapSo",
      logic:    "SwapSo's founding team built Bitcoin Bharat so college students could discover and use SwapSo through community first.",
    },
    {
      commLogo: IMGS.IMG_BTC_WAALE,
      commName: "Bitcoinwaale",
      brand:    "GetBit",
      logic:    "GetBit created Bitcoinwaale — a Bitcoin education community — so more Indians discover GetBit through learning, not ads.",
    },
  ];

  pairs.forEach(function(p, i) {
    var cx = 0.4 + i * 3.2;
    // Card
    s.addShape("rect", { x: cx, y: 1.8, w: 3.0, h: 3.45,
      fill: { color: C.white }, line: { color: "E5E7EB", width: 0.75 },
      shadow: makeShadow() });
    s.addShape("rect", { x: cx, y: 1.8, w: 3.0, h: 0.055,
      fill: { color: C.orange } });

    // Community logo
    s.addImage({ data: p.commLogo,
      x: cx + 0.85, y: 1.95, w: 1.3, h: 1.3,
      sizing: { type: "contain", w: 1.3, h: 1.3 } });

    // Community name
    s.addText(p.commName, { x: cx + 0.15, y: 3.3, w: 2.7, h: 0.35,
      fontFace: F.sans, fontSize: 10.5, bold: true, color: C.gray900,
      align: "center", margin: 0 });

    // Arrow down
    s.addText("↓  powers  ↓", { x: cx + 0.15, y: 3.7, w: 2.7, h: 0.28,
      fontFace: F.sans, fontSize: 9, color: C.orange,
      align: "center", margin: 0 });

    // Brand name
    s.addText(p.brand, { x: cx + 0.15, y: 4.02, w: 2.7, h: 0.35,
      fontFace: F.sans, fontSize: 12, bold: true, color: C.orange,
      align: "center", margin: 0 });

    // Logic
    s.addText(p.logic, { x: cx + 0.15, y: 4.42, w: 2.7, h: 0.7,
      fontFace: F.sans, fontSize: 8, color: C.gray500,
      align: "left", margin: 0 });
  });

  addLightFooter(s);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 7 — Limitations
// ─────────────────────────────────────────────────────────────────────────────
function slide07_Limitations(pres) {
  var s = pres.addSlide();
  s.background = { color: C.cream };
  addLabel(s, "B U T   T H I S   M O D E L   H A S   P R O B L E M S");
  addHeadline(s, "Building your own community\nbreaks at scale.", { y: 0.52, h: 1.1, size: 30 });

  var items = [
    { emoji: "🧠", head: "Org time & energy", body: "Organising meetups, community management, 1-on-1 guidance, customer education — all diverts from building the product." },
    { emoji: "🗺️", head: "Physical presence across cities", body: "Every city has its own nuance. Language, examples, culture — you can't copy-paste what works in Bangalore to Delhi." },
    { emoji: "⚙️", head: "Operations & hiring", body: "Booking venues, hiring educators, speakers, managing invites, attendance — a full-time job with no playbook." },
    { emoji: "✈️", head: "Travel & accommodation budget", body: "Team members flying in for every city activation. It burns cash fast with no direct attribution to revenue." },
    { emoji: "📊", head: "End-to-end attribution", body: "Who came? Who touched the product? Who activated? Who's a warm lead? Without tracking, it's all vanity." },
  ];

  items.forEach(function(item, i) {
    var col = i % 2 === 0 ? 0 : 1;
    var row = Math.floor(i / 2);
    if (i === 4) { col = 0; row = 2; } // last item centered
    var ix = i === 4 ? 0.5 : (0.5 + col * 4.78);
    var iw = i === 4 ? 9.0 : 4.55;
    var iy = 1.85 + row * 1.15;
    s.addShape("rect", { x: ix, y: iy, w: iw, h: 1.0,
      fill: { color: C.white }, line: { color: "E5E7EB", width: 0.75 },
      shadow: makeShadow() });
    s.addShape("rect", { x: ix, y: iy, w: 0.055, h: 1.0,
      fill: { color: C.orange } });
    s.addText(item.emoji, { x: ix + 0.18, y: iy + 0.15, w: 0.5, h: 0.5,
      fontFace: F.sans, fontSize: 18, margin: 0 });
    s.addText(item.head, { x: ix + 0.78, y: iy + 0.1, w: iw - 1.0, h: 0.35,
      fontFace: F.sans, fontSize: 10.5, bold: true, color: C.gray900, margin: 0 });
    s.addText(item.body, { x: ix + 0.78, y: iy + 0.48, w: iw - 1.0, h: 0.42,
      fontFace: F.sans, fontSize: 9, color: C.gray500, margin: 0 });
  });

  addLightFooter(s);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 8 — Problem Statement (DARK)
// ─────────────────────────────────────────────────────────────────────────────
function slide08_ProblemStatement(pres) {
  var s = pres.addSlide();
  s.background = { color: C.black };
  s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.orange } });
  addLabel(s, "T h e   P r o b l e m");

  // Orange vertical bar
  s.addShape("rect", { x: 0.5, y: 1.0, w: 0.07, h: 3.2, fill: { color: C.orange } });

  s.addText("IRL events & community management\nare the most effective way\nto get to a billion+ Indians.", {
    x: 0.8, y: 1.0, w: 8.8, h: 1.95,
    fontFace: F.serif, fontSize: 34, italic: true, color: C.onDark,
    align: "left", margin: 0,
  });

  s.addShape("rect", { x: 0.8, y: 3.05, w: 8.8, h: 0.055,
    fill: { color: C.separator } });

  s.addText("But Bitcoin products and services lack the\nexecution & operations muscle to actualise it.", {
    x: 0.8, y: 3.2, w: 8.8, h: 1.0,
    fontFace: F.serif, fontSize: 28, italic: true, color: C.orange,
    align: "left", margin: 0,
  });

  addDarkFooter(s);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 9 — Cover (Bitcoincierge Title)
// ─────────────────────────────────────────────────────────────────────────────
function slide09_Cover(pres) {
  var s = pres.addSlide();
  s.background = { color: C.black };
  s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.orange } });
  s.addShape("rect", { x: 7.4, y: 0.07, w: 2.6, h: 5.2, fill: { color: C.darkPanel } });
  s.addText("Bitcoincierge", {
    x: 0.5, y: 0.7, w: 7.0, h: 1.2,
    fontFace: F.serif, fontSize: 68, italic: true, color: C.onDark, align: "left", margin: 0,
  });
  s.addShape("rect", { x: 0.5, y: 1.85, w: 2.5, h: 0.055, fill: { color: C.orange } });
  s.addText("IRL Event and Community Management.\nFor Bitcoin brands. In India.", {
    x: 0.5, y: 2.05, w: 6.7, h: 0.9,
    fontFace: F.sans, fontSize: 18, color: C.onDark, align: "left", margin: 0,
  });
  s.addText("D e m o s .   W o r k s h o p s .   M e e t u p s .", {
    x: 0.5, y: 3.15, w: 6.5, h: 0.4,
    fontFace: F.sans, fontSize: 11.5, bold: true, color: C.orange, align: "left", margin: 0,
  });
  s.addShape("rect", { x: 0, y: 5.2, w: 10, h: 0.43, fill: { color: C.black } });
  s.addText("SofB Accelerator Pitch", {
    x: 0.5, y: 5.22, w: 6, h: 0.3,
    fontFace: F.sans, fontSize: 9, color: C.gray500, align: "left", margin: 0,
  });
  s.addText("2026", {
    x: 0.5, y: 5.22, w: 9, h: 0.3,
    fontFace: F.sans, fontSize: 9, color: C.gray500, align: "right", margin: 0,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 10 — Our Solution (4 pillars)
// ─────────────────────────────────────────────────────────────────────────────
function slide10_Solution(pres) {
  var s = pres.addSlide();
  s.background = { color: "FAF9F6" };
  addLabel(s, "O u r   S o l u t i o n");
  addHeadline(s, "IRL event & community management\nas a service — for Bitcoin brands.", { y: 0.55, h: 1.18, size: 30 });

  // Orange banner
  s.addShape("rect", { x: 0.5, y: 1.92, w: 9.0, h: 0.72, fill: { color: C.orange } });
  s.addText("Plug in on Day 1. Demo, acquire, and activate users — without building a team, traveling, or starting a community from zero.", {
    x: 0.7, y: 1.95, w: 8.6, h: 0.66,
    fontFace: F.serif, fontSize: 12.5, italic: true, color: C.onDark,
    align: "center", valign: "middle", margin: 0,
  });

  var features = [
    { emoji: "📍", head: "Venue & Logistics",   body: "We handle booking, setup, and operations across 7 cities" },
    { emoji: "👥", head: "Curated Audience",    body: "Pre-qualified participants from our community — not a random crowd" },
    { emoji: "🎤", head: "Expert Mentors",      body: "Bitcoin-native coaches, hand-picked or approved by you" },
    { emoji: "📊", head: "Attribution Reports", body: "Post-event summary: attendance, demos, leads generated" },
  ];
  features.forEach(function(f, i) {
    var fx = 0.5 + i * 2.28;
    s.addShape("rect", { x: fx, y: 2.85, w: 2.15, h: 2.3,
      fill: { color: C.white }, line: { color: "E5E7EB", width: 0.75 }, shadow: makeShadow() });
    s.addText(f.emoji, { x: fx + 0.18, y: 3.0, w: 0.55, h: 0.55,
      fontFace: F.sans, fontSize: 22, margin: 0 });
    s.addText(f.head, { x: fx + 0.18, y: 3.65, w: 1.82, h: 0.42,
      fontFace: F.sans, fontSize: 10, bold: true, color: C.gray900, margin: 0 });
    s.addText(f.body, { x: fx + 0.18, y: 4.15, w: 1.82, h: 0.88,
      fontFace: F.sans, fontSize: 9, color: C.gray500, margin: 0 });
  });
  addLightFooter(s);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 11 — Why Now (bridge)
// ─────────────────────────────────────────────────────────────────────────────
function slide11_WhyNow(pres) {
  var s = pres.addSlide();
  s.background = { color: "FAF9F6" };
  addLabel(s, "W h y   N o w");
  addHeadline(s, "Two big forces are on our side.", { y: 0.55, h: 0.82, size: 34 });

  var cards = [
    { num: "1", head: "Bitcoin mentors & community are seeded in major Indian cities",
      body: "Thanks to years of work by Bitshala and other Bitcoin communities, a dense mentor network exists across Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Ahmedabad, and Goa — trained, ready to demo and onboard." },
    { num: "2", head: "The pendulum is swinging back offline",
      body: "People are burned out by social media and AI-generated content. The new generation wants to experience things in person. The utility of being terminally online is decreasing fast — and we meet people exactly where they are going next." },
  ];
  cards.forEach(function(c, i) {
    var cx = 0.5 + i * 4.85;
    s.addShape("rect", { x: cx, y: 1.58, w: 4.6, h: 3.65,
      fill: { color: C.white }, line: { color: "E5E7EB", width: 0.75 }, shadow: makeShadow() });
    s.addShape("rect", { x: cx + 0.2, y: 1.75, w: 0.52, h: 0.52, fill: { color: C.orange } });
    s.addText(c.num, { x: cx + 0.2, y: 1.75, w: 0.52, h: 0.52,
      fontFace: F.sans, fontSize: 15, bold: true, color: C.onDark,
      align: "center", valign: "middle", margin: 0 });
    s.addText(c.head, { x: cx + 0.2, y: 2.4, w: 4.2, h: 0.65,
      fontFace: F.sans, fontSize: 11, bold: true, color: C.gray900, margin: 0 });
    s.addText(c.body, { x: cx + 0.2, y: 3.15, w: 4.2, h: 1.9,
      fontFace: F.sans, fontSize: 9.5, color: C.gray500, margin: 0 });
  });
  addLightFooter(s);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 12 — India Map (mentors seeded)
// ─────────────────────────────────────────────────────────────────────────────
function slide12_IndiaMap(pres) {
  var s = pres.addSlide();
  s.background = { color: "FAF9F6" };
  addLabel(s, "B i t c o i n   m e n t o r s   a n d   c o m m u n i t y   a r e   s e e d e d   i n   m a j o r   c i t i e s");

  // India map (exact original position)
  s.addImage({ data: IMGS.IMG_INDIA_MAP,
    x: MAP.x, y: MAP.y, w: MAP.w, h: MAP.h });

  // City dots with labels (orange = active, gray outline = coming soon)
  var activeCities = ["Delhi","Ahmedabad","Mumbai","Goa","Hyderabad","Bangalore","Chennai"];
  var labels = {
    Delhi:     "Delhi",
    Ahmedabad: "Ahmedabad",
    Mumbai:    "Mumbai",
    Goa:       "Goa",
    Hyderabad: "Hyderabad",
    Bangalore: "Bangalore",
    Chennai:   "Chennai",
  };
  activeCities.forEach(function(city) {
    placeMapDot(s, city, C.orange, 0.18, labels[city]);
  });

  // Left panel legend
  s.addText("7 Cities\nActive", {
    x: 0.25, y: 2.4, w: 1.5, h: 0.9,
    fontFace: F.serif, fontSize: 28, italic: true, color: C.orange,
    align: "center", margin: 0,
  });
  s.addText("Mentors present, community active,\nready to run activations", {
    x: 0.1, y: 3.4, w: 1.7, h: 0.8,
    fontFace: F.sans, fontSize: 8, color: C.gray500, align: "center", margin: 0,
  });
  s.addText("Expanding to\nmore cities", {
    x: 0.1, y: 4.35, w: 1.7, h: 0.5,
    fontFace: F.sans, fontSize: 8, italic: true, color: C.orange,
    align: "center", margin: 0,
  });

  addLightFooter(s);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 13 — AI Fatigue / Pendulum swinging offline (DARK)
// ─────────────────────────────────────────────────────────────────────────────
function slide13_AIFatigue(pres) {
  var s = pres.addSlide();
  s.background = { color: C.black };

  // Left half: ONLINE WORLD (blue glow panel)
  s.addShape("rect", { x: 0, y: 0, w: 4.8, h: 5.625,
    fill: { color: C.darkPanel } });
  s.addShape("rect", { x: 0, y: 0, w: 4.8, h: 0.07,
    fill: { color: "1D4ED8" } });

  s.addText("ONLINE", {
    x: 0.3, y: 0.3, w: 4.2, h: 0.45,
    fontFace: F.sans, fontSize: 11, bold: true, color: "1D4ED8",
    charSpacing: 4, align: "left", margin: 0,
  });
  s.addText("📱 📱 📱\n🤖 🤖 🤖\n📲 📲 📲", {
    x: 0.4, y: 0.85, w: 4.0, h: 2.0,
    fontFace: F.sans, fontSize: 30, align: "center", margin: 0,
  });
  var onlineItems = ["AI-generated content flood", "Crypto ad restrictions", "Doomscrolling & fatigue", "Low ROAS, high burnout"];
  onlineItems.forEach(function(t, i) {
    s.addText("— " + t, { x: 0.4, y: 3.1 + i * 0.42, w: 4.0, h: 0.35,
      fontFace: F.sans, fontSize: 10, color: "4B5563", italic: true, margin: 0 });
  });

  // Divider arrow
  s.addShape("rect", { x: 4.72, y: 0, w: 0.07, h: 5.625,
    fill: { color: C.orange } });
  s.addText("→", { x: 4.4, y: 2.55, w: 1.2, h: 0.55,
    fontFace: F.serif, fontSize: 30, color: C.orange,
    align: "center", valign: "middle", margin: 0 });

  // Right half: OFFLINE / IRL
  s.addText("OFFLINE", {
    x: 5.1, y: 0.3, w: 4.5, h: 0.45,
    fontFace: F.sans, fontSize: 11, bold: true, color: C.orange,
    charSpacing: 4, align: "left", margin: 0,
  });
  s.addText("🙌 🙌 🙌\n🤝 🤝 🤝\n⚡ ⚡ ⚡", {
    x: 5.1, y: 0.85, w: 4.5, h: 2.0,
    fontFace: F.sans, fontSize: 30, align: "center", margin: 0,
  });
  s.addText("The pendulum is swinging\nback offline.", {
    x: 5.1, y: 3.05, w: 4.5, h: 0.85,
    fontFace: F.serif, fontSize: 18, italic: true, color: C.onDark,
    margin: 0,
  });
  s.addText("People want to meet in person. They want to hold the hardware. They want to feel the experience — not scroll past another post about it.", {
    x: 5.1, y: 4.0, w: 4.5, h: 1.08,
    fontFace: F.sans, fontSize: 9.5, color: C.gray500, margin: 0,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 14 — Market & Traction
// ─────────────────────────────────────────────────────────────────────────────
function slide14_MarketTraction(pres) {
  var s = pres.addSlide();
  s.background = { color: "FAF9F6" };
  addLabel(s, "T h e   M a r k e t   A n d   T r a c t i o n");
  addHeadline(s, "India is open to Bitcoin products.\nWe are just getting started.", { y: 0.52, h: 1.1, size: 28 });

  var stats = [
    { num: "1B+",    label: "Indians reachable\nthrough IRL activations" },
    { num: "8 / 97", label: "Tier-1 cities and\nTier-2 cities in India" },
    { num: "200+",   label: "Bitcoin products &\nservices usable in India" },
    { num: "2,000+", label: "Existing community\nmembers" },
    { num: "6 / 1",  label: "Tier-1 and Tier-2\ncities we cover" },
    { num: "6",      label: "Existing brand\npartnerships" },
  ];
  stats.forEach(function(st, i) {
    var col = i % 3;
    var row = Math.floor(i / 3);
    var sx = 0.5 + col * 3.08;
    var sy = 1.82 + row * 1.58;
    s.addShape("rect", { x: sx, y: sy, w: 2.88, h: 1.38,
      fill: { color: C.white }, line: { color: "E5E7EB", width: 0.75 }, shadow: makeShadow() });
    s.addText(st.num, { x: sx + 0.18, y: sy + 0.08, w: 2.5, h: 0.68,
      fontFace: F.serif, fontSize: 34, italic: true, color: C.orange, margin: 0 });
    s.addText(st.label, { x: sx + 0.18, y: sy + 0.8, w: 2.5, h: 0.45,
      fontFace: F.sans, fontSize: 9, color: C.gray500, margin: 0 });
  });
  addLightFooter(s);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 15 — Go-to-Market
// ─────────────────────────────────────────────────────────────────────────────
function slide15_GTM(pres) {
  var s = pres.addSlide();
  s.background = { color: "FAF9F6" };
  addLabel(s, "G o - t o - M a r k e t");
  addHeadline(s, "Warm intro → Proof of work → Expand.", { y: 0.52, h: 0.82, size: 30 });

  var steps = [
    { num: "01", head: "Warm intro or cold outreach",  body: "Bitshala refers brands outside open-source mandate. We also do cold outreach to our target list." },
    { num: "02", head: "Partner for First Pilot",      body: "Show proof of work from past partners (GetBit, Trezor, Zebpay, Ourpool)" },
    { num: "03", head: "Pilot event",                  body: "Brand sponsors one event — fixed fee only, no risk. We handle everything." },
    { num: "04", head: "First activation",             body: "Brand joins a meetup as attendee first, sees the audience and experience." },
    { num: "05", head: "Retainer & revenue share",     body: "After proven CPA, brand moves to ongoing IRL strategy with performance fees." },
  ];
  steps.forEach(function(st, i) {
    var sx = 0.38 + i * 1.85;
    s.addShape("rect", { x: sx, y: 1.5, w: 1.72, h: 3.72,
      fill: { color: C.white }, line: { color: "E5E7EB", width: 0.75 }, shadow: makeShadow() });
    s.addShape("rect", { x: sx, y: 1.5, w: 1.72, h: 0.055, fill: { color: C.orange } });
    s.addText(st.num, { x: sx + 0.15, y: 1.65, w: 1.4, h: 0.45,
      fontFace: F.sans, fontSize: 18, bold: true, color: C.gray900, margin: 0 });
    s.addText(st.head, { x: sx + 0.15, y: 2.2, w: 1.42, h: 0.65,
      fontFace: F.sans, fontSize: 9.5, bold: true, color: C.gray900, margin: 0 });
    s.addText(st.body, { x: sx + 0.15, y: 2.95, w: 1.42, h: 2.1,
      fontFace: F.sans, fontSize: 8.5, color: C.gray500, margin: 0 });
  });
  addLightFooter(s);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 16 — Business Model
// ─────────────────────────────────────────────────────────────────────────────
function slide16_BusinessModel(pres) {
  var s = pres.addSlide();
  s.background = { color: "FAF9F6" };
  addLabel(s, "B u s i n e s s   M o d e l");
  addHeadline(s, "We charge brands. Not participants.", { y: 0.52, h: 0.82, size: 30 });

  var blocks = [
    { tag: "FIXED",    tagBg: "D6E4EF", tagColor: "3A6080",
      head: "Event Execution Fee", amount: "₹15,000 – ₹20,000", sub: "per event",
      items: ["Venue booking & management","Mentor / speaker time","Snacks, logistics, ops","Post-event summary report"] },
    { tag: "VARIABLE", tagBg: "FAD9C8", tagColor: "8A3010",
      head: "Performance / Revenue Share", amount: "0.5% – 2%", sub: "on attributed sales or activations",
      items: ["KYC completions / deposits","Hardware wallet sales","Loan / custody product sign-ups","Referrals through mentor network"] },
  ];
  blocks.forEach(function(b, i) {
    var bx = 0.5 + i * 4.75;
    s.addShape("rect", { x: bx, y: 1.5, w: 4.5, h: 3.75,
      fill: { color: C.white }, line: { color: "E5E7EB", width: 0.75 }, shadow: makeShadow() });
    s.addShape("rect", { x: bx + 0.22, y: 1.72, w: 0.95, h: 0.32, fill: { color: b.tagBg } });
    s.addText(b.tag, { x: bx + 0.22, y: 1.72, w: 0.95, h: 0.32,
      fontFace: F.sans, fontSize: 7.5, bold: true, color: b.tagColor,
      align: "center", valign: "middle", charSpacing: 1.5, margin: 0 });
    s.addText(b.head, { x: bx + 0.22, y: 2.15, w: 4.1, h: 0.4,
      fontFace: F.sans, fontSize: 11, bold: true, color: C.gray900, margin: 0 });
    s.addText(b.amount, { x: bx + 0.22, y: 2.6, w: 4.1, h: 0.62,
      fontFace: F.serif, fontSize: 28, italic: true, color: C.orange, margin: 0 });
    s.addText(b.sub, { x: bx + 0.22, y: 3.23, w: 4.1, h: 0.3,
      fontFace: F.sans, fontSize: 9, color: C.gray500, margin: 0 });
    b.items.forEach(function(item, j) {
      var iy = 3.65 + j * 0.3;
      s.addText("—", { x: bx + 0.22, y: iy, w: 0.28, h: 0.28,
        fontFace: F.sans, fontSize: 10, color: C.orange, margin: 0 });
      s.addText(item, { x: bx + 0.55, y: iy, w: 3.8, h: 0.28,
        fontFace: F.sans, fontSize: 9.5, color: C.gray700, margin: 0 });
    });
  });
  addLightFooter(s);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 17 — Proof of Work (Brands on India Map)
// ─────────────────────────────────────────────────────────────────────────────
function slide17_ProofOfWork(pres) {
  var s = pres.addSlide();
  s.background = { color: "FAF9F6" };
  addLabel(s, "P r o o f   o f   W o r k");
  addHeadline(s, "We've already done this\nwith 6 brands.", { y: 0.52, h: 1.1, size: 30 });

  // Left legend panel
  var brands = [
    { name: "GetBit",    color: C.orange,  type: "Bitcoin-only exchange" },
    { name: "Ourpool",   color: C.blue,    type: "Bitcoin mining" },
    { name: "Cryobrick", color: C.green,   type: "Hardware wallet" },
    { name: "Jetking",   color: C.purple,  type: "Bitcoin treasury" },
    { name: "Bitasha",   color: C.pink,    type: "Bitcoin product" },
    { name: "Zebpay",    color: C.teal,    type: "Crypto exchange" },
  ];

  s.addShape("rect", { x: 0.4, y: 1.82, w: 2.85, h: 3.42,
    fill: { color: C.white }, line: { color: "E5E7EB", width: 0.75 }, shadow: makeShadow() });
  s.addShape("rect", { x: 0.4, y: 1.82, w: 2.85, h: 0.055, fill: { color: C.orange } });

  s.addText("BRANDS", { x: 0.6, y: 1.88, w: 2.4, h: 0.28,
    fontFace: F.sans, fontSize: 8, bold: true, color: C.orange,
    charSpacing: 2, margin: 0 });

  brands.forEach(function(b, i) {
    var by = 2.28 + i * 0.5;
    s.addShape("oval", { x: 0.6, y: by + 0.07, w: 0.22, h: 0.22,
      fill: { color: b.color } });
    s.addText(b.name, { x: 0.9, y: by + 0.04, w: 1.35, h: 0.25,
      fontFace: F.sans, fontSize: 10, bold: true, color: C.gray900, margin: 0 });
    s.addText(b.type, { x: 0.9, y: by + 0.26, w: 1.9, h: 0.2,
      fontFace: F.sans, fontSize: 7.5, color: C.gray500, margin: 0 });
  });

  // India map — right side, scaled to fit
  s.addImage({ data: IMGS.IMG_INDIA_MAP,
    x: 3.4, y: 0.1, w: 6.45, h: 5.9 });

  // Brand city placements (brand colors, exact XML coordinates scaled to right panel)
  // Map is now shifted right by (3.4 - 1.85) = 1.55 and scaled
  var scaleX = 6.45 / 6.945;
  var scaleY = 5.9 / 6.371;
  var offX   = 3.4 - 1.85 * scaleX;
  var offY   = 0.1 - 0.047 * scaleY;

  function scaledX(origX) { return offX + origX * scaleX; }
  function scaledY(origY) { return offY + origY * scaleY; }

  // Brand-city data: brand → cities → color
  var brandCities = [
    { brand: "GetBit",    color: C.orange,  cities: ["Delhi","Bangalore"] },
    { brand: "Ourpool",   color: C.blue,    cities: ["Mumbai","Bangalore","Delhi"] },
    { brand: "Cryobrick", color: C.green,   cities: ["Goa"] },
    { brand: "Jetking",   color: C.purple,  cities: ["Mumbai"] },
    { brand: "Bitasha",   color: C.pink,    cities: ["Delhi"] },
    { brand: "Zebpay",    color: C.teal,    cities: ["Mumbai","Delhi"] },
  ];

  // City base positions from original XML
  var cityCoords = {
    Delhi:     { x: 4.408, y: 1.700 },
    Mumbai:    { x: 3.607, y: 3.409 },
    Bangalore: { x: 4.500, y: 4.192 },
    Goa:       { x: 3.726, y: 3.952 },
    Hyderabad: { x: 5.101, y: 3.710 },
    Ahmedabad: { x: 3.393, y: 2.943 },
    Chennai:   { x: 4.872, y: 4.721 },
  };

  var activeCities = ["Delhi","Ahmedabad","Mumbai","Goa","Hyderabad","Bangalore","Chennai"];
  activeCities.forEach(function(city) {
    var coord = cityCoords[city];
    var cx = scaledX(coord.x);
    var cy = scaledY(coord.y);
    var dotSize = 0.22;

    // Single orange dot per city as requested using text character to bypass LibreOffice bug
    s.addText("●", { x: cx, y: cy - 0.02, w: dotSize, h: dotSize + 0.04,
      fontFace: F.sans, fontSize: 24, color: C.orange,
      align: "center", valign: "middle", margin: 0 });

    // City label
    var labelDir = ["Delhi","Hyderabad","Bangalore","Chennai"].indexOf(city) >= 0 ? "right" : "left";
    var lx = labelDir === "right" ? cx + dotSize + 0.05 : cx - 1.15;
    var align = labelDir === "right" ? "left" : "right";
    s.addText(city, { x: lx, y: cy + 0.03, w: 1.1, h: 0.2,
      fontFace: F.sans, fontSize: 8.5, bold: true, color: C.gray900,
      align: align, margin: 0 });
  });

  addLightFooter(s);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 19a-f — Company Profiles
// ─────────────────────────────────────────────────────────────────────────────
function slide_CompanyProfile(pres, company) {
  var s = pres.addSlide();
  s.background = { color: C.black };
  s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.orange } });
  s.addText(company.name, {
    x: 0.5, y: 2.0, w: 5, h: 1.0,
    fontFace: F.serif, fontSize: 56, italic: true, color: C.onDark,
    align: "left", margin: 0,
  });
  s.addText(company.nowText || "", {
    x: 0.5, y: 3.2, w: 4.8, h: 2,
    fontFace: F.sans, fontSize: 18, color: C.gray500,
    align: "left", margin: 0,
  });
  addDarkFooter(s);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 18 — The Ask
// ─────────────────────────────────────────────────────────────────────────────
function slide18_Ask(pres) {
  var s = pres.addSlide();
  s.background = { color: C.black };
  // Blank slide - the server will overlay the Hero video and text
  s.addShape("rect", { x: 0, y: 0, w: 10, h: 5.625, fill: { type: "solid", color: "000000" } });
  addDarkFooter(s);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 19 — Q & A
// ─────────────────────────────────────────────────────────────────────────────
function slide19_QandA(pres) {
  var s = pres.addSlide();
  s.background = { color: C.black };
  s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.orange } });

  s.addText("Q & A", {
    x: 0.5, y: 1.5, w: 9, h: 1.8,
    fontFace: F.serif, fontSize: 96, italic: true, color: C.onDark,
    align: "center", margin: 0,
  });

  s.addText("Watch our 2-minute explainer 👆  then ask us anything.", {
    x: 0.5, y: 3.55, w: 9, h: 0.5,
    fontFace: F.sans, fontSize: 14, color: C.gray700, italic: true,
    align: "center", margin: 0,
  });

  addDarkFooter(s);
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD
// ─────────────────────────────────────────────────────────────────────────────
async function buildDeck(outputPath) {
  var outFile = outputPath || path.join(__dirname, "..", "output", "bitcoincierge_pitch_deck.pptx");
  var pres    = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title  = "Bitcoincierge Pitch Deck — Week 11";
  pres.author = "Bitcoincierge";

  slide01_AudienceQuestion(pres);
  slide02_BossBattle(pres);
  slide03_ExBitcoiners(pres);
  slide04_Normies(pres);
  slide05a_AdsCompliance(pres);
  slide05b_SocialFatigue(pres);
  slide05c_Conferences(pres);
  slide06_CurrentWorkarounds(pres);
  slide07_Limitations(pres);
  slide08_ProblemStatement(pres);
  slide09_Cover(pres);
  slide10_Solution(pres);
  slide11_WhyNow(pres);
  slide12_IndiaMap(pres);
  slide13_AIFatigue(pres);
  slide14_MarketTraction(pres);
  slide15_GTM(pres);
  slide16_BusinessModel(pres);
  slide17_ProofOfWork(pres);

  const companies = [
    { name: "Getbit",    nowText: "Bitcoin-only exchange from India. 200+ attendees across meetups powered by Bitcoincierge." },
    { name: "Zebpay",    nowText: "India's leading crypto exchange. Hosted meetups across Mumbai and Delhi, reaching hundreds of attendees." },
    { name: "Jetking",   nowText: "Reached thousands through in-person meetups and online streams, spreading their Bitcoin treasury story to potential investors." },
    { name: "Ourpool",   nowText: "3 meetups across Bangalore, Mumbai, and Delhi. Partners and ecosystem providers onboarded to their Bitcoin Mining Academy in Goa, culminating in a paid 30+ attendee cohort." },
    { name: "Bitasha",   nowText: "Piloted hardware meetups for beta testing. Sold 50+ BitAxe units through meetup and event activations alone." },
    { name: "Cryobrick", nowText: "First user activation through meetups in Goa. Onboarded senior Bitcoiners as beta testers for v1 of the app." },
  ];
  companies.forEach(function(c) { slide_CompanyProfile(pres, c); });

  slide18_Ask(pres);
  slide19_QandA(pres);

  await pres.writeFile({ fileName: outFile });
  console.log("Saved: " + outFile);
  return outFile;
}

module.exports = { buildDeck, THEMES };
if (require.main === module) { buildDeck().catch(function(e){ console.error(e); process.exit(1); }); }

