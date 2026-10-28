"""Builds the merged fonts in public/fonts/ from the OFL sources in fonts-src/.

- "Montserrat Armenian": Montserrat (Latin) + Noto Sans Armenian (Armenian glyphs)
- "Cinematic Serif": Cormorant Garamond (Latin) + Noto Serif Armenian (Armenian glyphs)

Neither Montserrat nor Cormorant has Armenian glyphs; shipping one merged font per weight keeps
Latin, digits and Armenian in a single family.
Usage: python3 scripts/build_font.py   (needs: pip install fonttools)
"""
import os

from fontTools import subset
from fontTools.merge import Merger
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'fonts-src')
OUT = os.path.join(ROOT, 'public', 'fonts')
ARMENIAN = list(range(0x0530, 0x0590)) + list(range(0xFB13, 0xFB18))

FAMILIES = [
    ('Montserrat Armenian', 'MontserratArmenian', 'Montserrat.ttf', 'NotoSansArmenian.ttf', [500, 600, 700, 800, 900]),
    ('Cinematic Serif', 'CinematicSerif', 'CormorantGaramond.ttf', 'NotoSerifArmenian.ttf', [300, 500, 700]),
]


def build(family, file_prefix, latin_src, armenian_src, weights):
    for w in weights:
        latin = instantiateVariableFont(TTFont(os.path.join(SRC, latin_src)), {'wght': w})
        arm = instantiateVariableFont(TTFont(os.path.join(SRC, armenian_src)), {'wght': w, 'wdth': 100})
        opts = subset.Options()
        opts.layout_features = ['*']
        opts.notdef_outline = True
        sub = subset.Subsetter(opts)
        sub.populate(unicodes=ARMENIAN)
        sub.subset(arm)
        tmp = [os.path.join(OUT, f'_latin{w}.ttf'), os.path.join(OUT, f'_arm{w}.ttf')]
        latin.save(tmp[0])
        arm.save(tmp[1])
        merged = Merger().merge(tmp)
        for rec in merged['name'].names:
            if rec.nameID in (1, 4, 16):
                rec.string = family
        merged.save(os.path.join(OUT, f'{file_prefix}-{w}.ttf'))
        for t in tmp:
            os.remove(t)
        print('built', family, w)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for args in FAMILIES:
        build(*args)
