import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Dust, Flash, Label, Pop, Rise, Sfx, useSpring, useSwing} from '../fx';
import {Polaroid} from '../illustrations';
import {pick, useLayout} from '../layout';
import {colors, font} from '../theme';
import {SceneData} from '../timeline';

const LEADERS = [
  {
    id: 'vazgen',
    initials: 'ՎՍ',
    name: 'Վազգեն Սարգսյան',
    role: 'Վարչապետ',
    accent: colors.red,
    facts: ['Վարչապետ՝ 1999 թ. հունիսից', 'Պաշտպանության նախկին նախարար', 'Ղարաբաղյան պատերազմի հերոս'],
  },
  {
    id: 'demirchyan',
    initials: 'ԿԴ',
    name: 'Կարեն Դեմիրճյան',
    role: 'ԱԺ նախագահ',
    accent: colors.blue,
    facts: ['ԱԺ նախագահ՝ 1999 թ. հունիսից', 'Խորհրդային Հայաստանի ղեկավար', '1974–1988 թթ.'],
  },
];

const LeaderCard: React.FC<{leader: (typeof LEADERS)[number]; delay: number; lineEnd: number}> = ({leader, delay}) => {
  const {vertical} = useLayout();
  const drop = useSpring(delay, {damping: 14, stiffness: 120});
  const swing = useSwing(delay + 4, 14);
  const photoW = pick(vertical, 380, 380);
  return (
    <div style={{display: 'flex', flexDirection: vertical ? 'row' : 'column', alignItems: 'center', gap: pick(vertical, 40, 30), flex: 1}}>
      <div style={{transform: `translateY(${(1 - drop) * -1200}px) rotate(${swing}deg)`, transformOrigin: 'top center', position: 'relative', opacity: drop > 0.01 ? 1 : 0}}>
        {/* Pushpin */}
        <div style={{position: 'absolute', top: -14, left: '50%', marginLeft: -16, width: 32, height: 32, borderRadius: 99, background: leader.accent, zIndex: 2, boxShadow: '0 4px 0 rgba(0,0,0,0.4)'}} />
        <Polaroid id={leader.id} initials={leader.initials} width={photoW} caption={leader.name} accent={leader.accent} />
      </div>
      <div style={{textAlign: vertical ? 'left' : 'center', maxWidth: pick(vertical, 560, 640)}}>
        <Pop delay={delay + 18} origin={vertical ? 'left center' : 'center'}>
          <span style={{display: 'inline-block', fontFamily: font, fontWeight: 800, fontSize: pick(vertical, 36, 34), color: 'white', background: leader.accent, padding: '8px 22px', borderRadius: 999}}>
            {leader.role}
          </span>
        </Pop>
        {leader.facts.map((f, i) => (
          <Rise key={f} delay={delay + 30 + i * 14} distance={30}>
            <div style={{fontFamily: font, fontWeight: 600, fontSize: pick(vertical, 34, 30), color: colors.muted, marginTop: 14}}>• {f}</div>
          </Rise>
        ))}
      </div>
    </div>
  );
};

export const Leaders: React.FC<{scene: SceneData}> = ({scene}) => {
  const {vertical} = useLayout();
  const [l1, l2] = scene.lines;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 30%, #222a3c 0%, ${colors.bg} 70%)`}}>
      <Dust count={30} color={colors.muted} />
      {/* Cork-board string */}
      <div style={{position: 'absolute', top: pick(vertical, 300, 168), left: 0, right: 0, height: 3, background: '#6d5a44', opacity: 0.6}} />
      <AbsoluteFill style={{padding: pick(vertical, '120px 70px 560px', '60px 120px 200px'), justifyContent: 'center'}}>
        <div style={{textAlign: 'center', marginBottom: pick(vertical, 80, 50)}}>
          <Label size={pick(vertical, 40, 34)}>Երկու առաջնորդ</Label>
        </div>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: pick(vertical, 70, 80)}}>
          <LeaderCard leader={LEADERS[0]} delay={l1.start} lineEnd={l1.start + l1.duration} />
          <LeaderCard leader={LEADERS[1]} delay={l2.start} lineEnd={l2.start + l2.duration} />
        </div>
      </AbsoluteFill>
      <Flash at={l1.start + 14} length={8} />
      <Flash at={l2.start + 14} length={8} />
      <Sfx name="whoosh" at={l1.start} volume={0.35} />
      <Sfx name="shutter" at={l1.start + 14} volume={0.6} />
      <Sfx name="whoosh" at={l2.start} volume={0.35} />
      <Sfx name="shutter" at={l2.start + 14} volume={0.6} />
    </AbsoluteFill>
  );
};
