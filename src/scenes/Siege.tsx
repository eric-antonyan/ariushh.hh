import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, random, useCurrentFrame} from 'remotion';
import {clamp, Label, Pop, Sfx} from '../fx';
import {Clock, Dove, Parliament, PoliceCar} from '../illustrations';
import {pick, useLayout} from '../layout';
import {colors, font} from '../theme';
import {SceneData} from '../timeline';

const Bubble: React.FC<{text: string; side: 'left' | 'right'; size: number}> = ({text, side, size}) => (
  <div
    style={{
      position: 'relative',
      background: 'white',
      color: '#111',
      fontFamily: font,
      fontWeight: 800,
      fontSize: size,
      padding: '14px 26px',
      borderRadius: 26,
      border: '4px solid #111',
      boxShadow: '6px 6px 0 #111',
    }}
  >
    {text}
    <div
      style={{
        position: 'absolute',
        bottom: -22,
        [side]: 36,
        width: 0,
        height: 0,
        borderLeft: '16px solid transparent',
        borderRight: '16px solid transparent',
        borderTop: '22px solid #111',
      }}
    />
  </div>
);

export const Siege: React.FC<{scene: SceneData}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {vertical, width, height} = useLayout();
  const [, l2, l3] = scene.lines;
  const dawn = interpolate(frame, [l3.start, l3.start + 60], [0, 1], clamp);
  const sky = interpolateColors(dawn, [0, 0.5, 1], [colors.night, '#c4566b', '#7fb4e6']);
  const skyLow = interpolateColors(dawn, [0, 0.5, 1], ['#1b2550', '#f2a65a', '#d6ecff']);
  // Clock fast-forwards through the night: 18:00 on the 27th to 10:00 on the 28th.
  const minutes = interpolate(frame, [0, l3.start + 40], [18 * 60, 34 * 60], clamp);
  const buildingW = pick(vertical, 900, 820);
  const groundY = pick(vertical, 1230, 840);
  const doveStart = l3.start + 40;

  return (
    <AbsoluteFill style={{background: `linear-gradient(${sky}, ${skyLow})`}}>
      {/* Stars fade out at dawn */}
      {Array.from({length: 70}).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: random(`sx${i}`) * width,
            top: random(`sy${i}`) * groundY * 0.7,
            width: 4,
            height: 4,
            borderRadius: 4,
            background: 'white',
            opacity: (1 - dawn) * (0.3 + 0.7 * Math.abs(Math.sin(frame / 12 + i))),
          }}
        />
      ))}
      {/* Moon sets, sun rises */}
      <div style={{position: 'absolute', right: width * 0.12, top: interpolate(dawn, [0, 1], [140, groundY], clamp), width: 120, height: 120, borderRadius: 99, background: '#f1eedf', boxShadow: '0 0 60px #f1eedf88', opacity: 1 - dawn}} />
      <div style={{position: 'absolute', left: width * 0.12, top: interpolate(dawn, [0, 1], [groundY, pick(vertical, 260, 120)], clamp), width: 160, height: 160, borderRadius: 99, background: colors.apricot, boxShadow: `0 0 120px ${colors.apricot}`, opacity: dawn}} />
      {/* Ground */}
      <div style={{position: 'absolute', left: 0, right: 0, top: groundY, bottom: 0, background: interpolateColors(dawn, [0, 1], ['#070a14', '#3c4a3a'])}} />
      <div style={{position: 'absolute', left: (width - buildingW) / 2, top: groundY - buildingW * 0.6}}>
        <Parliament width={buildingW} lit={1 - dawn * 0.8} flicker />
      </div>
      {/* Police cars with flashing lights */}
      {[0, 1].map((i) => (
        <div key={i} style={{position: 'absolute', top: groundY - pick(vertical, 60, 80), left: i ? width - pick(vertical, 330, 420) : pick(vertical, 30, 120), transform: i ? 'scaleX(-1)' : undefined, opacity: 1 - dawn * 0.6}}>
          <PoliceCar width={pick(vertical, 300, 300)} phase={i * 3} />
        </div>
      ))}
      {/* Fast-forwarding clock */}
      <div style={{position: 'absolute', top: pick(vertical, 120, 50), right: pick(vertical, 60, 70)}}>
        <Pop delay={6}>
          <Clock size={pick(vertical, 170, 170)} minutes={minutes} accent={colors.blue} />
        </Pop>
      </div>
      <div style={{position: 'absolute', top: pick(vertical, 140, 70), left: pick(vertical, 60, 90)}}>
        <Label size={pick(vertical, 36, 32)} color="white">
          {dawn > 0.5 ? 'Հոկտեմբերի 28' : 'Պատանդների գիշերը'}
        </Label>
      </div>
      {/* Negotiation: speech bubbles bouncing between the president's phone and the building */}
      {frame >= l2.start && frame < l3.start + 10 && (
        <>
          <div style={{position: 'absolute', left: pick(vertical, 80, 160), top: pick(vertical, 420, 230)}}>
            <Pop delay={l2.start + 6}>
              <Bubble text="Ռ. Քոչարյան. բանակցություններ" side="left" size={pick(vertical, 34, 32)} />
            </Pop>
          </div>
          <div style={{position: 'absolute', right: pick(vertical, 80, 160), top: pick(vertical, 600, 380)}}>
            <Pop delay={l2.start + 40}>
              <Bubble text="…" side="right" size={pick(vertical, 48, 44)} />
            </Pop>
          </div>
        </>
      )}
      {/* Doves fly out as the hostages are freed */}
      {frame >= doveStart &&
        Array.from({length: 9}).map((_, i) => {
          const t = frame - doveStart - i * 4;
          if (t < 0) return null;
          const x = width / 2 + (random(`dvx${i}`) - 0.5) * 200 + t * (random(`dvdx${i}`) - 0.5) * 22;
          const y = groundY - buildingW * 0.35 - t * (6 + random(`dvy${i}`) * 5);
          return (
            <div key={i} style={{position: 'absolute', left: x, top: y, transform: `scaleX(${random(`dvd${i}`) > 0.5 ? 1 : -1})`}}>
              <Dove size={70 + random(`dsz${i}`) * 40} phase={i} />
            </div>
          );
        })}
      {frame >= l3.start + 50 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: pick(vertical, 380, 220), display: 'flex', justifyContent: 'center'}}>
          <Pop delay={l3.start + 50}>
            <div style={{fontFamily: font, fontWeight: 900, fontSize: pick(vertical, 64, 60), color: '#111', background: 'white', padding: '14px 36px', borderRadius: 18, border: '5px solid #111', boxShadow: '10px 10px 0 #111', transform: 'rotate(-3deg)'}}>
              Պատանդներն ազատ են
            </div>
          </Pop>
        </div>
      )}
      <Sfx name="siren" at={10} volume={0.12} />
      <Sfx name="pop" at={l2.start + 6} volume={0.35} />
      <Sfx name="pop" at={l2.start + 40} volume={0.35} />
      <Sfx name="wings" at={doveStart} volume={0.4} />
      <Sfx name="pop" at={l3.start + 50} volume={0.35} />
    </AbsoluteFill>
  );
};
