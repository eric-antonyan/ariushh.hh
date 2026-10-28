import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import mapData from '../data/map.json';
import {clamp, Label, Pop, Sfx, useSpring} from '../fx';
import {BallotBox, Parliament} from '../illustrations';
import {pick, useLayout} from '../layout';
import {colors, font} from '../theme';
import {SceneData} from '../timeline';

const map = mapData as {width: number; height: number; yerevan: [number, number]; countries: {iso: string; name: string; d: string}[]};

// Same projection as scripts/build_map.py.
const project = (lon: number, lat: number): [number, number] => [(lon - 15) * 40 * Math.cos((41 * Math.PI) / 180), (58 - lat) * 40];

const LABELS: [string, number, number][] = [
  ['ՎՐԱՍՏԱՆ', 43.6, 42.1],
  ['ԱԴՐԲԵՋԱՆ', 47.9, 40.6],
  ['ԹՈՒՐՔԻԱ', 41.2, 39.4],
  ['ԻՐԱՆ', 47.5, 37.6],
  ['ՌՈՒՍԱՍՏԱՆ', 46.0, 43.1],
  ['Սև ծով', 37.5, 42.8],
  ['Կասպից ծով', 50.8, 41.3],
];

export const MapScene: React.FC<{scene: SceneData}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {vertical, width, height} = useLayout();
  const l2 = scene.lines[1].start;
  const [yx, yy] = map.yerevan;

  // Zoom from the wide region into Armenia.
  const z = interpolate(frame, [0, 75], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const aspect = width / height;
  const wideW = map.width;
  const tightW = vertical ? 380 : 640;
  const vw = wideW + (tightW - wideW) * z;
  const vh = vw / aspect;
  // Keep Yerevan slightly off-centre so cards have room.
  const cx = yx + (vertical ? 0 : vw * 0.18);
  const cy = yy + (vertical ? vh * 0.2 : 0);
  const viewBox = `${cx - vw / 2} ${cy - vh / 2} ${vw} ${vh}`;

  const pin = useSpring(70, {damping: 8, stiffness: 140});
  const ripple = ((frame - 80) % 45) / 45;
  const labelsIn = interpolate(frame, [55, 80], [0, 1], clamp);
  const cardLeft = vertical ? width / 2 : width * 0.66;
  const cardTop = vertical ? 1120 : height * 0.45;
  const swap = interpolate(frame, [l2 - 6, l2 + 6], [0, 1], clamp);

  return (
    <AbsoluteFill style={{background: '#0d1830'}}>
      <svg width={width} height={height} viewBox={viewBox} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="armflag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.red} />
            <stop offset="33%" stopColor={colors.red} />
            <stop offset="33%" stopColor={colors.blue} />
            <stop offset="66%" stopColor={colors.blue} />
            <stop offset="66%" stopColor={colors.apricot} />
            <stop offset="100%" stopColor={colors.apricot} />
          </linearGradient>
          <pattern id="grid" width={40} height={40} patternUnits="userSpaceOnUse">
            <path d="M40,0 L0,0 0,40" fill="none" stroke="#1b2a4a" strokeWidth={1} />
          </pattern>
        </defs>
        <rect x={-2000} y={-2000} width={6000} height={6000} fill="url(#grid)" />
        {map.countries.map((c) => (
          <path
            key={c.iso + c.name}
            d={c.d}
            fill={c.iso === 'ARM' ? 'url(#armflag)' : '#1e2638'}
            stroke={c.iso === 'ARM' ? 'white' : '#3a4560'}
            strokeWidth={c.iso === 'ARM' ? 2.5 : 1}
            opacity={c.iso === 'ARM' ? interpolate(frame, [40, 60], [0.4, 1], clamp) : 1}
          />
        ))}
        {LABELS.map(([name, lon, lat]) => {
          const [x, y] = project(lon, lat);
          const sea = name.includes('ծով');
          return (
            <text
              key={name}
              x={x}
              y={y}
              textAnchor="middle"
              fontFamily={font}
              fontWeight={sea ? 500 : 800}
              fontStyle={sea ? 'italic' : 'normal'}
              fontSize={vw / 50}
              letterSpacing={sea ? 0 : vw / 400}
              fill={sea ? '#6f8fc9' : '#7d879c'}
              opacity={labelsIn}
            >
              {name}
            </text>
          );
        })}
        {/* Yerevan pin */}
        <circle cx={yx} cy={yy} r={(vw / 30) * ripple} fill="none" stroke={colors.yellow} strokeWidth={vw / 400} opacity={frame > 80 ? 1 - ripple : 0} />
        <g transform={`translate(${yx} ${yy - (1 - pin) * vw * 0.2}) scale(${(vw / 900) * Math.max(0.001, pin)})`}>
          <path d="M0,0 C-14,-22 -22,-30 -22,-44 A22,22 0 1 1 22,-44 C22,-30 14,-22 0,0Z" fill={colors.yellow} stroke="#1b1b1b" strokeWidth={3} />
          <circle cx={0} cy={-44} r={8} fill="#1b1b1b" />
          <text x={30} y={-36} fontFamily={font} fontWeight={800} fontSize={30} fill="white" stroke="#0d1830" strokeWidth={6} paintOrder="stroke">
            Երևան
          </text>
        </g>
      </svg>
      <div style={{position: 'absolute', top: pick(vertical, 120, 60), left: pick(vertical, 0, 70), right: pick<number | 'auto'>(vertical, 0, 'auto'), textAlign: 'center'}}>
        <Label size={pick(vertical, 40, 34)} color={colors.text} style={{opacity: labelsIn}}>
          Հայաստան · 1999
        </Label>
      </div>
      {/* Cards: the parliament building, then the election ballot box */}
      <div style={{position: 'absolute', left: cardLeft, top: cardTop, transform: 'translate(-50%, -50%)'}}>
        <div style={{position: 'absolute', transform: 'translate(-50%, -50%)', opacity: 1 - swap}}>
          <Pop delay={scene.lines[0].start + 10}>
            <Card title="Ազգային ժողով">
              <Parliament width={pick(vertical, 520, 480)} />
            </Card>
          </Pop>
        </div>
        <div style={{position: 'absolute', transform: 'translate(-50%, -50%)', opacity: swap}}>
          <Pop delay={l2}>
            <Card title="«Միասնություն» դաշինքը հաղթում է">
              <div style={{display: 'flex', justifyContent: 'center'}}>
                <BallotBox size={pick(vertical, 300, 280)} drops={[l2 + 12, l2 + 24, l2 + 36, l2 + 48]} />
              </div>
            </Card>
          </Pop>
        </div>
      </div>
      <Sfx name="whoosh" at={2} volume={0.45} />
      <Sfx name="pop" at={72} volume={0.4} />
      <Sfx name="pop" at={scene.lines[0].start + 10} volume={0.3} />
      {[12, 24, 36, 48].map((d) => (
        <Sfx key={d} name="tick" at={l2 + d + 11} volume={0.5} />
      ))}
    </AbsoluteFill>
  );
};

const Card: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => {
  const {vertical} = useLayout();
  return (
    <div style={{background: 'rgba(15,20,32,0.92)', border: '3px solid #f5f2ea', borderRadius: 24, padding: 28, boxShadow: '12px 12px 0 #000', minWidth: pick(vertical, 600, 540)}}>
      <div style={{fontFamily: font, fontWeight: 800, fontSize: pick(vertical, 40, 34), color: colors.text, marginBottom: 14, textAlign: 'center'}}>{title}</div>
      {children}
    </div>
  );
};
