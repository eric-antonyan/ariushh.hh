import React from 'react';
import {useFrame} from '../time';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import mapData from '../data/map.json';
import {clamp, Label, Pop, Sfx, useSpring} from '../fx';
import {BallotBox, Parliament} from '../illustrations';
import {pick, useLayout} from '../layout';
import {colors, font} from '../theme';
import {SceneData} from '../timeline';

const map = mapData as {
  width: number;
  height: number;
  yerevan: [number, number];
  metsHayk: string;
  metsHaykProvinces: string[];
  artsakh: string;
  artsakhLabel: [number, number];
  metsHaykLabel: [number, number];
  countries: {iso: string; name: string; d: string}[];
};

// Same projection as scripts/build_map.py.
const project = (lon: number, lat: number): [number, number] => [(lon - 15) * 40 * Math.cos((41 * Math.PI) / 180), (58 - lat) * 40];

const LABELS: [string, number, number][] = [
  ['ՎՐԱՍՏԱՆ', 43.6, 42.1],
  ['ԱԴՐԲԵՋԱՆ', 49.3, 41.0],
  ['ԹՈՒՐՔԻԱ', 36.8, 39.2],
  ['ԻՐԱՆ', 47.5, 37.6],
  ['ՌՈՒՍԱՍՏԱՆ', 46.0, 43.1],
  ['Սև ծով', 37.5, 42.8],
  ['Կասպից ծով', 50.8, 41.3],
];

export const MapScene: React.FC<{scene: SceneData}> = ({scene}) => {
  const frame = useFrame();
  const {vertical, width, height} = useLayout();
  const l2 = scene.lines[1].start;
  const [yx, yy] = map.yerevan;

  // Zoom from the wide region to historical Greater Armenia (Mets Hayk), then into today's Armenia.
  const easing = Easing.inOut(Easing.cubic);
  const z1 = interpolate(frame, [0, 70], [0, 1], {...clamp, easing});
  const z2 = interpolate(frame, [95, 140], [0, 1], {...clamp, easing});
  const aspect = width / height;
  const wideW = map.width;
  const midW = vertical ? 640 : 1000;
  const tightW = vertical ? 380 : 640;
  const vw = wideW + (midW - wideW) * z1 + (tightW - midW) * z2;
  const vh = vw / aspect;
  const [hx, hy] = project(42.2, 39.6);
  // Keep the focus slightly off-centre so cards have room.
  const cx = hx + (yx - hx) * z2 + (vertical ? 0 : vw * 0.18);
  const cy = hy + (yy - hy) * z2 + (vertical ? vh * 0.2 : 0);
  const hayk = interpolate(frame, [30, 65], [0, 1], clamp);
  const viewBox = `${cx - vw / 2} ${cy - vh / 2} ${vw} ${vh}`;

  const pin = useSpring(125, {damping: 8, stiffness: 140});
  const ripple = ((frame - 135) % 45) / 45;
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
        {map.countries.map((c) =>
          c.iso === 'ARM' ? null : <path key={c.iso + c.name} d={c.d} fill="#1e2638" stroke="#3a4560" strokeWidth={1} />,
        )}
        {/* Greater Armenia (Mets Hayk): muted, approximate historical extent */}
        <path d={map.metsHayk} fill="#9aa1b3" fillOpacity={0.2 * hayk} stroke="#c3c8d4" strokeOpacity={0.7 * hayk} strokeWidth={vw / 500} strokeDasharray={`${vw / 120} ${vw / 180}`} />
        {map.metsHaykProvinces.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#c3c8d4" strokeOpacity={0.3 * hayk} strokeWidth={vw / 1100} />
        ))}
        <text x={map.metsHaykLabel[0]} y={map.metsHaykLabel[1]} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={vw / 26} fill="#c3c8d4" opacity={hayk * (1 - 0.7 * z2)}>
          Մեծ Հայք
        </text>
        <text x={map.metsHaykLabel[0]} y={map.metsHaykLabel[1] + vw / 30} textAnchor="middle" fontFamily={font} fontWeight={500} fontSize={vw / 60} fill="#9aa1b3" opacity={hayk * (1 - 0.7 * z2)}>
          պատմական տարածք · 15 նահանգ
        </text>
        {/* Armenia and Artsakh (its 1994-2020 extent, as in 1999) */}
        {[...map.countries.filter((c) => c.iso === 'ARM').map((c) => c.d), map.artsakh].map((d, i) => (
          <path key={i} d={d} fill="url(#armflag)" stroke="white" strokeWidth={2.5} opacity={interpolate(frame, [70, 100], [0.4, 1], clamp)} />
        ))}
        <text
          x={map.artsakhLabel[0] + vw / 25}
          y={map.artsakhLabel[1]}
          fontFamily={font}
          fontWeight={800}
          fontSize={vw / 32}
          fill="white"
          stroke="#0d1830"
          strokeWidth={vw / 250}
          paintOrder="stroke"
          opacity={interpolate(frame, [100, 120], [0, 1], clamp)}
        >
          Արցախ
        </text>
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
      <Sfx name="pop" at={127} volume={0.4} />
      <Sfx name="whoosh" at={95} volume={0.3} />
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
