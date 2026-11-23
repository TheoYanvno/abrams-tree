// The Doré engravings (Gustave Doré, La Grande Bible de Tours, 1866, public domain) placed through the
// AbrahamsTree Study Bible and the app: each plate sits at the verse its story belongs to (src/data/dore.json,
// made by tools/make_dore.py), and each week opens with one of them.
import PLATES from '../data/dore.json' with { type: 'json' };
import { bookById } from './books.js';

/** Weeks with no plate of their own (the Psalms, the wisdom books, the letters) open with a plate that fits their reading. */
export const LEAD = {
  4: 40, 6: 45, 13: 116, 14: 91, 20: 1, 21: 116, 22: 37, 23: 38, 25: 137, 26: 128, 27: 93, 28: 90, 29: 133, 30: 102,
  47: 233, 48: 232, 49: 234, 50: 16, 51: 225,
};

export const plate = (n) => (PLATES[n] ? { n: Number(n), ...PLATES[n] } : null);

/** Where a plate's story is: "Genesis 22:6". */
export const plateRef = (p) => `${bookById(p.book).label.replace(/ \(.*\)/, '')} ${p.chapter}:${p.verse}`;

/** The plates whose verses fall in a week's readings, in reading order. */
export function platesInWeek(week) {
  const order = new Map();
  week.days.forEach((d) => d.chapters.forEach((c) => order.set(`${c.book}|${c.chapter}`, order.size)));
  return Object.keys(PLATES).map(plate).filter((p) => order.has(`${p.book}|${p.chapter}`))
    .sort((a, b) => order.get(`${a.book}|${a.chapter}`) - order.get(`${b.book}|${b.chapter}`) || a.verse - b.verse);
}

/** The plate a week opens with. */
export const leadFor = (week) => plate(LEAD[week.week]) || platesInWeek(week)[0] || null;

/** Plates by chapter, for placing them in the Bible text: 'Genesis|22' → [plate, ...] in verse order. */
export function platesByChapter() {
  const m = {};
  for (const n of Object.keys(PLATES)) { const p = plate(n); (m[`${p.book}|${p.chapter}`] ||= []).push(p); }
  for (const k in m) m[k].sort((a, b) => a.verse - b.verse);
  return m;
}

export const PLATE_COUNT = Object.keys(PLATES).length;
