import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Built by scripts/build_font.py: Montserrat + Armenian glyphs merged into one family per weight.
export const fontsLoaded = Promise.all(
  [500, 600, 700, 800, 900].map((w) =>
    loadFont({family: 'Montserrat Armenian', url: staticFile(`fonts/MontserratArmenian-${w}.ttf`), weight: String(w)}),
  ),
);
