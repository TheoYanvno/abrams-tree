// The AbrahamsTree study book: a 6 x 9 printed companion to the app. This file lays out its pages in
// order and gives every page that has a QR code its link into the app, so the book (tools/build_book.mjs)
// and the app (which shows "Book page N") always agree on page numbers. Pure functions, tested in Node.
import { planById, schedule, describe } from './plans.js';
import { HOURS } from './prayers.js';
import { ERAS } from './map.js';

/** Where the app lives; every QR code in the book opens a page under it. */
export const APP_URL = 'https://theoyanvno.github.io/abrams-tree/';

export const PLAN = planById('bible-year');
export const WEEKS = 52;
export const JOURNAL_PAGES = 12;

/** The reading plan in weeks: 52 weeks of 7 days, with day 365 added to the last week. */
export function weeks(days = schedule(PLAN)) {
  const out = [];
  for (let w = 0; w < WEEKS; w++) {
    const last = w === WEEKS - 1;
    const from = w * 7;
    const to = last ? days.length : from + 7;
    out.push({ week: w + 1, days: days.slice(from, to).map((chapters, i) => ({ day: from + i + 1, chapters, text: describe(chapters).join(', ') })) });
  }
  return out;
}

/** The app link (hash route) for a page: '#read/week/12', '#pray/hour/third', '#map/era/exodus', '#timeline/genesis'. */
export const route = (...parts) => `#${parts.join('/')}`;

/** Read a hash route back into { tab, kind, id }: '#read/week/12' → { tab: 'read', kind: 'week', id: '12' }. */
export function parseRoute(hash = '') {
  const [tab = '', kind = null, id = null] = hash.replace(/^#/, '').split('/').map(decodeURIComponent);
  return { tab, kind, id };
}

/**
 * Every page of the book in order, numbered from 1 (the title page, a right-hand page). Each is
 * { n, kind, ...data, link? }; `link` is the app route its QR code opens. Spreads that must face each
 * other (a week's readings on the left, its notes on the right) start on an even page, and every part
 * opens on a right-hand page, with blank pages added where needed.
 */
export function layout() {
  const pages = [];
  const add = (kind, data = {}) => pages.push({ n: pages.length + 1, kind, ...data });
  const toOdd = () => { if (pages.length % 2 === 1) add('blank'); };    // the next page is odd (right-hand)
  const toEven = () => { if (pages.length % 2 === 0) add('blank'); };   // the next page is even (left-hand)

  add('title');
  add('copyright');
  add('how', { link: route('read') });
  add('contents');
  add('start');

  toOdd();
  add('part', { part: 1, title: 'A Year in the Word', subtitle: 'The whole Bible in 52 weeks', link: route('read') });
  for (const w of weeks()) {
    toEven();
    add('week', { ...w, link: route('read', 'week', w.week) });
    add('notes', { week: w.week });
  }

  toOdd();
  add('part', { part: 2, title: 'Pray Without Ceasing', subtitle: 'The hours of prayer through the day', link: route('pray') });
  for (const h of HOURS) add('hour', { hour: h.id, link: route('pray', 'hour', h.id) });
  add('requests', { sheet: 1 });
  add('requests', { sheet: 2 });

  toOdd();
  add('part', { part: 3, title: 'Who Lived When', subtitle: 'A timeline of the people of the Bible', link: route('timeline') });
  add('creation', { link: route('timeline', 'week') });
  add('godtime', { link: route('timeline', 'week') });
  add('chart', { chart: 'genesis', link: route('timeline', 'genesis') });
  add('chart', { chart: 'later', link: route('timeline', 'later') });

  toOdd();
  add('part', { part: 4, title: 'Where It Happened', subtitle: 'Maps of the events of the Bible', link: route('map') });
  for (const e of ERAS) add('era', { era: e.id, link: route('map', 'era', e.id) });

  toOdd();
  add('part', { part: 5, title: 'Journal', subtitle: 'For what God is teaching you', link: null });
  for (let i = 0; i < JOURNAL_PAGES; i++) add('journal');
  if (pages.length % 2 === 1) add('blank');                            // an even number of pages in all
  return pages;
}

/** The book page a route in the app belongs to ('#read/week/12' → its page number), or null. */
export function pageFor(hash, pages = layout()) {
  const want = hash.startsWith('#') ? hash : `#${hash}`;
  const exact = pages.find((p) => p.link === want);
  return exact ? exact.n : null;
}

/** The contents: each part and where it starts. */
export const contents = (pages = layout()) => pages.filter((p) => p.kind === 'part').map(({ part, title, n }) => ({ part, title, n }));
