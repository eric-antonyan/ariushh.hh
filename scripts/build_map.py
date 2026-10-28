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
    out = {'width': w, 'height': h, 'yerevan': project(*YEREVAN), 'countries': countries}
    json.dump(out, open('src/data/map.json', 'w'))
    print(len(countries), 'countries,', w, 'x', h)


if __name__ == '__main__':
    main(sys.argv[1])
