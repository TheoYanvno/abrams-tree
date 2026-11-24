// The Church calendar for the Calendar tab: the date of Pascha in any year, the movable feasts that
// hang from it, and the next twelve months of feasts in date order. Fixed feasts use the dates in
// src/data/orthodoxy.js (the Revised Julian calendar most Orthodox churches keep). Pure functions,
// tested in Node.
import { ORTHODOXY } from '../data/orthodoxy.js';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** 'YYYY-MM-DD' for a UTC date. */
export const iso = (d) => d.toISOString().slice(0, 10);
const utc = (y, m, d) => new Date(Date.UTC(y, m - 1, d));
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);

/** Orthodox Pascha in a year (1900 to 2099), as a UTC date on the civil (Gregorian) calendar. */
export function pascha(year) {
  const a = year % 4, b = year % 7, c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  return addDays(utc(year, month, day), 13);          // Julian date + 13 days in this century
}

const MOVABLE = {
  'The Sunday before Pascha': -7,
  'Forty days after Pascha': 39,
  'Fifty days after Pascha': 49,
};

/** The date of one feast in a year, from its date text ('August 6', 'Forty days after Pascha', or 'Pascha'). */
export function feastDate(when, year) {
  if (when === 'Pascha') return pascha(year);
  if (when in MOVABLE) return addDays(pascha(year), MOVABLE[when]);
  const [month, day] = when.split(' ');
  return utc(year, MONTHS.indexOf(month) + 1, Number(day));
}

/** Every feast as { date, name, text, great }, for the year after `today` ('YYYY-MM-DD'), in date order. */
export function upcoming(today, data = ORTHODOXY) {
  const start = utc(+today.slice(0, 4), +today.slice(5, 7), +today.slice(8, 10));
  const end = addDays(start, 365);
  const all = [
    ['Pascha', data.pascha[0], data.pascha[1], true],
    ...data.feasts.map(([when, name, text]) => [when, name, text, true]),
    ...data.otherFeasts.map(([when, name, text]) => [when, name, text, false]),
  ];
  const out = [];
  for (const year of [start.getUTCFullYear(), start.getUTCFullYear() + 1]) {
    for (const [when, name, text, great] of all) {
      const date = feastDate(when, year);
      if (date >= start && date < end) out.push({ date: iso(date), name, text, great });
    }
  }
  return out.sort((x, y) => x.date.localeCompare(y.date) || Number(y.great) - Number(x.great));
}

/** A date for people: '2027-05-02' → 'Sunday, May 2, 2027'. */
export function longDate(isoDate) {
  const d = utc(+isoDate.slice(0, 4), +isoDate.slice(5, 7), +isoDate.slice(8, 10));
  const wd = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getUTCDay()];
  return `${wd}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/** Whole days from one date to another (both 'YYYY-MM-DD'). */
export const daysUntil = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 86400000);
