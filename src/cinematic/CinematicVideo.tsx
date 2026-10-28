import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Captions} from '../Captions';
import '../fonts';
import {Soundtrack} from '../Soundtrack';
import {useToFrames} from '../time';
import {SceneData, timeline, usesHumanVoice} from '../timeline';
import {FilmLook, Resolve, SceneShell} from './fx';
import {CAftermath, CAttack, CIntro, CLeaders, CMap, CMemorial, CSiege, CVictims} from './scenes';
import {cine, sans, serif} from './theme';

const CCredits: React.FC = () => (
  <AbsoluteFill style={{background: cine.black, alignItems: 'center', justifyContent: 'center', paddingBottom: 200}}>
    {[
      'Պատմում է՝ հեղինակը',
      'Քարտեզ՝ Natural Earth',
      'Երաժշտություն և էֆեկտներ՝ ծրագրային սինթեզ',
      'Տառատեսակներ՝ Cormorant Garamond, Noto Serif Armenian, Montserrat',
    ]
      .filter((r, i) => i > 0 || usesHumanVoice)
      .map((r, i) => (
        <Resolve key={r} delay={10 + i * 10}>
          <div style={{fontFamily: i === 0 ? serif : sans, fontWeight: 500, fontSize: i === 0 ? 44 : 24, color: i === 0 ? cine.cream : cine.muted, marginBottom: 22, textAlign: 'center'}}>{r}</div>
        </Resolve>
      ))}
  </AbsoluteFill>
);

const SCENES: Record<string, React.FC<{scene: SceneData}>> = {
  intro: CIntro,
  map: CMap,
  leaders: CLeaders,
  attack: CAttack,
  victims: CVictims,
  siege: CSiege,
  aftermath: CAftermath,
  memorial: CMemorial,
  credits: CCredits,
};

export const CinematicVideo: React.FC = () => {
  const toFrames = useToFrames();
  return (
    <AbsoluteFill style={{background: cine.black}}>
      {timeline.scenes.map((scene) => {
        const Scene = SCENES[scene.id];
        return (
          <Sequence key={scene.id} from={toFrames(scene.from)} durationInFrames={toFrames(scene.duration)} name={scene.id}>
            <SceneShell duration={scene.duration}>
              <Scene scene={scene} />
            </SceneShell>
          </Sequence>
        );
      })}
      <FilmLook />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1420, height: 500, background: 'linear-gradient(transparent, rgba(0,0,0,0.75) 45%)'}} />
      <Captions variant="cinematic" />
      <Soundtrack />
    </AbsoluteFill>
  );
};
