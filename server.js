/**
 * BITCOINCIERGE PITCH DECK — LIVE PREVIEW SERVER
 * ─────────────────────────────────────────────────
 * Usage:  npm start  →  http://localhost:3333
 * Edit src/deck.js → browser auto-refreshes
 * Theme picker in the header → rebuilds with new palette
 */
const express   = require("express");
const http      = require("http");
const WebSocket = require("ws");
const chokidar  = require("chokidar");
const path      = require("path");
const fs        = require("fs");
const { execSync } = require("child_process");
const { buildDeck, THEMES } = require("./src/deck.js");

const app    = express();
const server = http.createServer(app);
const wss    = new WebSocket.Server({ server });
app.use(express.json());

const PORT       = 3333;
const OUTPUT_DIR = path.join(__dirname, "output");
const SLIDES_DIR = path.join(__dirname, "output", "slides");
const PPTX_PATH  = path.join(OUTPUT_DIR, "bitcoincierge_pitch_deck.pptx");
const PDF_PATH   = path.join(OUTPUT_DIR, "bitcoincierge_pitch_deck.pdf");
const THEME_PATH = path.join(__dirname, "theme.json");

fs.mkdirSync(SLIDES_DIR, { recursive: true });

function getActiveTheme() {
  try {
    if (fs.existsSync(THEME_PATH)) {
      const d = JSON.parse(fs.readFileSync(THEME_PATH, "utf8"));
      if (d.theme && THEMES[d.theme]) return d.theme;
    }
  } catch (e) {}
  return "dark-bitcoin";
}

function broadcast(msg) {
  wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(JSON.stringify(msg)); });
}

function getBinaryPath(name, fallbackPaths = []) {
  try {
    execSync(`which ${name}`, { stdio: "pipe" });
    return name;
  } catch (e) {
    for (const p of fallbackPaths) {
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

let building = false;
async function rebuild() {
  if (building) return;
  building = true;
  broadcast({ type: "building" });
  console.log("\n🔨  Rebuilding deck...");
  try {
    // Re-require deck.js fresh so theme changes take effect
    Object.keys(require.cache).forEach(k => { if (k.includes("deck.js") || k.includes("theme.json")) delete require.cache[k]; });
    const { buildDeck: bd } = require("./src/deck.js");
    await bd(PPTX_PATH);

    const soffice = getBinaryPath("soffice", [
      "/Applications/LibreOffice.app/Contents/MacOS/soffice",
      "/opt/homebrew/bin/soffice",
      "/usr/local/bin/soffice"
    ]);
    const pdftoppm = getBinaryPath("pdftoppm", [
      "/opt/homebrew/bin/pdftoppm",
      "/usr/local/bin/pdftoppm"
    ]);

    if (soffice && pdftoppm) {
      try {
        execSync(`"${soffice}" --headless --convert-to pdf --outdir "${OUTPUT_DIR}" "${PPTX_PATH}"`, { stdio: "pipe" });
        fs.readdirSync(SLIDES_DIR).forEach(f => fs.unlinkSync(path.join(SLIDES_DIR, f)));
        execSync(`"${pdftoppm}" -jpeg -r 300 "${PDF_PATH}" "${path.join(SLIDES_DIR, "slide")}"`, { stdio: "pipe" });
        console.log("🖼   Slides rendered.");
      } catch (e) {
        console.warn("⚠️  Conversion failed:", e.message);
      }
    } else {
      console.warn("⚠️  LibreOffice/pdftoppm not found — install for visual preview.");
    }
    broadcast({ type: "done", theme: getActiveTheme() });
    console.log("✅  Ready at http://localhost:" + PORT + "\n");
  } catch (err) {
    console.error("❌  Build error:", err.message);
    broadcast({ type: "error", message: err.message });
  } finally { building = false; }
}

chokidar.watch(path.join(__dirname, "src", "deck.js"), { ignoreInitial: false })
  .on("change", () => { console.log("📄  deck.js changed — rebuilding..."); rebuild(); })
  .on("add", () => rebuild());

app.use("/slides", express.static(SLIDES_DIR));
app.use("/output", express.static(OUTPUT_DIR));
app.use("/website-assets", express.static(path.join(__dirname, "assets", "website-assets")));

// ── Theme switcher API ────────────────────────────────────────────────────────
app.post("/set-theme", (req, res) => {
  const { theme } = req.body || {};
  if (!theme || !THEMES[theme]) return res.status(400).json({ error: "Unknown theme" });
  fs.writeFileSync(THEME_PATH, JSON.stringify({ theme }, null, 2));
  console.log(`🎨  Theme switched to: ${THEMES[theme].name}`);
  rebuild();
  res.json({ ok: true, theme });
});

app.get("/themes", (req, res) => {
  res.json({ themes: THEMES, active: getActiveTheme() });
});

// ── Main page ─────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  const slides = fs.existsSync(SLIDES_DIR)
    ? fs.readdirSync(SLIDES_DIR).filter(f => f.endsWith(".jpg") || f.endsWith(".png")).sort()
    : [];
  const slideHTML = slides.length
    ? slides.map((f, i) => `<div class="slide-wrap" id="s${i+1}"><div class="num">${i+1}/${slides.length}</div><img src="/slides/${f}" loading="lazy" /></div>`).join("")
    : `<div class="empty"><p>⏳ Building slides…</p></div>`;

  const activeTheme = getActiveTheme();

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bitcoincierge Pitch Deck</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#eee;min-height:100vh}
/* ── Top bar ── */
.topbar{
  position:fixed;top:0;left:0;right:0;z-index:200;
  background:rgba(10,10,10,.96);
  border-bottom:1px solid #222;
  backdrop-filter:blur(12px);
  display:flex;align-items:center;gap:12px;
  padding:0 20px;height:56px;
}
.brand{font-size:13px;font-weight:800;color:#F26522;letter-spacing:.05em;white-space:nowrap}
.divider{width:1px;height:24px;background:#333;flex-shrink:0}
/* ── Theme palette section ── */
.theme-label{font-size:11px;font-weight:600;color:#555;white-space:nowrap;text-transform:uppercase;letter-spacing:.08em}
.palette-row{display:flex;align-items:center;gap:8px}
.palette-btn{
  position:relative;display:flex;align-items:center;gap:6px;
  padding:5px 11px;border-radius:20px;border:1.5px solid transparent;
  font-size:11px;font-weight:700;cursor:pointer;transition:all .2s ease;
  background:#1a1a1a;color:#aaa;
}
.palette-btn:hover{border-color:#444;color:#fff;background:#222}
.palette-btn.active{border-color:var(--sw);background:var(--sw-bg);color:var(--sw-txt)}
.swatch{width:10px;height:10px;border-radius:50%;display:inline-block;flex-shrink:0}
/* ── Spacer pushes right actions ── */
.spacer{flex:1}
/* ── Actions ── */
.actions{display:flex;gap:8px;align-items:center}
.status{font-size:11px;color:#555;white-space:nowrap}
.status.building{color:#F26522}.status.error{color:#f55}
.btn{
  padding:6px 13px;border-radius:5px;font-size:11px;font-weight:700;
  cursor:pointer;border:none;text-decoration:none;
  display:inline-flex;align-items:center;gap:4px;
  transition:background .15s;
}
.primary{background:#F26522;color:#fff}.primary:hover{background:#D54E10}
.secondary{background:#1e1e1e;color:#bbb;border:1px solid #333}.secondary:hover{background:#282828}
/* ── Slides ── */
.main{padding:72px 24px 40px;max-width:980px;margin:0 auto}
.slide-wrap{
  margin-bottom:24px;border-radius:8px;overflow:hidden;
  box-shadow:0 6px 32px rgba(0,0,0,.6);position:relative;
  transition:transform .2s;
}
.slide-wrap:hover{transform:translateY(-2px)}
.num{
  position:absolute;top:10px;left:10px;
  background:rgba(0,0,0,.65);color:#F26522;
  font-size:10px;font-weight:800;padding:2px 8px;border-radius:3px;
}
.slide-wrap img{display:block;width:100%}
.empty{text-align:center;padding:100px;color:#444;font-size:16px}
/* ── Building overlay ── */
#overlay{
  display:none;position:fixed;inset:0;
  background:rgba(0,0,0,.75);z-index:300;
  align-items:center;justify-content:center;flex-direction:column;gap:16px;
}
#overlay.v{display:flex}
.spinner{
  width:44px;height:44px;border:3px solid #333;
  border-top-color:#F26522;border-radius:50%;
  animation:spin .7s linear infinite;
}
.overlay-msg{font-size:13px;color:#888}
@keyframes spin{to{transform:rotate(360deg)}}
/* ── Theme change toast ── */
#toast{
  position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(60px);
  background:#F26522;color:#fff;font-size:12px;font-weight:700;
  padding:10px 20px;border-radius:6px;z-index:400;
  transition:transform .3s ease;pointer-events:none;
}
#toast.show{transform:translateX(-50%) translateY(0)}
/* ── Presentation Mode ── */
#pres-overlay {
  display:none;position:fixed;inset:0;background:#000;z-index:9999;
  align-items:center;justify-content:center;user-select:none;
}
#pres-overlay.active { display:flex; cursor:none; }
#pres-overlay.active.show-cursor { cursor:default; }
#pres-img { width:100vw; height:100vh; object-fit:fill; }
</style>
</head>
<body>
<div class="topbar">
  <span class="brand">⚡ Bitcoincierge</span>
  <div class="divider"></div>
  <span class="theme-label">Theme</span>
  <div class="palette-row" id="palettes"></div>
  <div class="spacer"></div>
  <div class="actions">
    <span class="status" id="st">● Live</span>
    <button id="startPresBtn" class="btn primary" style="display:none; background:#10B981" onclick="startPresentation()">▶ Start Presentation</button>
    <a href="/output/bitcoincierge_pitch_deck.pptx" download class="btn secondary">⬇ PPTX</a>
    <a href="/output/bitcoincierge_pitch_deck.pdf"  download class="btn secondary">⬇ PDF</a>
    <button class="btn primary" onclick="location.reload()">↺ Refresh</button>
  </div>
</div>

<div id="pres-overlay">
  <img id="pres-img" src="" alt="Slide" />
  <div id="interactive-overlay" style="display:none;position:absolute;inset:0;background:transparent;align-items:center;justify-content:flex-end;padding-right:5%;z-index:10001;pointer-events:none;">
    <div id="carousel-card" style="position:relative;width:28vw;min-width:320px;max-width:440px;height:72vh;background:#000;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.1);">
      <div id="carousel-bars" style="position:absolute;top:16px;left:16px;right:16px;display:flex;gap:4px;z-index:20;"></div>
      <img id="carousel-img" src="" style="width:100%;height:100%;object-fit:contain;background:#000;" />
      <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 60%, transparent 100%);padding:24px;padding-top:60px;z-index:20;">
        <h2 id="carousel-title" style="display:none;"></h2>
        <p id="carousel-text" style="color:#fff;font-family:Georgia,serif;font-style:italic;font-size:20px;line-height:1.4;margin:0;text-shadow:0 2px 8px rgba(0,0,0,0.9);"></p>
      </div>
    </div>
  </div>
  <div id="hero-overlay" style="display:none;position:absolute;inset:0;background:#000;z-index:9500;align-items:center;justify-content:center;overflow:hidden;pointer-events:none;">
    <video id="hero-video" muted loop playsinline poster="/website-assets/images/defaultMentor.webp" src="/website-assets/Hero.mp4" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:0;filter:blur(3px) brightness(0.6);transform:scale(1.1);"></video>
    <div style="position:absolute;inset:0;background:rgba(0,0,0,0.2);z-index:1;"></div>
    
    <div style="position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;width:100%;height:100%;padding:0 8%;gap:40px;">
      <h1 style="color:#fff;font-family:serif;font-size:80px;line-height:1.2;margin:0;font-weight:normal;letter-spacing:-0.01em;text-shadow:0 0 40px rgba(0,0,0,0.5);">
        Bring Your Bitcoin Brand<br/>
        <em style="font-style:italic;">in Front of a Billion+ Indians</em>
      </h1>
      <p style="color:rgba(255,255,255,0.9);font-family:serif;font-style:italic;font-size:30px;line-height:1.5;margin:0 auto;max-width:960px;text-shadow:0 4px 12px rgba(0,0,0,0.9);">
        The end-to-end concierge for Bitcoin brands — meetups, workshops, and brand-led activations across India &amp; Southeast Asia.
      </p>
    </div>
  </div>
</div>
<div id="overlay"><div class="spinner"></div><div class="overlay-msg">Rebuilding with new theme…</div></div>
<div id="toast"></div>
<div class="main">${slideHTML}</div>

<script>
// ── WebSocket live reload ──────────────────────────────────────────────────
const ws=new WebSocket("ws://"+location.host);
const ov=document.getElementById("overlay"),st=document.getElementById("st");
ws.onmessage=e=>{const m=JSON.parse(e.data);
  if(m.type==="building"){ov.classList.add("v");st.textContent="● Building...";st.className="status building";}
  if(m.type==="done"){ov.classList.remove("v");st.textContent="● Updated";st.className="status";setTimeout(()=>location.reload(),400);}
  if(m.type==="error"){ov.classList.remove("v");st.textContent="● Error";st.className="status error";}
};
ws.onclose=()=>{st.textContent="● Disconnected";st.className="status error";};

// ── Theme palette buttons ──────────────────────────────────────────────────
// ── Presentation mode & Carousel ───────────────────────────────────────────
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  document.getElementById("startPresBtn").style.display = "inline-flex";
}

const COMPANY_DATA = [
  { name: "Getbit", storyTexts: ["Bitcoin-only exchange from India.","Workshops on buying Bitcoin into self-custody.","200+ attendees across meetups powered by Bitcoincierge."], images: ["/website-assets/images/getbit/getbit-1.jpeg", "/website-assets/images/getbit/getbit-2.jpeg", "/website-assets/images/getbit/getbit-3.jpeg"] },
  { name: "Zebpay", storyTexts: ["India's leading crypto exchange.","Hosted meetups across Mumbai and Delhi.","Reaching hundreds of attendees."], images: ["/website-assets/images/zebpay/zebpay-1.jpeg", "/website-assets/images/zebpay/zebpay-2.jpeg", "/website-assets/images/zebpay/zebpay-3.jpeg"] },
  { name: "Jetking", storyTexts: ["Reached thousands through in-person meetups and online streams.","Spreading their Bitcoin treasury story to potential investors."], images: ["/website-assets/images/jetking/jetking-1.jpeg", "/website-assets/images/jetking/jetking-2.jpeg"] },
  { name: "Ourpool", storyTexts: ["3 meetups across Bangalore, Mumbai, and Delhi.","Partners onboarded to their Bitcoin Mining Academy.","Paid 30+ attendee mining cohort in Goa."], images: ["/website-assets/images/ourpool/ourpool-1.jpeg", "/website-assets/images/ourpool/ourpool-2.jpeg", "/website-assets/images/ourpool/ourpool-3.jpeg"] },
  { name: "Bitasha", storyTexts: ["Sold 50+ BitAxe units through meetup and event activations alone."], images: ["/website-assets/images/bitasha1.jpeg", "/website-assets/images/bitasha2.jpeg"] },
  { name: "Cryobrick", storyTexts: ["First user activation through meetups in Goa.","Senior Bitcoiners onboarded as beta testers for v1 of the app."], images: ["/website-assets/images/cryobrick/cryobrick-1.jpeg", "/website-assets/images/cryobrick/cryobrick-2.jpeg"] }
];

let presIndex = 0;
let presSlides = [];
let intraSlideIndex = 0;
let carouselInterval;

function updateCarousel() {
  const cData = COMPANY_DATA[presIndex - 16];
  if (!cData) return;
  document.getElementById("carousel-img").src = cData.images[intraSlideIndex];
  document.getElementById("carousel-title").textContent = cData.name;
  document.getElementById("carousel-text").textContent = cData.storyTexts[intraSlideIndex] || cData.storyTexts[0];
  
  const bars = document.getElementById("carousel-bars");
  bars.innerHTML = "";
  cData.images.forEach((_, i) => {
    const bar = document.createElement("div");
    bar.style.flex = "1";
    bar.style.height = "4px";
    bar.style.background = "rgba(255,255,255,0.3)";
    bar.style.borderRadius = "2px";
    bar.style.overflow = "hidden";
    const fill = document.createElement("div");
    fill.style.height = "100%";
    fill.style.background = "#fff";
    if (i < intraSlideIndex) fill.style.width = "100%";
    else if (i === intraSlideIndex) {
      fill.style.width = "0%";
      fill.style.transition = "width 2.5s linear";
      setTimeout(() => { fill.style.width = "100%"; }, 50);
    } else {
      fill.style.width = "0%";
    }
    bar.appendChild(fill);
    bars.appendChild(bar);
  });
}

function continueCarousel() {
  clearInterval(carouselInterval);
  carouselInterval = setInterval(() => {
    const cData = COMPANY_DATA[presIndex - 16];
    if (intraSlideIndex < cData.images.length - 1) {
      intraSlideIndex++;
      updateCarousel();
    } else {
      presIndex = Math.min(presIndex + 1, presSlides.length - 1);
      renderSlide();
    }
  }, 2500);
}

function renderSlide() {
  document.getElementById("pres-img").src = presSlides[presIndex];
  
  if (presIndex >= 16 && presIndex <= 21) {
    document.getElementById("interactive-overlay").style.display = "flex";
    intraSlideIndex = 0;
    updateCarousel();
    continueCarousel();
  } else {
    document.getElementById("interactive-overlay").style.display = "none";
    clearInterval(carouselInterval);
  }

  if (presIndex === 22) {
    document.getElementById("hero-overlay").style.display = "flex";
    const v = document.getElementById("hero-video");
    v.currentTime = 0;
    v.play().catch(()=>{});
  } else {
    document.getElementById("hero-overlay").style.display = "none";
    document.getElementById("hero-video").pause();
  }
}

function startPresentation() {
  const slides = document.querySelectorAll(".slide-wrap img");
  if (!slides.length) return showToast("No slides available");
  presSlides = Array.from(slides).map(img => img.src);
  presIndex = 0;
  
  const overlay = document.getElementById("pres-overlay");
  overlay.style.backgroundColor = "#000";
  overlay.classList.add("active");
  if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(()=>{});
  renderSlide();
}

function exitPresentation() {
  document.getElementById("pres-overlay").classList.remove("active");
  clearInterval(carouselInterval);
  document.getElementById("hero-video").pause();
  if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
}

document.addEventListener("keydown", (e) => {
  const overlay = document.getElementById("pres-overlay");
  if (!overlay.classList.contains("active")) return;
  if (e.key === "Escape") return exitPresentation();
  
  if (presIndex >= 16 && presIndex <= 21) {
    const cData = COMPANY_DATA[presIndex - 16];
    if (e.key === "ArrowRight" || e.key === "Space" || e.key === "Enter") {
      if (intraSlideIndex < cData.images.length - 1) {
        intraSlideIndex++;
        updateCarousel();
        continueCarousel();
        return;
      }
    } else if (e.key === "ArrowLeft") {
      if (intraSlideIndex > 0) {
        intraSlideIndex--;
        updateCarousel();
        continueCarousel();
        return;
      }
    }
  }

  if (e.key === "ArrowRight" || e.key === "Space" || e.key === "Enter") {
    presIndex = Math.min(presIndex + 1, presSlides.length - 1);
    renderSlide();
  } else if (e.key === "ArrowLeft") {
    presIndex = Math.max(presIndex - 1, 0);
    renderSlide();
  }
});

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) exitPresentation();
});

let hideCursorTimeout;
const prOverlay = document.getElementById("pres-overlay");
prOverlay.addEventListener("click", (e) => {
  if (presIndex >= 16 && presIndex <= 21) {
    const cData = COMPANY_DATA[presIndex - 16];
    if (e.clientX > window.innerWidth / 2) {
      if (intraSlideIndex < cData.images.length - 1) {
        intraSlideIndex++;
        updateCarousel();
        continueCarousel();
      } else {
        presIndex = Math.min(presIndex + 1, presSlides.length - 1);
        renderSlide();
      }
    } else {
      if (intraSlideIndex > 0) {
        intraSlideIndex--;
        updateCarousel();
        continueCarousel();
      } else {
        presIndex = Math.max(presIndex - 1, 0);
        renderSlide();
      }
    }
    return;
  }

  if (e.clientX > window.innerWidth / 2) {
    presIndex = Math.min(presIndex + 1, presSlides.length - 1);
  } else {
    presIndex = Math.max(presIndex - 1, 0);
  }
  renderSlide();
});

prOverlay.addEventListener("mousemove", () => {
  prOverlay.classList.add("show-cursor");
  clearTimeout(hideCursorTimeout);
  hideCursorTimeout = setTimeout(() => {
    prOverlay.classList.remove("show-cursor");
  }, 2000);
});

const THEME_META = {
  "dark-bitcoin": { label:"Dark Bitcoin", bg:"#111",    fg:"#F26522", dot:"#F26522" },
  "white-orange":{ label:"White & Orange",bg:"#FFF7F0", fg:"#F26522", dot:"#F26522" },
  "navy-blue":   { label:"Navy & Gold",  bg:"#0F172A", fg:"#F59E0B", dot:"#F59E0B" },
  "green-bitcoin":{ label:"Forest Green",bg:"#0D1F1A", fg:"#16A34A", dot:"#16A34A" },
};
let activeTheme = "${activeTheme}";
const row = document.getElementById("palettes");

Object.entries(THEME_META).forEach(([key, meta]) => {
  const btn = document.createElement("button");
  btn.className = "palette-btn" + (key === activeTheme ? " active" : "");
  btn.style.setProperty("--sw",   meta.dot);
  btn.style.setProperty("--sw-bg", meta.bg === "#111" || meta.bg.startsWith("#0") ? meta.bg : meta.bg);
  btn.style.setProperty("--sw-txt", meta.fg);
  btn.innerHTML = \`<span class="swatch" style="background:\${meta.dot}"></span>\${meta.label}\`;
  btn.onclick = () => applyTheme(key, btn);
  row.appendChild(btn);
});

function applyTheme(key, btn) {
  if (key === activeTheme) return;
  activeTheme = key;
  document.querySelectorAll(".palette-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  showToast("Applying theme: " + THEME_META[key].label);
  fetch("/set-theme", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ theme: key })
  });
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}
</script>
</body>
</html>`);
});

server.listen(PORT, () => {
  console.log(`\n🚀  Bitcoincierge Pitch Deck Preview`);
  console.log(`    http://localhost:${PORT}\n`);
  console.log(`    Edit src/deck.js → slides auto-rebuild\n`);
  console.log(`    Theme picker available in the top bar\n`);
});
