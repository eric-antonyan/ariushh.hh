# Հոկտեմբերի 27, 1999 — motion video

An Armenian-language motion-graphics documentary of the 1999 Armenian parliament shooting, built with [Remotion](https://www.remotion.dev).

Two 1080×1920 (9:16) reels at 60 fps for Instagram Reels / TikTok / Shorts share the same narration, captions and soundtrack:

| Composition | Style |
|---|---|
| `Oct27Reel` | Bold cartoon motion graphics |
| `Oct27Cinematic` | Cinematic documentary: film grain, light leaks, gold serif titles, chapters (`src/cinematic/`) |

Animation timings are written in 30 fps base frames (`src/time.ts`), so the frame rate can be changed in `src/Root.tsx`.

Contents: animated map (Natural Earth data), cartoon-style illustrations, karaoke captions, Armenian narration,
a synthesised score and sound effects, and the merged **Montserrat Armenian** font.

```bash
npm install
npm start              # Remotion Studio: preview and edit
npm run render              # out/oct27-1999-reel-60fps.mp4
npm run render:cinematic    # out/oct27-1999-cinematic-60fps.mp4
```

## Editing

- **Narration / captions:** `src/data/narration.json` (`text` is shown, optional `tts` is what the voice says). Then run `npm run assets` (needs `espeak-ng`, `ffmpeg`, Python with `numpy`).
- **Human voice:** see `public/audio/voice-human/README.md`.
- **Photos:** see `public/photos/README.md`.
- **Scenes:** `src/scenes/*.tsx`; shared effects in `src/fx.tsx`, drawings in `src/illustrations.tsx`.
- **Fonts:** `python3 scripts/build_font.py` rebuilds `public/fonts/` from the OFL sources in `fonts-src/`: Montserrat Armenian (Montserrat + Noto Sans Armenian) and Cinematic Serif (Cormorant Garamond + Noto Serif Armenian).
- **Map:** `python3 scripts/build_map.py ne_50m_admin_0_countries.geojson` regenerates `src/data/map.json`.
