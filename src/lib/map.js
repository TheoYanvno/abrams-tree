// The map of biblical events: projecting places onto the base map, filtering and ordering events,
// and the view box maths for panning and zooming. Pure functions, tested in Node.
import BASEMAP from '../data/basemap.json' with { type: 'json' };
import { PLACES, EVENTS, ERAS } from '../data/places.js';

export { BASEMAP, PLACES, EVENTS, ERAS };

const { west, north, scale, kx } = BASEMAP.box;
export const FULL = { x: 0, y: 0, w: BASEMAP.width, h: BASEMAP.height };
export const MIN_WIDTH = 60;           // the closest zoom: about three degrees across

/** A place's position on the base map. */
export const project = ({ lon, lat }) => ({ x: (lon - west) * kx, y: (north - lat) * scale });

export const placeById = (id) => PLACES.find((p) => p.id === id);

/** Events that match the filters (an era id and a book id, either may be 'all'), in order. */
export function filterEvents({ era = 'all', book = 'all' } = {}, events = EVENTS) {
  return events.filter((e) => (era === 'all' || e.era === era) && (book === 'all' || e.book === book));
}

/** The books that have events, in the order they first appear. */
export const eventBooks = (events = EVENTS) => [...new Set(events.map((e) => e.book))];

/** Every event at a place. */
export const eventsAt = (placeId, events = EVENTS) => events.filter((e) => e.place === placeId);

/** Keep a view inside the map and no smaller than MIN_WIDTH, with the map's shape. */
export function clampView({ x, y, w }) {
  const width = Math.min(FULL.w, Math.max(MIN_WIDTH, w));
  const height = width * (FULL.h / FULL.w);
  return {
    x: Math.min(Math.max(x, 0), FULL.w - width),
    y: Math.min(Math.max(y, 0), FULL.h - height),
    w: width,
    h: height,
  };
}

/** Zoom by factor (below 1 zooms in) keeping the map point (px, py) under the same spot on screen. */
export function zoomAt(view, factor, px = view.x + view.w / 2, py = view.y + view.h / 2) {
  const w = view.w * factor;
  const k = w / view.w;
  return clampView({ x: px - (px - view.x) * k, y: py - (py - view.y) * k, w });
}

/** Move the view by (dx, dy) in map units. */
export const pan = (view, dx, dy) => clampView({ ...view, x: view.x + dx, y: view.y + dy });

/** A view of the given width centred on a point. */
export const centreOn = (point, w) => clampView({ x: point.x - w / 2, y: point.y - (w * FULL.h / FULL.w) / 2, w });

/** The step after `index` when playing events through, or null at the end. */
export const nextIndex = (index, count) => (index + 1 < count ? index + 1 : null);

/** A view that shows two points with room around them, at least `minW` wide. */
export function fitBoth(a, b, minW = 320, pad = 1.6) {
  const w = Math.max(minW, Math.abs(a.x - b.x) * pad, Math.abs(a.y - b.y) * pad * (FULL.w / FULL.h));
  return centreOn({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, w);
}

/**
 * Footprints walking from a to b along a gentle curve: [{ x, y, angle, left }], one every `spacing` map
 * units (at most `max` of them), stepping left and right of the path. The angle is the walking direction
 * in degrees (0 = east, 90 = south, as on screen).
 */
export function footsteps(a, b, spacing = 8, max = 160) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len < spacing) return [];
  const bend = Math.min(len * 0.12, 40);                        // bow the path a little, like a road
  const c = { x: (a.x + b.x) / 2 - (dy / len) * bend, y: (a.y + b.y) / 2 + (dx / len) * bend };
  const at = (t) => ({ x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * c.x + t * t * b.x, y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * c.y + t * t * b.y });
  const n = Math.min(max, Math.floor(len / spacing));
  const side = spacing * 0.32;
  const out = [];
  for (let i = 1; i < n; i++) {
    const t = i / n, p = at(t), q = at(Math.min(1, t + 0.01));
    const ang = Math.atan2(q.y - p.y, q.x - p.x);
    const left = i % 2 === 1;
    const off = left ? -side : side;
    out.push({ x: p.x - Math.sin(ang) * off, y: p.y + Math.cos(ang) * off, angle: (ang * 180) / Math.PI, left });
  }
  return out;
}
