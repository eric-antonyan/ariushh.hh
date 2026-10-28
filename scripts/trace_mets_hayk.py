"""Traces Greater Armenia (Mets Hayk) and its provinces from the Wikimedia Commons location map
"Great Armenia location map.png" (Tigran Ovanyan, CC BY-SA 4.0) into src/data/mets-hayk.json.

The map is georeferenced with Lake Van, Lake Sevan and Lake Urmia: their centroids in the image are
matched to the same lakes in Natural Earth 1:10m data, assuming an equirectangular projection
(x = a*lon + b, y = c*lat + d), and the fit residuals are printed as a check.

Usage: python3 scripts/trace_mets_hayk.py great_armenia_location_map.png ne_10m_lakes.geojson
Needs: pip install opencv-python-headless numpy
"""
import json
import os
import sys

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILL = np.array([233, 254, 254])  # BGR of the light yellow land fill
LAKE = np.array([255, 236, 198])  # BGR of water


def near(img, color, tol):
    return (np.abs(img.astype(int) - color).max(axis=2) <= tol).astype(np.uint8)


def ring_centroid(ring):
    pts = np.array(ring)
    x, y = pts[:, 0], pts[:, 1]
    cross = x[:-1] * y[1:] - x[1:] * y[:-1]
    area = cross.sum() / 2
    return np.array([((x[:-1] + x[1:]) * cross).sum() / (6 * area), ((y[:-1] + y[1:]) * cross).sum() / (6 * area)]), abs(area)


def lake_centroid(features, name):
    for f in features:
        if (f['properties'].get('name') or '').lower().replace('lake ', '') == name:
            g = f['geometry']
            polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
            best = max((ring_centroid(p[0]) for p in polys), key=lambda c: c[1])
            return best[0]
    raise SystemExit(f'lake {name} not found')


def main(image_path, lakes_path):
    img = cv2.imread(image_path)
    h, w = img.shape[:2]
    land = near(img, FILL, 10)

    # The three big lakes, found from a point inside each (in a 1280 px wide image).
    water_all = near(img, LAKE, 12)
    n_w, water_labels = cv2.connectedComponents(water_all)
    seeds = {'van': (720, 485), 'sevan': (932, 275), 'urmia': (960, 600)}
    scale = w / 1280
    lake_ids = {k: water_labels[int(y * scale), int(x * scale)] for k, (x, y) in seeds.items()}
    assert all(lake_ids.values()), lake_ids
    lakes_mask = np.isin(water_labels, list(lake_ids.values())).astype(np.uint8)
    land = land | lakes_mask

    # Region = land with internal lines, rivers and lakes filled in.
    closed = cv2.morphologyEx(land, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    outer = max(contours, key=cv2.contourArea)
    region = np.zeros_like(land)
    cv2.drawContours(region, [outer], -1, 1, thickness=cv2.FILLED)

    pix = []
    for k in ('van', 'sevan', 'urmia'):
        ys, xs = np.nonzero(water_labels == lake_ids[k])
        pix.append([xs.mean(), ys.mean()])
    pix = np.array(pix)

    feats = json.load(open(lakes_path))['features']
    geo = np.array([lake_centroid(feats, 'van'), lake_centroid(feats, 'sevan'), lake_centroid(feats, 'urmia')])
    ax, bx = np.polyfit(geo[:, 0], pix[:, 0], 1)
    ay, by = np.polyfit(geo[:, 1], pix[:, 1], 1)
    resid = np.hypot(ax * geo[:, 0] + bx - pix[:, 0], ay * geo[:, 1] + by - pix[:, 1])
    print('lakes px', pix.round(1).tolist(), 'geo', geo.round(3).tolist())
    print('fit residuals (px):', resid.round(2).tolist(), ' px per degree:', round(ax, 2), round(-ay, 2))
    print('image bounds lon %.3f..%.3f lat %.3f..%.3f' % (-bx / ax, (w - bx) / ax, -by / ay, (h - by) / ay))

    def to_geo(c):
        pts = c.reshape(-1, 2).astype(float)
        return [[round((x - bx) / ax, 4), round((y - by) / ay, 4)] for x, y in pts]

    outline = cv2.approxPolyDP(outer, 0.8, True)

    # Provinces: land split by the dark grey border lines (rivers and lakes count as land here).
    borders = near(img, np.array([99, 99, 99]), 45) & region
    inside = (region & (1 - cv2.dilate(borders, np.ones((3, 3), np.uint8)))).astype(np.uint8)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(inside, connectivity=4)
    provinces = []
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] < 1500:
            continue
        comp = (labels == i).astype(np.uint8)
        comp = cv2.dilate(comp, np.ones((3, 3), np.uint8))
        cs, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        provinces.append(to_geo(cv2.approxPolyDP(max(cs, key=cv2.contourArea), 1.0, True)))
    print('outline points', len(outline), 'provinces', len(provinces))

    out = {
        'source': 'Wikimedia Commons, "Great Armenia location map.png" by Tigran Ovanyan, CC BY-SA 4.0',
        'outline': to_geo(outline),
        'provinces': provinces,
    }
    json.dump(out, open(os.path.join(ROOT, 'src', 'data', 'mets-hayk.json'), 'w'))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
