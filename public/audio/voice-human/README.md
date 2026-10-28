# Human voice-over

Record each narration line from `src/data/narration.json` and save it here as `<scene>_<n>.wav` (or `.mp3` / `.m4a`),
e.g. `intro_1.wav`, `intro_2.wav`, `map_1.wav` … Then run `npm run assets` — the timeline, captions and music are
re-timed to your recordings automatically, and lines without a recording keep the synthetic eSpeak voice.
