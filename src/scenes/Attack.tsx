import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, Flash, Label, Pop, Rise, Sfx, useShake} from '../fx';
import {Clock, Deputy, Silhouette, Static, TV} from '../illustrations';
import {pick, useLayout} from '../layout';
import {colors, font} from '../theme';
import {SceneData} from '../timeline';

// Cartoon parliament hall drawn inside the TV.
const Hall: React.FC<{intrude: number; chaos: number}> = ({intrude, chaos}) => {
  const frame = useCurrentFrame();
  const rows = [
    {y: 150, n: 9, r: 260},
    {y: 190, n: 11, r: 320},
    {y: 232, n: 13, r: 380},
    {y: 276, n: 15, r: 440},
  ];
  return (
    <svg width="100%" height="100%" viewBox="0 0 800 528" preserveAspectRatio="xMidYMid slice">
      <rect width={800} height={528} fill="#5b3a2c" />
      <rect width={800} height={120} fill="#7a5340" />
      {/* Back wall emblem */}
      <circle cx={400} cy={62} r={34} fill="#c9a227" opacity={0.85} />
      <rect x={340} y={100} width={120} height={50} fill="#3e2a20" />
      <text x={400} y={132} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={18} fill="#e8d9b0">
        ԱԺ
      </text>
      {/* Seat rows facing the podium */}
      {rows.map((row, ri) => (
        <g key={ri}>
          <rect x={400 - row.r} y={row.y + 6} width={row.r * 2} height={16} rx={6} fill="#3b2a22" />
          {Array.from({length: row.n}).map((_, i) => {
            const x = 400 - row.r + 30 + (i * (row.r * 2 - 60)) / (row.n - 1);
            const duck = chaos * (0.5 + 0.5 * Math.sin(i + ri));
            return <Deputy key={i} x={x} y={row.y + 6 + duck * 16} scale={0.9 + ri * 0.08} seed={i * 7 + ri} color={ri === 0 ? '#c7cbd6' : '#8a93a8'} />;
          })}
        </g>
      ))}
      {/* Government bench at the front */}
      <rect x={140} y={330} width={520} height={30} rx={8} fill="#2a1d17" />
      {/* Door on the left with intruders */}
      <rect x={20} y={300} width={70} height={140} fill={intrude > 0 ? '#1a0f0b' : '#4a3226'} stroke="#2a1d17" strokeWidth={6} />
      <rect x={0} y={420} width={800} height={108} fill="#4a2d22" />
      <rect x={0} y={420} width={800} height={8} fill="#8b1d1d" />
      {/* Camera shake of the broadcast once chaos starts */}
      <rect width={800} height={528} fill={colors.red} opacity={chaos * (0.25 + 0.1 * Math.sin(frame / 2))} />
    </svg>
  );
};

export const Attack: React.FC<{scene: SceneData}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {vertical, width} = useLayout();
  const [l1, l2, l3] = scene.lines;
  const enterAt = l2.start + Math.round(l2.duration * 0.35);
  const fireAt = l2.start + Math.round(l2.duration * 0.8);
  const blackAt = l3.start - 4;

  const walk = interpolate(frame, [enterAt, fireAt], [-200, 250], clamp);
  const chaos = interpolate(frame, [fireAt, fireAt + 10], [0, 1], clamp);
  const shake = useShake(fireAt, 40, 30);
  const tvW = pick(vertical, 960, 1020);
  const minutes = interpolate(frame, [0, l2.start + 20], [16 * 60 + 40, 17 * 60 + 15], clamp);
  const toBlack = interpolate(frame, [blackAt, blackAt + 10], [0, 1], clamp);

  // ECG line for the final beat.
  const ecgT = frame - blackAt;
  const ecgWidth = width * 0.8;
  const ecgProgress = interpolate(ecgT, [10, 100], [0, 1], clamp);
  const ecgPath = Array.from({length: 200}, (_, i) => {
    const x = (i / 199) * ecgWidth;
    const local = i % 40;
    const beats = i < 110; // heart stops after the third beat
    const y = beats && local >= 15 && local < 25 ? [0, -20, 70, -110, 40, 0, 0, -10, 0, 0][local - 15] : 0;
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${y}`;
  }).join('');

  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #2a1e1a 0%, ${colors.bg} 75%)`}}>
      <AbsoluteFill
        style={{
          transform: `translate(${shake.x}px, ${shake.y}px) rotate(${shake.r}deg)`,
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: pick(vertical, 420, 60),
        }}
      >
        <div style={{display: 'flex', flexDirection: vertical ? 'column-reverse' : 'row', alignItems: 'center', gap: pick(vertical, 50, 60)}}>
          <Pop delay={4}>
            <TV width={tvW}>
              <Hall intrude={frame >= enterAt ? 1 : 0} chaos={chaos} />
              {/* Five intruders walk in from the door */}
              {frame >= enterAt && (
                <div style={{position: 'absolute', left: 0, bottom: tvW * 0.08, width: '100%', height: tvW * 0.25}}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} style={{position: 'absolute', bottom: 0, left: (walk - i * 70) * (tvW / 800)}}>
                      <Silhouette height={tvW * 0.22} walking={frame < fireAt} phase={i * 1.3} />
                    </div>
                  ))}
                </div>
              )}
              <Static opacity={interpolate(frame, [fireAt, fireAt + 3, fireAt + 30], [0, 0.9, 0.25], clamp)} />
              {/* Breaking news ticker */}
              {frame >= fireAt && (
                <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, background: colors.red, padding: '10px 0', overflow: 'hidden', whiteSpace: 'nowrap'}}>
                  <div style={{fontFamily: font, fontWeight: 900, fontSize: tvW * 0.04, color: 'white', transform: `translateX(${tvW - (frame - fireAt) * 9}px)`}}>
                    ԿՐԱԿՈՑՆԵՐ ԽՈՐՀՐԴԱՐԱՆՈՒՄ • ԿՐԱԿՈՑՆԵՐ ԽՈՐՀՐԴԱՐԱՆՈՒՄ • ԿՐԱԿՈՑՆԵՐ ԽՈՐՀՐԴԱՐԱՆՈՒՄ
                  </div>
                </div>
              )}
            </TV>
          </Pop>
          <Pop delay={l1.start}>
            <div style={{display: 'flex', flexDirection: vertical ? 'row' : 'column', alignItems: 'center', gap: 20}}>
              <Clock size={pick(vertical, 190, 230)} minutes={minutes} />
              <Label size={pick(vertical, 30, 28)} color={colors.muted}>
                27.10.1999
              </Label>
            </div>
          </Pop>
        </div>
      </AbsoluteFill>
      <Flash at={fireAt} length={18} />
      {/* Final beat: fade to black, heart monitor stops */}
      <AbsoluteFill style={{background: 'black', opacity: toBlack, alignItems: 'center', justifyContent: 'center', paddingBottom: pick(vertical, 300, 120)}}>
        <svg width={ecgWidth} height={260} viewBox={`0 -130 ${ecgWidth} 260`} style={{opacity: toBlack}}>
          <path d={ecgPath} fill="none" stroke={colors.red} strokeWidth={5} strokeDasharray={ecgWidth * 3} strokeDashoffset={ecgWidth * 3 * (1 - ecgProgress)} strokeLinejoin="round" />
        </svg>
        <Rise delay={blackAt + 40}>
          <div style={{fontFamily: font, fontWeight: 800, fontSize: pick(vertical, 70, 72), color: colors.text, textAlign: 'center'}}>Վազգեն Սարգսյան</div>
          <div style={{fontFamily: font, fontWeight: 600, fontSize: pick(vertical, 44, 42), color: colors.muted, textAlign: 'center', marginTop: 10}}>1959 – 1999</div>
        </Rise>
      </AbsoluteFill>
      {Array.from({length: Math.floor((l2.start + 20) / 15)}).map((_, i) => (
        <Sfx key={i} name="tick" at={l1.start + i * 15} volume={0.25} />
      ))}
      <Sfx name="riser" at={fireAt - 66} volume={0.45} />
      <Sfx name="impact" at={fireAt} volume={0.9} />
      <Sfx name="static" at={fireAt} volume={0.35} />
      {[0, 1, 2].map((i) => (
        <Sfx key={i} name="heartbeat" at={blackAt + 16 + i * 18} volume={0.8} />
      ))}
      <Sfx name="flatline" at={blackAt + 64} volume={0.15} />
    </AbsoluteFill>
  );
};
