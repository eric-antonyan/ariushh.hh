"""Synthesises the background score and sound effects (no third-party samples) into public/audio/.

Reads src/data/timeline.json so the score follows the scene structure. Run after make_voice.py.
"""
import json
import os
import wave

import numpy as np

SR = 44100
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'audio')
rng = np.random.default_rng(27)


def write(name, sig):
    sig = np.asarray(sig, dtype=np.float64)
    if sig.ndim == 1:
        sig = np.stack([sig, sig], axis=1)
    peak = np.max(np.abs(sig)) or 1
    sig = sig / peak * 0.89
    data = (sig * 32767).astype('<i2')
    with wave.open(os.path.join(OUT, name), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def fft_filter(x, lo, hi):
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    spec[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(spec, len(x))


def reverb(x, seconds=2.4, mix=0.35):
    n = int(seconds * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 3.2)
    ir = fft_filter(ir, 80, 6000)
    size = 1 << int(np.ceil(np.log2(len(x) + n)))
    wet = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    wet *= np.max(np.abs(x)) / (np.max(np.abs(wet)) or 1)
    return x * (1 - mix) + wet * mix


def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def tone(freq, sec, harmonics=(1, 0.5, 0.25, 0.12), attack=0.01, decay=None):
    t = t_axis(sec)
    s = sum(a * np.sin(2 * np.pi * freq * (i + 1) * t) for i, a in enumerate(harmonics))
    env = np.minimum(1, t / attack)
    if decay:
        env *= np.exp(-t / decay)
    return s * env


# ---------------------------------------------------------------- score
def score(timeline):
    total = timeline['total'] / timeline['fps'] + 3
    n = int(total * SR)
    mix = np.zeros(n)
    sections = {s['id']: (s['from'] / timeline['fps'], (s['from'] + s['duration']) / timeline['fps']) for s in timeline['scenes']}

    def add(sig, at, gain=1.0):
        i = int(at * SR)
        j = min(n, i + len(sig))
        if i < n:
            mix[i:j] += sig[: j - i] * gain

    beat = 60 / 68
    bar = beat * 4
    # D minor: Dm, Bb, Gm, A  (root midi notes and chord tones)
    chords = [[50, 53, 57, 62], [46, 50, 53, 58], [43, 50, 55, 58], [45, 49, 52, 57]]

    def in_section(t, *names):
        return any(sections[s][0] <= t < sections[s][1] for s in names if s in sections)

    t = 0.0
    k = 0
    while t < total:
        chord = chords[k % 4]
        dur = bar * 2
        tense = in_section(t, 'attack')
        if not tense:
            # Warm pad
            for m in chord:
                pad = tone(hz(m), dur + 1.5, harmonics=(1, 0.35, 0.15, 0.08, 0.04), attack=1.6)
                pad *= np.minimum(1, (dur + 1.5 - t_axis(dur + 1.5)) / 1.5)
                add(pad, t, 0.05)
            # Piano arpeggio, sparser in sad sections
            sparse = in_section(t, 'victims', 'memorial')
            step = beat * (2 if sparse else 1)
            pattern = [chord[0] + 12, chord[2] + 12, chord[3] + 12, chord[1] + 24, chord[3] + 12, chord[2] + 12, chord[1] + 12, chord[2] + 12]
            for i in range(int(dur / step)):
                note = pattern[i % len(pattern)]
                add(tone(hz(note), 2.5, harmonics=(1, 0.4, 0.2, 0.1, 0.05), attack=0.004, decay=0.7), t + i * step, 0.11)
        else:
            # Tension: low pulse + tremolo strings
            for i in range(int(dur / beat)):
                add(tone(hz(38), 0.6, harmonics=(1, 0.3), attack=0.005, decay=0.18), t + i * beat, 0.35)
            tt = t_axis(dur)
            trem = (np.sin(2 * np.pi * hz(74) * tt) + 0.6 * np.sin(2 * np.pi * hz(75) * tt)) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * tt))
            add(trem * np.minimum(1, tt / 2), t, 0.025)
        # Sub drone throughout
        add(tone(hz(chord[0] - 12), dur + 1, harmonics=(1, 0.2), attack=1.0) * np.minimum(1, (dur + 1 - t_axis(dur + 1)) / 1.0), t, 0.07)
        t += dur
        k += 1

    mix = reverb(mix, 3.0, 0.4)
    fade = np.ones(n)
    fade[-SR * 4:] = np.linspace(1, 0, SR * 4)
    fade[: SR * 2] = np.linspace(0, 1, SR * 2)
    left = mix * fade
    right = np.roll(mix, int(0.012 * SR)) * fade  # tiny Haas delay for width
    write('music.wav', np.stack([left, right], axis=1))


# ---------------------------------------------------------------- sound effects
def sfx():
    t = t_axis(0.9)
    noise = rng.standard_normal(len(t))
    w = fft_filter(noise, 300, 4000) * np.sin(np.pi * t / 0.9) ** 2
    pan = np.linspace(0, 1, len(t))
    write('whoosh.wav', np.stack([w * (1 - pan), w * pan], axis=1))

    t = t_axis(2.5)
    f = 60 * np.exp(-t * 1.2) + 28
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    boom += fft_filter(rng.standard_normal(len(t)), 20, 400) * np.exp(-t * 8) * 0.6
    write('impact.wav', reverb(boom, 1.5, 0.25))

    t = t_axis(0.08)
    write('tick.wav', fft_filter(rng.standard_normal(len(t)), 2000, 9000) * np.exp(-t * 120) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90) * 0.5)

    t = t_axis(0.35)
    thump = np.sin(2 * np.pi * 52 * t) * np.exp(-t * 18)
    hb = np.concatenate([thump, np.zeros(int(0.05 * SR)), thump * 0.7, np.zeros(int(0.5 * SR))])
    write('heartbeat.wav', hb)

    t = t_axis(3.0)
    write('flatline.wav', np.sin(2 * np.pi * 980 * t) * np.minimum(1, t / 0.02) * np.minimum(1, (3 - t) / 0.6) * 0.5)

    t = t_axis(0.12)
    f = np.linspace(260, 950, len(t))
    write('pop.wav', np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.12))

    t = t_axis(0.5)
    knock = fft_filter(rng.standard_normal(len(t)), 500, 2500) * np.exp(-t * 40) + np.sin(2 * np.pi * 170 * t) * np.exp(-t * 25)
    write('gavel.wav', reverb(knock, 0.8, 0.2))

    t = t_axis(6)
    bell = sum(a * np.sin(2 * np.pi * 196 * r * t) * np.exp(-t * d) for r, a, d in [(1, 1, 0.6), (2.0, 0.6, 0.9), (2.76, 0.4, 1.2), (5.4, 0.25, 2), (8.93, 0.12, 3)])
    write('bell.wav', reverb(bell, 2.5, 0.3))

    t = t_axis(1.2)
    write('static.wav', fft_filter(rng.standard_normal(len(t)), 500, 12000) * np.minimum(1, t / 0.03) * np.minimum(1, (1.2 - t) / 0.3))

    t = t_axis(0.8)
    f = np.linspace(80, 1200, len(t))
    write('tvon.wav', np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5) * 0.6 + np.sin(2 * np.pi * 60 * t) * 0.2 * np.exp(-t * 2))

    t = t_axis(5)
    f = 650 + 200 * np.sign(np.sin(2 * np.pi * 0.8 * t))
    siren = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / 1.5) * np.minimum(1, (5 - t) / 1.5)
    write('siren.wav', reverb(fft_filter(siren, 300, 3000), 2.0, 0.6))

    flaps = np.zeros(int(1.6 * SR))
    for i in range(10):
        s = int(i * 0.14 * SR + rng.integers(0, 800))
        burst = fft_filter(rng.standard_normal(int(0.07 * SR)), 300, 3000) * np.hanning(int(0.07 * SR))
        flaps[s : s + len(burst)] += burst * (1 - i / 12)
    write('wings.wav', flaps)

    t = t_axis(2.2)
    f = np.linspace(200, 900, len(t))
    rise = (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + fft_filter(rng.standard_normal(len(t)), 1000, 8000) * 0.5) * (t / 2.2) ** 2
    write('riser.wav', rise)

    t = t_axis(0.25)
    write('shutter.wav', fft_filter(rng.standard_normal(len(t)), 1500, 8000) * (np.exp(-t * 60) + 0.6 * np.exp(-np.maximum(0, t - 0.09) * 60) * (t > 0.09)))


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    timeline = json.load(open(os.path.join(ROOT, 'src', 'data', 'timeline.json')))
    sfx()
    score(timeline)
    print('written:', sorted(os.listdir(OUT)))
