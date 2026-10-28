import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Captions} from '../Captions';
import {FilmLook, Resolve, SceneShell} from '../cinematic/fx';
import {cine, sans, serif} from '../cinematic/theme';
import '../fonts';
import {Soundtrack} from '../Soundtrack';
import {useToFrames} from '../time';
import {SceneData, timeline} from '../timeline';
import {PHOTOS} from './photos';
import {DAftermath, DAttack, DIntro, DLeaders, DMap, DMemorial, DSiege, DVictims} from './scenes';

const voiceCredit = () => {
  const v = timeline.scenes.flatMap((s) => s.lines).find((l) => l.voice)?.voice;
  return v === 'azure' ? 'Ձայն՝ Microsoft Azure (Հայկ)' : v === 'human' ? 'Պատմում է՝ հեղինակը' : 'Ձայն՝ eSpeak NG';
};

const DCredits: React.FC = () => {
  const photoCredits = [...new Set(Object.values(PHOTOS).map((p) => p.credit))];
  const rows = [
    voiceCredit(),
    'Լուսանկարներ (Wikimedia Commons)՝',
    ...photoCredits,
    'Երաժշտություն՝ Kevin MacLeod (incompetech.com), CC BY 4.0',
    'Քարտեզներ՝ Natural Earth · Մեծ Հայք՝ Tigran Ovanyan, CC BY-SA 4.0',
  ];
  return (
    <AbsoluteFill style={{background: cine.black, alignItems: 'center', justifyContent: 'center', padding: '0 80px 260px'}}>
      {rows.map((r, i) => (
        <Resolve key={r} delay={6 + i * 4}>
          <div style={{fontFamily: i === 0 ? serif : sans, fontWeight: 500, fontSize: i === 0 ? 40 : 21, color: i === 0 ? cine.cream : cine.muted, marginBottom: 14, textAlign: 'center'}}>{r}</div>
        </Resolve>
      ))}
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<{scene: SceneData}>> = {
  intro: DIntro,
  map: DMap,
  leaders: DLeaders,
  attack: DAttack,
  victims: DVictims,
  siege: DSiege,
  aftermath: DAftermath,
  memorial: DMemorial,
  credits: DCredits,
};

// Documentary reel: archive photographs with slow camera moves, real map data, narration and score.
export const DocumentaryVideo: React.FC = () => {
  const toFrames = useToFrames();
  return (
    <AbsoluteFill style={{background: cine.black}}>
      {timeline.scenes.map((scene) => {
        const Scene = SCENES[scene.id];
        return (
          <Sequence key={scene.id} from={toFrames(scene.from)} durationInFrames={toFrames(scene.duration)} name={scene.id}>
            <SceneShell duration={scene.duration} push={0}>
              <Scene scene={scene} />
            </SceneShell>
          </Sequence>
        );
      })}
      <FilmLook />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1420, height: 500, background: 'linear-gradient(transparent, rgba(0,0,0,0.8) 45%)'}} />
      <Captions variant="cinematic" />
      <Soundtrack music="audio/doc-music.wav" base={0.62} />
    </AbsoluteFill>
  );
};
