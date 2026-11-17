"""Builds src/data/basemap.json, the map's land, lakes and rivers, from Natural Earth (public domain).

Natural Earth's 1:50m GeoJSON files (ne_50m_land, ne_50m_lakes, ne_50m_rivers_lake_centerlines from
https://github.com/nvkelso/natural-earth-vector) are cut to the lands of the Bible, from Rome to Persia and
from the Black Sea to Egypt, projected, simplified and saved as SVG path data (land is drawn with fill-rule evenodd, so the
Caspian Sea, a hole in the land, stays water). The app only needs the
result, so this runs once:  python tools/build_basemap.py <folder with the three .geojson files>
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

WEST, EAST, SOUTH, NORTH = 8.0, 62.0, 18.0, 46.0
SCALE = 20.0                                  # map units per degree of latitude
KX = math.cos(math.radians((SOUTH + NORTH) / 2)) * SCALE
WIDTH, HEIGHT = round((EAST - WEST) * KX), round((NORTH - SOUTH) * SCALE)
LAKES = {"Dead Sea", "Sea of Galilee", "Lake Van", "Lake Urmia"}
RIVERS = {"Nile", "Jordan", "Tigris", "Euphrates"}
OUT = Path(__file__).resolve().parents[1] / "src" / "data" / "basemap.json"


def project(lon: float, lat: float) -> tuple[float, float]:
    return (lon - WEST) * KX, (NORTH - lat) * SCALE


def clip(ring: list, inside, cross) -> list:
    """Sutherland-Hodgman against one edge of the box."""
    out = []
    for i, cur in enumerate(ring):
        prev = ring[i - 1]
        if inside(cur):
            if not inside(prev):
                out.append(cross(prev, cur))
            out.append(cur)
        elif inside(prev):
            out.append(cross(prev, cur))
    return out


def clip_to_box(ring: list) -> list:
    def at_x(x):
        return lambda a, b: (x, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]))

    def at_y(y):
        return lambda a, b: (a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]), y)

    pad = 0.5
    for inside, cross in ((lambda p: p[0] >= WEST - pad, at_x(WEST - pad)), (lambda p: p[0] <= EAST + pad, at_x(EAST + pad)),
                          (lambda p: p[1] >= SOUTH - pad, at_y(SOUTH - pad)), (lambda p: p[1] <= NORTH + pad, at_y(NORTH + pad))):
        ring = clip(ring, inside, cross) if ring else ring
    return ring


def simplify(points: list, tolerance: float) -> list:
    """Douglas-Peucker."""
    if len(points) < 3:
        return points
    (x1, y1), (x2, y2) = points[0], points[-1]
    dx, dy = x2 - x1, y2 - y1
    length = math.hypot(dx, dy) or 1e-9
    far, index = 0.0, 0
    for i in range(1, len(points) - 1):
        d = abs(dy * points[i][0] - dx * points[i][1] + x2 * y1 - y2 * x1) / length
        if d > far:
            far, index = d, i
    if far <= tolerance:
        return [points[0], points[-1]]
    return simplify(points[:index + 1], tolerance)[:-1] + simplify(points[index:], tolerance)


def path(points: list, closed: bool, tolerance: float = 0.6) -> str:
    if len(points) < (3 if closed else 2):
        return ""
    xy = [project(lon, lat) for lon, lat in points]
    if closed:      # a ring starts and ends at the same point, so split it at the point farthest from there
        k = max(range(len(xy)), key=lambda i: math.dist(xy[0], xy[i]))
        xy = simplify(xy[:k + 1], tolerance)[:-1] + simplify(xy[k:], tolerance)
    else:
        xy = simplify(xy, tolerance)
    if len(xy) < (3 if closed else 2):
        return ""
    d = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in xy)
    return d + ("Z" if closed else "")


def polygons(geometry: dict) -> list:
    return [geometry["coordinates"]] if geometry["type"] == "Polygon" else geometry["coordinates"]


def lines(geometry: dict) -> list:
    return [geometry["coordinates"]] if geometry["type"] == "LineString" else geometry["coordinates"]


def main(folder: Path) -> None:
    def read(name):
        return json.loads((folder / f"{name}.geojson").read_text(encoding="utf-8"))["features"]

    land = []
    for f in read("ne_50m_land"):
        for poly in polygons(f["geometry"]):           # the outline, then any holes (the Caspian Sea)
            d = "".join(path(clip_to_box([tuple(p) for p in ring]), True) for ring in poly)
            if d:
                land.append(d)
    lakes = []
    for f in read("ne_50m_lakes"):
        if f["properties"].get("name") in LAKES:
            for poly in polygons(f["geometry"]):
                lakes.append({"name": f["properties"]["name"], "d": path(poly[0], True, 0.1)})
    rivers = []
    for f in read("ne_50m_rivers_lake_centerlines"):
        name = f["properties"].get("name")
        if name in RIVERS:
            for line in lines(f["geometry"]):
                inside = [p for p in line if WEST <= p[0] <= EAST and SOUTH <= p[1] <= NORTH]
                d = path(inside, False)
                if d:
                    rivers.append({"name": name, "d": d})
    out = {"source": "Natural Earth 1:50m (public domain), naturalearthdata.com",
           "box": {"west": WEST, "east": EAST, "south": SOUTH, "north": NORTH, "scale": SCALE, "kx": round(KX, 6)},
           "width": WIDTH, "height": HEIGHT, "land": land, "lakes": [l for l in lakes if l["d"]], "rivers": rivers}
    OUT.write_text(json.dumps(out, separators=(",", ":")) + "\n", encoding="utf-8", newline="\n")
    print(f"Wrote {OUT.name}: {len(land)} land shapes, {len(out['lakes'])} lakes, {len(rivers)} river lines, "
          f"{OUT.stat().st_size // 1024} KB, {WIDTH} x {HEIGHT}")


if __name__ == "__main__":
    main(Path(sys.argv[1] if len(sys.argv) > 1 else "."))
