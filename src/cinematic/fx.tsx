import React from 'react';
import {AbsoluteFill, Easing, interpolate, random} from 'remotion';
import {clamp, useSpring} from '../fx';
import {useFrame} from '../time';
import {cine, sans, serif} from './theme';

const ease = Easing.bezier(0.25, 0.1, 0.25, 1);

// Dip from and to black with a soft blur at the edges of a scene.
export const SceneShell: React.FC<{duration: number; children: React.ReactNode; push?: number}> = ({duration, children, push = 0.08}) => {
  const frame = useFrame();
  const fade = interpolate(frame, [0, 18, duration - 18, duration], [0, 1, 1, 0], clamp);
  const blur = interpolate(frame, [0, 18, duration - 14, duration], [12, 0, 0, 10], clamp);
  // Slow cinematic camera push with a slight drift.
  const t = interpolate(frame, [0, duration], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill style={{background: cine.black}}>
      <AbsoluteFill style={{opacity: fade, filter: `blur(${blur}px)`, transform: `scale(${1 + push * t}) translateY(${-14 * t}px)`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// Letterbox, light leaks, grain, vignette and a faint exposure flicker.
export const FilmLook: React.FC = () => {
  const frame = useFrame();
  const flicker = 0.03 * Math.sin(frame / 3.1) * Math.sin(frame / 7.7);
  const lx = 50 + 40 * Math.sin(frame / 160);
  const ly = 30 + 25 * Math.cos(frame / 210);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${lx}% ${ly}%, rgba(255,170,90,0.16), transparent 45%)`, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: `radial-gradient(circle at ${100 - lx}% ${100 - ly}%, rgba(255,120,60,0.08), transparent 40%)`, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.8) 100%)'}} />
      <AbsoluteFill style={{background: 'black', opacity: Math.max(0, flicker)}} />
      <AbsoluteFill style={{opacity: 0.13, mixBlendMode: 'overlay'}}>
        <svg width="100%" height="100%">
          <filter id="cgrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves={2} seed={Math.floor(frame) % 24} />
          </filter>
          <rect width="100%" height="100%" filter="url(#cgrain)" />
        </svg>
      </AbsoluteFill>
      {/* Occasional film scratch */}
      {random(`scr${Math.floor(frame / 4)}`) > 0.86 && (
        <div style={{position: 'absolute', top: 0, bottom: 0, left: `${random(`sx${Math.floor(frame / 4)}`) * 100}%`, width: 1.5, background: 'rgba(255,240,210,0.25)'}} />
      )}
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 90, background: 'linear-gradient(black 60%, transparent)'}} />
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, background: 'linear-gradient(transparent, black 40%)'}} />
    </AbsoluteFill>
  );
};

// Soft out-of-focus gold particles.
export const Bokeh: React.FC<{count?: number; color?: string}> = ({count = 18, color = cine.gold}) => {
  const frame = useFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: count}).map((_, i) => {
        const size = 30 + random(`bs${i}`) * 110;
        const x = (random(`bx${i}`) * 1200 + frame * (random(`bvx${i}`) - 0.5) * 0.6) % 1200 - 60;
        const y = (random(`by${i}`) * 2100 - frame * (0.15 + random(`bvy${i}`) * 0.35) + 4200) % 2100 - 90;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: size,
              background: `radial-gradient(circle, ${color}55 0%, ${color}00 70%)`,
              opacity: 0.35 + 0.35 * Math.sin(frame / 40 + i),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Text that resolves from blurred and widely tracked to sharp.
export const Resolve: React.FC<{delay: number; children: React.ReactNode; style?: React.CSSProperties; tracking?: number}> = ({
  delay,
  children,
  style,
  tracking = 0,
}) => {
  const frame = useFrame();
  const p = interpolate(frame - delay, [0, 40], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{opacity: p, filter: `blur(${(1 - p) * 14}px)`, letterSpacing: `${tracking + (1 - p) * 0.25}em`, ...style}}>{children}</div>
  );
};

export const FadeUp: React.FC<{delay: number; children: React.ReactNode; style?: React.CSSProperties}> = ({delay, children, style}) => {
  const p = useSpring(delay, {damping: 200, stiffness: 60});
  return <div style={{opacity: p, transform: `translateY(${(1 - p) * 40}px)`, ...style}}>{children}</div>;
};

export const GoldLine: React.FC<{delay: number; width: number; style?: React.CSSProperties}> = ({delay, width, style}) => {
  const frame = useFrame();
  const p = interpolate(frame - delay, [0, 35], [0, 1], {...clamp, easing: ease});
  return (
    <div
      style={{
        height: 2,
        width: width * p,
        background: `linear-gradient(90deg, transparent, ${cine.gold}, transparent)`,
        margin: '0 auto',
        ...style,
      }}
    />
  );
};

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

// "Chapter" heading: roman numeral, gold rule and serif title.
export const Chapter: React.FC<{n: number; title: string; top?: number}> = ({n, title, top = 170}) => (
  <div style={{position: 'absolute', top, left: 0, right: 0, textAlign: 'center'}}>
    <Resolve delay={6} tracking={0.4}>
      <div style={{fontFamily: sans, fontWeight: 600, fontSize: 24, color: cine.gold, textTransform: 'uppercase'}}>Գլուխ {ROMAN[n - 1]}</div>
    </Resolve>
    <GoldLine delay={14} width={220} style={{margin: '18px auto'}} />
    <Resolve delay={18}>
      <div style={{fontFamily: serif, fontWeight: 500, fontSize: 60, color: cine.cream}}>{title}</div>
    </Resolve>
  </div>
);

export const SmallCaps: React.FC<{children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({
  children,
  color = cine.gold,
  size = 24,
  style,
}) => (
  <div style={{fontFamily: sans, fontWeight: 600, fontSize: size, color, letterSpacing: '0.3em', textTransform: 'uppercase', ...style}}>{children}</div>
);

// Ararat (Masis and Sis) silhouette used on the horizon.
export const Ararat: React.FC<{width: number; color?: string; snow?: string; opacity?: number}> = ({width, color = '#1a1c24', snow = '#cfd3dc', opacity = 1}) => (
  <svg width={width} height={width * 0.32} viewBox="0 0 1000 320" style={{opacity}}>
    <path d="M0,320 L180,250 L330,150 L430,60 L470,40 L520,70 L600,140 L650,170 L720,130 L770,110 L820,140 L900,210 L1000,260 L1000,320Z" fill={color} />
    <path d="M430,60 L470,40 L520,70 L500,85 L480,72 L462,92 L445,78Z" fill={snow} opacity={0.85} />
    <path d="M745,122 L770,110 L795,124 L780,130 L768,122 L757,132Z" fill={snow} opacity={0.7} />
  </svg>
);
