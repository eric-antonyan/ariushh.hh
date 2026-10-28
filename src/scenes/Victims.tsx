import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, Dust, Label, Pop, Sfx} from '../fx';
import {pick, useLayout} from '../layout';
import {colors, font} from '../theme';
import {SceneData} from '../timeline';

export const VICTIMS: [string, string][] = [
  ['Վազգեն Սարգսյան', 'Վարչապետ'],
  ['Կարեն Դեմիրճյան', 'ԱԺ նախագահ'],
  ['Յուրի Բախշյան', 'ԱԺ փոխնախագահ'],
  ['Ռուբեն Միրոյան', 'ԱԺ փոխնախագահ'],
  ['Լեոնարդ Պետրոսյան', 'Օպերատիվ հարցերի նախարար'],
  ['Հենրիկ Աբրահամյան', 'Պատգամավոր'],
  ['Արմենակ Արմենակյան', 'Պատգամավոր'],
  ['Միքայել Քոթանյան', 'Պատգամավոր'],
];

const Ribbon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 40 52">
    <path d="M20,18 C8,0 2,12 12,22 L4,50 L14,46 L20,30 L26,46 L36,50 L28,22 C38,12 32,0 20,18Z" fill="#111" stroke="#555" strokeWidth={1.5} />
  </svg>
);

export const Victims: React.FC<{scene: SceneData}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {vertical} = useLayout();
  const start = scene.lines[0].start + 10;
  const cols = vertical ? 2 : 4;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 30%, #1d2130 0%, #050608 75%)`}}>
      <Dust count={25} color="#ffffff" />
      <AbsoluteFill style={{padding: pick(vertical, '150px 50px 560px', '70px 90px 200px'), justifyContent: 'center'}}>
        <div style={{textAlign: 'center', marginBottom: pick(vertical, 50, 46)}}>
          <Pop delay={4}>
            <div style={{fontFamily: font, fontWeight: 900, fontSize: pick(vertical, 150, 120), color: colors.text, lineHeight: 1}}>8</div>
          </Pop>
          <Label size={pick(vertical, 36, 30)}>զոհ</Label>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: pick(vertical, 26, 30)}}>
          {VICTIMS.map(([name, role], i) => {
            const at = start + i * 9;
            const flip = interpolate(frame, [at, at + 14], [90, 0], clamp);
            return (
              <div key={name} style={{perspective: 900}}>
                <div
                  style={{
                    transform: `rotateY(${flip}deg)`,
                    opacity: frame >= at ? 1 : 0,
                    background: colors.panel,
                    borderRadius: 18,
                    padding: pick(vertical, '24px 22px', '26px 22px'),
                    borderTop: `6px solid ${i < 2 ? colors.red : '#4b5263'}`,
                    display: 'flex',
                    gap: 16,
                    alignItems: 'center',
                    height: pick(vertical, 160, 150),
                  }}
                >
                  <Ribbon size={pick(vertical, 34, 32)} />
                  <div>
                    <div style={{fontFamily: font, fontWeight: 800, fontSize: pick(vertical, 32, 30), color: colors.text}}>{name}</div>
                    <div style={{fontFamily: font, fontWeight: 600, fontSize: pick(vertical, 24, 22), color: colors.muted, marginTop: 6}}>{role}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Sfx name="bell" at={2} volume={0.35} />
      {VICTIMS.map((_, i) => (
        <Sfx key={i} name="whoosh" at={start + i * 9} volume={0.08} />
      ))}
    </AbsoluteFill>
  );
};
