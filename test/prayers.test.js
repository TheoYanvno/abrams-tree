import test from 'node:test';
import assert from 'node:assert';
import { HOURS, hourById, currentHour, nextReminder, emptyList, addRequest, markAnswered, reopen, removeRequest,
  open, answered, prayerCalendar } from '../src/lib/prayers.js';

test('six hours of prayer in order through the day, each with prayers and a verse', () => {
  assert.deepStrictEqual(HOURS.map((h) => h.time), [...HOURS.map((h) => h.time)].sort());
  for (const h of HOURS) assert.ok(h.prayers.length >= 3 && h.verse.text && h.verse.ref, h.id);
  assert.ok(hourById('morning').prayers.some((p) => p.title.startsWith("The Lord's Prayer")));
});

test('the hour to pray now, and the next reminder', () => {
  assert.strictEqual(currentHour('12:30').id, 'sixth');
  assert.strictEqual(currentHour('03:00').id, 'night');
  const now = new Date(2026, 10, 17, 14, 0);
  assert.strictEqual(nextReminder(['morning', 'ninth'], now).hour.id, 'ninth');
  const late = nextReminder(['morning'], new Date(2026, 10, 17, 22, 0));
  assert.strictEqual(late.at.getDate(), 18);
  assert.strictEqual(late.at.getHours(), 6);
  assert.strictEqual(nextReminder([], now), null);
});

test('the prayer list: add, answer, reopen and remove', () => {
  let list = addRequest(emptyList(), '  For Grandma\'s surgery ', '2026-11-17');
  list = addRequest(list, '   ', '2026-11-17');
  list = addRequest(list, 'For the new job', '2026-11-17');
  assert.deepStrictEqual(list.items.map((i) => i.text), ['For the new job', "For Grandma's surgery"]);
  list = markAnswered(list, 1, '2026-11-20');
  assert.deepStrictEqual(answered(list).map((i) => i.answered), ['2026-11-20']);
  assert.strictEqual(open(list).length, 1);
  list = reopen(list, 1);
  assert.strictEqual(open(list).length, 2);
  assert.strictEqual(removeRequest(list, 2).items.length, 1);
});

test('a calendar file with a daily reminder for each chosen hour', () => {
  const cal = prayerCalendar(['morning', 'evening'], '2026-11-17', '20261117T190000Z');
  assert.ok(cal.startsWith('BEGIN:VCALENDAR\r\n') && cal.endsWith('END:VCALENDAR\r\n'));
  assert.strictEqual(cal.match(/BEGIN:VEVENT/g).length, 2);
  assert.ok(cal.includes('DTSTART:20261117T060000') && cal.includes('DTSTART:20261117T180000'));
  assert.ok(cal.includes('RRULE:FREQ=DAILY') && cal.includes('BEGIN:VALARM'));
  assert.ok(cal.includes('like incense\\; the lifting'), 'semicolons are escaped');
});
