// Builds the paperback covers of the four AbrahamsTree Study Bible volumes for Amazon KDP: back, spine
// and front as one PDF each, 6 x 9 trim, black-and-white interior on white paper, 0.125 in bleed all round.
// The spine width comes from each volume's page count, so run `npm run book` first. The tree on the front
// follows the seasons through the four volumes. KDP adds the barcode at the bottom right of the back, so
// that corner stays clear. Run with `npm run cover`; it writes book/AbrahamsTree Study Bible - Volume N - cover.pdf.
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { weeks, APP_URL } from '../src/lib/book.js';
import { bookById } from '../src/lib/books.js';

const require = createRequire(import.meta.url);
const QRCode = require('./vendor/qrcode/index.js');
const QRLevel = require('./vendor/qrcode/QRErrorCorrectLevel.js');

const AUTHOR = 'Theo Yanvno';
const TRIM_W = 6, TRIM_H = 9, BLEED = 0.125, PER_PAGE = 0.002252;          // KDP: white paper, inches per page
const H = 2 * BLEED + TRIM_H;
const NAME = 'AbrahamsTree Study Bible';
// The leaves for each volume: spring blossom, summer green, autumn gold, and gold and white for the last.
const SEASONS = [
  { leaves: ['#9cc96b', '#b8d98a', '#79b356', '#f2b8c6', '#f7d4dc'], gold: 0.03 },
  { leaves: ['#4f7d3f', '#5f8f4a', '#3f6b33', '#79a85a', '#6b9b4e'], gold: 0.04 },
  { leaves: ['#d9a441', '#c8702e', '#a8442a', '#e3b85c', '#b9813a'], gold: 0 },
  { leaves: ['#5f8f4a', '#79a85a', '#e9d9a6', '#d9a441', '#f4ecd2'], gold: 0.1 },
];

/** A tree drawn by branching: trunk and limbs in brown, a canopy of leaves in greens and gold. */
function tree(season) {
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
  const greens = season.leaves;
  const leafSvg = leaves.sort((a, b) => a[3] - b[3]).map(([x, y, r, order, k]) =>       // drawn in random order
    `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${k > 1 - season.gold ? '#d9a441' : greens[Math.min(greens.length - 1, Math.floor(k / (1 - season.gold) * greens.length))]}" fill-opacity="0.9"/>`).join('');
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

const coverHtml = (v, pages, range) => {
  const SPINE = pages * PER_PAGE;
  const W = 2 * BLEED + 2 * TRIM_W + SPINE;
  const FRONT_X = BLEED + TRIM_W + SPINE;
  return { W, SPINE, html: `<!doctype html><html><head><meta charset="utf-8"><title>${NAME} - Volume ${v} - cover</title><style>
@page { size: ${W}in ${H}in; margin: 0; }
html, body { margin: 0; }
body { width: ${W}in; height: ${H}in; position: relative; overflow: hidden; background: #f6eedb; color: #2b2118;
  font-family: 'TeX Gyre Pagella', 'Palatino Linotype', Georgia, serif; }
.band { position: absolute; left: 0; right: 0; height: 0.55in; background: #7a4e1d; }
.band.top { top: 0; } .band.bottom { bottom: 0; }
.front { position: absolute; left: ${FRONT_X}in; top: ${BLEED}in; width: ${TRIM_W}in; height: ${TRIM_H}in; text-align: center; }
.cross { position: absolute; top: 0.72in; left: 0; right: 0; font-size: 18pt; color: #7a4e1d; }
.title { position: absolute; top: 1.0in; left: 0; right: 0; font-size: 50pt; font-weight: bold; letter-spacing: 0.01em; }
.sub { position: absolute; top: 1.85in; left: 0; right: 0; font-size: 17pt; font-style: italic; }
.vol { position: absolute; top: 2.3in; left: 0; right: 0; font-size: 13pt; letter-spacing: 0.22em; text-transform: uppercase; color: #7a4e1d; }
.range { position: absolute; top: 2.62in; left: 0; right: 0; font-size: 11.5pt; }
.rule { position: absolute; top: 3.0in; left: 2.2in; right: 2.2in; border-top: 1.5px solid #7a4e1d; }
.tree { position: absolute; top: 3.05in; left: 0.75in; width: 4.5in; }
.feat { position: absolute; top: 7.0in; left: 0.5in; right: 0.5in; font-size: 12.5pt; letter-spacing: 0.04em; }
.feat b { color: #7a4e1d; }
.app { position: absolute; top: 7.38in; left: 0.5in; right: 0.5in; font-size: 11pt; font-style: italic; }
.by { position: absolute; bottom: 0.82in; left: 0; right: 0; font-size: 17pt; letter-spacing: 0.24em; text-transform: uppercase; }
.spine { position: absolute; left: ${BLEED + TRIM_W}in; top: 0; width: ${SPINE}in; height: ${H}in; background: #7a4e1d; color: #f6eedb; }
.spine div { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) rotate(90deg); white-space: nowrap; font-size: 12pt; letter-spacing: 0.12em; }
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
  <p>The AbrahamsTree Study Bible takes you through every book of the Orthodox Bible in 52 weeks, about four chapters a day, in four volumes. Volume ${v} holds weeks ${range.weeks}: ${range.from} to ${range.to}.</p>
  <ul>
    <li>The complete Bible text for each day, in the World English Bible</li>
    <li>An introduction to each book and a "Did you know?" every week</li>
    <li>A saint's words each week, and a prayer to learn by heart</li>
    <li>Room for notes and prayers beside every week</li>
    <li>The hours of prayer, a timeline, maps and journal pages</li>
  </ul>
  <p>Every week has a QR code that opens the free AbrahamsTree app at the same spot: read in two translations side by side, pray the hours, and explore the map and timeline.</p>
</div>
<div class="qr">${qr(APP_URL, '0.9in')}<span>Scan to open the free AbrahamsTree app</span></div>
</div>
<div class="spine"><div>AbrahamsTree Study Bible &nbsp;·&nbsp; Volume ${v} &nbsp;·&nbsp; ${AUTHOR}</div></div>
<div class="front">
  <div class="cross">☦</div>
  <div class="title">AbrahamsTree</div>
  <div class="sub">Study Bible</div>
  <div class="vol">Volume ${v}</div>
  <div class="range">Weeks ${range.weeks} · ${range.from} to ${range.to}</div>
  <div class="rule"></div>
  ${tree(SEASONS[v - 1])}
  <div class="feat"><b>Read</b> · <b>Pray</b> · <b>Who Lived When</b> · <b>Where It Happened</b></div>
  <div class="app">with a free app at every step</div>
  <div class="by">${AUTHOR}</div>
</div>
</body></html>` };
};


const WEEKS = weeks();
const label = (id) => bookById(id).label.replace(/ \(.*\)/, '');
await mkdir('book', { recursive: true });
let chromium;
try { ({ chromium } = require('playwright')); } catch { console.log('Playwright is needed to build the covers.'); process.exit(1); }
const browser = await chromium.launch();
const page = await browser.newPage();
for (let v = 1; v <= 4; v++) {
  const interior = `book/${NAME} - Volume ${v}.pdf`;
  const pages = Number(execFileSync('pdfinfo', [interior]).toString().match(/Pages:\s+(\d+)/)[1]);
  const ws = WEEKS.slice((v - 1) * 13, v * 13);
  const range = { weeks: `${(v - 1) * 13 + 1}–${v * 13}`, from: label(ws[0].days[0].chapters[0].book), to: label(ws.at(-1).days.at(-1).chapters.at(-1).book) };
  const { W, SPINE, html } = coverHtml(v, pages, range);
  const base = `book/${NAME} - Volume ${v} - cover`;
  await writeFile(`${base}.html`, html);
  await page.goto(pathToFileURL(resolve(`${base}.html`)).href, { waitUntil: 'load' });
  await page.pdf({ path: `${base}.pdf`, width: `${W}in`, height: `${H}in`, printBackground: true, preferCSSPageSize: true });
  console.log(`Volume ${v}: ${pages} pages, spine ${SPINE.toFixed(4)} in, cover ${W.toFixed(4)} x ${H} in → ${base}.pdf`);
}
await browser.close();
