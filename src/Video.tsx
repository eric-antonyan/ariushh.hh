import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Captions} from './Captions';
import './fonts';
import {Grain, Sfx, StripeWipe, Vignette} from './fx';
import {Aftermath} from './scenes/Aftermath';
import {Attack} from './scenes/Attack';
import {Credits} from './scenes/Credits';
import {Intro} from './scenes/Intro';
import {Leaders} from './scenes/Leaders';
import {MapScene} from './scenes/MapScene';
import {Memorial} from './scenes/Memorial';
import {Siege} from './scenes/Siege';
import {Victims} from './scenes/Victims';
import {Soundtrack} from './Soundtrack';
import {colors} from './theme';
import {SceneData, timeline} from './timeline';

const SCENES: Record<string, React.FC<{scene: SceneData}>> = {
  intro: Intro,
  map: MapScene,
  leaders: Leaders,
  attack: Attack,
  victims: Victims,
  siege: Siege,
  aftermath: Aftermath,
  memorial: Memorial,
  credits: Credits,
};

const WIPE = 26;

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  return <div style={{position: 'absolute', top: 0, left: 0, height: 8, width: `${(frame / timeline.total) * 100}%`, background: colors.red}} />;
};

export const Video: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: colors.bg}}>
    {timeline.scenes.map((scene) => {
      const Scene = SCENES[scene.id];
      return (
        <Sequence key={scene.id} from={scene.from} durationInFrames={scene.duration} name={scene.id}>
          <Scene scene={scene} />
        </Sequence>
      );
    })}
    {/* Tricolour wipe + whoosh on every cut (not into the sombre victims / memorial scenes) */}
    {timeline.scenes.slice(1).map((scene) =>
      ['victims', 'memorial', 'credits'].includes(scene.id) ? null : (
        <Sequence key={`wipe-${scene.id}`} from={scene.from - WIPE / 2} durationInFrames={WIPE}>
          <StripeWipe length={WIPE} />
          <Sfx name="whoosh" at={0} volume={0.35} />
        </Sequence>
      ),
    )}
    <Vignette />
    <Grain />
    <Captions />
    <ProgressBar />
    <Soundtrack />
  </AbsoluteFill>
);
