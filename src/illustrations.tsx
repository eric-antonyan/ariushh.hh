import React from 'react';
import {getStaticFiles, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp} from './fx';
import {colors, font, tricolor} from './theme';

// Flat cartoon of the National Assembly building with a waving flag. `lit` 0..1 lights the windows.
export const Parliament: React.FC<{width: number; lit?: number; flicker?: boolean}> = ({width, lit = 0, flicker = false}) => {
  const frame = useCurrentFrame();
  const wave = (i: number) => Math.sin(frame / 6 + i) * 4;
  return (
    <svg width={width} height={width * 0.62} viewBox="0 0 500 310">
      {/* Flag */}
      <line x1={250} y1={20} x2={250} y2={95} stroke="#c9ccd4" strokeWidth={3} />
      {tricolor.map((c, i) => (
        <path
          key={c}
          d={`M250,${22 + i * 10} Q275,${22 + i * 10 + wave(0)} 300,${22 + i * 10} L300,${32 + i * 10} Q275,${32 + i * 10 + wave(0)} 250,${32 + i * 10}Z`}
          fill={c}
        />
      ))}
      {/* Central block */}
      <rect x={170} y={95} width={160} height={70} fill="#d9d2c3" />
      <rect x={160} y={88} width={180} height={12} fill="#efe9dc" />
      {/* Main body */}
      <rect x={40} y={160} width={420} height={120} fill="#e6dfcf" />
      <rect x={30} y={150} width={440} height={14} fill="#f4efe4" />
      {/* Columns and windows */}
      {Array.from({length: 11}).map((_, i) => {
        const on = lit > 0 && (flicker ? Math.sin(frame / 9 + i * 1.7) > -0.6 : true);
        return (
          <g key={i}>
            <rect x={58 + i * 37} y={172} width={12} height={100} fill="#c9c0ad" />
            <rect x={73 + i * 37} y={185} width={16} height={34} rx={2} fill={on ? colors.yellow : '#3b4152'} opacity={on ? 0.35 + 0.65 * lit : 1} />
            <rect x={73 + i * 37} y={230} width={16} height={34} rx={2} fill={on ? colors.yellow : '#3b4152'} opacity={on ? 0.35 + 0.65 * lit : 1} />
          </g>
        );
      })}
      {Array.from({length: 4}).map((_, i) => (
        <rect key={i} x={190 + i * 38} y={108} width={20} height={44} rx={2} fill={lit > 0 ? colors.yellow : '#3b4152'} opacity={lit > 0 ? 0.35 + 0.65 * lit : 1} />
      ))}
      {/* Steps */}
      <rect x={20} y={280} width={460} height={10} fill="#bdb5a3" />
      <rect x={0} y={290} width={500} height={14} fill="#a39b89" />
    </svg>
  );
};

// A person in a coat seen from the side, with a walk cycle. `walking` animates the legs.
export const Silhouette: React.FC<{height: number; walking?: boolean; phase?: number; color?: string}> = ({
  height,
  walking = false,
  phase = 0,
  color = '#05060a',
}) => {
  const frame = useCurrentFrame();
  const s = walking ? Math.sin(frame / 3.2 + phase) : 0;
  const bob = walking ? Math.abs(Math.cos(frame / 3.2 + phase)) * 4 : 0;
  return (
    <svg width={height * 0.45} height={height} viewBox="0 0 45 100" style={{overflow: 'visible'}}>
      <g transform={`translate(0 ${-bob})`}>
        <circle cx={22} cy={12} r={9} fill={color} />
        <path d="M10,24 Q22,18 34,24 L37,66 L7,66 Z" fill={color} />
        <rect x={30} y={30} width={7} height={26} rx={3} fill={color} transform={`rotate(${s * 12} 33 30)`} />
      </g>
      <rect x={13} y={64} width={8} height={34} rx={3} fill={color} transform={`rotate(${s * 22} 17 64)`} />
      <rect x={24} y={64} width={8} height={34} rx={3} fill={color} transform={`rotate(${-s * 22} 28 64)`} />
    </svg>
  );
};

// Simple round-headed deputy for the parliament hall.
export const Deputy: React.FC<{x: number; y: number; scale?: number; color?: string; seed?: number}> = ({
  x,
  y,
  scale = 1,
  color = '#8a93a8',
  seed = 0,
}) => {
  const frame = useCurrentFrame();
  const nod = Math.sin(frame / (14 + (seed % 5)) + seed) * 1.5;
  return (
    <g transform={`translate(${x} ${y + nod}) scale(${scale})`}>
      <circle cx={0} cy={-18} r={7} fill={color} />
      <path d="M-11,0 Q-11,-11 0,-11 Q11,-11 11,0 Z" fill={color} />
    </g>
  );
};

export const Candle: React.FC<{size: number; lit: number}> = ({size, lit}) => {
  const frame = useCurrentFrame();
  const flick = 1 + Math.sin(frame / 2.7) * 0.06 + Math.sin(frame / 6.1) * 0.05;
  const sway = Math.sin(frame / 9) * 2;
  return (
    <svg width={size * 0.5} height={size} viewBox="0 0 50 100" style={{overflow: 'visible'}}>
      <defs>
        <radialGradient id="cglow">
          <stop offset="0%" stopColor={colors.apricot} stopOpacity={0.55} />
          <stop offset="100%" stopColor={colors.apricot} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={25} cy={26} r={34 * lit} fill="url(#cglow)" />
      <path
        d={`M25,${38 - 26 * flick * lit} Q${33 + sway},30 25,42 Q${17 + sway},30 25,${38 - 26 * flick * lit}Z`}
        fill="#ffcf6b"
        opacity={lit}
      />
      <ellipse cx={25} cy={36} rx={3 * lit} ry={5 * lit} fill="#fff6d8" opacity={lit} />
      <line x1={25} y1={38} x2={25} y2={45} stroke="#2a2a2a" strokeWidth={2} />
      <rect x={15} y={45} width={20} height={52} rx={3} fill="#efe7d4" />
      <path d="M15,48 Q20,54 22,48" fill="#e2d7bf" />
    </svg>
  );
};

export const Dove: React.FC<{size: number; phase?: number}> = ({size, phase = 0}) => {
  const frame = useCurrentFrame();
  const flap = Math.sin(frame / 2 + phase);
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 60 42" style={{overflow: 'visible'}}>
      <path d={`M30,22 Q14,${10 - flap * 14} 2,${14 - flap * 10} Q16,24 30,26Z`} fill="#f4f4f4" />
      <ellipse cx={34} cy={25} rx={14} ry={7} fill="white" />
      <circle cx={47} cy={21} r={5} fill="white" />
      <path d="M51,21 L56,22 L51,23Z" fill={colors.apricot} />
      <path d={`M34,22 Q46,${8 - flap * 14} 58,${12 - flap * 10} Q46,22 36,26Z`} fill="#e9e9e9" />
    </svg>
  );
};

export const PoliceCar: React.FC<{width: number; phase?: number}> = ({width, phase = 0}) => {
  const frame = useCurrentFrame();
  const on = Math.floor(frame / 5 + phase) % 2 === 0;
  const bounce = Math.abs(Math.sin(frame / 5 + phase)) * 2;
  return (
    <svg width={width} height={width * 0.55} viewBox="0 0 120 66" style={{overflow: 'visible'}}>
      <circle cx={52} cy={8} r={22} fill={on ? colors.red : colors.blue} opacity={0.25} />
      <g transform={`translate(0 ${-bounce})`}>
        <rect x={45} y={6} width={7} height={6} rx={2} fill={on ? '#ff3b3b' : '#5a1010'} />
        <rect x={53} y={6} width={7} height={6} rx={2} fill={on ? '#14205a' : '#4d7dff'} />
        <path d="M28,14 L88,14 L100,30 L114,32 L114,48 L6,48 L6,32 L18,30Z" fill="#e8ecf3" />
        <path d="M32,18 L56,18 L56,30 L24,30Z M60,18 L84,18 L94,30 L60,30Z" fill="#7aa2d6" />
        <rect x={6} y={36} width={108} height={5} fill={colors.blue} />
      </g>
      <circle cx={30} cy={50} r={10} fill="#141414" />
      <circle cx={90} cy={50} r={10} fill="#141414" />
      <circle cx={30} cy={50} r={4} fill="#888" />
      <circle cx={90} cy={50} r={4} fill="#888" />
    </svg>
  );
};

export const BallotBox: React.FC<{size: number; drops: number[]}> = ({size, drops}) => {
  const frame = useCurrentFrame();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
      {drops.map((at, i) => {
        const y = interpolate(frame - at, [0, 12], [-60, 34], clamp);
        const visible = frame >= at && frame - at < 14;
        return (
          <g key={i} transform={`translate(${44 + (i % 2) * 4} ${y}) rotate(${(i - 1) * 8})`} opacity={visible ? 1 : 0}>
            <rect width={14} height={20} fill="white" stroke="#bbb" />
            <path d="M3,8 L6,12 L11,4" stroke={colors.red} strokeWidth={2} fill="none" />
          </g>
        );
      })}
      <rect x={15} y={38} width={70} height={55} rx={4} fill={colors.blue} />
      <rect x={15} y={38} width={70} height={10} fill="#2149ad" />
      <rect x={38} y={41} width={24} height={4} rx={2} fill="#0b1430" />
      <text x={50} y={78} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={13} fill="white">
        1999
      </text>
    </svg>
  );
};

export const Gavel: React.FC<{size: number; hits: number[]}> = ({size, hits}) => {
  const frame = useCurrentFrame();
  // Swing up between hits, slam down on each hit frame.
  const angle = hits.reduce((acc, h) => {
    const d = frame - h;
    if (d >= -8 && d < 0) return interpolate(d, [-8, -1], [0, -45]);
    if (d >= 0 && d < 3) return interpolate(d, [0, 2], [-45, 0], clamp);
    return acc;
  }, 0);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
      <rect x={10} y={80} width={50} height={10} rx={3} fill="#6b4226" />
      <g transform={`rotate(${angle} 85 60)`}>
        <rect x={30} y={56} width={58} height={7} rx={3} fill="#8a5a36" />
        <rect x={18} y={44} width={22} height={34} rx={5} fill="#6b4226" />
      </g>
    </svg>
  );
};

export const Clock: React.FC<{size: number; minutes: number; accent?: string}> = ({size, minutes, accent = colors.red}) => {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.floor(minutes % 60);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.06}}>
      <svg width={size} height={size} viewBox="-100 -100 200 200">
        <circle r={94} fill="#f5f2ea" stroke="#20242f" strokeWidth={8} />
        {Array.from({length: 12}).map((_, i) => (
          <line key={i} x1={0} y1={-72} x2={0} y2={-84} stroke="#20242f" strokeWidth={5} transform={`rotate(${i * 30})`} />
        ))}
        <line x1={0} y1={0} x2={0} y2={-45} stroke="#20242f" strokeWidth={9} strokeLinecap="round" transform={`rotate(${(minutes / 60) * 30})`} />
        <line x1={0} y1={0} x2={0} y2={-70} stroke={accent} strokeWidth={6} strokeLinecap="round" transform={`rotate(${(minutes % 60) * 6})`} />
        <circle r={8} fill="#20242f" />
      </svg>
      <div style={{fontFamily: font, fontWeight: 800, fontSize: size * 0.22, color: colors.text, fontVariantNumeric: 'tabular-nums'}}>
        {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}
      </div>
    </div>
  );
};

const photoFor = (id: string) =>
  getStaticFiles().find((f) => new RegExp(`^photos/${id}\\.(jpe?g|png|webp)$`, 'i').test(f.name))?.name;

export const hasPhoto = (id: string) => Boolean(photoFor(id));

// Polaroid-style frame. Uses public/photos/<id>.jpg if present, else an illustrated placeholder.
export const Polaroid: React.FC<{id: string; initials: string; width: number; caption?: string; mourning?: number; accent?: string}> = ({
  id,
  initials,
  width,
  caption,
  mourning = 0,
  accent = colors.red,
}) => {
  const frame = useCurrentFrame();
  const src = photoFor(id);
  const zoom = 1.05 + frame * 0.0006;
  const h = width * 1.1;
  return (
    <div style={{background: '#f4f1ea', padding: width * 0.05, paddingBottom: width * 0.17, boxShadow: '0 30px 60px rgba(0,0,0,0.5)', position: 'relative'}}>
      <div style={{width: width * 0.9, height: h * 0.82, overflow: 'hidden', position: 'relative', background: '#222'}}>
        {src ? (
          <Img
            src={staticFile(src)}
            style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, filter: `grayscale(${mourning})`}}
          />
        ) : (
          <svg width="100%" height="100%" viewBox="0 0 90 90" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={mourning > 0.5 ? '#555' : accent} />
                <stop offset="100%" stopColor="#141824" />
              </linearGradient>
            </defs>
            <rect width={90} height={90} fill={`url(#bg-${id})`} />
            <circle cx={45} cy={36} r={15} fill="#0c0f16" opacity={0.85} />
            <path d="M14,90 Q14,58 45,56 Q76,58 76,90Z" fill="#0c0f16" opacity={0.85} />
            <text x={45} y={41} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={13} fill="#f4f1ea">
              {initials}
            </text>
          </svg>
        )}
        {mourning > 0 && (
          <svg width={width * 0.3} height={width * 0.3} viewBox="0 0 30 30" style={{position: 'absolute', right: 0, top: 0, opacity: mourning}}>
            <path d="M0,0 L30,0 L30,30Z" fill="black" />
          </svg>
        )}
      </div>
      {caption && (
        <div style={{fontFamily: font, fontWeight: 700, fontSize: width * 0.075, color: '#20242f', textAlign: 'center', marginTop: width * 0.04}}>
          {caption}
        </div>
      )}
    </div>
  );
};

// Old CRT television that frames its children.
export const TV: React.FC<{width: number; children: React.ReactNode; live?: boolean}> = ({width, children, live = true}) => {
  const frame = useCurrentFrame();
  const h = width * 0.66;
  return (
    <div style={{width, position: 'relative'}}>
      <div style={{background: '#3a2c22', borderRadius: width * 0.05, padding: width * 0.04, boxShadow: '0 30px 80px rgba(0,0,0,0.6)'}}>
        <div style={{width: '100%', height: h, borderRadius: width * 0.04, overflow: 'hidden', position: 'relative', background: '#000'}}>
          {children}
          {/* Scanlines */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 2px, transparent 2px, transparent 5px)',
              pointerEvents: 'none',
            }}
          />
          {live && (
            <div style={{position: 'absolute', top: 18, left: 22, display: 'flex', alignItems: 'center', gap: 10, fontFamily: font, fontWeight: 800, fontSize: width * 0.03, color: 'white'}}>
              <div style={{width: width * 0.018, height: width * 0.018, borderRadius: 99, background: colors.red, opacity: Math.floor(frame / 15) % 2 ? 1 : 0.2}} />
              ՈՒՂԻՂ ԵԹԵՐ
            </div>
          )}
        </div>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', padding: `0 ${width * 0.15}px`}}>
        <div style={{width: width * 0.05, height: width * 0.06, background: '#2a1f18', transform: 'skewX(20deg)'}} />
        <div style={{width: width * 0.05, height: width * 0.06, background: '#2a1f18', transform: 'skewX(-20deg)'}} />
      </div>
    </div>
  );
};

export const Static: React.FC<{opacity: number}> = ({opacity}) => {
  const frame = useCurrentFrame();
  return (
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity}}>
      <filter id="static">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={frame} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#static)" />
    </svg>
  );
};

export const Newspaper: React.FC<{width: number; headline: string; date: string}> = ({width, headline, date}) => (
  <div style={{width, background: '#ece6d6', padding: width * 0.05, boxShadow: '0 30px 60px rgba(0,0,0,0.5)', fontFamily: font, color: '#1b1b1b'}}>
    <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '3px double #1b1b1b', paddingBottom: 8, fontSize: width * 0.035, fontWeight: 700}}>
      <span>ԼՐԱԳԻՐ</span>
      <span>{date}</span>
    </div>
    <div style={{fontSize: width * 0.085, fontWeight: 900, lineHeight: 1.05, margin: `${width * 0.04}px 0`}}>{headline}</div>
    <div style={{display: 'flex', gap: width * 0.04}}>
      {[0, 1, 2].map((c) => (
        <div key={c} style={{flex: 1}}>
          {Array.from({length: 6}).map((_, i) => (
            <div key={i} style={{height: width * 0.014, background: '#9b9584', marginBottom: width * 0.016, width: `${70 + ((i * 37 + c * 11) % 30)}%`}} />
          ))}
        </div>
      ))}
    </div>
  </div>
);
