"""Merges Armenia and Artsakh (1994-2020 extent) into one outline: src/data/armenia-artsakh.json.

Armenia comes from Natural Earth v4.1.0 1:10m countries, the same release as src/data/artsakh-1994.json,
so their shared border matches. A tiny buffer closes slivers along the seam before the union.
Usage: python3 scripts/build_armenia_artsakh.py path/to/v4.1.0/ne_10m_admin_0_countries.geojson
Needs: pip install shapely
"""
import json
import os
import sys

from shapely.geometry import Polygon, shape
from shapely.ops import unary_union

DATA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', 'data')


def main(countries_path):
    countries = json.load(open(countries_path))['features']
    armenia = shape(next(f for f in countries if f['properties']['ADM0_A3'] == 'ARM')['geometry'])
    artsakh = unary_union([Polygon(r) for r in json.load(open(os.path.join(DATA, 'artsakh-1994.json')))['rings']])
    merged = unary_union([armenia.buffer(0.004), artsakh.buffer(0.004)]).buffer(-0.004).simplify(0.002)
    polys = list(merged.geoms) if merged.geom_type == 'MultiPolygon' else [merged]
    # Keep Armenia's exclaves out: only the main landmass matters at this scale.
    main_poly = max(polys, key=lambda p: p.area)
    ring = [[round(x, 4), round(y, 4)] for x, y in main_poly.exterior.coords]
    json.dump(
        {'source': 'Natural Earth v4.1.0 (public domain): Armenia + Nagorno-Karabakh 1994-2020 extent, merged', 'ring': ring},
        open(os.path.join(DATA, 'armenia-artsakh.json'), 'w'),
    )
    print('points', len(ring), 'parts dropped', len(polys) - 1)


if __name__ == '__main__':
    main(sys.argv[1])
