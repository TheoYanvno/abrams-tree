// The timeline of people in the Bible: when each one lived, who was alive at the same time, and how
// long their lives were in God's time, where "one day is with the Lord as a thousand years" (2 Peter 3:8).
// Pure functions, tested in Node.
import { GENESIS_LINE, GENESIS_OTHERS, FLOOD, LATER, GOD_TIME, CREATION_WEEK } from '../data/people.js';

export { GOD_TIME };

/** Years of ours in one of God's days. */
export const GOD_DAY = 1000;

const MINUTES_IN_DAY = 24 * 60;

/** From Adam to Joseph, in years from creation, added up from the ages Genesis gives. */
export const genesisPeople = (line = GENESIS_LINE, others = GENESIS_OTHERS) => {
  const people = [];
  const byId = {};
  for (const [id, name, father, fatherAge, lived, book, chapter, note] of line) {
    const born = father ? byId[father].born + fatherAge : 0;
    byId[id] = { id, name, born, died: born + lived, lived, book, chapter, note, about: false };
    people.push(byId[id]);
  }
  for (const [id, name, relative, after, lived, book, chapter, note] of others) {
    const born = byId[relative].born + after;
    people.push({ id, name, born, died: born + lived, lived, book, chapter, note, about: false });
  }
  return people.sort((a, b) => a.born - b.born);
};

/** The year of the Flood, counted from creation. */
export const floodYear = (people = genesisPeople()) => people.find((p) => p.id === FLOOD.after).born + FLOOD.years;

/** From Abraham to the apostles, in years BC (negative) and AD. */
export const laterPeople = (rows = LATER) =>
  rows.map(([id, name, born, died, about, book, chapter, note]) => ({
    id, name, born, died, lived: lifespan(born, died), about, book, chapter, note,
  }));

/**
 * The whole story, Adam to St. Paul and St. John, on one BC/AD scale. The Genesis years are moved so that
 * Abraham's birth falls where the later chart puts it (c. 2166 BC), which makes every Genesis date
 * approximate; the people in both charts appear once.
 */
export function wholeStory(genesis = genesisPeople(), later = laterPeople()) {
  const shift = later.find((p) => p.id === 'abraham').born - genesis.find((p) => p.id === 'abraham').born;
  const early = genesis.map((p) => ({ ...p, born: p.born + shift, died: p.died + shift, about: true }));
  const seen = new Set(early.map((p) => p.id));
  return [...early, ...later.filter((p) => !seen.has(p.id))].sort((a, b) => a.born - b.born);
}

/** The year of the Flood on the BC/AD scale of wholeStory(). */
export const wholeStoryFlood = (genesis = genesisPeople(), later = laterPeople()) =>
  floodYear(genesis) + later.find((p) => p.id === 'abraham').born - genesis.find((p) => p.id === 'abraham').born;

/** Years between two years, where negatives are BC; there was no year 0, so 1 BC to AD 1 is one year. */
export const lifespan = (born, died) => died - born - (born < 0 && died > 0 ? 1 : 0);

/** "1446 BC", "AD 30", or with about, "c. 1446 BC". */
export const formatBcAd = (year, about = false) =>
  `${about ? 'c. ' : ''}${year < 0 ? `${(-year).toLocaleString('en-US')} BC` : `AD ${year}`}`;

/** "Year 1,656" counted from creation. */
export const formatFromCreation = (year) => `Year ${year.toLocaleString('en-US')}`;

/** How long a number of our years lasts in God's time, as days, hours and minutes of His days. */
export function godTime(years) {
  const total = Math.round((years / GOD_DAY) * MINUTES_IN_DAY);
  return { days: Math.floor(total / MINUTES_IN_DAY), hours: Math.floor((total % MINUTES_IN_DAY) / 60), minutes: total % 60 };
}

/** "23 hours 15 minutes", "2 days 6 hours", "48 minutes". */
export function formatGodTime(years) {
  const { days, hours, minutes } = godTime(years);
  const part = (n, word) => (n ? `${n} ${word}${n === 1 ? '' : 's'}` : '');
  return [part(days, 'day'), part(hours, 'hour'), days ? '' : part(minutes, 'minute')].filter(Boolean).join(' ') || 'less than a minute';
}

/** Which of God's days a year from creation falls in: years 0 to 999 are day 1. */
export const godDayOf = (year) => Math.floor(year / GOD_DAY) + 1;

/** God's days across a span of years from creation, as { day, from, to } clipped to the span. */
export function godDays(from, to) {
  const days = [];
  for (let d = godDayOf(from); (d - 1) * GOD_DAY < to; d += 1) {
    days.push({ day: d, from: Math.max(from, (d - 1) * GOD_DAY), to: Math.min(to, d * GOD_DAY) });
  }
  return days;
}

/** Everyone else whose life overlapped this person's, with the years they shared. */
export const contemporaries = (person, people) =>
  people
    .filter((p) => p.id !== person.id && p.born <= person.died && p.died >= person.born)
    .map((p) => ({ ...p, shared: Math.min(p.died, person.died) - Math.max(p.born, person.born) }));

/** The span a chart covers, padded and rounded out to whole steps. */
export function span(people, step = 100) {
  const from = Math.min(...people.map((p) => p.born));
  const to = Math.max(...people.map((p) => p.died));
  return { from: Math.floor(from / step) * step, to: Math.ceil(to / step) * step };
}

/** Where a year sits across a span, as a percentage. */
export const percent = (year, { from, to }) => ((year - from) / (to - from)) * 100;

/** Gridline years every `step` inside a span. */
export const ticks = ({ from, to }, step) => {
  const out = [];
  for (let y = Math.ceil(from / step) * step; y <= to; y += step) out.push(y);
  return out;
};

/** The week of creation in our years: each day God made the world is one of His days, a thousand years. */
export const creationWeek = (week = CREATION_WEEK) =>
  week.map(([day, made, ref]) => ({ day, made, ref, rest: day === 7, from: (day - 1) * GOD_DAY, to: day * GOD_DAY }));

/** "1st", "2nd", "3rd", "4th". */
export const ordinal = (n) => `${n}${['th', 'st', 'nd', 'rd'][(n % 100 >= 11 && n % 100 <= 13) || n % 10 > 3 ? 0 : n % 10]}`;
