import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {GoldLine, Resolve, SmallCaps} from '../cinematic/fx';
import {CMap} from '../cinematic/scenes';
import {cine, sans, serif} from '../cinematic/theme';
import {clamp, Sfx, useShake} from '../fx';
import {Candle} from '../illustrations';
import {VICTIMS} from '../scenes/Victims';
import {useFrame} from '../time';
import {SceneData} from '../timeline';
import {ChapterTag, Shots} from './components';

type Props = {scene: SceneData};
const end = (scene: SceneData) => scene.duration;

// ---------------------------------------------------------------- Intro: the hall, then the memorial plaque
export const DIntro: React.FC<Props> = ({scene}) => {
  const [l1, l2] = scene.lines;
  return (
    <AbsoluteFill>
      <Shots
        shots={[
          // The collage's top-left quarter is the session hall in 1999.
          {photo: 'collage', from: 0, to: l2.start, zoom: [2.05, 2.25], pan: [[0, 0], [0, 0]], tone: 'sepia', frame: 'full'},
          {photo: 'collage', from: l2.start, to: end(scene), zoom: [2.05, 2.2], pan: [[100, 100], [100, 100]], tone: 'sepia', frame: 'full'},
        ]}
      />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 420}}>
        <Resolve delay={20} tracking={0.4}>
          <SmallCaps size={28}>Երևան</SmallCaps>
        </Resolve>
        <Resolve delay={30}>
          <div style={{fontFamily: serif, fontWeight: 500, fontSize: 150, color: cine.cream, textShadow: '0 6px 40px rgba(0,0,0,0.8)'}}>27.10.1999</div>
        </Resolve>
        <GoldLine delay={50} width={560} />
        <Resolve delay={l1.start + 40}>
          <div style={{fontFamily: serif, fontWeight: 500, fontSize: 66, color: cine.cream, textAlign: 'center', marginTop: 30, lineHeight: 1.15, textShadow: '0 4px 30px rgba(0,0,0,0.9)'}}>
            Ահաբեկչությունը
            <br />
            Ազգային ժողովում
          </div>
        </Resolve>
      </AbsoluteFill>
      <Sfx name="impact" at={30} volume={0.35} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Map, then the 1999 election winners
export const DMap: React.FC<Props> = ({scene}) => {
  const [, l2] = scene.lines;
  return (
    <AbsoluteFill>
      <CMap scene={scene} />
      <Shots
        shots={[
          {photo: 'leaders1999', from: l2.start, to: end(scene), zoom: [1.0, 1.1], pan: [[50, 30], [55, 25]], label: ['«Միասնություն»', 'Մայիս 1999 · ընտրությունների հաղթող']},
        ]}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Leaders
export const DLeaders: React.FC<Props> = ({scene}) => {
  const [l1, l2] = scene.lines;
  const mid = l1.start + Math.round(l1.duration * 0.5);
  return (
    <AbsoluteFill>
      <Shots
        shots={[
          {photo: 'sargsyanUniform', from: 0, to: mid, zoom: [1.0, 1.1], pan: [[50, 25], [50, 20]], tone: 'bw', label: ['Վազգեն Սարգսյան', 'Պաշտպանության նախարար · 1995–1999']},
          {photo: 'sargsyan1999', from: mid, to: l2.start, zoom: [1.0, 1.12], pan: [[50, 25], [50, 20]], label: ['Վազգեն Սարգսյան', 'Վարչապետ · 1999']},
          {photo: 'demirchyan1999', from: l2.start, to: end(scene), zoom: [1.0, 1.12], pan: [[50, 20], [50, 15]], label: ['Կարեն Դեմիրճյան', 'Ազգային ժողովի նախագահ · 1999']},
        ]}
      />
      <ChapterTag n="I" title="Առաջնորդները" />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- The attack
export const DAttack: React.FC<Props> = ({scene}) => {
  const frame = useFrame();
  const [l1, l2, l3] = scene.lines;
  const fireAt = l2.start + Math.round(l2.duration * 0.8);
  const blackAt = l3.start - 4;
  const shake = useShake(fireAt, 22, 28);
  const toBlack = interpolate(frame, [blackAt, blackAt + 16], [0, 1], clamp);
  const minutes = interpolate(frame, [0, fireAt], [16 * 60 + 50, 17 * 60 + 15], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${shake.x}px, ${shake.y}px)`}}>
        <Shots
          shots={[
            {photo: 'collage', from: 0, to: l2.start, zoom: [2.05, 2.3], pan: [[0, 0], [0, 0]], tone: 'color', date: '27.10.1999', frame: 'full'},
            {photo: 'parliamentBw', from: l2.start, to: blackAt + 10, zoom: [1.05, 1.3], pan: [[50, 55], [50, 50]], tone: 'bw', frame: 'full'},
          ]}
        />
        <AbsoluteFill style={{background: cine.blood, mixBlendMode: 'multiply', opacity: interpolate(frame, [fireAt, fireAt + 6], [0, 0.55], clamp)}} />
      </AbsoluteFill>
      <ChapterTag n="II" title="Հոկտեմբերի 27" />
      <div style={{position: 'absolute', top: 200, right: 70, textAlign: 'right'}}>
        <div style={{fontFamily: serif, fontWeight: 300, fontSize: 110, color: cine.cream, fontVariantNumeric: 'tabular-nums', textShadow: '0 4px 30px rgba(0,0,0,0.9)'}}>
          {String(Math.floor(minutes / 60)).padStart(2, '0')}:{String(Math.floor(minutes % 60)).padStart(2, '0')}
        </div>
        <SmallCaps size={20}>Ուղիղ եթեր · նիստերի դահլիճ</SmallCaps>
      </div>
      <AbsoluteFill style={{background: 'white', opacity: interpolate(frame - fireAt, [0, 2, 16], [0, 0.85, 0], clamp)}} />
      <AbsoluteFill style={{background: 'black', opacity: toBlack}}>
        <Shots shots={[{photo: 'sargsyanUniform', from: blackAt + 8, to: end(scene) + 20, zoom: [1.0, 1.06], pan: [[50, 25], [50, 22]], tone: 'bw'}]} />
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 470}}>
          <Resolve delay={blackAt + 30}>
            <div style={{fontFamily: serif, fontWeight: 500, fontSize: 80, color: cine.cream, textShadow: '0 4px 30px #000'}}>Վազգեն Սարգսյան</div>
          </Resolve>
          <Resolve delay={blackAt + 45} tracking={0.2}>
            <div style={{fontFamily: serif, fontWeight: 300, fontSize: 48, color: cine.gold, textAlign: 'center'}}>1959 – 1999</div>
          </Resolve>
        </AbsoluteFill>
      </AbsoluteFill>
      {[0, 1, 2, 3].map((i) => (
        <Sfx key={i} name="heartbeat" at={l1.start + 20 + i * 28} volume={0.2 + i * 0.08} />
      ))}
      <Sfx name="riser" at={fireAt - 66} volume={0.3} />
      <Sfx name="impact" at={fireAt} volume={0.75} />
      <Sfx name="bell" at={blackAt + 20} volume={0.3} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Victims: the 2000 memorial stamp with all eight portraits
export const DVictims: React.FC<Props> = ({scene}) => {
  const frame = useFrame();
  const start = scene.lines[0].start;
  return (
    <AbsoluteFill>
      <Shots shots={[{photo: 'memorialStamp', from: 0, to: end(scene), zoom: [1.0, 1.08], pan: [[50, 50], [55, 45]], label: ['8 զոհ', 'Հուշադրոշմ · Հայփոստ, 2000']}]} />
      <ChapterTag n="III" title="Զոհերը" />
      <div style={{position: 'absolute', top: 1180, left: 70, right: 70, columnCount: 2, columnGap: 40}}>
        {VICTIMS.map(([name, role], i) => (
          <div key={name} style={{opacity: interpolate(frame - start - 20 - i * 8, [0, 15], [0, 1], clamp), marginBottom: 12, breakInside: 'avoid'}}>
            <div style={{fontFamily: serif, fontWeight: 500, fontSize: 30, color: cine.cream}}>{name}</div>
            <div style={{fontFamily: sans, fontWeight: 500, fontSize: 15, color: cine.gold, letterSpacing: '0.15em', textTransform: 'uppercase'}}>{role}</div>
          </div>
        ))}
      </div>
      <Sfx name="bell" at={4} volume={0.25} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Siege: Raffi Kojian's photographs from 28 October 1999
export const DSiege: React.FC<Props> = ({scene}) => {
  const [, l2, l3] = scene.lines;
  return (
    <AbsoluteFill>
      <Shots
        shots={[
          {photo: 'apc102', from: 0, to: l2.start, zoom: [1.05, 1.2], pan: [[30, 50], [45, 45]], date: "'99 10 28", label: ['Բաղրամյան պողոտա', 'Գիշերը՝ պաշարված խորհրդարանի մոտ']},
          {photo: 'crowd', from: l2.start, to: l3.start, zoom: [1.05, 1.18], pan: [[60, 50], [40, 50]], date: "'99 10 28"},
          {photo: 'release', from: l3.start, to: end(scene), zoom: [1.05, 1.22], pan: [[50, 55], [55, 45]], date: "'99 10 28", label: ['Հոկտեմբերի 28', 'Մեքենաները լքում են ԱԺ տարածքը']},
        ]}
      />
      <ChapterTag n="IV" title="Պատանդների գիշերը" />
      <Sfx name="siren" at={10} volume={0.05} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Aftermath
export const DAftermath: React.FC<Props> = ({scene}) => {
  const [l1, l2, l3] = scene.lines;
  return (
    <AbsoluteFill>
      <Shots
        shots={[
          {photo: 'parliament', from: 0, to: l2.start, zoom: [1.05, 1.15], pan: [[50, 50], [55, 50]], tone: 'bw', label: ['2003', 'Ցմահ ազատազրկում']},
          {photo: 'leaders1999', from: l2.start, to: l3.start, zoom: [1.0, 1.12], pan: [[50, 30], [50, 25]], tone: 'bw', label: ['Մեկ օրում', 'Երկու առաջնորդ']},
          {photo: 'leadersStamps', from: l3.start, to: end(scene), zoom: [1.0, 1.1], pan: [[50, 50], [50, 45]], label: ['Անպատասխան հարցեր', 'Ո՞վ էր կանգնած հանցագործների թիկունքում']},
        ]}
      />
      <ChapterTag n="V" title="Հետևանքները" />
      <Sfx name="gavel" at={l1.start + 20} volume={0.5} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Memorial: "Biblical David" monument by the parliament
export const DMemorial: React.FC<Props> = ({scene}) => {
  const frame = useFrame();
  const [l1, l2] = scene.lines;
  return (
    <AbsoluteFill>
      <Shots
        shots={[
          {photo: 'monument', from: 0, to: l2.start + 10, zoom: [1.0, 1.12], pan: [[50, 60], [50, 50]], label: ['Հուշարձան', 'Ազգային ժողովի մոտ, Երևան']},
          {photo: 'monument2', from: l2.start + 10, to: end(scene) + 20, zoom: [1.05, 1.15], pan: [[50, 30], [50, 25]], tone: 'sepia'},
        ]}
      />
      <div style={{position: 'absolute', top: 1260, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 18}}>
        {VICTIMS.map(([name], i) => (
          <Candle key={name} size={90} lit={interpolate(frame, [l1.start + 20 + i * 10, l1.start + 32 + i * 10], [0, 1], clamp)} />
        ))}
      </div>
      <div style={{position: 'absolute', top: 1110, left: 0, right: 0, textAlign: 'center'}}>
        <Resolve delay={l2.start}>
          <div style={{fontFamily: serif, fontWeight: 500, fontSize: 110, color: cine.cream, textShadow: '0 4px 30px #000'}}>Հիշենք</div>
        </Resolve>
      </div>
      <Sfx name="bell" at={l1.start} volume={0.3} />
      <Sfx name="bell" at={l2.start} volume={0.25} />
    </AbsoluteFill>
  );
};
