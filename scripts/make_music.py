"""Builds the documentary score public/audio/doc-music.wav from the CC BY 4.0 tracks in assets/music/
(Kevin MacLeod, incompetech.com), following the scene structure in src/data/timeline.json.

- Opening to the attack:   "Lightless Dawn"
- The attack:              "Dark Times"
- Victims to the end:      "Heartbreaking"
Each section is loudness-normalised and joined with crossfades. Run after make_voice.py.
"""
import json
import os
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC = os.path.join(ROOT, 'assets', 'music')
OUT = os.path.join(ROOT, 'public', 'audio', 'doc-music.wav')
FADE = 3.0

# (track, offset into the track in seconds, first scene of the section)
SECTIONS = [
    ('Lightless_Dawn.mp3', 2.6, 'intro'),
    ('Dark_Times.mp3', 4.1, 'attack'),
    ('Heartbreaking.mp3', 1.3, 'victims'),
]


def main():
    t = json.load(open(os.path.join(ROOT, 'src', 'data', 'timeline.json')))
    starts = {s['id']: s['from'] / t['fps'] for s in t['scenes']}
    total = t['total'] / t['fps']
    bounds = [starts[s] for _, _, s in SECTIONS] + [total]
    inputs, filters = [], []
    for i, (track, offset, _) in enumerate(SECTIONS):
        # Each section overlaps the next by FADE seconds for the crossfade.
        length = bounds[i + 1] - bounds[i] + (FADE if i < len(SECTIONS) - 1 else 0)
        inputs += ['-ss', str(offset), '-t', f'{length:.2f}', '-i', os.path.join(MUSIC, track)]
        filters.append(f'[{i}:a]aresample=44100,loudnorm=I=-20:TP=-2,afade=t=in:d=1.5[s{i}]')
    chain = '[s0]'
    for i in range(1, len(SECTIONS)):
        filters.append(f'{chain}[s{i}]acrossfade=d={FADE}:c1=tri:c2=tri[x{i}]')
        chain = f'[x{i}]'
    filters.append(f'{chain}afade=t=out:st={total - 4:.2f}:d=4,aformat=channel_layouts=stereo[out]')
    subprocess.check_call(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(filters), '-map', '[out]', OUT])
    print('wrote', OUT, f'{total:.1f}s')


if __name__ == '__main__':
    main()
