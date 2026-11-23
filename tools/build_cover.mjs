// Builds the paperback covers of the four AbrahamsTree Study Bible volumes for Amazon KDP: back, spine
// and front as one PDF each, 6 x 9 trim, black-and-white interior on white paper, 0.125 in bleed all round.
// The spine width comes from each volume's page count, so run `npm run book` first.
//
// The front is framed like a leather-bound Bible: a gold title, Gustave Doré's engraving of Abraham and the
// three angels at Mamre (1866, public domain; the Old Testament image of the Holy Trinity) toned in gold, the
// book's features on a parchment strip, and the free app on a phone. KDP adds the barcode at the bottom right
// of the back, so that corner stays clear. Run with `npm run cover`; it writes
// book/AbrahamsTree Study Bible - Volume N - cover.pdf.
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
const ART = pathToFileURL(resolve('tools/data/cover/abraham-three-angels.jpg')).href;
const APP_SHOT = pathToFileURL(resolve('tools/data/cover/app-home.jpg')).href;

function qr(link, size) {
  const code = new QRCode(-1, QRLevel.M);
  code.addData(link);
  code.make();
  const n = code.getModuleCount(), q = 4;
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (code.isDark(r, c)) d += `M${c + q} ${r + q}h1v1h-1z`;
  return `<svg style="width:${size};height:${size}" viewBox="0 0 ${n + 2 * q} ${n + 2 * q}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}

/** The three-bar Orthodox cross, drawn in gold. */
const cross = (size, pos = '') => `<svg class="ocross" style="width:${size};height:${size};${pos}" viewBox="0 0 40 60"><g fill="#e3bd62" stroke="#7a5418" stroke-width="0.8">
  <rect x="17" y="2" width="6" height="56"/><rect x="11" y="9" width="18" height="4"/><rect x="4" y="18" width="32" height="6"/>
  <rect x="9" y="39" width="22" height="4.5" transform="rotate(-18 20 41)"/></g></svg>`;

/** A small olive branch under the title. */
const branch = `<svg class="branch" viewBox="0 0 200 30"><g fill="none" stroke="#e3bd62" stroke-width="1.4"><path d="M20 15 H180"/></g>
  <g fill="#e3bd62">${[30, 50, 70, 90, 110, 130, 150, 170].map((x, i) => `<ellipse cx="${x}" cy="${i % 2 ? 9 : 21}" rx="9" ry="3.6" transform="rotate(${i % 2 ? -25 : 25} ${x} ${i % 2 ? 9 : 21})"/>`).join('')}
  <circle cx="100" cy="15" r="3.5"/></g></svg>`;

/** Line icons for the features strip. */
const ICONS = {
  church: '<path d="M20 4v6M17 7h6M20 10c-5 3-6 7-6 9h12c0-2-1-6-6-9zM12 19h16v4H12zM9 23h22v13H9zM18 36v-7a2 2 0 0 1 4 0v7"/>',
  book: '<path d="M4 10c6-2 11-1 16 3 5-4 10-5 16-3v22c-6-2-11-1-16 3-5-4-10-5-16-3zM20 13v22"/>',
  saint: '<circle cx="20" cy="12" r="5"/><circle cx="20" cy="12" r="9" stroke-dasharray="2 2"/><path d="M9 36c1-8 5-13 11-13s10 5 11 13z"/>',
  calendar: '<rect x="6" y="9" width="28" height="25" rx="2"/><path d="M6 16h28M13 5v7M27 5v7M12 22h4M19 22h4M26 22h4M12 28h4M19 28h4"/>',
  map: '<path d="M5 10l10-4 10 4 10-4v24l-10 4-10-4-10 4zM15 6v24M25 10v24"/>',
  phone: '<rect x="12" y="4" width="16" height="32" rx="3"/><path d="M18 8h4M19 31h2"/>',
};
const icon = (k) => `<svg viewBox="0 0 40 40"><g fill="none" stroke="#5a1a14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</g></svg>`;

const FEATURES = [
  ['church', 'The Orthodox Faith & Feasts'],
  ['book', 'Weekly Lessons & Study Notes'],
  ['saint', 'Saints & Church Fathers'],
  ['map', 'Maps & Timelines'],
  ['phone', 'Free Companion App'],
];

const coverHtml = (v, pages, range) => {
  const SPINE = pages * PER_PAGE;
  const W = 2 * BLEED + 2 * TRIM_W + SPINE;
  const FRONT_X = BLEED + TRIM_W + SPINE;
  return { W, SPINE, html: `<!doctype html><html><head><meta charset="utf-8"><title>${NAME} - Volume ${v} - cover</title><style>
@page { size: ${W}in ${H}in; margin: 0; }
html, body { margin: 0; }
body { width: ${W}in; height: ${H}in; position: relative; overflow: hidden; color: #f3e3b8;
  font-family: 'TeX Gyre Pagella', 'Palatino Linotype', Georgia, serif;
  background: radial-gradient(ellipse at 50% 40%, #6e1d18 0%, #551410 55%, #3b0c09 100%); }
.gold { color: #e9c66e; }
/* gold frames, inset from each trim edge */
.frame { position: absolute; border: 2.2px solid #d4ad55; border-radius: 0.12in; }
.frame::after { content: ""; position: absolute; inset: 0.06in; border: 0.8px solid #d4ad55; border-radius: 0.08in; }
.ocross { position: absolute; }
/* front */
.front { position: absolute; left: ${FRONT_X}in; top: ${BLEED}in; width: ${TRIM_W}in; height: ${TRIM_H}in; text-align: center; }
.title { position: absolute; top: 0.56in; left: 0; right: 0; font-size: 47pt; font-weight: bold; letter-spacing: 0.005em; line-height: 1; }
.title span { position: relative; color: #ecc96f; }
.title .shade { position: absolute; left: 0; right: 0; top: 0.025in; color: #1e0705; }
.branch { position: absolute; top: 1.24in; left: 2.1in; width: 1.8in; }
.sub { position: absolute; top: 1.6in; left: 0; right: 0; font-size: 22pt; color: #f3e3b8; letter-spacing: 0.02em; }
.ribbon { position: absolute; top: 2.06in; left: 0.75in; right: 0.75in; padding: 0.07in 0.18in; background: linear-gradient(#7c231c, #5a1611);
  border: 1.4px solid #d4ad55; border-radius: 0.05in; font-size: 10.5pt; line-height: 1.32; color: #f6e7bf; font-style: italic; }
.vol { position: absolute; top: 2.72in; left: 0; right: 0; font-size: 9pt; letter-spacing: 0.2em; text-transform: uppercase; color: #e9c66e; }
.art { position: absolute; top: 2.98in; left: 0.42in; width: 5.16in; height: 5.18in; border: 2px solid #d4ad55; overflow: hidden; border-radius: 0.06in; }
.art img { position: absolute; left: -0.3in; top: -0.75in; width: 106%; }
.feat { position: absolute; top: 7.18in; left: 0.62in; width: 3.62in; height: 0.86in; display: flex; background: rgba(246, 232, 196, 0.95);
  border: 1.4px solid #b88c3c; border-radius: 0.05in; color: #3a120d; }
.feat div { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 0.06in 0.02in 0; border-left: 0.6px solid #c9a564; }
.feat div:first-child { border-left: 0; }
.feat svg { width: 0.32in; height: 0.32in; }
.feat span { font-size: 6.9pt; line-height: 1.12; font-weight: bold; margin-top: 0.02in; }
.phone { position: absolute; top: 5.25in; left: 4.42in; width: 1.32in; height: 2.62in; border-radius: 0.17in; background: #1b1b1d;
  border: 2px solid #c9a24c; transform: rotate(4deg); padding: 0.06in; box-sizing: border-box; }
.phone .screen { width: 100%; height: 100%; border-radius: 0.12in; overflow: hidden; background: #fbf6ee; position: relative; }
.phone img { width: 100%; display: block; }
.phone .notch { position: absolute; top: 0.03in; left: 50%; width: 0.36in; height: 0.07in; margin-left: -0.18in; background: #1b1b1d; border-radius: 0.04in; }
.free { position: absolute; top: 7.92in; left: 4.25in; width: 1.55in; font-size: 7pt; line-height: 1.2; color: #f3e3b8; font-style: italic; }
.by { position: absolute; bottom: 0.38in; left: 0; right: 0; font-size: 15pt; letter-spacing: 0.3em; text-transform: uppercase; color: #e9c66e; }
/* spine */
.spine { position: absolute; left: ${BLEED + TRIM_W}in; top: 0; width: ${SPINE}in; height: ${H}in; background: linear-gradient(90deg, #3e0d0a, #5c1712 50%, #3e0d0a);
  border-left: 1px solid #d4ad55; border-right: 1px solid #d4ad55; box-sizing: border-box; }
.spine .txt { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) rotate(90deg); white-space: nowrap; font-size: 13pt; letter-spacing: 0.12em; color: #ecc96f; }
.spine .ocross { left: 50%; top: 0.55in; transform: translateX(-50%); }
.spine .num { position: absolute; left: 0; right: 0; bottom: 0.6in; text-align: center; font-size: 15pt; color: #ecc96f; }
/* back */
.back { position: absolute; left: ${BLEED}in; top: ${BLEED}in; width: ${TRIM_W}in; height: ${TRIM_H}in; }
.back .inner { position: absolute; left: 0.62in; right: 0.62in; top: 0.75in; }
.back h2 { font-size: 21pt; margin: 0 0 0.12in; color: #ecc96f; font-weight: bold; }
.back p { font-size: 10.6pt; line-height: 1.48; margin: 0 0 0.12in; color: #f3e3b8; }
.back ul { font-size: 10.2pt; line-height: 1.45; margin: 0 0 0.14in; padding-left: 0.2in; color: #f3e3b8; }
.back li { margin-bottom: 0.03in; } .back li::marker { color: #e9c66e; }
.back .qr { position: absolute; left: 0.62in; bottom: 0.8in; display: flex; gap: 0.14in; align-items: center; font-size: 9.2pt; width: 3in; color: #f3e3b8; }
.back .qr svg { flex: none; outline: 2px solid #d4ad55; }
.back .credit { position: absolute; left: 0.62in; right: 2.6in; bottom: 0.38in; font-size: 6.6pt; color: #cdb98a; font-style: italic; }
</style></head><body>
<div class="back">
  <div class="frame" style="left:0.22in;top:0.22in;right:0.22in;bottom:0.22in"></div>
  <div class="inner">
    <h2>Read the whole Bible this year</h2>
    <p>The AbrahamsTree Study Bible takes you through every book of the Orthodox Bible in 52 weeks, about four chapters a day, in four volumes. Volume ${v} holds weeks ${range.weeks}: ${range.from} to ${range.to}.</p>
    <ul>
      <li>The complete World English Bible text, with the books of the Orthodox Old Testament</li>
      <li>Each week: a lesson, a saint's words and life, a "Did you know?" and a lesson plan</li>
      <li>A prayer to learn by heart, and a map that follows the reading week by week</li>
      <li>Gustave Doré's engravings beside the stories they show</li>
      <li>A summary and timeline at the end of every book</li>
      <li>Notes lines on every page, and talking points at the end of every week</li>
      <li>The Orthodox Faith: its history, beliefs, feasts and fasts, and how to become Orthodox</li>
    </ul>
    <p>Every week has a QR code that opens the free AbrahamsTree app at the same spot: read in two translations side by side, pray the hours, and explore the map and timeline.</p>
  </div>
  <div class="qr">${qr(APP_URL, '0.9in')}<span>Scan to open the free AbrahamsTree app. It works in the browser on any phone or computer.</span></div>
  <div class="credit">Cover: Abraham and the three angels at Mamre (Genesis 18), engraving by Gustave Doré, 1866.</div>
</div>
<div class="spine">${cross('0.3in')}<div class="txt">AbrahamsTree Study Bible &nbsp;·&nbsp; ${AUTHOR}</div><div class="num">${v}</div></div>
<div class="front">
  <div class="frame" style="left:0.18in;top:0.18in;right:0.18in;bottom:0.18in"></div>
  ${cross('0.34in', 'left:0.36in;top:0.34in')}
  ${cross('0.34in', 'right:0.36in;top:0.34in')}
  <div class="title"><span class="shade">AbrahamsTree</span><span>AbrahamsTree</span></div>
  ${branch}
  <div class="sub">A Study Bible</div>
  <div class="ribbon">The Whole Bible in a Year, Through the Faith and<br>Tradition of the Eastern Orthodox Church</div>
  <div class="vol">Volume ${v} &nbsp;·&nbsp; Weeks ${range.weeks} &nbsp;·&nbsp; ${range.from} to ${range.to}</div>
  <div class="art"><img src="${ART}"></div>
  <div class="feat">${FEATURES.map(([k, t]) => `<div>${icon(k)}<span>${t}</span></div>`).join('')}</div>
  <div class="phone"><div class="screen"><img src="${APP_SHOT}"><div class="notch"></div></div></div>
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
