"""Builds src/data/map.json (SVG paths of the region around Armenia) from Natural Earth 1:50m data.

Usage: python3 scripts/build_map.py path/to/ne_50m_admin_0_countries.geojson
"""
import json
import math
import sys

LON_MIN, LON_MAX, LAT_MIN, LAT_MAX = 15, 70, 25, 58
LAT0 = math.radians(41)
SCALE = 40  # SVG units per degree of longitude
YEREVAN = (44.5126, 40.1772)

# Approximate outline of Greater Armenia (Mets Hayk, the 15 provinces of the Ashkharhatsuyts), traced by
# hand from historical maps: the upper Euphrates in the west, the Pontic range and Kura river in the north,
# the Caspian lowlands in the east, Lake Urmia and the Tigris in the south. Schematic, not survey-accurate.
METS_HAYK = [
    (38.85, 38.35), (38.95, 38.9), (39.2, 39.55), (39.05, 40.1), (39.5, 40.55), (40.6, 40.75),
    (41.8, 41.05), (42.9, 41.45), (44.0, 41.6), (45.1, 41.45), (46.1, 41.2), (47.1, 40.85),
    (47.9, 40.3), (48.6, 39.85), (48.9, 39.25), (48.3, 38.85), (47.4, 38.6), (46.4, 38.35),
    (45.8, 37.85), (45.2, 37.15), (44.2, 37.0), (43.2, 37.1), (42.3, 37.35), (41.3, 37.65),
    (40.3, 37.9), (39.4, 38.05),
]


def chaikin(points, rounds=3):
    """Smooths a closed polygon by corner cutting."""
    for _ in range(rounds):
        out = []
        for i, p in enumerate(points):
            q = points[(i + 1) % len(points)]
            out += [(0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]), (0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1])]
        points = out
    return points


def project(lon, lat):
    return (round((lon - LON_MIN) * SCALE * math.cos(LAT0), 1), round((LAT_MAX - lat) * SCALE, 1))


def ring_in_bounds(ring):
    return any(LON_MIN - 10 < x < LON_MAX + 10 and LAT_MIN - 10 < y < LAT_MAX + 10 for x, y in ring)


def path_for(geom):
    polys = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
    parts = []
    for poly in polys:
        for ring in poly:
            if not ring_in_bounds(ring):
                continue
            # Clamp to a padded box so huge rings (e.g. Russia) don't draw across the map.
            pts = [project(min(max(x, LON_MIN - 5), LON_MAX + 5), min(max(y, LAT_MIN - 5), LAT_MAX + 5)) for x, y in ring]
            parts.append('M' + 'L'.join(f'{x},{y}' for x, y in pts) + 'Z')
    return ''.join(parts)


def main(src):
    data = json.load(open(src))
    countries = []
    for f in data['features']:
        p = f['properties']
        minx, miny, maxx, maxy = f.get('bbox') or (None,) * 4
        d = path_for(f['geometry'])
        if not d:
            continue
        countries.append({'iso': p['ISO_A3'] if p['ISO_A3'] != '-99' else p['ADM0_A3'], 'name': p['NAME'], 'd': d})
    w, h = project(LON_MAX, LAT_MIN)
    mets_hayk = 'M' + 'L'.join('%s,%s' % project(x, y) for x, y in chaikin(METS_HAYK)) + 'Z'
    out = {'width': w, 'height': h, 'yerevan': project(*YEREVAN), 'metsHayk': mets_hayk, 'metsHaykLabel': project(41.6, 38.9), 'countries': countries}
    json.dump(out, open('src/data/map.json', 'w'))
    print(len(countries), 'countries,', w, 'x', h)


if __name__ == '__main__':
    main(sys.argv[1])
