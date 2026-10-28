import React from 'react';
import {AbsoluteFill, Easing, getStaticFiles, Img, interpolate, interpolateColors, random, staticFile} from 'remotion';
import mapData from '../data/map.json';
import {clamp, Sfx, useShake} from '../fx';
import {Candle, Deputy} from '../illustrations';
import {VICTIMS} from '../scenes/Victims';
import {useFrame} from '../time';
import {SceneData} from '../timeline';
import {Ararat, Bokeh, Chapter, FadeUp, GoldLine, Resolve, SmallCaps} from './fx';
import {cine, sans, serif} from './theme';

const ease = Easing.bezier(0.33, 0, 0.2, 1);
const W = 1080;

type Props = {scene: SceneData};

// ---------------------------------------------------------------- Intro
export const CIntro: React.FC<Props> = ({scene}) => {
  const l2 = scene.lines[1].start;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 38%, #1b1712 0%, ${cine.black} 65%)`}}>
      <Bokeh count={22} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 300}}>
        <Resolve delay={20} tracking={0.5}>
          <SmallCaps size={30}>Հոկտեմբեր</SmallCaps>
        </Resolve>
        <Resolve delay={30}>
          <div style={{fontFamily: serif, fontWeight: 300, fontSize: 460, lineHeight: 1, color: cine.cream, textShadow: `0 0 80px ${cine.gold}55`}}>27</div>
        </Resolve>
        <GoldLine delay={55} width={640} />
        <Resolve delay={65} tracking={0.6}>
          <div style={{fontFamily: serif, fontWeight: 500, fontSize: 64, color: cine.gold, marginTop: 24}}>1999</div>
        </Resolve>
        <FadeUp delay={l2} style={{marginTop: 90, textAlign: 'center'}}>
          <div style={{fontFamily: serif, fontWeight: 500, fontSize: 76, color: cine.cream, lineHeight: 1.15}}>
            Ահաբեկչությունը
            <br />
            Ազգային ժողովում
          </div>
        </FadeUp>
        <FadeUp delay={l2 + 25} style={{marginTop: 30}}>
          <SmallCaps size={22} color={cine.muted}>
            Ինչպես սպանվեց Վազգեն Սարգսյանը
          </SmallCaps>
        </FadeUp>
      </AbsoluteFill>
      <Sfx name="riser" at={0} volume={0.25} />
      <Sfx name="impact" at={34} volume={0.45} />
      <Sfx name="whoosh" at={l2} volume={0.2} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Map
const map = mapData as {
  width: number;
  height: number;
  yerevan: [number, number];
  metsHayk: string;
  metsHaykLabel: [number, number];
  countries: {iso: string; name: string; d: string}[];
};

const LineParliament: React.FC<{progress: number; width: number}> = ({progress, width}) => {
  const dash = 2400;
  const s = {fill: 'none', stroke: cine.gold, strokeWidth: 2, strokeDasharray: dash, strokeDashoffset: dash * (1 - progress)};
  return (
    <svg width={width} height={width * 0.5} viewBox="0 0 500 250">
      <path d="M40,230 L460,230 M30,120 L470,120 L470,130 L30,130Z M45,130 L45,230 M455,130 L455,230" {...s} />
      {Array.from({length: 10}).map((_, i) => (
        <path key={i} d={`M${75 + i * 39},132 L${75 + i * 39},228`} {...s} />
      ))}
      <path d="M170,120 L170,60 L330,60 L330,120 M160,60 L340,60 L340,52 L160,52Z" {...s} />
      <path d="M250,52 L250,8 M250,10 L285,10 L285,30 L250,30" {...s} />
      <path d="M10,245 L490,245 M20,238 L480,238" {...s} />
    </svg>
  );
};

export const CMap: React.FC<Props> = ({scene}) => {
  const frame = useFrame();
  const [l1, l2] = scene.lines;
  const [yx, yy] = map.yerevan;
  // Push in to historical Greater Armenia (Mets Hayk), then on to today's Armenia and Yerevan.
  const z1 = interpolate(frame, [0, 80], [0, 1], {...clamp, easing: ease});
  const z2 = interpolate(frame, [90, 140], [0, 1], {...clamp, easing: ease});
  const vw = 1500 + (600 - 1500) * z1 + (270 - 600) * z2;
  const vh = vw * (1920 / 1080);
  const hx = (43.9 - 15) * 40 * Math.cos((41 * Math.PI) / 180);
  const hy = (58 - 39.3) * 40;
  const cx = hx + (yx - hx) * z2;
  const cy = hy + (yy - hy) * z2 + vh * 0.08;
  const hayk = interpolate(frame, [30, 70], [0, 1], clamp);
  const draw = interpolate(frame, [95, 135], [0, 1], clamp);
  const glow = 0.6 + 0.4 * Math.sin(frame / 10);
  const dim = interpolate(frame, [l2.start - 10, l2.start + 20], [1, 0.35], clamp);
  const coords = '40°11′ Հս · 44°31′ Աա';
  const shown = Math.max(0, Math.floor((frame - 135) / 2));
  return (
    <AbsoluteFill style={{background: '#07080c'}}>
      <svg width={W} height={1920} viewBox={`${cx - vw / 2} ${cy - vh / 2} ${vw} ${vh}`} style={{opacity: dim}}>
        {map.countries.map((c) =>
          c.iso === 'ARM' ? null : <path key={c.iso + c.name} d={c.d} fill="#0e1016" stroke={cine.goldSoft} strokeOpacity={0.35} strokeWidth={vw / 900} />,
        )}
        <path
          d={map.metsHayk}
          fill={cine.goldSoft}
          fillOpacity={0.2 * hayk}
          stroke={cine.goldSoft}
          strokeOpacity={0.85 * hayk}
          strokeWidth={vw / 600}
          strokeDasharray={`${vw / 140} ${vw / 200}`}
        />
        <text x={map.metsHaykLabel[0]} y={map.metsHaykLabel[1]} textAnchor="middle" fontFamily={serif} fontWeight={500} fontStyle="italic" fontSize={vw / 22} fill={cine.cream} opacity={0.75 * hayk * (1 - 0.8 * z2)}>
          Մեծ Հայք
        </text>
        <text x={map.metsHaykLabel[0]} y={map.metsHaykLabel[1] + vw / 30} textAnchor="middle" fontFamily={sans} fontWeight={500} fontSize={vw / 75} letterSpacing={vw / 500} fill={cine.goldSoft} opacity={hayk * (1 - 0.8 * z2)}>
          ՊԱՏՄԱԿԱՆ ՏԱՐԱԾՔ · ՄՈՏԱՎՈՐ
        </text>
        {map.countries
          .filter((c) => c.iso === 'ARM')
          .map((c) => (
            <path
              key="arm"
              d={c.d}
              fill={cine.gold}
              fillOpacity={0.12 * draw}
              stroke={cine.gold}
              strokeWidth={vw / 300}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - draw}
              style={{filter: `drop-shadow(0 0 ${vw / 120}px ${cine.gold})`}}
            />
          ))}
        <circle cx={yx} cy={yy} r={(vw / 60) * glow} fill={cine.gold} opacity={0.25 * draw} />
        <circle cx={yx} cy={yy} r={vw / 220} fill={cine.cream} opacity={draw} />
      </svg>
      <div style={{position: 'absolute', top: 1040, left: 0, right: 0, textAlign: 'center', opacity: (dim - 0.35) / 0.65}}>
        <Resolve delay={120}>
          <div style={{fontFamily: serif, fontWeight: 500, fontSize: 84, color: cine.cream}}>Երևան</div>
        </Resolve>
        <div style={{fontFamily: sans, fontWeight: 500, fontSize: 24, color: cine.gold, letterSpacing: '0.2em', marginTop: 12}}>{coords.slice(0, shown)}</div>
      </div>
      {frame > l2.start - 10 && (
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 640}}>
          <LineParliament progress={interpolate(frame, [l2.start, l2.start + 70], [0, 1], {...clamp, easing: ease})} width={820} />
          <FadeUp delay={l2.start + 40} style={{marginTop: 40, textAlign: 'center'}}>
            <SmallCaps size={24}>Մայիս 1999</SmallCaps>
            <div style={{fontFamily: serif, fontWeight: 500, fontSize: 64, color: cine.cream, marginTop: 14}}>«Միասնություն»</div>
          </FadeUp>
        </AbsoluteFill>
      )}
      <Chapter n={1} title="Ազգային ժողով" />
      <Sfx name="whoosh" at={0} volume={0.2} />
      <Sfx name="bell" at={40} volume={0.12} />
      <Sfx name="bell" at={120} volume={0.15} />
      <Sfx name="whoosh" at={l1.start + l1.duration} volume={0.15} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Leaders
const photo = (id: string) => getStaticFiles().find((f) => new RegExp(`^photos/${id}\\.(jpe?g|png|webp)$`, 'i').test(f.name))?.name;

const Portrait: React.FC<{id: string; initials: string; delay: number; width: number; height: number; mono?: number}> = ({id, initials, delay, width, height, mono = 0}) => {
  const frame = useFrame();
  const reveal = interpolate(frame - delay, [0, 45], [0, 1], {...clamp, easing: ease});
  const src = photo(id);
  const zoom = 1.12 - 0.08 * interpolate(frame - delay, [0, 300], [0, 1], clamp);
  return (
    <div style={{width, height, position: 'relative', border: `1.5px solid ${cine.gold}`, padding: 10, opacity: reveal > 0 ? 1 : 0}}>
      <div style={{width: '100%', height: '100%', overflow: 'hidden', clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`, position: 'relative', background: '#15161c'}}>
        {src ? (
          <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, filter: `grayscale(${0.3 + 0.7 * mono}) contrast(1.05) sepia(0.15)`}} />
        ) : (
          <svg width="100%" height="100%" viewBox="0 0 100 120" preserveAspectRatio="xMidYMid slice" style={{transform: `scale(${zoom})`}}>
            <defs>
              <radialGradient id={`pg-${id}`} cx="50%" cy="35%" r="70%">
                <stop offset="0%" stopColor="#3a3226" />
                <stop offset="100%" stopColor="#0c0d11" />
              </radialGradient>
            </defs>
            <rect width={100} height={120} fill={`url(#pg-${id})`} />
            <circle cx={50} cy={46} r={17} fill="#050507" />
            <path d="M14,120 Q14,74 50,70 Q86,74 86,120Z" fill="#050507" />
            <text x={50} y={51} textAnchor="middle" fontFamily={serif} fontWeight={500} fontSize={12} fill={cine.gold}>
              {initials}
            </text>
          </svg>
        )}
      </div>
    </div>
  );
};

const LEADERS = [
  {id: 'vazgen', initials: 'Վ Ս', name: 'Վազգեն Սարգսյան', role: 'Վարչապետ', years: '1959 – 1999', note: 'Պաշտպանության նախկին նախարար'},
  {id: 'demirchyan', initials: 'Կ Դ', name: 'Կարեն Դեմիրճյան', role: 'Ազգային ժողովի նախագահ', years: '1932 – 1999', note: 'Խորհրդային Հայաստանի ղեկավար 1974–1988'},
];

export const CLeaders: React.FC<Props> = ({scene}) => {
  const [l1, l2] = scene.lines;
  return (
    <AbsoluteFill style={{background: `linear-gradient(${cine.black}, #121015 60%, ${cine.black})`}}>
      <Bokeh count={10} />
      <Chapter n={2} title="Առաջնորդները" />
      {LEADERS.map((p, i) => {
        const delay = i ? l2.start : l1.start;
        return (
          <div key={p.id} style={{position: 'absolute', top: 440 + i * 470, left: 80, right: 80, display: 'flex', gap: 46, alignItems: 'center', flexDirection: i ? 'row-reverse' : 'row'}}>
            <Portrait id={p.id} initials={p.initials} delay={delay} width={330} height={410} />
            <div style={{flex: 1, textAlign: i ? 'right' : 'left'}}>
              <FadeUp delay={delay + 20}>
                <SmallCaps size={22}>{p.role}</SmallCaps>
              </FadeUp>
              <FadeUp delay={delay + 30}>
                <div style={{fontFamily: serif, fontWeight: 500, fontSize: 64, color: cine.cream, lineHeight: 1.05, margin: '16px 0'}}>{p.name}</div>
              </FadeUp>
              <FadeUp delay={delay + 42}>
                <div style={{fontFamily: serif, fontWeight: 300, fontSize: 40, color: cine.gold}}>{p.years}</div>
              </FadeUp>
              <FadeUp delay={delay + 54}>
                <div style={{fontFamily: sans, fontWeight: 500, fontSize: 24, color: cine.muted, marginTop: 14, lineHeight: 1.4}}>{p.note}</div>
              </FadeUp>
            </div>
          </div>
        );
      })}
      <Sfx name="shutter" at={l1.start + 5} volume={0.25} />
      <Sfx name="shutter" at={l2.start + 5} volume={0.25} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Attack
const Archive: React.FC<{chaos: number; intruders: number}> = ({chaos, intruders}) => {
  const frame = useFrame();
  return (
    <div style={{width: 920, height: 620, position: 'relative', overflow: 'hidden', border: `1px solid ${cine.goldSoft}`, background: '#120d0b'}}>
      <svg width="100%" height="100%" viewBox="0 0 800 540" preserveAspectRatio="xMidYMid slice" style={{filter: 'blur(1.4px) sepia(0.5) contrast(1.1)'}}>
        <rect width={800} height={540} fill="#3b2a22" />
        <rect width={800} height={140} fill="#4d382c" />
        {[150, 195, 240, 285].map((y, r) =>
          Array.from({length: 9 + r * 2}).map((_, i) => (
            <Deputy key={`${r}-${i}`} x={400 - (180 + r * 60) + (i * (2 * (180 + r * 60))) / (8 + r * 2)} y={y + chaos * 14 * random(`d${r}${i}`)} scale={0.9 + r * 0.1} color="#7d7468" seed={i + r * 9} />
          )),
        )}
        <rect x={150} y={340} width={500} height={28} rx={6} fill="#22170f" />
        {Array.from({length: 5}).map((_, i) => (
          <g key={i} transform={`translate(${-60 + intruders * 280 - i * 55} 470)`} opacity={intruders > 0 ? 1 : 0}>
            <circle cx={0} cy={-88} r={11} fill="#050505" />
            <path d="M-16,-74 Q0,-82 16,-74 L18,-20 L-18,-20Z" fill="#050505" />
            <rect x={-12} y={-22} width={9} height={36} fill="#050505" />
            <rect x={3} y={-22} width={9} height={36} fill="#050505" />
          </g>
        ))}
      </svg>
      <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 2px, transparent 2px 4px)'}} />
      <div style={{position: 'absolute', inset: 0, background: cine.blood, opacity: chaos * 0.35, mixBlendMode: 'multiply'}} />
      <div style={{position: 'absolute', left: 26, top: 22, fontFamily: 'monospace', fontSize: 26, color: '#f2efe6', textShadow: '2px 0 #ff0040, -2px 0 #00e0ff'}}>
        <span style={{color: '#ff3b3b', opacity: Math.floor(frame / 15) % 2 ? 1 : 0.2}}>● </span>REC
      </div>
      <div style={{position: 'absolute', right: 26, bottom: 22, fontFamily: 'monospace', fontSize: 26, color: '#f2efe6', textShadow: '2px 0 #ff0040, -2px 0 #00e0ff'}}>OCT 27 1999</div>
    </div>
  );
};

export const CAttack: React.FC<Props> = ({scene}) => {
  const frame = useFrame();
  const [l1, l2, l3] = scene.lines;
  const enterAt = l2.start + Math.round(l2.duration * 0.35);
  const fireAt = l2.start + Math.round(l2.duration * 0.8);
  const blackAt = l3.start - 4;
  const shake = useShake(fireAt, 26, 30);
  const intruders = interpolate(frame, [enterAt, fireAt], [0, 1], clamp);
  const chaos = interpolate(frame, [fireAt, fireAt + 8], [0, 1], clamp);
  const toBlack = interpolate(frame, [blackAt, blackAt + 16], [0, 1], clamp);
  const lineP = interpolate(frame, [l1.start, fireAt], [0, 1], clamp);
  const events: [number, string, string][] = [
    [l1.start + 10, 'Երեկո', 'Նիստը՝ ուղիղ եթերում'],
    [enterAt, '≈ 17:15', 'Զինված ներխուժում'],
    [fireAt, '17:15', 'Կրակոցներ դահլիճում'],
  ];
  return (
    <AbsoluteFill style={{background: cine.black}}>
      <Chapter n={3} title="Հոկտեմբերի 27" />
      <AbsoluteFill style={{transform: `translate(${shake.x}px, ${shake.y}px)`, alignItems: 'center', paddingTop: 420}}>
        <FadeUp delay={4}>
          <Archive chaos={chaos} intruders={intruders} />
        </FadeUp>
        {/* Timeline of the evening */}
        <div style={{position: 'relative', width: 920, height: 380, marginTop: 50}}>
          <div style={{position: 'absolute', left: 40, top: 0, width: 2, height: 360 * lineP, background: `linear-gradient(${cine.gold}, ${cine.blood})`}} />
          {events.map(([at, time, label], i) => (
            <div key={label} style={{position: 'absolute', left: 30, top: i * 120, display: 'flex', alignItems: 'center', gap: 34, opacity: interpolate(frame - at, [0, 15], [0, 1], clamp)}}>
              <div style={{width: 22, height: 22, borderRadius: 22, background: i === 2 ? cine.blood : cine.gold, boxShadow: `0 0 20px ${i === 2 ? cine.blood : cine.gold}`}} />
              <div>
                <div style={{fontFamily: serif, fontWeight: 500, fontSize: 44, color: i === 2 ? '#d84a3a' : cine.gold}}>{time}</div>
                <div style={{fontFamily: sans, fontWeight: 500, fontSize: 28, color: cine.cream}}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'white', opacity: interpolate(frame - fireAt, [0, 2, 14], [0, 0.9, 0], clamp)}} />
      <AbsoluteFill style={{background: cine.black, opacity: toBlack, alignItems: 'center', justifyContent: 'center', paddingBottom: 300}}>
        <Resolve delay={blackAt + 20}>
          <div style={{fontFamily: serif, fontWeight: 500, fontSize: 88, color: cine.cream, textAlign: 'center'}}>Վազգեն Սարգսյան</div>
        </Resolve>
        <GoldLine delay={blackAt + 40} width={520} style={{margin: '30px auto'}} />
        <Resolve delay={blackAt + 50} tracking={0.2}>
          <div style={{fontFamily: serif, fontWeight: 300, fontSize: 52, color: cine.gold, textAlign: 'center'}}>1959 – 1999</div>
        </Resolve>
      </AbsoluteFill>
      {[0, 1, 2, 3].map((i) => (
        <Sfx key={i} name="heartbeat" at={l1.start + i * 26} volume={0.25 + i * 0.1} />
      ))}
      <Sfx name="riser" at={fireAt - 66} volume={0.35} />
      <Sfx name="impact" at={fireAt} volume={0.8} />
      <Sfx name="static" at={fireAt} volume={0.15} />
      <Sfx name="bell" at={blackAt + 20} volume={0.35} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Victims
export const CVictims: React.FC<Props> = ({scene}) => {
  const frame = useFrame();
  const start = scene.lines[0].start + 10;
  return (
    <AbsoluteFill style={{background: '#0b0b0d'}}>
      {/* Dark stone wall */}
      <AbsoluteFill style={{opacity: 0.55}}>
        <svg width="100%" height="100%">
          <filter id="stone">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves={4} seed={7} />
            <feDiffuseLighting lightingColor="#5a5650" surfaceScale={2.2}>
              <feDistantLight azimuth={45} elevation={55} />
            </feDiffuseLighting>
          </filter>
          <rect width="100%" height="100%" filter="url(#stone)" />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 20%, rgba(0,0,0,0.85) 80%)'}} />
      <Chapter n={4} title="Զոհերը" />
      <div style={{position: 'absolute', top: 400, left: 0, right: 0, textAlign: 'center'}}>
        <Resolve delay={8}>
          <div style={{fontFamily: serif, fontWeight: 300, fontSize: 200, color: cine.gold, lineHeight: 1}}>8</div>
        </Resolve>
      </div>
      <div style={{position: 'absolute', top: 630, left: 0, right: 0, textAlign: 'center'}}>
        {VICTIMS.map(([name, role], i) => {
          const at = start + i * 11;
          const p = interpolate(frame - at, [0, 30], [0, 1], {...clamp, easing: ease});
          const sweep = interpolate(frame - at, [0, 45], [-30, 130], clamp);
          return (
            <div key={name} style={{marginBottom: 14, opacity: p}}>
              <div
                style={{
                  fontFamily: serif,
                  fontWeight: 500,
                  fontSize: 42,
                  backgroundImage: `linear-gradient(100deg, ${cine.gold} ${sweep - 20}%, #fff3d0 ${sweep}%, ${cine.gold} ${sweep + 20}%)`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  textShadow: '0 2px 2px rgba(0,0,0,0.6)',
                }}
              >
                {name}
              </div>
              <div style={{fontFamily: sans, fontWeight: 500, fontSize: 17, letterSpacing: '0.25em', color: cine.muted, textTransform: 'uppercase', marginTop: 0}}>{role}</div>
            </div>
          );
        })}
      </div>
      <Sfx name="bell" at={6} volume={0.3} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Siege
const Skyline: React.FC<{lit: number}> = ({lit}) => {
  const frame = useFrame();
  const blocks = Array.from({length: 22}).map((_, i) => ({x: i * 50 - 10, w: 40 + random(`bw${i}`) * 30, h: 90 + random(`bh${i}`) * 200}));
  return (
    <svg width={W} height={340} viewBox="0 0 1080 340">
      {blocks.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={340 - b.h} width={b.w} height={b.h} fill="#08090d" />
          {Array.from({length: Math.floor(b.h / 34)}).map((_, j) =>
            random(`win${i}-${j}`) > 0.55 ? (
              <rect key={j} x={b.x + 10 + (j % 2) * 16} y={340 - b.h + 14 + j * 30} width={8} height={12} fill={cine.gold} opacity={lit * (0.4 + 0.5 * Math.abs(Math.sin(frame / 50 + i + j)))} />
            ) : null,
          )}
        </g>
      ))}
    </svg>
  );
};

export const CSiege: React.FC<Props> = ({scene}) => {
  const frame = useFrame();
  const [, l2, l3] = scene.lines;
  const dawn = interpolate(frame, [l3.start - 10, l3.start + 90], [0, 1], {...clamp, easing: ease});
  const top = interpolateColors(dawn, [0, 0.5, 1], ['#04060f', '#2b1a3a', '#6d86b8']);
  const mid = interpolateColors(dawn, [0, 0.5, 1], ['#0b1024', '#a3474a', '#f0b27a']);
  const hours = interpolate(frame, [0, l3.start + 60], [18, 34], clamp);
  const h = Math.floor(hours) % 24;
  const m = Math.floor((hours % 1) * 60);
  return (
    <AbsoluteFill style={{background: `linear-gradient(${top} 0%, ${mid} 75%)`}}>
      {Array.from({length: 90}).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: random(`st${i}`) * W,
            top: random(`sy${i}`) * 1100,
            width: 3,
            height: 3,
            borderRadius: 3,
            background: 'white',
            opacity: (1 - dawn) * (0.2 + 0.8 * Math.abs(Math.sin(frame / 25 + i))),
          }}
        />
      ))}
      {/* Sun rising behind Ararat */}
      <div style={{position: 'absolute', left: 560, top: interpolate(dawn, [0, 1], [1450, 1060]), width: 260, height: 260, borderRadius: 260, background: 'radial-gradient(circle, #ffe2a8 0%, #f2a35e 45%, transparent 70%)', opacity: dawn}} />
      <div style={{position: 'absolute', left: -60, top: 1080}}>
        <Ararat width={1200} color={interpolateColors(dawn, [0, 1], ['#0d0f18', '#4b4960'])} snow={interpolateColors(dawn, [0, 1], ['#3b3f4c', '#fff4e0'])} />
      </div>
      <div style={{position: 'absolute', left: 0, top: 1150}}>
        <Skyline lit={1 - dawn * 0.85} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1488, bottom: 0, background: '#050508'}} />
      <Chapter n={5} title="Պատանդների գիշերը" />
      <div style={{position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{fontFamily: serif, fontWeight: 300, fontSize: 150, color: cine.cream, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 40px ${cine.gold}44`}}>
          {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}
        </div>
        <SmallCaps size={22}>{dawn > 0.5 ? 'Հոկտեմբերի 28' : 'Հոկտեմբերի 27–28'}</SmallCaps>
      </div>
      <FadeUp delay={l2.start + 10} style={{position: 'absolute', top: 760, left: 0, right: 0, textAlign: 'center', opacity: 1 - dawn}}>
        <div style={{fontFamily: serif, fontWeight: 500, fontSize: 52, color: cine.cream}}>Ռոբերտ Քոչարյան</div>
        <SmallCaps size={20} color={cine.muted} style={{marginTop: 10}}>
          Բանակցություններ
        </SmallCaps>
      </FadeUp>
      {dawn > 0.2 && (
        <FadeUp delay={l3.start + 50} style={{position: 'absolute', top: 780, left: 0, right: 0, textAlign: 'center'}}>
          <div style={{fontFamily: serif, fontWeight: 500, fontSize: 70, color: '#fff7e6', textShadow: '0 4px 30px rgba(0,0,0,0.5)'}}>Պատանդներն ազատ են</div>
        </FadeUp>
      )}
      <Sfx name="siren" at={10} volume={0.06} />
      <Sfx name="riser" at={l3.start - 10} volume={0.2} />
      <Sfx name="bell" at={l3.start + 50} volume={0.25} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Aftermath
export const CAftermath: React.FC<Props> = ({scene}) => {
  const frame = useFrame();
  const [l1, l2, l3] = scene.lines;
  const stampAt = l1.start + 50;
  const stamp = interpolate(frame - stampAt, [0, 6], [2.4, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const shake = useShake(stampAt + 6, 10, 12);
  const part = frame < l2.start - 4 ? 0 : frame < l3.start - 4 ? 1 : 2;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #17140f 0%, ${cine.black} 70%)`}}>
      <Chapter n={6} title="Հետևանքները" />
      {part === 0 && (
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 450, transform: `translate(${shake.x}px, ${shake.y}px)`}}>
          <FadeUp delay={l1.start}>
            <div style={{width: 760, height: 900, background: '#e9e0cb', boxShadow: '0 40px 80px rgba(0,0,0,0.7)', padding: 60, position: 'relative', transform: 'rotate(-2deg)'}}>
              <div style={{fontFamily: serif, fontWeight: 700, fontSize: 40, color: '#2a241b', textAlign: 'center', letterSpacing: '0.15em'}}>ԴԱՏԱՎՃԻՌ</div>
              <div style={{fontFamily: serif, fontWeight: 500, fontSize: 30, color: '#5a5041', textAlign: 'center', marginTop: 10}}>Երևան · 2003</div>
              <div style={{height: 2, background: '#2a241b', margin: '30px 0'}} />
              {Array.from({length: 14}).map((_, i) => (
                <div key={i} style={{height: 10, background: '#b8ad94', marginBottom: 24, width: `${72 + ((i * 41) % 28)}%`}} />
              ))}
              {frame >= stampAt && (
                <div
                  style={{
                    position: 'absolute',
                    right: 70,
                    bottom: 120,
                    transform: `rotate(-14deg) scale(${stamp})`,
                    border: `8px solid ${cine.blood}`,
                    borderRadius: 14,
                    padding: '14px 34px',
                    fontFamily: serif,
                    fontWeight: 700,
                    fontSize: 92,
                    color: cine.blood,
                    opacity: 0.88,
                    mixBlendMode: 'multiply',
                  }}
                >
                  ՑՄԱՀ
                </div>
              )}
            </div>
          </FadeUp>
        </AbsoluteFill>
      )}
      {part === 1 && (
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 460}}>
          <div style={{display: 'flex', gap: 40}}>
            <Portrait id="vazgen" initials="Վ Ս" delay={l2.start} width={400} height={500} mono={interpolate(frame, [l2.start + 20, l2.start + 80], [0, 1], clamp)} />
            <Portrait id="demirchyan" initials="Կ Դ" delay={l2.start + 12} width={400} height={500} mono={interpolate(frame, [l2.start + 20, l2.start + 80], [0, 1], clamp)} />
          </div>
          <FadeUp delay={l2.start + 40} style={{marginTop: 60, textAlign: 'center'}}>
            <div style={{fontFamily: serif, fontWeight: 500, fontSize: 64, color: cine.cream}}>Մեկ օրում՝</div>
            <div style={{fontFamily: serif, fontWeight: 300, fontSize: 64, color: cine.gold}}>երկու առաջնորդ</div>
          </FadeUp>
        </AbsoluteFill>
      )}
      {part === 2 && (
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 470}}>
          <Resolve delay={l3.start}>
            <div style={{fontFamily: serif, fontWeight: 300, fontSize: 520, lineHeight: 1, color: cine.cream, textShadow: `0 0 60px ${cine.gold}44`}}>?</div>
          </Resolve>
          <GoldLine delay={l3.start + 30} width={500} style={{margin: '20px auto 40px'}} />
          <Resolve delay={l3.start + 40}>
            <div style={{fontFamily: serif, fontWeight: 500, fontSize: 64, color: cine.cream, textAlign: 'center'}}>Անպատասխան հարցեր</div>
          </Resolve>
        </AbsoluteFill>
      )}
      <Sfx name="whoosh" at={l1.start} volume={0.15} />
      <Sfx name="gavel" at={stampAt + 5} volume={0.7} />
      <Sfx name="impact" at={stampAt + 5} volume={0.3} />
      <Sfx name="whoosh" at={l2.start} volume={0.15} />
      <Sfx name="riser" at={l3.start - 30} volume={0.15} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Memorial
export const CMemorial: React.FC<Props> = ({scene}) => {
  const frame = useFrame();
  const [l1, l2] = scene.lines;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 70%, #2a1c0e 0%, ${cine.black} 65%)`}}>
      <div style={{position: 'absolute', left: -60, top: 300, opacity: 0.35}}>
        <Ararat width={1200} color="#15130f" snow="#6b604c" />
      </div>
      <Bokeh count={26} />
      <div style={{position: 'absolute', top: 260, left: 0, right: 0, textAlign: 'center'}}>
        <Resolve delay={l1.start}>
          <div style={{fontFamily: serif, fontWeight: 500, fontSize: 150, color: cine.cream, textShadow: `0 0 50px ${cine.gold}55`}}>Հիշենք</div>
        </Resolve>
        <GoldLine delay={l1.start + 20} width={460} style={{margin: '10px auto 20px'}} />
        <Resolve delay={l1.start + 30} tracking={0.3}>
          <div style={{fontFamily: serif, fontWeight: 300, fontSize: 48, color: cine.gold}}>27 · 10 · 1999</div>
        </Resolve>
      </div>
      <div style={{position: 'absolute', top: 700, left: 60, right: 60, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', rowGap: 40}}>
        {VICTIMS.map(([name], i) => {
          const at = l1.start + 30 + i * 12;
          const lit = interpolate(frame, [at, at + 14], [0, 1], clamp);
          return (
            <div key={name} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <Candle size={190} lit={lit} />
              <div style={{fontFamily: serif, fontWeight: 500, fontSize: 26, color: cine.cream, textAlign: 'center', opacity: 0.25 + 0.75 * lit, marginTop: 10, lineHeight: 1.15}}>{name}</div>
            </div>
          );
        })}
      </div>
      <Sfx name="bell" at={l1.start} volume={0.4} />
      <Sfx name="bell" at={l2.start} volume={0.3} />
    </AbsoluteFill>
  );
};
