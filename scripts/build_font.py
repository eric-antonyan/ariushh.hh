"""Builds "Montserrat Armenian": static Montserrat weights merged with Armenian glyphs from Noto Sans Armenian.

Montserrat itself has no Armenian glyphs. Mixing it with a separate fallback font confuses Chrome's
text measurement in Remotion renders, so we ship one merged font per weight instead.
Usage: python3 scripts/build_font.py   (needs: pip install fonttools)
"""
import os

from fontTools import subset
from fontTools.merge import Merger
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

FONTS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'fonts')
WEIGHTS = [500, 600, 700, 800, 900]
ARMENIAN = list(range(0x0530, 0x0590)) + list(range(0xFB13, 0xFB18)) + [0x058F]


def main():
    for w in WEIGHTS:
        latin = instantiateVariableFont(TTFont(os.path.join(FONTS, 'Montserrat.ttf')), {'wght': w})
        arm = instantiateVariableFont(TTFont(os.path.join(FONTS, 'NotoSansArmenian.ttf')), {'wght': w, 'wdth': 100})
        opts = subset.Options()
        opts.layout_features = ['*']
        opts.notdef_outline = True
        sub = subset.Subsetter(opts)
        sub.populate(unicodes=ARMENIAN)
        sub.subset(arm)
        tmp = [os.path.join(FONTS, f'_latin{w}.ttf'), os.path.join(FONTS, f'_arm{w}.ttf')]
        latin.save(tmp[0])
        arm.save(tmp[1])
        merged = Merger().merge(tmp)
        for rec in merged['name'].names:
            if rec.nameID in (1, 4, 16):
                rec.string = 'Montserrat Armenian'
        merged.save(os.path.join(FONTS, f'MontserratArmenian-{w}.ttf'))
        for t in tmp:
            os.remove(t)
        print('built weight', w)


if __name__ == '__main__':
    main()
