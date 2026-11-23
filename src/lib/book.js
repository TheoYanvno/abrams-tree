// The AbrahamsTree Study Bible: the whole Bible read in a year, printed in four 6 x 9 volumes of 13 weeks
// (tools/build_book.mjs). This file holds the weeks of the reading plan and the links its QR codes open,
// and finds the volume and page that go with a link, from the page map the build writes, so the book
// and the app always agree. Pure functions, tested in Node.
import { planById, schedule, describe } from './plans.js';
import PAGES from '../data/bookPages.json' with { type: 'json' };

/** Where the app lives; every QR code in the book opens a page under it. */
export const APP_URL = 'https://theoyanvno.github.io/abrams-tree/';

export const PLAN = planById('bible-year');
export const WEEKS = 52;
export const WEEKS_PER_VOLUME = 13;

/** Which volume a week is printed in. */
export const volumeOf = (week) => Math.ceil(week / WEEKS_PER_VOLUME);

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

/** The volume and page that go with an app link ('#read/week/12' → { volume: 1, page: 312 }), or null. */
export function pageFor(hash, pages = PAGES) {
  const want = hash.startsWith('#') ? hash : `#${hash}`;
  const hit = pages[want];
  return hit ? { volume: hit[0], page: hit[1] } : null;
}
