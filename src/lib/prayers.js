// Prayers and prayer times. The hours follow the Orthodox daily cycle of prayer; the texts are the
// traditional prayers of the Church and verses from the World English Bible, all in the public domain.
// The prayer list and the chosen reminder times are plain objects, so the app keeps them in
// localStorage and the tests stay simple.

const TRISAGION = { title: 'The Trisagion', text: 'Holy God, Holy Mighty, Holy Immortal, have mercy on us. (Three times)' };
const GLORY = { title: 'Glory', text: 'Glory to the Father, and to the Son, and to the Holy Spirit, now and ever and unto ages of ages. Amen.' };
const OUR_FATHER = {
  title: "The Lord's Prayer (Matthew 6:9–13)",
  text: 'Our Father in heaven, may your name be kept holy. Let your Kingdom come. Let your will be done on earth as it is in heaven. Give us today our daily bread. Forgive us our debts, as we also forgive our debtors. Bring us not into temptation, but deliver us from the evil one.',
};
const HEAVENLY_KING = {
  title: 'O Heavenly King',
  text: 'O Heavenly King, Comforter, the Spirit of Truth, who art everywhere present and fillest all things, Treasury of blessings and Giver of life: come and abide in us, cleanse us from every stain, and save our souls, O Good One.',
};
const JESUS_PRAYER = { title: 'The Jesus Prayer', text: 'Lord Jesus Christ, Son of God, have mercy on me, a sinner.' };

export const HOURS = [
  { id: 'morning', name: 'Morning prayers', time: '06:00', verse: { ref: 'Psalm 5:3', text: 'Yahweh, in the morning you will hear my voice. In the morning I will lay my requests before you, and will watch expectantly.' },
    prayers: [HEAVENLY_KING, TRISAGION, GLORY, OUR_FATHER] },
  { id: 'third', name: 'The Third Hour', time: '09:00', verse: { ref: 'Psalm 51:10', text: 'Create in me a clean heart, O God. Renew a right spirit within me.' },
    prayers: [TRISAGION, OUR_FATHER, JESUS_PRAYER] },
  { id: 'sixth', name: 'The Sixth Hour', time: '12:00', verse: { ref: 'Psalm 55:17', text: 'Evening, morning, and at noon, I will cry out in distress. He will hear my voice.' },
    prayers: [TRISAGION, OUR_FATHER, JESUS_PRAYER] },
  { id: 'ninth', name: 'The Ninth Hour', time: '15:00', verse: { ref: 'Psalm 86:6', text: 'Hear, Yahweh, my prayer. Listen to the voice of my petitions.' },
    prayers: [TRISAGION, OUR_FATHER, JESUS_PRAYER] },
  { id: 'evening', name: 'Evening prayers', time: '18:00', verse: { ref: 'Psalm 141:2', text: 'Let my prayer be set before you like incense; the lifting up of my hands like the evening sacrifice.' },
    prayers: [TRISAGION, GLORY, OUR_FATHER, { title: 'The Song of Simeon (Luke 2:29–32)', text: 'Now you are releasing your servant, Master, according to your word, in peace; for my eyes have seen your salvation, which you have prepared before the face of all peoples; a light for revelation to the nations, and the glory of your people Israel.' }] },
  { id: 'night', name: 'Prayers before sleep', time: '21:00', verse: { ref: 'Psalm 4:8', text: 'In peace I will both lay myself down and sleep, for you, Yahweh alone, make me live in safety.' },
    prayers: [TRISAGION, OUR_FATHER, JESUS_PRAYER] },
];

export const hourById = (id) => HOURS.find((h) => h.id === id);

/** The hour to pray now: the latest one at or before the time ('HH:MM'), or the last one before morning. */
export function currentHour(time) {
  const due = HOURS.filter((h) => h.time <= time);
  return due.length ? due[due.length - 1] : HOURS[HOURS.length - 1];
}

/** The next enabled reminder after a moment, as { hour, at: Date }, or null when none are on. */
export function nextReminder(enabled, now = new Date()) {
  const on = HOURS.filter((h) => enabled.includes(h.id));
  if (!on.length) return null;
  for (let day = 0; day < 2; day++) {
    for (const hour of on) {
      const [hh, mm] = hour.time.split(':').map(Number);
      const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day, hh, mm);
      if (at > now) return { hour, at };
    }
  }
  return null;
}

// --- the prayer list: { items: [{ id, text, added, answered? }] } -------------------------------

export const emptyList = () => ({ items: [], next: 1 });

export function addRequest(list, text, on) {
  const t = text.trim();
  if (!t) return list;
  return { items: [{ id: list.next, text: t, added: on }, ...list.items], next: list.next + 1 };
}

export const markAnswered = (list, id, on) =>
  ({ ...list, items: list.items.map((i) => (i.id === id ? { ...i, answered: on } : i)) });

export const reopen = (list, id) =>
  ({ ...list, items: list.items.map((i) => { if (i.id !== id) return i; const { answered, ...rest } = i; return rest; }) });

export const removeRequest = (list, id) => ({ ...list, items: list.items.filter((i) => i.id !== id) });

export const open = (list) => list.items.filter((i) => !i.answered);
export const answered = (list) => list.items.filter((i) => i.answered);

// --- reminders that work even when the page is closed: a calendar file -------------------------

const ics = (s) => s.replace(/[\;,]/g, (c) => `\\${c}`);

/**
 * An .ics calendar file with a daily event, and an alert, for each chosen prayer time, starting on
 * `date` ('YYYY-MM-DD'). Imported into a phone or computer calendar, the reminders work even when
 * AbramsTree isn't open. `stamp` is when the file was made, as 'YYYYMMDDTHHMMSSZ'.
 */
export function prayerCalendar(enabled, date, stamp) {
  const day = date.replaceAll('-', '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AbramsTree//Prayer times//EN', 'CALSCALE:GREGORIAN'];
  for (const hour of HOURS.filter((h) => enabled.includes(h.id))) {
    const t = hour.time.replace(':', '');
    lines.push('BEGIN:VEVENT', `UID:abramstree-${hour.id}-${day}@theoyanvno.github.io`, `DTSTAMP:${stamp}`,
      `DTSTART:${day}T${t}00`, 'DURATION:PT15M', 'RRULE:FREQ=DAILY', `SUMMARY:${ics(hour.name)}`,
      `DESCRIPTION:${ics(`${hour.verse.text} (${hour.verse.ref})`)}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${ics(hour.name)}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}
