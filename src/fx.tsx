import React from 'react';
import {AbsoluteFill, Audio, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, font, tricolor} from './theme';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Plays a sound effect from public/audio/<name>.wav, `at` frames into the current Sequence.
export const Sfx: React.FC<{name: string; at: number; volume?: number}> = ({name, at, volume = 0.5}) => (
  <Sequence from={Math.round(at)} layout="none">
    <Audio src={staticFile(`audio/${name}.wav`)} volume={volume} />
  </Sequence>
);

// Spring that starts `delay` frames into the scene.
export const useSpring = (delay: number, config: Partial<{damping: number; stiffness: number; mass: number}> = {}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping: 12, stiffness: 120, ...config}});
};

// Cartoon "pop": overshooting scale with a little squash and stretch.
export const Pop: React.FC<{delay: number; children: React.ReactNode; style?: React.CSSProperties; origin?: string}> = ({
  delay,
  children,
  style,
  origin = 'center',
}) => {
  const frame = useCurrentFrame();
  const p = useSpring(delay, {damping: 9, stiffness: 140});
  const wobble = frame > delay ? Math.sin((frame - delay) / 2.2) * Math.exp(-(frame - delay) / 10) * 0.12 : 0;
  return (
    <div
      style={{
        transform: `scale(${p * (1 + wobble)}, ${p * (1 - wobble)})`,
        transformOrigin: origin,
        opacity: Math.min(1, p * 2),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Slides up and fades in.
export const Rise: React.FC<{delay: number; children: React.ReactNode; style?: React.CSSProperties; distance?: number}> = ({
  delay,
  children,
  style,
  distance = 60,
}) => {
  const p = useSpring(delay, {damping: 200});
  return <div style={{opacity: p, transform: `translateY(${(1 - p) * distance}px)`, ...style}}>{children}</div>;
};

// Reveals text letter by letter.
export const Typewriter: React.FC<{text: string; delay: number; speed?: number; style?: React.CSSProperties}> = ({
  text,
  delay,
  speed = 1.5,
  style,
}) => {
  const frame = useCurrentFrame();
  const chars = Array.from(text);
  const n = Math.max(0, Math.floor((frame - delay) / speed));
  return (
    <span style={style}>
      {chars.slice(0, n).join('')}
      <span style={{opacity: n < chars.length && frame >= delay && Math.floor(frame / 8) % 2 ? 1 : 0}}>▍</span>
    </span>
  );
};

// Camera shake offsets for a burst starting at `at`.
export const useShake = (at: number, strength = 30, length = 25) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame - at, [0, length], [1, 0], clamp) * (frame >= at ? 1 : 0);
  return {
    x: (random(`sx${frame}`) - 0.5) * 2 * strength * k,
    y: (random(`sy${frame}`) - 0.5) * 2 * strength * k,
    r: (random(`sr${frame}`) - 0.5) * 2 * k,
  };
};

export const Flash: React.FC<{at: number; color?: string; length?: number}> = ({at, color = 'white', length = 14}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - at, [0, 2, length], [0, 1, 0], clamp);
  return <AbsoluteFill style={{background: color, opacity: o, pointerEvents: 'none'}} />;
};

export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.08}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 12} />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.65) 100%)', pointerEvents: 'none'}} />
);

// Slowly drifting dust particles.
export const Dust: React.FC<{count?: number; color?: string}> = ({count = 40, color = colors.apricot}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: count}).map((_, i) => {
        const x = (random(`dx${i}`) * width + frame * (random(`dvx${i}`) - 0.5) * 0.8 + width) % width;
        const y = (random(`dy${i}`) * height - frame * (0.3 + random(`dvy${i}`) * 0.8) + height * 10) % height;
        const s = 2 + random(`ds${i}`) * 5;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: s,
              background: color,
              opacity: 0.15 + 0.35 * Math.abs(Math.sin(frame / 30 + i)),
              filter: 'blur(1px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Tricolour bars sweeping across the frame, used between scenes. Covers fully at frame `length / 2`.
export const StripeWipe: React.FC<{length?: number}> = ({length = 26}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const diag = width + height;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      {tricolor.map((c, i) => {
        const p = interpolate(frame, [i * 2, length - 4 + i * 2], [-1.2, 1.2], clamp);
        return (
          <div
            key={c}
            style={{
              position: 'absolute',
              left: width / 2 - diag,
              top: height / 2 - diag / 2,
              width: diag * 2,
              height: diag,
              background: c,
              transform: `rotate(-20deg) translateX(${p * diag}px)`,
              opacity: 0.97,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Label: React.FC<{children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({
  children,
  color = colors.apricot,
  size = 30,
  style,
}) => (
  <div style={{fontFamily: font, fontWeight: 800, fontSize: size, letterSpacing: size * 0.12, textTransform: 'uppercase', color, ...style}}>
    {children}
  </div>
);

export const Title: React.FC<{children: React.ReactNode; size?: number; style?: React.CSSProperties}> = ({children, size = 80, style}) => (
  <div style={{fontFamily: font, fontWeight: 800, fontSize: size, color: colors.text, lineHeight: 1.15, ...style}}>{children}</div>
);

// Hanging-from-a-pin pendulum swing that settles.
export const useSwing = (delay: number, amplitude = 18) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - delay);
  return amplitude * Math.exp(-t / 18) * Math.cos(t / 4.5);
};
