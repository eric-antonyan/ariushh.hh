import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile} from 'remotion';
import {serif, sans, cine} from '../cinematic/theme';
import {clamp} from '../fx';
import {useFrame} from '../time';
import {PHOTOS, PhotoId} from './photos';

const ease = Easing.bezier(0.33, 0, 0.2, 1);

export type Shot = {
  photo: PhotoId;
  from: number; // base frames, scene-relative
  to: number;
  zoom?: [number, number];
  pan?: [[number, number], [number, number]]; // focal point in %, start -> end
  tone?: 'color' | 'bw' | 'sepia';
  date?: string; // archive date stamp, e.g. "28.10.1999"
  label?: [string, string]; // lower third: title, subtitle
  frame?: 'land' | 'port' | 'full';
};

const FADE = 14;

const filterFor = (tone: Shot['tone']) =>
  tone === 'bw' ? 'grayscale(1) contrast(1.1) brightness(0.95)' : tone === 'sepia' ? 'sepia(0.55) contrast(1.05) brightness(0.95)' : 'saturate(0.85) contrast(1.05)';

// One photograph with a slow Ken Burns move, a blurred fill behind it, credit and optional date stamp.
const ShotView: React.FC<{shot: Shot}> = ({shot}) => {
  const frame = useFrame();
  const p = PHOTOS[shot.photo];
  const t = interpolate(frame, [shot.from, shot.to], [0, 1], {...clamp, easing: ease});
  const [z0, z1] = shot.zoom ?? [1.05, 1.18];
  const [[x0, y0], [x1, y1]] = shot.pan ?? [
    [50, 50],
    [50, 45],
  ];
  const scale = z0 + (z1 - z0) * t;
  const ox = x0 + (x1 - x0) * t;
  const oy = y0 + (y1 - y0) * t;
  const opacity = interpolate(frame, [shot.from - FADE, shot.from, shot.to, shot.to + FADE], [0, 1, 1, 0], clamp);
  const kind = shot.frame ?? (p.aspect >= 1 ? 'land' : 'port');
  const box = kind === 'full' ? {w: 1080, h: 1920, top: 0} : kind === 'land' ? {w: 1080, h: 1080 / Math.max(p.aspect, 1.15), top: 330} : {w: 860, h: 860 / p.aspect, top: 260};
  const img = (
    <Img
      src={staticFile(p.file)}
      style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${ox}% ${oy}%`, transform: `scale(${scale})`, transformOrigin: `${ox}% ${oy}%`, filter: filterFor(shot.tone)}}
    />
  );
  return (
    <AbsoluteFill style={{opacity}}>
      {kind !== 'full' && (
        <AbsoluteFill style={{filter: 'blur(38px) brightness(0.3)', transform: 'scale(1.25)'}}>
          <Img src={staticFile(p.file)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: filterFor(shot.tone)}} />
        </AbsoluteFill>
      )}
      <div
        style={{
          position: 'absolute',
          left: (1080 - box.w) / 2,
          top: box.top,
          width: box.w,
          height: Math.min(box.h, 1300),
          overflow: 'hidden',
          boxShadow: kind === 'full' ? undefined : '0 30px 80px rgba(0,0,0,0.7)',
          outline: kind === 'full' ? undefined : `1px solid ${cine.goldSoft}55`,
        }}
      >
        {img}
        {kind === 'full' && <AbsoluteFill style={{background: 'linear-gradient(rgba(0,0,0,0.45), transparent 30%, transparent 55%, rgba(0,0,0,0.85))'}} />}
        {shot.date && (
          <div style={{position: 'absolute', right: 24, bottom: 20, fontFamily: 'monospace', fontWeight: 700, fontSize: 30, color: '#ffb347', textShadow: '0 0 6px #ff7b00'}}>{shot.date}</div>
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          left: (1080 - box.w) / 2 + 16,
          top: box.top + Math.min(box.h, 1300) + 10,
          fontFamily: sans,
          fontWeight: 500,
          fontSize: 17,
          color: 'rgba(255,255,255,0.55)',
          letterSpacing: '0.04em',
        }}
      >
        {p.credit}
      </div>
      {shot.label && <LowerThird title={shot.label[0]} subtitle={shot.label[1]} at={shot.from + 10} top={box.top + Math.min(box.h, 1300) + 60} />}
    </AbsoluteFill>
  );
};

export const Shots: React.FC<{shots: Shot[]}> = ({shots}) => {
  const frame = useFrame();
  return (
    <AbsoluteFill>
      {shots
        .filter((s) => frame >= s.from - FADE && frame <= s.to + FADE)
        .map((s, i) => (
          <ShotView key={`${s.photo}-${s.from}-${i}`} shot={s} />
        ))}
    </AbsoluteFill>
  );
};

export const LowerThird: React.FC<{title: string; subtitle: string; at: number; top: number}> = ({title, subtitle, at, top}) => {
  const frame = useFrame();
  const p = interpolate(frame - at, [0, 22], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{position: 'absolute', left: 70, top, opacity: p, transform: `translateX(${(1 - p) * -40}px)`}}>
      <div style={{display: 'flex', alignItems: 'stretch', gap: 22}}>
        <div style={{width: 5, background: cine.gold, transform: `scaleY(${p})`, transformOrigin: 'top'}} />
        <div>
          <div style={{fontFamily: serif, fontWeight: 500, fontSize: 60, color: cine.cream, lineHeight: 1.05}}>{title}</div>
          <div style={{fontFamily: sans, fontWeight: 600, fontSize: 24, color: cine.gold, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 10}}>{subtitle}</div>
        </div>
      </div>
    </div>
  );
};

// Small chapter tag in the top-left corner, in the style of a TV documentary.
export const ChapterTag: React.FC<{n: string; title: string}> = ({n, title}) => {
  const frame = useFrame();
  const p = interpolate(frame, [8, 30], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{position: 'absolute', top: 120, left: 70, opacity: p, display: 'flex', alignItems: 'center', gap: 16}}>
      <div style={{fontFamily: serif, fontWeight: 500, fontSize: 34, color: cine.gold}}>{n}</div>
      <div style={{width: 60 * p, height: 1.5, background: cine.gold}} />
      <div style={{fontFamily: sans, fontWeight: 600, fontSize: 22, color: cine.cream, letterSpacing: '0.25em', textTransform: 'uppercase'}}>{title}</div>
    </div>
  );
};
