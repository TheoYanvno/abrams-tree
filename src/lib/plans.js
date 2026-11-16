// Reading plans: a plan spreads a set of chapters as evenly as possible over a number of days.
import { BOOKS, bookById } from './books.js';

const chaptersOf = (books) => books.flatMap((b) => Array.from({ length: b.chapters }, (_, i) => ({ book: b.id, chapter: i + 1 })));
const pick = (...ids) => ids.map(bookById);

export const PLANS = [
  { id: 'bible-year', name: 'The whole Bible in a year', days: 365, chapters: () => chaptersOf(BOOKS) },
  { id: 'nt-90', name: 'The New Testament in 90 days', days: 90, chapters: () => chaptersOf(BOOKS.filter((b) => b.testament === 'new')) },
  { id: 'gospels-40', name: 'The four Gospels in 40 days', days: 40, chapters: () => chaptersOf(pick('Matthew', 'Mark', 'Luke', 'John')) },
  { id: 'psalms-30', name: 'Psalms in a month', days: 30, chapters: () => chaptersOf(pick('Psalms')) },
  { id: 'wisdom-31', name: 'Proverbs, a chapter a day', days: 31, chapters: () => chaptersOf(pick('Proverbs')) },
];

export const planById = (id) => PLANS.find((p) => p.id === id);

/**
 * Splits the plan's chapters into its days. Extra chapters go to the earliest days, so no day
 * gets more than one chapter above another, and the order never changes.
 */
export function schedule(plan) {
  const all = plan.chapters();
  const base = Math.floor(all.length / plan.days);
  const extra = all.length % plan.days;
  const days = [];
  let at = 0;
  for (let d = 0; d < plan.days; d++) {
    const n = base + (d < extra ? 1 : 0);
    days.push(all.slice(at, at + n));
    at += n;
  }
  return days;
}

/** Whole days from start to date (both 'YYYY-MM-DD'), so day 0 is the start date. */
export function dayNumber(start, date) {
  const toDays = (s) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 86400000;
  return Math.round(toDays(date) - toDays(start));
}

/** Groups a day's chapters into readable ranges: "Genesis 1–3", "Psalms 119". */
export function describe(day) {
  const parts = [];
  for (const { book, chapter } of day) {
    const last = parts[parts.length - 1];
    if (last && last.book === book && last.to === chapter - 1) last.to = chapter;
    else parts.push({ book, from: chapter, to: chapter });
  }
  return parts.map((p) => `${bookById(p.book).label} ${p.from === p.to ? p.from : `${p.from}–${p.to}`}`);
}

/** Today's date as 'YYYY-MM-DD' in the reader's own time zone. */
export function today(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
