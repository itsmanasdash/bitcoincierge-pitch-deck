/**
 * BITCOINCIERGE PITCH DECK — LIVE PREVIEW SERVER
 * ─────────────────────────────────────────────────
 * Usage:  npm start  →  http://localhost:3333
 * Edit src/deck.js → browser auto-refreshes
 */
const express   = require("express");
const http      = require("http");
const WebSocket = require("ws");
const chokidar  = require("chokidar");
const path      = require("path");
const fs        = require("fs");
const { execSync } = require("child_process");
const { buildDeck } = require("./src/deck.js");

const app    = express();
const server = http.createServer(app);
const wss    = new WebSocket.Server({ server });

const PORT       = 3333;
const OUTPUT_DIR = path.join(__dirname, "output");
const SLIDES_DIR = path.join(__dirname, "output", "slides");
const PPTX_PATH  = path.join(OUTPUT_DIR, "bitcoincierge_pitch_deck.pptx");
const PDF_PATH   = path.join(OUTPUT_DIR, "bitcoincierge_pitch_deck.pdf");

fs.mkdirSync(SLIDES_DIR, { recursive: true });

function broadcast(msg) {
  wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(JSON.stringify(msg)); });
}

let building = false;
async function rebuild() {
  if (building) return;
  building = true;
  broadcast({ type: "building" });
  console.log("\n🔨  Rebuilding deck...");
  try {
    await buildDeck(PPTX_PATH);
    try {
      execSync(`soffice --headless --convert-to pdf --outdir "${OUTPUT_DIR}" "${PPTX_PATH}"`, { stdio: "pipe" });
      fs.readdirSync(SLIDES_DIR).forEach(f => fs.unlinkSync(path.join(SLIDES_DIR, f)));
      execSync(`pdftoppm -jpeg -r 130 "${PDF_PATH}" "${path.join(SLIDES_DIR, "slide")}"`, { stdio: "pipe" });
      console.log("🖼   Slides rendered.");
    } catch (e) {
      console.warn("⚠️  LibreOffice/pdftoppm not found — install for visual preview.");
    }
    broadcast({ type: "done" });
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

app.get("/", (req, res) => {
  const slides = fs.existsSync(SLIDES_DIR)
    ? fs.readdirSync(SLIDES_DIR).filter(f => f.endsWith(".jpg")||f.endsWith(".png")).sort()
    : [];
  const slideHTML = slides.length
    ? slides.map((f,i) => `<div class="slide-wrap" id="s${i+1}"><div class="num">${i+1}/${slides.length}</div><img src="/slides/${f}" /></div>`).join("")
    : `<div class="empty"><p>⏳ Building... (or install LibreOffice for visual preview)</p></div>`;
  res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Bitcoincierge Pitch Deck</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#111;font-family:sans-serif;color:#eee}
.topbar{position:fixed;top:0;left:0;right:0;z-index:100;background:#000;border-bottom:1px solid #222;display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:52px}
.brand{font-size:14px;font-weight:700;color:#F26522;letter-spacing:.05em}
.status{font-size:12px;color:#666}.building{color:#F26522!important}.error{color:#f55!important}
.actions{display:flex;gap:10px}
.btn{padding:6px 14px;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;display:inline-flex;align-items:center;gap:4px}
.primary{background:#F26522;color:#fff}.primary:hover{background:#D54E10}
.secondary{background:#222;color:#ccc;border:1px solid #333}.secondary:hover{background:#2a2a2a}
.main{padding:72px 24px 40px;max-width:960px;margin:0 auto}
.slide-wrap{margin-bottom:28px;border-radius:6px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.5);position:relative}
.num{position:absolute;top:10px;left:10px;background:rgba(0,0,0,.6);color:#F26522;font-size:11px;font-weight:700;padding:3px 8px;border-radius:3px}
.slide-wrap img{display:block;width:100%}
.empty{text-align:center;padding:80px;color:#555}
#overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:150;align-items:center;justify-content:center}
#overlay.v{display:flex}
.spinner{width:40px;height:40px;border:3px solid #333;border-top-color:#F26522;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
</style></head><body>
<div class="topbar">
  <span class="brand">Bitcoincierge Pitch Deck · Week 11</span>
  <span class="status" id="st">● Live</span>
  <div class="actions">
    <a href="/output/bitcoincierge_pitch_deck.pptx" download class="btn secondary">⬇ PPTX</a>
    <a href="/output/bitcoincierge_pitch_deck.pdf" download class="btn secondary">⬇ PDF</a>
    <button class="btn primary" onclick="location.reload()">↺ Refresh</button>
  </div>
</div>
<div id="overlay"><div class="spinner"></div></div>
<div class="main">${slideHTML}</div>
<script>
const ws=new WebSocket("ws://localhost:3333");
const ov=document.getElementById("overlay"),st=document.getElementById("st");
ws.onmessage=e=>{const m=JSON.parse(e.data);
  if(m.type==="building"){ov.classList.add("v");st.textContent="● Building...";st.className="status building";}
  if(m.type==="done"){ov.classList.remove("v");st.textContent="● Updated";st.className="status";setTimeout(()=>location.reload(),300);}
  if(m.type==="error"){ov.classList.remove("v");st.textContent="● Error";st.className="status error";}
};
ws.onclose=()=>{st.textContent="● Disconnected";st.className="status error";};
</script></body></html>`);
});

server.listen(PORT, () => {
  console.log(`\n🚀  Bitcoincierge Pitch Deck Preview`);
  console.log(`    http://localhost:${PORT}\n`);
  console.log(`    Edit src/deck.js → slides auto-rebuild\n`);
});
