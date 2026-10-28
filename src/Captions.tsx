import React from 'react';
import {BASE_FPS, useFrame} from './time';
import {spring} from 'remotion';
import {pick, useLayout} from './layout';
import {colors, font} from './theme';
import {timeline} from './timeline';

const lines = timeline.scenes.flatMap((s) => s.lines.map((l) => ({...l, start: s.from + l.start})));

// Split a line into caption chunks no longer than `maxChars`.
const chunk = (words: string[], maxChars: number) => {
  const out: number[][] = [];
  let cur: number[] = [];
  let len = 0;
  words.forEach((w, i) => {
    if (cur.length && len + w.length > maxChars) {
      out.push(cur);
      cur = [];
      len = 0;
    }
    cur.push(i);
    len += w.length + 1;
  });
  if (cur.length) out.push(cur);
  return out;
};

// Word-by-word karaoke captions. Word timing is estimated from word length.
// `cinematic` is a quieter style: medium weight, soft shadow, gold active word, no pop.
export const Captions: React.FC<{variant?: 'cartoon' | 'cinematic'}> = ({variant = 'cartoon'}) => {
  const cinematic = variant === 'cinematic';
  const frame = useFrame();
  const {vertical, captionTop} = useLayout();
  const line = lines.find((l) => frame >= l.start && frame < l.start + l.duration + 6);
  if (!line) return null;

  const words = line.text.split(' ');
  const weights = words.map((w) => w.length + 2);
  const total = weights.reduce((a, b) => a + b, 0);
  const progress = Math.min(0.999, (frame - line.start) / line.duration) * total;
  let acc = 0;
  let current = words.length - 1;
  for (let i = 0; i < words.length; i++) {
    acc += weights[i];
    if (progress < acc) {
      current = i;
      break;
    }
  }
  const chunks = chunk(words, pick(vertical, 40, 52));
  const ci = chunks.findIndex((c) => c.includes(current));
  const chunkStartWord = chunks[ci][0];
  const chunkStartFrame = line.start + (weights.slice(0, chunkStartWord).reduce((a, b) => a + b, 0) / total) * line.duration;
  const pop = cinematic ? 1 : spring({frame: frame - chunkStartFrame, fps: BASE_FPS, config: {damping: 12, stiffness: 200}});
  const fadeIn = cinematic ? Math.min(1, (frame - chunkStartFrame) / 8) : 1;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: cinematic ? 1500 : captionTop,
        height: cinematic ? 300 : pick(vertical, 400, 170),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 70px',
      }}
    >
      <div
        style={{
          fontFamily: font,
          fontWeight: cinematic ? 600 : 800,
          fontSize: cinematic ? 50 : pick(vertical, 62, 50),
          lineHeight: 1.3,
          textAlign: 'center',
          color: 'white',
          transform: `scale(${0.85 + 0.15 * pop})`,
          opacity: fadeIn,
          maxWidth: pick(vertical, 960, 1600),
        }}
      >
        {chunks[ci].map((wi) => {
          const active = wi === current;
          return (
            <span
              key={wi}
              style={{
                display: 'inline-block',
                margin: '0 0.26em',
                color: active ? (cinematic ? '#e6c784' : colors.yellow) : cinematic ? '#f3ede0' : 'white',
                transform: active && !cinematic ? 'scale(1.08) translateY(-3px)' : undefined,
                WebkitTextStroke: cinematic ? undefined : '8px black',
                paintOrder: 'stroke fill',
                textShadow: cinematic ? '0 2px 18px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.9)' : '0 6px 12px rgba(0,0,0,0.6)',
              }}
            >
              {words[wi]}
            </span>
          );
        })}
      </div>
    </div>
  );
};
