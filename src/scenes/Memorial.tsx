import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, Dust, Pop, Rise, Sfx} from '../fx';
import {Candle} from '../illustrations';
import {pick, useLayout} from '../layout';
import {colors, font, tricolor} from '../theme';
import {SceneData} from '../timeline';
import {VICTIMS} from './Victims';

export const Memorial: React.FC<{scene: SceneData}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {vertical} = useLayout();
  const [l1, l2] = scene.lines;
  const cols = vertical ? 4 : 8;
  const candle = pick(vertical, 200, 210);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #2a1d10 0%, #040405 70%)', alignItems: 'center', justifyContent: 'center', paddingBottom: pick(vertical, 420, 140)}}>
      <Dust count={35} />
      <Rise delay={l1.start}>
        <div style={{fontFamily: font, fontWeight: 900, fontSize: pick(vertical, 110, 100), color: colors.text, textAlign: 'center'}}>Հիշենք</div>
      </Rise>
      <div style={{display: 'flex', width: pick(vertical, 500, 600), height: 8, margin: '20px 0 50px'}}>
        {tricolor.map((c) => (
          <div key={c} style={{flex: 1, background: c, transform: `scaleX(${interpolate(frame, [l1.start + 10, l1.start + 40], [0, 1], clamp)})`}} />
        ))}
      </div>
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: pick(vertical, '40px 30px', '20px 26px')}}>
        {VICTIMS.map(([name], i) => {
          const at = l1.start + 20 + i * 12;
          const lit = interpolate(frame, [at, at + 10], [0, 1], clamp);
          return (
            <div key={name} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: pick(vertical, 220, 190)}}>
              <Candle size={candle} lit={lit} />
              <div style={{fontFamily: font, fontWeight: 700, fontSize: pick(vertical, 26, 22), color: colors.text, opacity: 0.3 + 0.7 * lit, textAlign: 'center', marginTop: 12}}>
                {name}
              </div>
            </div>
          );
        })}
      </div>
      <Pop delay={l2.start}>
        <div style={{fontFamily: font, fontWeight: 700, fontSize: pick(vertical, 44, 38), color: colors.apricot, marginTop: 50, letterSpacing: 6}}>27.10.1999</div>
      </Pop>
      <Sfx name="bell" at={l1.start} volume={0.45} />
      <Sfx name="bell" at={l2.start} volume={0.35} />
    </AbsoluteFill>
  );
};
