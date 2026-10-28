"""Generates the narration audio and src/data/timeline.json from src/data/narration.json.

For each line it uses a human recording from public/audio/voice-human/<scene>_<n>.(wav|mp3|m4a)
if one exists, otherwise synthesises the line with eSpeak NG (Armenian voice).
"""
import json
import os
import subprocess

FPS = 30
LEAD_IN = {'intro': 70, 'attack': 40}  # frames before the first line
GAP = 12  # frames between lines
TAIL = {'attack': 75, 'memorial': 90}  # frames after the last line
DEFAULT_LEAD_IN, DEFAULT_TAIL = 30, 35
CREDITS_FRAMES = 180

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, 'public')
OUT_DIR = os.path.join(PUB, 'audio', 'voice')
HUMAN_DIR = os.path.join(PUB, 'audio', 'voice-human')


def duration(path):
    out = subprocess.check_output(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]
    )
    return float(out)


def human_recording(name):
    for ext in ('wav', 'mp3', 'm4a'):
        p = os.path.join(HUMAN_DIR, f'{name}.{ext}')
        if os.path.exists(p):
            return p
    return None


def synthesise(text, dest):
    raw = dest + '.raw.wav'
    subprocess.check_call(['espeak-ng', '-v', 'hy+m3', '-s', '160', '-p', '42', '-g', '4', '-w', raw, text])
    # Warm the robotic tone a little: band-limit, light room echo, loudness normalise.
    subprocess.check_call([
        'ffmpeg', '-v', 'error', '-y', '-i', raw, '-af',
        'highpass=f=90,lowpass=f=7000,aecho=0.8:0.6:40:0.15,loudnorm=I=-16:TP=-1.5,aresample=44100',
        '-ac', '2', dest,
    ])
    os.remove(raw)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    narration = json.load(open(os.path.join(ROOT, 'src', 'data', 'narration.json')))
    scenes = []
    cursor = 0
    for scene in narration['scenes']:
        sid = scene['id']
        t = LEAD_IN.get(sid, DEFAULT_LEAD_IN)
        lines = []
        for i, line in enumerate(scene['lines']):
            name = f'{sid}_{i + 1}'
            src = human_recording(name)
            if src:
                rel = os.path.relpath(src, PUB)
            else:
                dest = os.path.join(OUT_DIR, f'{name}.wav')
                synthesise(line.get('tts', line['text']), dest)
                rel = os.path.relpath(dest, PUB)
            frames = int(round(duration(os.path.join(PUB, rel)) * FPS)) + 2
            lines.append({'text': line['text'], 'audio': rel, 'start': t, 'duration': frames, 'human': bool(src)})
            t += frames + GAP
        t += TAIL.get(sid, DEFAULT_TAIL) - GAP
        scenes.append({'id': sid, 'from': cursor, 'duration': t, 'lines': lines})
        cursor += t
    scenes.append({'id': 'credits', 'from': cursor, 'duration': CREDITS_FRAMES, 'lines': []})
    cursor += CREDITS_FRAMES
    json.dump({'fps': FPS, 'total': cursor, 'scenes': scenes}, open(os.path.join(ROOT, 'src', 'data', 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
    print('total', cursor, 'frames =', round(cursor / FPS, 1), 's')
    for s in scenes:
        print(f"  {s['id']:10s} {s['duration'] / FPS:5.1f}s")


if __name__ == '__main__':
    main()
