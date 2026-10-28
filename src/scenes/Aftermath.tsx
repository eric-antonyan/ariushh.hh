import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, Label, Pop, Sfx, useSpring} from '../fx';
import {Gavel, Newspaper, Polaroid} from '../illustrations';
import {pick, useLayout} from '../layout';
import {colors, font} from '../theme';
import {SceneData} from '../timeline';

export const Aftermath: React.FC<{scene: SceneData}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {vertical} = useLayout();
  const [l1, l2, l3] = scene.lines;
  const hits = [l1.start + 40, l1.start + 58, l1.start + 76];

  // Classic spinning newspaper.
  const spin = useSpring(l1.start, {damping: 16, stiffness: 70});
  const part = frame < l2.start - 4 ? 0 : frame < l3.start - 4 ? 1 : 2;
  const out = (end: number) => interpolate(frame, [end - 8, end], [1, 0], clamp);

  // Question marks orbit and wobble.
  const q = frame - l3.start;

  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #232a3a 0%, ${colors.bg} 75%)`, alignItems: 'center', justifyContent: 'center', paddingBottom: pick(vertical, 460, 150)}}>
      <div style={{position: 'absolute', top: pick(vertical, 140, 60), left: 0, right: 0, textAlign: 'center'}}>
        <Label size={pick(vertical, 40, 34)}>Հետևանքները</Label>
      </div>

      {part === 0 && (
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', gap: 60, opacity: out(l2.start - 4)}}>
          <div style={{transform: `scale(${spin}) rotate(${(1 - spin) * 720}deg)`}}>
            <Newspaper width={pick(vertical, 760, 720)} headline="ՑՄԱՀ ԱԶԱՏԱԶՐԿՈՒՄ" date="2003 թ. դեկտեմբեր" />
          </div>
          <Pop delay={l1.start + 25}>
            <Gavel size={pick(vertical, 300, 300)} hits={hits} />
          </Pop>
        </div>
      )}

      {part === 1 && (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, opacity: out(l3.start - 4)}}>
          <div style={{display: 'flex', gap: pick(vertical, 40, 80)}}>
            {[
              ['vazgen', 'ՎՍ', 'Վ. Սարգսյան'],
              ['demirchyan', 'ԿԴ', 'Կ. Դեմիրճյան'],
            ].map(([id, ini, cap], i) => (
              <Pop key={id} delay={l2.start + i * 10}>
                <div style={{transform: `rotate(${i ? 4 : -4}deg)`}}>
                  <Polaroid id={id} initials={ini} width={pick(vertical, 400, 340)} caption={cap} mourning={interpolate(frame, [l2.start + 30, l2.start + 70], [0, 1], clamp)} />
                </div>
              </Pop>
            ))}
          </div>
          <Pop delay={l2.start + 50}>
            <div style={{fontFamily: font, fontWeight: 900, fontSize: pick(vertical, 60, 56), color: colors.text, background: colors.red, padding: '10px 30px', borderRadius: 14}}>Մեկ օրում՝ երկու առաջնորդ</div>
          </Pop>
        </div>
      )}

      {part === 2 && (
        <div style={{position: 'relative', width: 700, height: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {Array.from({length: 6}).map((_, i) => {
            const a = (i / 6) * Math.PI * 2 + q / 40;
            const p = interpolate(q, [i * 4, i * 4 + 15], [0, 1], clamp);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 350 + Math.cos(a) * 280 * p - 30,
                  top: 350 + Math.sin(a) * 220 * p - 50,
                  fontFamily: font,
                  fontWeight: 900,
                  fontSize: 90,
                  color: [colors.red, colors.blue, colors.apricot][i % 3],
                  opacity: p * 0.8,
                  transform: `rotate(${Math.sin(q / 8 + i) * 20}deg)`,
                }}
              >
                ?
              </div>
            );
          })}
          <Pop delay={l3.start}>
            <div style={{fontFamily: font, fontWeight: 900, fontSize: 380, color: colors.text, lineHeight: 1, transform: `rotate(${Math.sin(q / 6) * 8}deg)`, textShadow: `14px 14px 0 ${colors.red}`}}>?</div>
          </Pop>
          <div style={{position: 'absolute', bottom: -10}}>
            <Pop delay={l3.start + 30}>
              <div style={{fontFamily: font, fontWeight: 800, fontSize: pick(vertical, 50, 46), color: colors.bg, background: colors.text, padding: '10px 30px', borderRadius: 14, whiteSpace: 'nowrap'}}>Անպատասխան հարցեր</div>
            </Pop>
          </div>
        </div>
      )}

      <Sfx name="whoosh" at={l1.start} volume={0.5} />
      {hits.map((h) => (
        <Sfx key={h} name="gavel" at={h} volume={0.7} />
      ))}
      <Sfx name="shutter" at={l2.start} volume={0.4} />
      <Sfx name="pop" at={l2.start + 50} volume={0.35} />
      <Sfx name="pop" at={l3.start} volume={0.4} />
    </AbsoluteFill>
  );
};
