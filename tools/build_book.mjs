// Builds the AbrahamsTree Study Bible: the whole Bible (World English Bible, public domain) read in a
// year, in four 6 x 9 volumes of 13 weeks each, ready for Amazon KDP (no bleed, mirrored margins with
// room for the binding). Each week opens with a two-page spread: that week's readings with checkboxes,
// an introduction to any book that starts that week, a "Did you know?" and a drawing on the left; a
// saint's words, a prayer to learn by heart and room for notes on the right. The week's chapters follow
// in two columns. Each volume ends with the hours of prayer, a prayer list, that part's timeline and
// maps, and journal pages. Every QR code opens the same spot in the free app, and the build writes the
// page numbers the app shows to src/data/bookPages.json.
//
// Run with `npm run book` (needs Playwright). It writes book/AbrahamsTree Study Bible - Volume N.pdf.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { gunzipSync } from 'node:zlib';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname, join } from 'node:path';
import { weeks, route, APP_URL, PLAN } from '../src/lib/book.js';
import { HOURS, hourById } from '../src/lib/prayers.js';
import { BASEMAP, ERAS, EVENTS, FULL, project, placeById } from '../src/lib/map.js';
import { bookById } from '../src/lib/books.js';
import { genesisPeople, floodYear, laterPeople, formatGodTime, creationWeek, GOD_TIME, GOD_DAY, span, ticks, percent }
  from '../src/lib/timeline.js';
import { INTROS, QUOTES, FACTS, MEMORY_STEPS, memoryFor } from '../src/data/study.js';

const require = createRequire(import.meta.url);
const QRCode = require('./vendor/qrcode/index.js');
const QRLevel = require('./vendor/qrcode/QRErrorCorrectLevel.js');
const HERE = dirname(fileURLToPath(import.meta.url));

const OUT = 'book';
const NAME = 'AbrahamsTree Study Bible';
const AUTHOR = 'Theo Yanvno';                                       // the pen name every book is published under
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const bookLabel = (id) => bookById(id)?.label ?? id;
const PLAN_LINK = route('read');

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


// ---- the volumes ---------------------------------------------------------------------------------

const BIBLE = JSON.parse(gunzipSync(await readFile(join(HERE, 'data/web.json.gz'))).toString('utf8'));
const ILLUS = JSON.parse(await readFile(join(HERE, 'data/illustrations/index.json'), 'utf8'));
const WEEKS = weeks();
const LAST_CHAPTER = { Psalms: 150, Baruch: 5 };                     // the plan's last chapter; 151 and 6 follow it
const EXTRA = { Psalms: '151', Baruch: '6' };

/** Each volume: its weeks and the extra sections it closes with. */
export const VOLUMES = [
  { n: 1, weeks: [1, 13], timeline: ['creation', 'godtime', 'genesis'], eras: ['patriarchs', 'exodus', 'kings'] },
  { n: 2, weeks: [14, 26], timeline: ['later'], eras: ['kings', 'exile'] },
  { n: 3, weeks: [27, 39], timeline: ['godtime', 'later'], eras: ['kings', 'exile'] },
  { n: 4, weeks: [40, 52], timeline: ['later'], eras: ['jesus', 'church'] },
];

const span2 = (v) => {
  const ws = WEEKS.slice(v.weeks[0] - 1, v.weeks[1]);
  const first = ws[0].days[0].chapters[0], last = ws.at(-1).days.at(-1).chapters.at(-1);
  return { ws, from: bookLabel(first.book).replace(/ \(.*\)/, ''), to: bookLabel(last.book).replace(/ \(.*\)/, '') };
};

/** Books whose first chapter is read in a given week. */
const booksStarting = (w) => [...new Set(w.days.flatMap((d) => d.chapters.filter((c) => c.chapter === 1).map((c) => c.book)))];

const marker = (id) => `<span class="mk">@@${id}@@</span>`;
const sheet = (cls, inner, plain = false) => `<section class="sheet ${cls}${plain ? ' plain' : ''}">${inner}</section>`;

function verseHtml(blocks, chapterKey) {
  const seen = new Set();
  return blocks.map(([kind, parts]) => {
    const body = parts.map(([v, t]) => {
      let num = '';
      if (v && !seen.has(v)) { seen.add(v); num = `<sup>${String(v).replace(/^S/, '')}</sup>`; }
      return `${num}${esc(t)} `;
    }).join('');
    if (kind === 'q' || kind === 'q2') return `<div class="${kind}">${body}</div>`;
    if (kind === 'd') return `<div class="d">${body}</div>`;
    if (kind === 's') return `<div class="s">${body}</div>`;
    return `<p>${body}</p>`;
  }).join('');
}

function readingHtml(w) {
  return w.days.map((d) => {
    const chapters = [];
    for (const { book, chapter } of d.chapters) {
      chapters.push([book, String(chapter)]);
      if (LAST_CHAPTER[book] === chapter) chapters.push([book, EXTRA[book]]);
    }
    const text = chapters.map(([book, ch]) => {
      const first = ch === '1';
      const name = bookLabel(book);
      const label = book === 'Psalms' ? `Psalm ${ch}` : book === 'Baruch' && ch === '6' ? 'Baruch 6' : `${name.replace(/ \(.*\)/, '')} ${ch}`;
      return `${first ? `<h3 class="book">${esc(name)}</h3>` : ''}<h4 class="ch">${esc(label)}</h4>${verseHtml(BIBLE[book][ch] || [], ch)}`;
    }).join('');
    return `<div class="day"><div class="dayhead">☐ Day ${d.day} <span>· ${esc(d.text)}</span></div><div class="cols">${text}</div></div>`;
  }).join('');
}

function weekLeft(w) {
  const intros = booksStarting(w).filter((b) => INTROS[b]);
  const [fact, factRef] = FACTS[w.week - 1];
  const ill = ILLUS[w.week];
  const img = ill ? `<figure><img src="${pathToFileURL(join(HERE, 'data/illustrations', ill.file)).href}"><figcaption>${esc(ill.title)}</figcaption></figure>` : '';
  return sheet('wleft', `${marker('W' + w.week)}
    <div class="head"><div><div class="kicker">${esc(PLAN.name)} · Days ${w.days[0].day}–${w.days.at(-1).day}</div><h2>Week ${w.week}</h2></div>${qrBox(route('read', 'week', w.week), 'Read this week in the app')}</div>
    <table class="days">${w.days.map((d) => `<tr><td class="box">☐</td><td class="dn">Day ${d.day}</td><td class="rd">${esc(d.text)}</td><td class="dt">____</td></tr>`).join('')}</table>
    ${intros.length ? `<div class="intros"><div class="label">New this week</div>${intros.map((b) => `<p><b>${esc(bookLabel(b))}.</b> ${esc(INTROS[b])}</p>`).join('')}</div>` : ''}
    <div class="fact">${img}<div class="label">Did you know?</div><p>${esc(fact)}</p></div>`);
}

function weekRight(w) {
  const [q, who, src] = QUOTES[w.week - 1];
  const { prayer: [title, text], step } = memoryFor(w.week);
  return sheet('wright', `
    <div class="quote"><div class="label">This week's saint</div><p>“${esc(q)}”</p><cite>${esc(who)}${src ? `, <i>${esc(src)}</i>` : ''}</cite></div>
    <div class="memory"><div class="label">Pray it by heart · week ${step} of 4</div><h4>${esc(title)}</h4><p class="ptext">${esc(text)}</p>
      <p class="step">${esc(MEMORY_STEPS[step - 1])}</p><div class="ticks">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => `<span>☐ ${d}</span>`).join('')}</div></div>
    <div class="notes"><div class="label">Notes and prayers</div><div class="nlines">${lines(18)}</div></div>`);
}

const filler = () => sheet('filler', `<div class="label">Notes</div><div class="nlines">${lines(22)}</div>`);

function volumeHtml(v, fillers, toc) {
  const { ws, from, to } = span2(v);
  const out = [];
  out.push(sheet('title', `<div class="cross">☦</div><h1>AbrahamsTree</h1><div class="sub">Study Bible</div><div class="rule"></div>
    <div class="vol">Volume ${v.n}</div><div class="range">Weeks ${v.weeks[0]}–${v.weeks[1]} · ${esc(from)} to ${esc(to)}</div>
    <p class="tag">The whole Bible in a year, with prayers, a timeline, maps and a free app at every step.</p><div class="author">${AUTHOR}</div>`, true));
  out.push(sheet('copyright', `<div class="bottom small">
      <p><b>AbrahamsTree Study Bible, Volume ${v.n}</b></p>
      <p>Copyright © 2026 ${AUTHOR}. All rights reserved for the notes, introductions and arrangement.</p>
      <p>The Bible text is the World English Bible (WEB), which is in the public domain, with the books of the Orthodox
      Old Testament: the Song of the Three Holy Children in Daniel 3, the Letter of Jeremiah as Baruch 6, and Psalm 151.
      Psalms are numbered as in the Hebrew. The prayers are the traditional prayers of the Orthodox Church. Maps are drawn
      from Natural Earth data (public domain). Drawings are from Colors of Eden by ${AUTHOR}.</p>
      <p>The free AbrahamsTree app: ${esc(APP_URL)}</p></div>`, true));
  out.push(sheet('how', `${marker('HOW')}<h2>How to use this book</h2>
    <p>This is the whole Bible, read in a year in four volumes of 13 weeks. This volume has weeks ${v.weeks[0]} to ${v.weeks[1]}.</p>
    <ol class="how">
      <li><b>Start each week</b> with its two pages: the week's readings, an introduction to any new book, a "Did you know?", a saint's words and a prayer to learn by heart.</li>
      <li><b>Read each day</b> in the pages that follow. Each day is marked; tick it when you've read it.</li>
      <li><b>Write it down</b> in the notes space beside each week.</li>
      <li><b>Learn a prayer</b> over four weeks: read it, then say part, then nearly all, then all of it by heart.</li>
      <li><b>Scan a code</b> with your phone to open the same week, prayer, chart or map in the free app, read in two translations side by side and keep your streak.</li>
    </ol><div class="center">${qrBox(PLAN_LINK, 'Scan to open AbrahamsTree')}</div>`));
  const tocRows = toc ? toc.map(([t, n]) => `<div><span>${esc(t)}</span><b>${n}</b></div>`).join('') : '';
  out.push(sheet('contents', `<h2>Contents</h2><div class="toc">${tocRows}</div>
    <blockquote>Your word is a lamp to my feet, and a light for my path.<cite>Psalm 119:105</cite></blockquote>`));
  out.push(sheet('start', `<h2>My year in the Word</h2>
    <div class="field">This book belongs to ${lines(1, 'fill')}</div><div class="field">I began this volume on ${lines(1, 'fill')}</div>
    <p>The whole Bible takes about fifteen minutes a day. If you miss a day, don't give up: pick up where you left off.</p>
    <h3>My prayer for these weeks</h3>${lines(10)}`));
  for (const w of ws) {
    if (fillers.has(w.week)) out.push(filler());
    out.push(weekLeft(w), weekRight(w));
    out.push(`<section class="reading">${readingHtml(w)}</section>`);
  }
  out.push(sheet('part', `${marker('PRAY')}<div class="partno">Pray without ceasing</div><h1>The Hours of Prayer</h1><div class="rule"></div>
    <p>The Church prays through the day: in the morning, at the Third, Sixth and Ninth Hours, in the evening and before sleep.</p>${qrBox(route('pray'))}`, true));
  for (const h of HOURS) out.push(sheet('hour', marker('H' + h.id) + PAGES.hour({ hour: h.id, link: route('pray', 'hour', h.id) })));
  out.push(sheet('requests', PAGES.requests({ sheet: 1 })), sheet('requests', PAGES.requests({ sheet: 2 })));
  out.push(sheet('part', `${marker('TIME')}<div class="partno">Who lived when · where it happened</div><h1>Timeline and Maps</h1><div class="rule"></div>
    <p>The people and places of these weeks' readings.</p>${qrBox(route('timeline'))}`, true));
  for (const t of v.timeline) {
    const page = t === 'creation' ? PAGES.creation({ link: route('timeline', 'week') })
      : t === 'godtime' ? PAGES.godtime({ link: route('timeline', 'week') })
        : PAGES.chart({ chart: t, link: route('timeline', t) });
    out.push(sheet('tl', marker('T' + t) + page));
  }
  for (const e of v.eras) out.push(sheet('era', marker('E' + e) + PAGES.era({ era: e, link: route('map', 'era', e) })));
  out.push(sheet('part', `${marker('JOURNAL')}<div class="partno">For what God is teaching you</div><h1>Journal</h1><div class="rule"></div>`, true));
  for (let i = 0; i < 6; i++) out.push(sheet('journal', PAGES.journal()));
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${NAME} - Volume ${v.n}</title><meta name="author" content="${AUTHOR}"><style>${CSS}</style></head><body>${out.join('\n')}</body></html>`;
}

const CSS = `
@page { size: 6in 9in; margin: 0.6in 0.5in 0.7in 0.75in;
  @bottom-center { content: counter(page); font-family: 'TeX Gyre Pagella', Georgia, serif; font-size: 8.5pt; } }
@page :left { margin-left: 0.5in; margin-right: 0.75in; }
@page plain { @bottom-center { content: none; } }
* { box-sizing: border-box; }
html, body { margin: 0; }
body { font-family: 'TeX Gyre Pagella', 'Palatino Linotype', Georgia, serif; color: #111; font-size: 10pt; line-height: 1.38; }
.sheet { height: 7.7in; overflow: hidden; break-after: page; position: relative; }
.sheet.plain { page: plain; }
.mk { position: absolute; left: 0; top: 0; font-size: 1px; color: #fff; }
h1 { font-size: 30pt; margin: 0; line-height: 1.1; }
h2 { font-size: 16pt; margin: 0 0 6pt; line-height: 1.15; }
h3 { font-size: 11pt; margin: 10pt 0 3pt; }
p { margin: 0 0 6pt; }
.small { font-size: 8.5pt; } .center { text-align: center; }
.title, .part { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.title h1 { font-size: 40pt; } .cross { font-size: 30pt; margin-bottom: 10pt; } .sub { font-size: 16pt; font-style: italic; margin-top: 4pt; }
.rule { width: 1.6in; border-top: 1.5px solid #111; margin: 14pt auto; }
.vol { font-size: 15pt; letter-spacing: .2em; text-transform: uppercase; } .range { font-size: 11pt; margin-top: 4pt; }
.tag { max-width: 3.6in; margin-top: 18pt; } .author { margin-top: 40pt; font-size: 13pt; letter-spacing: .14em; text-transform: uppercase; }
.bottom { position: absolute; bottom: 0; left: 0; right: 0; }
.partno { text-transform: uppercase; letter-spacing: .18em; font-size: 9pt; margin-bottom: 8pt; } .part p { max-width: 3.8in; margin-bottom: 14pt; }
.kicker, .label { text-transform: uppercase; letter-spacing: .12em; font-size: 7.5pt; color: #444; }
.label { font-weight: bold; margin-bottom: 3pt; }
.head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10pt; margin-bottom: 4pt; }
.qrbox { display: inline-flex; flex-direction: column; align-items: center; gap: 2pt; font-size: 6.5pt; color: #333; text-align: center; max-width: 0.95in; }
.qr { display: block; }
.days { width: 100%; border-collapse: collapse; margin: 2pt 0 8pt; font-size: 9.5pt; }
.days td { border-bottom: 1px solid #aaa; padding: 4.5pt 2pt; vertical-align: top; }
.days .box { width: 14pt; font-size: 11pt; line-height: 1; } .days .dn { width: 42pt; font-weight: bold; white-space: nowrap; } .days .dt { width: 32pt; color: #888; text-align: right; }
.intros { font-size: 8.4pt; line-height: 1.3; margin-bottom: 7pt; } .intros p { margin: 0 0 2.5pt; }
.fact { border: 1.2px solid #111; border-radius: 6pt; padding: 6pt 8pt; font-size: 8.6pt; line-height: 1.33; overflow: hidden; }
.fact p { margin: 0; }
.fact figure { float: right; width: 1.8in; margin: 0 0 3pt 8pt; text-align: center; }
.fact img { width: 100%; height: auto; max-height: 2.1in; object-fit: contain; display: block; }
.fact figcaption { font-size: 6.5pt; font-style: italic; color: #444; margin-top: 2pt; }
.wright { display: flex; flex-direction: column; }
.quote { border-left: 2.5px solid #111; padding: 2pt 0 2pt 9pt; margin-bottom: 9pt; }
.quote p { font-style: italic; font-size: 10.5pt; margin: 0 0 3pt; } .quote cite { font-style: normal; font-size: 8pt; }
.memory { border: 1.2px solid #111; border-radius: 6pt; padding: 6pt 8pt; margin-bottom: 8pt; font-size: 8.6pt; }
.memory h4 { margin: 0 0 3pt; font-size: 10.5pt; } .memory .ptext { margin: 0 0 4pt; line-height: 1.32; }
.memory .step { font-style: italic; margin: 0 0 3pt; } .ticks { display: flex; justify-content: space-between; font-size: 8pt; }
.notes { flex: 1; overflow: hidden; } .nlines .line { height: 0.27in; }
.filler .nlines .line { height: 0.32in; }
.line { border-bottom: 1px solid #aaa; height: 0.3in; }
.fill { display: inline-block; border-bottom: 1px solid #333; width: 2.4in; height: 1em; }
.field { margin: 10pt 0; } .how li { margin-bottom: 5pt; }
.toc div { display: flex; justify-content: space-between; border-bottom: 1px dotted #888; padding: 3.5pt 0; font-size: 9.5pt; }
blockquote { margin: 12pt 0; padding: 3pt 0 3pt 10pt; border-left: 2.5px solid #111; font-style: italic; }
blockquote cite { display: block; font-style: normal; font-size: 8.5pt; margin-top: 3pt; }
.requests { width: 100%; border-collapse: collapse; } .requests th { text-align: left; font-size: 8.5pt; border-bottom: 1.5px solid #111; padding: 3pt; }
.requests td { border-bottom: 1px solid #aaa; height: 0.36in; } .requests td:first-child, .requests td:last-child { width: 0.7in; }
.week7 { display: grid; grid-template-columns: 1fr 1fr; gap: 5pt; margin: 8pt 0; }
.week7 div { border: 1px solid #333; border-radius: 6pt; padding: 5pt 7pt; display: grid; gap: 1pt; font-size: 9pt; }
.week7 .rest { grid-column: 1 / -1; border-width: 2px; text-align: center; } .week7 i { font-size: 7.5pt; color: #444; }
.total { font-size: 10.5pt; margin-top: 8pt; } .gt { font-size: 9pt; }
.lives { width: 100%; border-collapse: collapse; font-size: 9pt; } .lives td { border-bottom: 1px solid #bbb; padding: 3pt 2pt; }
.chart { width: 100%; height: auto; font-family: inherit; }
.chart .nm { font-size: 9px; text-anchor: end; } .chart .yrs { font-size: 7.5px; text-anchor: middle; } .chart .yrs2 { font-size: 7.5px; }
.chart .band { font-size: 8px; text-anchor: middle; } .chart .tick { font-size: 8px; text-anchor: middle; }
.mapbox { border: 1px solid #333; margin-bottom: 6pt; line-height: 0; overflow: hidden; } .map { width: 100%; height: auto; display: block; }
.places { font-size: 8.2pt; padding-left: 15pt; margin: 0; } .places li { margin-bottom: 1.5pt; }
/* the Bible text */
.reading { break-after: page; }
.day { margin-bottom: 8pt; }
.dayhead { font-size: 9pt; font-weight: bold; border-top: 1.5px solid #111; border-bottom: 0.6px solid #111; padding: 2pt 0; margin: 2pt 0 5pt; break-after: avoid; }
.dayhead span { font-weight: normal; }
.cols { column-count: 2; column-gap: 0.2in; column-rule: 0.4px solid #bbb; font-size: 8.4pt; line-height: 1.24; text-align: justify; hyphens: auto; }
.cols p { margin: 0 0 2.5pt; text-indent: 0.12in; }
.cols h3.book { font-size: 12pt; text-align: center; margin: 4pt 0 2pt; column-span: none; break-after: avoid; letter-spacing: .03em; }
.cols h4.ch { font-size: 8.8pt; margin: 5pt 0 1.5pt; text-transform: uppercase; letter-spacing: .08em; break-after: avoid; }
.cols sup { font-size: 5.6pt; vertical-align: 2.2pt; line-height: 0; margin-right: 1pt; font-weight: bold; }
.cols .q { padding-left: 0.16in; text-indent: -0.1in; text-align: left; } .cols .q2 { padding-left: 0.3in; text-indent: -0.1in; text-align: left; }
.cols .d { font-style: italic; font-size: 7.8pt; margin: 1pt 0 2pt; } .cols .s { font-style: italic; text-align: center; margin: 3pt 0; }
`;

// ---- build: render, find where each week landed, add notes pages so every week opens on the left, render again

function markerPages(pdf) {
  const text = execFileSync('pdftotext', ['-layout', pdf, '-'], { maxBuffer: 1 << 30 }).toString('utf8');
  const pages = text.split('\f');
  const found = {};
  pages.forEach((t, i) => { for (const m of t.matchAll(/@@(\w+)@@/g)) if (!(m[1] in found)) found[m[1]] = i + 1; });
  return { found, count: pages.length - (pages.at(-1).trim() ? 0 : 1) };
}

function tocFor(v, found) {
  const rows = [['How to use this book', found.HOW]];
  for (let w = v.weeks[0]; w <= v.weeks[1]; w++) {
    const wk = WEEKS[w - 1];
    rows.push([`Week ${w} · ${wk.days[0].text.split(',')[0]} – ${wk.days.at(-1).text.split(',').at(-1).trim()}`, found['W' + w]]);
  }
  rows.push(['The Hours of Prayer', found.PRAY], ['Timeline and Maps', found.TIME], ['Journal', found.JOURNAL]);
  return rows;
}

const only = process.argv.slice(2).map(Number).filter(Boolean);
await mkdir(OUT, { recursive: true });
let chromium;
try { ({ chromium } = require('playwright')); } catch { console.log('Playwright is needed to build the PDFs.'); process.exit(1); }
const browser = await chromium.launch();
const page = await browser.newPage();
const render = async (html, base) => {
  await writeFile(`${base}.html`, html);
  await page.goto(pathToFileURL(resolve(`${base}.html`)).href, { waitUntil: 'load' });
  await page.pdf({ path: `${base}.pdf`, width: '6in', height: '9in', preferCSSPageSize: true });
  return markerPages(`${base}.pdf`);
};

const map = JSON.parse(await readFile('src/data/bookPages.json', 'utf8').catch(() => '{}'));
for (const v of VOLUMES) {
  if (only.length && !only.includes(v.n)) continue;
  const base = `${OUT}/${NAME} - Volume ${v.n}`;
  // pass 1: where does each week land? Add a notes page before any week that would open on a right-hand page.
  let pass = await render(volumeHtml(v, new Set(), null), base);
  const fillers = new Set();
  let shift = 0;
  for (let w = v.weeks[0]; w <= v.weeks[1]; w++) if ((pass.found['W' + w] + shift) % 2 === 1) { fillers.add(w); shift++; }
  // pass 2 (and a check): with the notes pages and the contents filled in
  const est = Object.fromEntries(Object.entries(pass.found).map(([k, p]) => [k, p + [...fillers].filter((w) => p >= pass.found['W' + w]).length]));
  pass = await render(volumeHtml(v, fillers, tocFor(v, est)), base);
  const bad = [];
  for (let w = v.weeks[0]; w <= v.weeks[1]; w++) if (pass.found['W' + w] % 2 === 1) bad.push(w);
  if (bad.length || JSON.stringify(tocFor(v, pass.found)) !== JSON.stringify(tocFor(v, est))) {
    console.log(`Volume ${v.n}: page numbers moved (${bad.join(', ') || 'contents'}); run again`);
  }
  // the app's page map: each link to its volume and page (the first volume that has it)
  const put = (link, key) => { if (pass.found[key] && !map[link]) map[link] = [v.n, pass.found[key]]; };
  for (let w = v.weeks[0]; w <= v.weeks[1]; w++) map[route('read', 'week', w)] = [v.n, pass.found['W' + w]];
  for (const h of HOURS) put(route('pray', 'hour', h.id), 'H' + h.id);
  for (const t of v.timeline) put(t === 'creation' || t === 'godtime' ? route('timeline', 'week') : route('timeline', t), 'T' + t);
  for (const e of v.eras) put(route('map', 'era', e), 'E' + e);
  console.log(`Volume ${v.n}: ${pass.count} pages, ${fillers.size} notes pages added → ${base}.pdf`);
}
await browser.close();
await writeFile('src/data/bookPages.json', JSON.stringify(map, null, 1) + '\n');
