import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, Dust, Label, Pop, Rise, Sfx, Typewriter, useSpring} from '../fx';
import {pick, useLayout} from '../layout';
import {colors, font, tricolor} from '../theme';
import {SceneData} from '../timeline';

export const Intro: React.FC<{scene: SceneData}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {vertical} = useLayout();
  const l2 = scene.lines[1].start;

  // Old-TV switch-on: a bright line opens up into the picture.
  const open = interpolate(frame, [0, 6, 16], [0.004, 0.004, 1], clamp);
  const lineGlow = interpolate(frame, [0, 4, 16], [0, 1, 0], clamp);

  // "27" drops in with squash and stretch.
  const drop = useSpring(22, {damping: 7, stiffness: 110});
  const land = frame - 30;
  const squash = land > 0 ? Math.sin(land / 2.5) * Math.exp(-land / 7) * 0.25 : 0;
  const ribbon = useSpring(40, {damping: 200});
  const big = pick(vertical, 380, 300);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scaleY(${open})`, background: `radial-gradient(circle at 50% 40%, #1c2232 0%, ${colors.bg} 70%)`}}>
        <Dust count={50} />
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: pick(vertical, 420, 150)}}>
          <Label size={pick(vertical, 40, 46)} style={{opacity: interpolate(frame, [18, 30], [0, 1], clamp)}}>
            Հոկտեմբերի
          </Label>
          <div
            style={{
              fontFamily: font,
              fontWeight: 900,
              fontSize: big,
              lineHeight: 0.95,
              color: colors.text,
              transform: `translateY(${(1 - drop) * -900}px) scale(${1 + squash}, ${1 - squash})`,
              transformOrigin: 'bottom center',
              textShadow: `12px 12px 0 ${colors.red}`,
            }}
          >
            27
          </div>
          {/* Tricolour ribbon unfurls under the number */}
          <div style={{display: 'flex', flexDirection: 'column', width: pick(vertical, 760, 900) * ribbon, marginTop: 20}}>
            {tricolor.map((c) => (
              <div key={c} style={{height: 14, background: c}} />
            ))}
          </div>
          <div style={{fontFamily: font, fontWeight: 800, fontSize: pick(vertical, 96, 90), color: colors.apricot, letterSpacing: 20, marginTop: 16}}>
            <Typewriter text="1999" delay={48} speed={4} />
          </div>
          <Pop delay={l2} style={{marginTop: 30}}>
            <div
              style={{
                fontFamily: font,
                fontWeight: 800,
                fontSize: pick(vertical, 54, 52),
                color: colors.bg,
                background: colors.text,
                padding: '12px 34px',
                borderRadius: 12,
                transform: 'rotate(-2deg)',
                textAlign: 'center',
                maxWidth: pick(vertical, 900, 1500),
              }}
            >
              Ահաբեկչությունը Ազգային ժողովում
            </div>
          </Pop>
          <Rise delay={l2 + 20} style={{marginTop: 26}}>
            <div style={{fontFamily: font, fontWeight: 600, fontSize: pick(vertical, 36, 34), color: colors.muted, textAlign: 'center'}}>
              Ինչպես սպանվեց Վազգեն Սարգսյանը
            </div>
          </Rise>
        </AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'white', opacity: lineGlow * 0.6, transform: `scaleY(${open})`}} />
      <Sfx name="tvon" at={0} volume={0.5} />
      <Sfx name="whoosh" at={20} volume={0.4} />
      <Sfx name="impact" at={30} volume={0.7} />
      <Sfx name="pop" at={l2} volume={0.35} />
    </AbsoluteFill>
  );
};
