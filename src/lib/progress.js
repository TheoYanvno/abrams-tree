// Reading progress: which plan days are done, the daily streak, and notes per day.
// Pure functions over a plain object, so the app stores it in localStorage and tests stay simple.
//   progress = { done: { [dayIndex]: 'YYYY-MM-DD' (date it was marked) }, notes: { [dayIndex]: string } }

export const empty = () => ({ done: {}, notes: {} });

export function markDone(progress, day, on) {
  return { ...progress, done: { ...progress.done, [day]: on } };
}

export function unmark(progress, day) {
  const done = { ...progress.done };
  delete done[day];
  return { ...progress, done };
}

export function setNote(progress, day, text) {
  const notes = { ...progress.notes };
  if (text.trim()) notes[day] = text;
  else delete notes[day];
  return { ...progress, notes };
}

const shift = (date, days) => {
  const d = new Date(Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10) + days));
  return d.toISOString().slice(0, 10);
};

/**
 * Days in a row, ending today, on which at least one reading was marked done.
 * If nothing is marked yet today, the streak still counts up to yesterday, so it
 * doesn't reset in the morning before the reader has had a chance to read.
 */
export function streak(progress, today) {
  const dates = new Set(Object.values(progress.done));
  let day = dates.has(today) ? today : shift(today, -1);
  let count = 0;
  while (dates.has(day)) { count++; day = shift(day, -1); }
  return count;
}

/** How far through the plan: { done, total, percent }. */
export function completion(progress, total) {
  const done = Object.keys(progress.done).filter((k) => +k < total).length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

/** Days before today that were never marked done, so the reader can catch up. */
export function missed(progress, upTo) {
  const out = [];
  for (let d = 0; d < upTo; d++) if (!(d in progress.done)) out.push(d);
  return out;
}
