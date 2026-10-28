import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Built by scripts/build_font.py: Latin font + Armenian glyphs merged into one family per weight.
const load = (family: string, prefix: string, weights: number[]) =>
  weights.map((w) => loadFont({family, url: staticFile(`fonts/${prefix}-${w}.ttf`), weight: String(w)}));

export const fontsLoaded = Promise.all([
  ...load('Montserrat Armenian', 'MontserratArmenian', [500, 600, 700, 800, 900]),
  ...load('Cinematic Serif', 'CinematicSerif', [300, 500, 700]),
]);
