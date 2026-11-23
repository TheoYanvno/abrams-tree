// Builds the AbramsTree study book: a 6 x 9 inch PDF ready for Amazon KDP (no bleed, mirrored margins
// with room for the binding), laid out by src/lib/book.js so its page numbers match what the app shows.
// Every QR code opens the matching spot in the app. Run with `npm run book`; it writes
// book/AbramsTree Study Book.html and book/AbramsTree Study Book.pdf (the PDF needs Playwright).
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { layout, contents, APP_URL, PLAN } from '../src/lib/book.js';
import { hourById } from '../src/lib/prayers.js';
import { BASEMAP, ERAS, EVENTS, FULL, project, placeById } from '../src/lib/map.js';
import { bookById } from '../src/lib/books.js';
import { genesisPeople, floodYear, laterPeople, formatGodTime, creationWeek, GOD_TIME, GOD_DAY, span, ticks, percent }
  from '../src/lib/timeline.js';

const require = createRequire(import.meta.url);
const QRCode = require('./vendor/qrcode/index.js');
const QRLevel = require('./vendor/qrcode/QRErrorCorrectLevel.js');

const OUT = 'book';
const NAME = 'AbramsTree Study Book';
const AUTHOR = 'Theo Yanvno';                                       // the pen name every book is published under
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const bookLabel = (id) => bookById(id)?.label ?? id;

/** A QR code as an SVG drawing, one square per module, with the quiet zone QR readers need. */
function qr(link, size = '0.85in') {
  const code = new QRCode(-1, QRLevel.M);
  code.addData(APP_URL + link);
  code.make();
  const n = code.getModuleCount();
  const q = 4;                                                       // quiet zone, in modules
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (code.isDark(r, c)) d += `M${c + q} ${r + q}h1v1h-1z`;
  return `<svg class="qr" style="width:${size};height:${size}" viewBox="0 0 ${n + 2 * q} ${n + 2 * q}" shape-rendering="crispEdges">`
    + `<rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}

const qrBox = (link, label = 'Scan to open in the app') =>
  `<div class="qrbox">${qr(link)}<span>${esc(label)}</span></div>`;

const lines = (n, cls = 'line') => Array.from({ length: n }, () => `<div class="${cls}"></div>`).join('');

// ---- pages ------------------------------------------------------------------------------------

const PAGES = {
  blank: () => '',

  title: () => `
    <div class="center title">
      <div class="cross">☦</div>
      <h1>AbramsTree</h1>
      <div class="sub">A Bible-in-a-Year Study Book</div>
      <div class="rule"></div>
      <p class="tag">Read the whole Bible in 52 weeks, pray the hours, and walk through who lived when and where it happened, with a free app at every step.</p>
      <div class="author">${AUTHOR}</div>
    </div>`,

  copyright: () => `
    <div class="small bottom">
      <p><b>AbramsTree: A Bible-in-a-Year Study Book</b></p>
      <p>Copyright © 2026 ${AUTHOR}. All rights reserved.</p>
      <p>Scripture quotations are from the World English Bible, which is in the public domain. The prayers are the
      traditional prayers of the Orthodox Church. Maps are drawn from Natural Earth data, which is in the public domain.</p>
      <p>The reading plan follows the books of the Orthodox Bible in the order of SuperBook. Dates before Abraham are
      counted from the ages given in Genesis; later dates are approximate.</p>
      <p>The AbramsTree app is free: ${esc(APP_URL)}</p>
    </div>`,

  how: (p) => `
    <h2>How to use this book</h2>
    <p>This book and the free AbramsTree app work together. Read and write here; scan a code when you want more.</p>
    <ol class="how">
      <li><b>Read a little every day.</b> Each week has a page of seven days of chapters. Check off each day as you read it.</li>
      <li><b>Write it down.</b> Facing each week is a page for notes and prayers: what stood out, what to pray about.</li>
      <li><b>Scan the code</b> on any page with your phone's camera. It opens that week, prayer, chart or map in the app,
      where you can read the chapters in two translations side by side, mark verses and keep your streak.</li>
      <li><b>Pray the hours.</b> Part Two has the prayers for morning, the Third, Sixth and Ninth Hours, evening and night.</li>
      <li><b>See the big picture.</b> Parts Three and Four show who lived when and where it happened.</li>
    </ol>
    <div class="center">${qrBox(p.link, 'Scan to open AbramsTree')}</div>
    <p class="small center">Or visit ${esc(APP_URL)}</p>`,

  contents: () => `
    <h2>Contents</h2>
    <div class="toc">
      ${[['How to use this book', 3], ['My year in the Word', 5]].map(([t, n]) => `<div><span>${t}</span><b>${n}</b></div>`).join('')}
      ${contents().map((c) => `<div><span>Part ${c.part}: ${esc(c.title)}</span><b>${c.n}</b></div>`).join('')}
    </div>
    <blockquote>Your word is a lamp to my feet, and a light for my path.<cite>Psalm 119 (118):105</cite></blockquote>`,

  start: () => `
    <h2>My year in the Word</h2>
    <div class="field">This book belongs to ${lines(1, 'fill')}</div>
    <div class="field">I began on ${lines(1, 'fill')}</div>
    <p>Reading the whole Bible takes about fifteen minutes a day. Some days will be easy and some will be hard. If you miss
    a day, don't give up: pick up where you left off. The app keeps a list of days to catch up on.</p>
    <h3>My prayer for this year</h3>
    ${lines(9)}`,

  part: (p) => `
    <div class="center part">
      <div class="partno">Part ${p.part}</div>
      <h1>${esc(p.title)}</h1>
      <div class="sub">${esc(p.subtitle)}</div>
      <div class="rule"></div>
      <p>${esc(PART_INTRO[p.part])}</p>
      ${p.link ? qrBox(p.link) : ''}
    </div>`,

  week: (p) => `
    <div class="head"><div><div class="kicker">${esc(PLAN.name)}</div><h2>Week ${p.week}</h2></div>${qrBox(p.link, 'Read this week in the app')}</div>
    <table class="days">
      ${p.days.map((d) => `<tr><td class="box">☐</td><td class="dn">Day ${d.day}</td><td class="rd">${esc(d.text)}</td><td class="dt">____</td></tr>`).join('')}
    </table>
    <div class="small muted">Check each day as you read it, and write the date in the last column.</div>`,

  notes: (p) => `
    <div class="kicker">Week ${p.week}</div>
    <h2>Notes and prayers</h2>
    <h3>What stood out to me</h3>
    ${lines(9)}
    <h3>What I'm praying about</h3>
    ${lines(7)}`,

  hour: (p) => {
    const h = hourById(p.hour);
    return `
      <div class="head"><div><div class="kicker">${h.time}</div><h2>${esc(h.name)}</h2></div>${qrBox(p.link, 'Pray this hour in the app')}</div>
      <blockquote>${esc(h.verse.text)}<cite>${esc(h.verse.ref)}</cite></blockquote>
      ${h.prayers.map((x) => `<h3>${esc(x.title)}</h3><p>${esc(x.text)}</p>`).join('')}`;
  },

  requests: (p) => `
    <h2>${p.sheet === 1 ? 'My prayer list' : 'My prayer list (continued)'}</h2>
    <table class="requests"><tr><th>Date</th><th>I'm praying for</th><th>Answered</th></tr>
      ${Array.from({ length: 15 }, () => '<tr><td></td><td></td><td></td></tr>').join('')}
    </table>`,

  creation: (p) => {
    const week = creationWeek();
    return `
      <div class="head"><div><div class="kicker">Genesis 1:1 – 2:3</div><h2>The week of creation</h2></div>${qrBox(p.link)}</div>
      <p>“With the Lord one day is as a thousand years, and a thousand years as one day” (2 Peter 3:8). God made the
      heavens and the earth in six days and rested on the seventh: six days of making are 6,000 of our years, and the
      whole week with the day of rest is 7,000 years.</p>
      <div class="week7">${week.map((d) => `<div class="${d.rest ? 'rest' : ''}"><b>Day ${d.day}</b><span>${esc(d.made)}</span><i>${(d.to - d.from).toLocaleString('en-US')} years · Gen ${d.ref}</i></div>`).join('')}</div>
      <p class="center total">6 days of making = <b>6,000 years</b><br>7 days with the day of rest = <b>7,000 years</b></p>`;
  },

  godtime: (p) => {
    const G = genesisPeople(), L = laterPeople();
    const who = [['Adam', G.find((x) => x.id === 'adam')], ['Methuselah', G.find((x) => x.id === 'methuselah')],
      ['Noah', G.find((x) => x.id === 'noah')], ['Abraham', G.find((x) => x.id === 'abraham')],
      ['Moses', L.find((x) => x.id === 'moses')], ['King David', L.find((x) => x.id === 'david')]];
    return `
      <div class="head"><div><div class="kicker">2 Peter 3:8</div><h2>A day with the Lord</h2></div>${qrBox(p.link)}</div>
      <p>Whenever God speaks about time, remember that His day is a thousand of our years. One year of ours is about a
      minute and a half of God's day.</p>
      ${GOD_TIME.slice(0, 5).map(([, ref, , , , meaning]) => `<p class="gt"><b>${esc(ref)}</b> ${esc(meaning)}</p>`).join('')}
      <h3>Lives in God's time</h3>
      <table class="lives">${who.map(([n, x]) => `<tr><td>${n}</td><td>${x.lived} years</td><td>${formatGodTime(x.lived)}</td></tr>`).join('')}
        <tr><td>Your life</td><td>____ years</td><td>about 1½ minutes a year</td></tr></table>`;
  },

  chart: (p) => chartPage(p),

  era: (p) => eraPage(p),

  journal: () => `<div class="field">Date ${lines(1, 'fill')}</div>${lines(17)}`,
};

const PART_INTRO = {
  1: 'Fifty-two weeks of readings take you through every book of the Bible, from Genesis to Revelation, about four chapters a day.',
  2: 'The Church prays through the day: in the morning, at the Third, Sixth and Ninth Hours, in the evening and before sleep. Here are the prayers for each, and pages for your own prayer list.',
  3: 'From Adam to the apostles: when each person lived, who was alive at the same time, and the week of creation in God\'s days.',
  4: 'Six maps, one for each part of the story, from Abram leaving Ur to John on Patmos.',
  5: 'Pages for what God is teaching you this year.',
};

// ---- timeline charts ---------------------------------------------------------------------------

function chartPage(p) {
  const genesis = p.chart === 'genesis';
  const people = genesis ? genesisPeople() : laterPeople();
  const s = span(people, 100);
  const W = 460, nameW = 118, rowH = 19, top = 34;
  const H = top + people.length * rowH + 30;
  const x = (y) => nameW + (percent(y, s) / 100) * (W - nameW);
  const bands = genesis
    ? Array.from({ length: Math.ceil(s.to / GOD_DAY) }, (_, i) => ({ from: i * GOD_DAY, to: Math.min(s.to, (i + 1) * GOD_DAY), label: ['1st', '2nd', '3rd'][i] + ' 1,000 years' }))
    : (() => { const e = [s.from, ...ticks(s, GOD_DAY).filter((y) => y > s.from && y < s.to), s.to]; return e.slice(1).map((to, i) => ({ from: e[i], to, label: to - e[i] === GOD_DAY ? 'one day to God' : '' })); })();
  const flood = genesis ? floodYear(people) : null;
  const label = (y) => (genesis ? y.toLocaleString('en-US') : y < 0 ? `${-y} BC` : y === 0 ? 'BC|AD' : `AD ${y}`);
  const svg = `
    <svg class="chart" viewBox="0 0 ${W} ${H}">
      ${bands.map((b, i) => `<rect x="${x(b.from)}" y="2" width="${x(b.to) - x(b.from)}" height="22" rx="4" fill="${i % 2 ? '#e9e9e9' : '#f4f4f4'}" stroke="#bbb"/>
        <text x="${(x(b.from) + x(b.to)) / 2}" y="17" class="band">${b.label}</text>`).join('')}
      ${flood !== null ? `<line x1="${x(flood)}" x2="${x(flood)}" y1="${top - 4}" y2="${top + people.length * rowH}" stroke="#000" stroke-dasharray="3 2"/>` : ''}
      ${people.map((q, i) => {
        const y = top + i * rowH;
        return `<text x="${nameW - 6}" y="${y + 12}" class="nm">${esc(q.name)}</text>
          <rect x="${x(q.born)}" y="${y + 3}" width="${Math.max(3, x(q.died) - x(q.born))}" height="12" rx="6" fill="${q.about ? '#fff' : '#555'}" stroke="#333"/>
          ${x(q.died) - x(q.born) > 24 ? `<text x="${(x(q.born) + x(q.died)) / 2}" y="${y + 12.5}" class="yrs" fill="${q.about ? '#000' : '#fff'}">${q.lived}</text>` : `<text x="${x(q.died) + 4}" y="${y + 12.5}" class="yrs2">${q.lived}</text>`}`;
      }).join('')}
      <line x1="${nameW}" x2="${W}" y1="${H - 26}" y2="${H - 26}" stroke="#999"/>
      ${ticks(s, 500).map((y) => `<text x="${x(y)}" y="${H - 12}" class="tick">${label(y)}</text>`).join('')}
    </svg>`;
  return `
    <div class="head"><div><div class="kicker">${genesis ? 'Years from creation' : 'Years BC and AD'}</div><h2>${genesis ? 'From Adam to Joseph' : 'From Abraham to the Apostles'}</h2></div>${qrBox(p.link)}</div>
    ${svg}
    <p class="small">${genesis
      ? 'Added up from the ages in Genesis 5 and 11. The dashed line is the Flood, in year 1,656 (Genesis 7). Each band is a thousand years: one day to the Lord. The number on each bar is how many years that person lived.'
      : 'Worked back from 1 Kings 6:1 (the temple begun 480 years after the Exodus, about 1446 BC). Open bars are approximate dates. The number on each bar is how many years that person lived.'}</p>`;
}

// ---- maps ----------------------------------------------------------------------------------------

function eraPage(p) {
  const era = ERAS.find((e) => e.id === p.era);
  const events = EVENTS.filter((e) => e.era === p.era);
  const places = [...new Set(events.map((e) => e.place))].map(placeById);
  const pts = places.map(project);
  const aspect = 4.9 / 3.7;
  let x0 = Math.min(...pts.map((q) => q.x)), x1 = Math.max(...pts.map((q) => q.x));
  let y0 = Math.min(...pts.map((q) => q.y)), y1 = Math.max(...pts.map((q) => q.y));
  let w = Math.max(x1 - x0, 34) * 1.35, h = Math.max(y1 - y0, 26) * 1.35;
  if (w / h > aspect) h = w / aspect; else w = h * aspect;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  // Stay a little inside the base map, whose land is cut off (and outlined) at its edges.
  const edge = 4, maxW = FULL.w - 2 * edge, maxH = FULL.h - 2 * edge;
  if (w > maxW) { w = maxW; h = w / aspect; }
  if (h > maxH) { h = maxH; w = h * aspect; }
  const vb = { x: Math.max(edge, Math.min(FULL.w - edge - w, cx - w / 2)), y: Math.max(edge, Math.min(FULL.h - edge - h, cy - h / 2)), w, h };
  const u = vb.w / 520;                                              // map units per drawn point
  const num = new Map(places.map((pl, i) => [pl.id, i + 1]));
  const svg = `
    <div class="mapbox"><svg class="map" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}">
      <rect x="0" y="0" width="${FULL.w}" height="${FULL.h}" fill="#e8eef2"/>
      ${BASEMAP.land.map((d) => `<path d="${d}" fill="#fff" stroke="#666" stroke-width="${0.8 * u}" fill-rule="evenodd"/>`).join('')}
      ${BASEMAP.lakes.map((l) => `<path d="${l.d}" fill="#e8eef2" stroke="#666" stroke-width="${0.6 * u}"/>`).join('')}
      ${BASEMAP.rivers.map((r) => `<path d="${r.d}" fill="none" stroke="#888" stroke-width="${1.1 * u}"/>`).join('')}
      ${places.map((pl) => { const q = project(pl); const n = num.get(pl.id); return `<circle cx="${q.x}" cy="${q.y}" r="${7 * u}" fill="#000"/>
        <text x="${q.x}" y="${q.y + 3.3 * u}" font-size="${9 * u}" fill="#fff" text-anchor="middle" font-weight="bold">${n}</text>`; }).join('')}
    </svg></div>`;
  return `
    <div class="head"><div><div class="kicker">Map</div><h2>${esc(era.name)}</h2></div>${qrBox(p.link)}</div>
    ${svg}
    <ol class="places">${places.map((pl) => `<li><b>${esc(pl.name)}</b>: ${events.filter((e) => e.place === pl.id).map((e) => `${esc(e.title)} <i>(${esc(bookLabel(e.book))} ${e.chapter})</i>`).join('; ')}</li>`).join('')}</ol>`;
}

// ---- the whole book ------------------------------------------------------------------------------

const CSS = `
@page { size: 6in 9in; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; }
body { font-family: 'TeX Gyre Pagella', 'Palatino Linotype', Georgia, serif; color: #111; font-size: 10.5pt; line-height: 1.42; }
.page { width: 6in; height: 9in; position: relative; overflow: hidden; break-after: page; padding: 0.6in 0.5in 0.75in 0.75in; }
.page.even { padding: 0.6in 0.75in 0.75in 0.5in; }
.page:last-child { break-after: auto; }
.folio { position: absolute; bottom: 0.38in; left: 0; right: 0; text-align: center; font-size: 9pt; }
h1 { font-size: 30pt; margin: 0; line-height: 1.1; }
h2 { font-size: 17pt; margin: 0 0 8pt; line-height: 1.15; }
h3 { font-size: 11.5pt; margin: 12pt 0 3pt; }
p { margin: 0 0 7pt; }
.small { font-size: 8.5pt; }
.muted { color: #555; }
.center { text-align: center; }
.title, .part { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.title h1 { font-size: 40pt; }
.cross { font-size: 40pt; margin-bottom: 12pt; }
.sub { font-size: 14pt; font-style: italic; margin-top: 6pt; }
.rule { width: 1.6in; border-top: 1.5px solid #111; margin: 18pt auto; }
.tag { max-width: 3.8in; }
.author { margin-top: 48pt; font-size: 13pt; letter-spacing: .1em; text-transform: uppercase; }
.bottom { position: absolute; bottom: 0.9in; left: 0.5in; right: 0.75in; }
.partno { text-transform: uppercase; letter-spacing: .2em; font-size: 10pt; margin-bottom: 8pt; }
.part p { max-width: 3.9in; margin-bottom: 18pt; }
.kicker { text-transform: uppercase; letter-spacing: .12em; font-size: 8pt; color: #444; }
.head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10pt; margin-bottom: 8pt; }
.qrbox { display: inline-flex; flex-direction: column; align-items: center; gap: 2pt; font-size: 6.5pt; color: #333; text-align: center; max-width: 1in; }
.qr { display: block; }
.days { width: 100%; border-collapse: collapse; margin: 6pt 0 10pt; }
.days td { border-bottom: 1px solid #999; padding: 9pt 3pt; vertical-align: top; }
.days .box { width: 16pt; font-size: 13pt; line-height: 1; }
.days .dn { width: 46pt; font-weight: bold; white-space: nowrap; }
.days .dt { width: 40pt; color: #777; text-align: right; }
.line { border-bottom: 1px solid #aaa; height: 0.31in; }
.fill { display: inline-block; border-bottom: 1px solid #333; width: 2.6in; height: 1em; }
.field { margin: 12pt 0; }
.how li { margin-bottom: 6pt; }
.toc div { display: flex; justify-content: space-between; border-bottom: 1px dotted #888; padding: 6pt 0; }
blockquote { margin: 14pt 0; padding: 4pt 0 4pt 10pt; border-left: 2.5px solid #111; font-style: italic; }
blockquote cite { display: block; font-style: normal; font-size: 9pt; margin-top: 3pt; }
.requests { width: 100%; border-collapse: collapse; }
.requests th { text-align: left; font-size: 9pt; border-bottom: 1.5px solid #111; padding: 3pt; }
.requests td { border-bottom: 1px solid #aaa; height: 0.36in; }
.requests td:first-child, .requests td:last-child { width: 0.75in; }
.week7 { display: grid; grid-template-columns: 1fr 1fr; gap: 6pt; margin: 10pt 0; }
.week7 div { border: 1px solid #333; border-radius: 6pt; padding: 6pt 8pt; display: grid; gap: 1pt; }
.week7 .rest { grid-column: 1 / -1; border-width: 2px; text-align: center; }
.week7 i { font-size: 8pt; color: #444; }
.total { font-size: 11pt; margin-top: 10pt; }
.gt { font-size: 9.5pt; }
.lives { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
.lives td { border-bottom: 1px solid #bbb; padding: 3pt 2pt; }
.chart { width: 100%; height: auto; font-family: inherit; }
.chart .nm { font-size: 9px; text-anchor: end; }
.chart .yrs { font-size: 7.5px; text-anchor: middle; }
.chart .yrs2 { font-size: 7.5px; }
.chart .band { font-size: 8px; text-anchor: middle; }
.chart .tick { font-size: 8px; text-anchor: middle; }
.mapbox { border: 1px solid #333; margin-bottom: 8pt; line-height: 0; overflow: hidden; }
.map { width: 100%; height: auto; display: block; }
.places { font-size: 8.6pt; padding-left: 16pt; margin: 0; }
.places li { margin-bottom: 2pt; }
`;

const pages = layout();
const body = pages.map((p) => {
  const side = p.n % 2 ? 'odd' : 'even';
  const folio = ['blank', 'title', 'part'].includes(p.kind) ? '' : `<div class="folio">${p.n}</div>`;
  return `<section class="page ${side} ${p.kind}">${PAGES[p.kind](p)}${folio}</section>`;
}).join('\n');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${NAME}</title><meta name="author" content="${AUTHOR}"><style>${CSS}</style></head><body>${body}</body></html>`;

await mkdir(OUT, { recursive: true });
const htmlPath = `${OUT}/${NAME}.html`;
await writeFile(htmlPath, html);
console.log(`${pages.length} pages → ${htmlPath}`);

let chromium;
try { ({ chromium } = require('playwright')); } catch { console.log('Playwright is not installed, so only the HTML was written. Open it in a browser and print to PDF at 6 x 9 in.'); process.exit(0); }
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve(htmlPath)).href, { waitUntil: 'load' });
await page.pdf({ path: `${OUT}/${NAME}.pdf`, width: '6in', height: '9in', printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(`→ ${OUT}/${NAME}.pdf`);
