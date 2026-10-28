import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import {timeline} from './timeline';

const voice = timeline.scenes.flatMap((s) => s.lines.map((l) => ({src: l.audio, from: s.from + l.start, duration: l.duration})));

// Music ducks under the narration.
const musicVolume = (f: number) => {
  const near = voice.reduce((m, v) => {
    const d = f < v.from ? v.from - f : f > v.from + v.duration ? f - v.from - v.duration : 0;
    return Math.min(m, d);
  }, Infinity);
  const duck = interpolate(near, [0, 12], [1, 0], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(f, [timeline.total - 90, timeline.total], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (0.5 - 0.3 * duck) * fadeOut;
};

export const Soundtrack: React.FC = () => (
  <>
    <Audio src={staticFile('audio/music.wav')} volume={musicVolume} />
    {voice.map((v) => (
      <Sequence key={v.src} from={v.from} durationInFrames={v.duration} layout="none">
        <Audio src={staticFile(v.src)} volume={1} />
      </Sequence>
    ))}
  </>
);
