// Builds the study book's paperback cover for Amazon KDP: back, spine and front as one PDF, 6 x 9 trim,
// black-and-white interior on white paper, 0.125 in bleed all round. The spine width comes from the page
// count in src/lib/book.js. KDP adds the barcode at the bottom right of the back, so that corner stays clear.
// Run with `npm run cover`; it writes book/AbramsTree Study Book - cover.pdf (needs Playwright).
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { layout, APP_URL } from '../src/lib/book.js';

const require = createRequire(import.meta.url);
const QRCode = require('./vendor/qrcode/index.js');
const QRLevel = require('./vendor/qrcode/QRErrorCorrectLevel.js');

const AUTHOR = 'Theo Yanvno';
const TRIM_W = 6, TRIM_H = 9, BLEED = 0.125, PER_PAGE = 0.002252;          // KDP: white paper, inches per page
const pages = layout().length;
const SPINE = pages * PER_PAGE;
const W = 2 * BLEED + 2 * TRIM_W + SPINE, H = 2 * BLEED + TRIM_H;
const FRONT_X = BLEED + TRIM_W + SPINE;

/** A tree drawn by branching: trunk and limbs in brown, a canopy of leaves in greens and gold. */
function tree() {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const limbs = [], leaves = [];
  const grow = (x, y, angle, len, width, depth) => {
    const x2 = x + Math.cos(angle) * len, y2 = y - Math.sin(angle) * len;
    limbs.push(`<path d="M${x.toFixed(1)} ${y.toFixed(1)} Q${((x + x2) / 2 + (rnd() - 0.5) * len * 0.2).toFixed(1)} ${((y + y2) / 2).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke-width="${width.toFixed(1)}"/>`);
    if (depth === 0) {
      for (let i = 0; i < 7; i++) {
        const r = 7 + rnd() * 9;
        leaves.push([x2 + (rnd() - 0.5) * 34, y2 + (rnd() - 0.5) * 34, r, rnd(), rnd()]);
      }
      return;
    }
    const n = depth > 5 ? 2 : 2 + (rnd() > 0.6 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const spread = 0.45 + rnd() * 0.15;
      const lean = (Math.PI / 2 - angle) * 0.25;                                // bend limbs gently back toward upright
      const a = angle + (n === 2 ? (i ? spread : -spread) : (i - 1) * spread) + lean + (rnd() - 0.5) * 0.12;
      grow(x2, y2, a, len * (0.7 + rnd() * 0.1), width * 0.68, depth - 1);
    }
  };
  grow(200, 400, Math.PI / 2, 92, 26, 7);
  const roots = [-0.5, -0.2, 0.15, 0.45].map((s, i) =>
    `<path d="M${200 + s * 30} 396 Q${200 + s * 120} ${410 + i % 2 * 6} ${200 + s * 200} ${418 + (i % 2) * 4}" stroke-width="${7 - Math.abs(s) * 6}"/>`).join('');
  const greens = ['#5f8f4a', '#79a85a', '#9cbf6b', '#4f7d3f', '#b9cf7a'];
  const leafSvg = leaves.sort((a, b) => a[3] - b[3]).map(([x, y, r, order, k]) =>       // drawn in random order
    `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${k > 0.95 ? '#d9a441' : greens[Math.floor(k / 0.95 * greens.length)]}" fill-opacity="0.9"/>`).join('');
  return `<svg class="tree" viewBox="-50 0 500 430"><g fill="none" stroke="#5a3a1a" stroke-linecap="round">${roots}${limbs.join('')}</g>${leafSvg}</svg>`;
}

function qr(link, size) {
  const code = new QRCode(-1, QRLevel.M);
  code.addData(link);
  code.make();
  const n = code.getModuleCount(), q = 4;
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (code.isDark(r, c)) d += `M${c + q} ${r + q}h1v1h-1z`;
  return `<svg style="width:${size};height:${size}" viewBox="0 0 ${n + 2 * q} ${n + 2 * q}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}

const html = `<!doctype html><html><head><meta charset="utf-8"><title>AbramsTree Study Book - cover</title><style>
@page { size: ${W}in ${H}in; margin: 0; }
html, body { margin: 0; }
body { width: ${W}in; height: ${H}in; position: relative; overflow: hidden; background: #f6eedb; color: #2b2118;
  font-family: 'TeX Gyre Pagella', 'Palatino Linotype', Georgia, serif; }
.band { position: absolute; left: 0; right: 0; height: 0.55in; background: #7a4e1d; }
.band.top { top: 0; } .band.bottom { bottom: 0; }
.front { position: absolute; left: ${FRONT_X}in; top: ${BLEED}in; width: ${TRIM_W}in; height: ${TRIM_H}in; text-align: center; }
.cross { position: absolute; top: 0.72in; left: 0; right: 0; font-size: 18pt; color: #7a4e1d; }
.title { position: absolute; top: 1.0in; left: 0; right: 0; font-size: 50pt; font-weight: bold; letter-spacing: 0.01em; }
.sub { position: absolute; top: 1.95in; left: 0; right: 0; font-size: 17pt; font-style: italic; }
.rule { position: absolute; top: 2.45in; left: 2.2in; right: 2.2in; border-top: 1.5px solid #7a4e1d; }
.tree { position: absolute; top: 2.6in; left: 0.5in; width: 5.0in; }
.feat { position: absolute; top: 7.0in; left: 0.5in; right: 0.5in; font-size: 12.5pt; letter-spacing: 0.04em; }
.feat b { color: #7a4e1d; }
.app { position: absolute; top: 7.38in; left: 0.5in; right: 0.5in; font-size: 11pt; font-style: italic; }
.by { position: absolute; bottom: 0.82in; left: 0; right: 0; font-size: 17pt; letter-spacing: 0.24em; text-transform: uppercase; }
.spine { position: absolute; left: ${BLEED + TRIM_W}in; top: 0; width: ${SPINE}in; height: ${H}in; background: #7a4e1d; color: #f6eedb; }
.spine div { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) rotate(90deg); white-space: nowrap; font-size: 11pt; letter-spacing: 0.12em; }
.back { position: absolute; left: ${BLEED}in; top: ${BLEED}in; width: ${TRIM_W}in; height: ${TRIM_H}in; }
.back .inner { position: absolute; left: 0.6in; right: 0.6in; top: 0.9in; }
.back h2 { font-size: 21pt; margin: 0 0 0.12in; }
.back p { font-size: 11pt; line-height: 1.5; margin: 0 0 0.12in; }
.back ul { font-size: 10.5pt; line-height: 1.5; margin: 0 0 0.12in; padding-left: 0.22in; }
.back .qr { position: absolute; left: 0.6in; bottom: 0.85in; display: flex; gap: 0.15in; align-items: center; font-size: 9.5pt; width: 3.1in; }
</style></head><body>
<div class="band top"></div><div class="band bottom"></div>
<div class="back"><div class="inner">
  <h2>Read the whole Bible this year</h2>
  <p>AbramsTree walks with you through every book of the Bible in 52 weeks, about four chapters a day, with room each week to write what stood out to you and what you are praying about.</p>
  <ul>
    <li>A week-by-week plan through the whole Orthodox Bible, with a checkbox for every day</li>
    <li>The hours of prayer, morning to night, and your own prayer list</li>
    <li>A timeline of who lived when, from Adam to the apostles, and the week of creation in God's days</li>
    <li>Maps of where it happened, era by era</li>
    <li>Journal pages for what God is teaching you</li>
  </ul>
  <p>Every section has a QR code that opens the free AbramsTree app at the same spot: read the week's chapters in two translations side by side, pray the hours, and explore the map and timeline.</p>
</div>
<div class="qr">${qr(APP_URL, '0.9in')}<span>Scan to open the free AbramsTree app</span></div>
</div>
<div class="spine"><div>AbramsTree &nbsp;·&nbsp; ${AUTHOR}</div></div>
<div class="front">
  <div class="cross">☦</div>
  <div class="title">AbramsTree</div>
  <div class="sub">A Bible-in-a-Year Study Book</div>
  <div class="rule"></div>
  ${tree()}
  <div class="feat"><b>Read</b> · <b>Pray</b> · <b>Who Lived When</b> · <b>Where It Happened</b></div>
  <div class="app">with a free app at every step</div>
  <div class="by">${AUTHOR}</div>
</div>
</body></html>`;

await mkdir('book', { recursive: true });
const htmlPath = 'book/AbramsTree Study Book - cover.html';
await writeFile(htmlPath, html);
console.log(`${pages} pages, spine ${SPINE.toFixed(4)} in, cover ${W.toFixed(4)} x ${H} in`);
let chromium;
try { ({ chromium } = require('playwright')); } catch { console.log('Playwright is not installed, so only the HTML was written.'); process.exit(0); }
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve(htmlPath)).href, { waitUntil: 'load' });
await page.pdf({ path: 'book/AbramsTree Study Book - cover.pdf', width: `${W}in`, height: `${H}in`, printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log('→ book/AbramsTree Study Book - cover.pdf');
