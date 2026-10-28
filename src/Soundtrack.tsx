import React from 'react';
import {Audio, interpolate, Sequence, staticFile, useVideoConfig} from 'remotion';
import {BASE_FPS, useToFrames} from './time';
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

// `music` is a file in public/; `base` is the music volume when nobody is speaking.
export const Soundtrack: React.FC<{music?: string; base?: number}> = ({music = 'audio/music.wav', base = 0.5}) => {
  const {fps} = useVideoConfig();
  const toFrames = useToFrames();
  return (
    <>
      <Audio src={staticFile(music)} volume={(f) => (musicVolume((f * BASE_FPS) / fps) * base) / 0.5} />
      {voice.map((v) => (
        <Sequence key={v.src} from={toFrames(v.from)} durationInFrames={toFrames(v.duration)} layout="none">
          <Audio src={staticFile(v.src)} volume={1} />
        </Sequence>
      ))}
    </>
  );
};
