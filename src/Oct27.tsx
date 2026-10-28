import {AbsoluteFill, interpolate, Series, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background, Body, DrawLine, Heading, Kicker, Reveal, SceneFade} from './components';
import {colors, fonts} from './theme';

const SCENES = {
  intro: 150,
  context: 300,
  attack: 330,
  victims: 390,
  siege: 300,
  aftermath: 300,
  memorial: 270,
};

export const TOTAL_FRAMES = Object.values(SCENES).reduce((a, b) => a + b, 0);

const pad = {padding: '0 160px', justifyContent: 'center'} as const;

const Intro: React.FC = () => (
  <AbsoluteFill style={pad}>
    <Reveal delay={5}>
      <Kicker>Yerevan · 27 October 1999</Kicker>
    </Reveal>
    <DrawLine delay={15} />
    <Reveal delay={25}>
      <Heading size={110}>The Armenian Parliament Shooting</Heading>
    </Reveal>
    <Reveal delay={50} style={{marginTop: 30}}>
      <Body>How Prime Minister Vazgen Sargsyan was killed — a short summary</Body>
    </Reveal>
  </AbsoluteFill>
);

const PersonCard: React.FC<{name: string; role: string; lines: string[]; delay: number; accent: string}> = ({
  name,
  role,
  lines,
  delay,
  accent,
}) => {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('');
  return (
    <Reveal delay={delay} style={{flex: 1}}>
      <div style={{background: colors.panel, borderTop: `6px solid ${accent}`, padding: 44, borderRadius: 8, height: 470}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              border: `3px solid ${accent}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: fonts.serif,
              fontSize: 46,
              color: colors.text,
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{fontFamily: fonts.serif, fontSize: 52, color: colors.text}}>{name}</div>
            <div style={{fontFamily: fonts.sans, fontSize: 30, color: accent, marginTop: 6}}>{role}</div>
          </div>
        </div>
        <div style={{marginTop: 34}}>
          {lines.map((l, i) => (
            <Reveal key={l} delay={delay + 20 + i * 12}>
              <div style={{fontFamily: fonts.sans, fontSize: 32, color: colors.muted, lineHeight: 1.5}}>• {l}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </Reveal>
  );
};

const Context: React.FC = () => (
  <AbsoluteFill style={pad}>
    <Reveal>
      <Kicker>The context</Kicker>
    </Reveal>
    <DrawLine delay={10} />
    <div style={{display: 'flex', gap: 60}}>
      <PersonCard
        name="Vazgen Sargsyan"
        role="Prime Minister"
        accent={colors.red}
        delay={20}
        lines={['Became Prime Minister in June 1999', 'Former Defence Minister', 'Military leader of the Karabakh war']}
      />
      <PersonCard
        name="Karen Demirchyan"
        role="Speaker of Parliament"
        accent={colors.blue}
        delay={40}
        lines={['Elected Speaker in June 1999', 'Led Soviet Armenia, 1974–1988', 'Allied with Sargsyan']}
      />
    </div>
    <Reveal delay={110} style={{marginTop: 50}}>
      <Body>
        Their <span style={{color: colors.text}}>Unity (Miasnutyun)</span> bloc won the May 1999 election. Together they
        were the most powerful pair in Armenian politics.
      </Body>
    </Reveal>
  </AbsoluteFill>
);

const Clock: React.FC = () => {
  const frame = useCurrentFrame();
  // Sweep from 16:45 to roughly 17:15 local time.
  const minutes = interpolate(frame, [0, 90], [16 * 60 + 45, 17 * 60 + 15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  const minuteAngle = (minutes % 60) * 6;
  const hourAngle = (minutes / 60) * 30;
  const pulse = frame > 90 ? 0.5 + 0.5 * Math.sin((frame - 90) / 4) : 0;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
      <svg width={320} height={320} viewBox="-100 -100 200 200">
        <circle r={92} fill="none" stroke={colors.muted} strokeWidth={3} />
        <circle r={98} fill="none" stroke={colors.red} strokeWidth={4} opacity={pulse} />
        {Array.from({length: 12}).map((_, i) => (
          <line
            key={i}
            x1={0}
            y1={-80}
            x2={0}
            y2={-90}
            stroke={colors.muted}
            strokeWidth={3}
            transform={`rotate(${i * 30})`}
          />
        ))}
        <line x1={0} y1={0} x2={0} y2={-45} stroke={colors.text} strokeWidth={6} strokeLinecap="round" transform={`rotate(${hourAngle})`} />
        <line x1={0} y1={0} x2={0} y2={-70} stroke={colors.red} strokeWidth={4} strokeLinecap="round" transform={`rotate(${minuteAngle})`} />
        <circle r={6} fill={colors.text} />
      </svg>
      <div style={{fontFamily: fonts.sans, fontSize: 56, color: colors.text, fontVariantNumeric: 'tabular-nums'}}>
        ≈ {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}
      </div>
    </div>
  );
};

const Attack: React.FC = () => (
  <AbsoluteFill style={{...pad, flexDirection: 'row', alignItems: 'center', gap: 120}}>
    <Clock />
    <div style={{flex: 1}}>
      <Reveal>
        <Kicker color={colors.red}>The attack</Kicker>
      </Reveal>
      <DrawLine delay={10} />
      <Reveal delay={20}>
        <Body>A session of the National Assembly is under way, with TV cameras in the hall.</Body>
      </Reveal>
      <Reveal delay={70} style={{marginTop: 24}}>
        <Body>
          <span style={{color: colors.text}}>Five gunmen led by Nairi Hunanyan</span>, a former journalist, walk in with
          rifles hidden under their coats.
        </Body>
      </Reveal>
      <Reveal delay={130} style={{marginTop: 24}}>
        <Body>
          They open fire on the government benches. <span style={{color: colors.text}}>Vazgen Sargsyan</span> is shot at
          close range and killed.
        </Body>
      </Reveal>
    </div>
  </AbsoluteFill>
);

const VICTIMS = [
  ['Vazgen Sargsyan', 'Prime Minister'],
  ['Karen Demirchyan', 'Speaker of Parliament'],
  ['Yuri Bakhshyan', 'Deputy Speaker'],
  ['Ruben Miroyan', 'Deputy Speaker'],
  ['Leonard Petrosyan', 'Minister of Operative Affairs'],
  ['Henrik Abrahamyan', 'Member of Parliament'],
  ['Armenak Armenakyan', 'Member of Parliament'],
  ['Mikayel Kotanyan', 'Member of Parliament'],
];

const Victims: React.FC = () => (
  <AbsoluteFill style={pad}>
    <Reveal>
      <Kicker>Eight people were killed</Kicker>
    </Reveal>
    <DrawLine delay={10} />
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '26px 80px'}}>
      {VICTIMS.map(([name, role], i) => (
        <Reveal key={name} delay={25 + i * 18}>
          <div style={{borderLeft: `4px solid ${i < 2 ? colors.red : colors.muted}`, paddingLeft: 26}}>
            <div style={{fontFamily: fonts.serif, fontSize: 46, color: colors.text}}>{name}</div>
            <div style={{fontFamily: fonts.sans, fontSize: 28, color: colors.muted, marginTop: 4}}>{role}</div>
          </div>
        </Reveal>
      ))}
    </div>
  </AbsoluteFill>
);

const NightToDay: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [120, 220], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // Moon sets on the right, then the sun rises on the left and climbs.
  const x = t < 0.5 ? interpolate(t, [0, 0.5], [170, 290]) : interpolate(t, [0.5, 1], [30, 110]);
  const y = t < 0.5 ? interpolate(t, [0, 0.5], [50, 140]) : interpolate(t, [0.5, 1], [140, 55]);
  const sky = `rgb(${Math.round(interpolate(t, [0, 1], [15, 45]))}, ${Math.round(interpolate(t, [0, 1], [20, 70]))}, ${Math.round(
    interpolate(t, [0, 1], [45, 110]),
  )})`;
  return (
    <svg width={320} height={260} viewBox="0 0 320 260">
      <rect x={0} y={0} width={320} height={220} rx={12} fill={sky} />
      <circle cx={x} cy={y} r={26} fill={t < 0.5 ? '#e8e6dc' : colors.apricot} />
      {/* Simple silhouette of the parliament building */}
      <rect x={60} y={150} width={200} height={70} fill="#0b0d12" />
      <rect x={130} y={120} width={60} height={30} fill="#0b0d12" />
      {[80, 115, 150, 185, 220].map((cx) => (
        <rect key={cx} x={cx} y={165} width={14} height={40} fill={t > 0.5 ? '#3a3f4d' : '#c9a227'} opacity={0.8} />
      ))}
      <text x={160} y={250} textAnchor="middle" fill={colors.muted} fontFamily={fonts.sans} fontSize={22}>
        {t < 0.5 ? 'Night of 27 Oct' : 'Morning of 28 Oct'}
      </text>
    </svg>
  );
};

const Siege: React.FC = () => (
  <AbsoluteFill style={{...pad, flexDirection: 'row', alignItems: 'center', gap: 120}}>
    <NightToDay />
    <div style={{flex: 1}}>
      <Reveal>
        <Kicker>The siege</Kicker>
      </Reveal>
      <DrawLine delay={10} />
      <Reveal delay={20}>
        <Body>Dozens of deputies and officials are held hostage in the building through the night.</Body>
      </Reveal>
      <Reveal delay={75} style={{marginTop: 24}}>
        <Body>
          President <span style={{color: colors.text}}>Robert Kocharyan</span> negotiates with the gunmen.
        </Body>
      </Reveal>
      <Reveal delay={140} style={{marginTop: 24}}>
        <Body>On the morning of 28 October, the hostages are freed and the gunmen surrender.</Body>
      </Reveal>
    </div>
  </AbsoluteFill>
);

const Aftermath: React.FC = () => (
  <AbsoluteFill style={pad}>
    <Reveal>
      <Kicker>The aftermath</Kicker>
    </Reveal>
    <DrawLine delay={10} />
    {[
      ['2003', 'Nairi Hunanyan and his accomplices are sentenced to life imprisonment.'],
      ['Politics', 'Armenia loses its two most powerful leaders in one day; the political balance shifts.'],
      ['Questions', 'Whether anyone else stood behind the gunmen is still debated in Armenia today.'],
    ].map(([label, text], i) => (
      <Reveal key={label} delay={25 + i * 55} style={{display: 'flex', gap: 40, marginBottom: 40, alignItems: 'baseline'}}>
        <div style={{width: 260, fontFamily: fonts.sans, fontSize: 36, color: colors.apricot, fontWeight: 700}}>{label}</div>
        <div style={{flex: 1}}>
          <Body>{text}</Body>
        </div>
      </Reveal>
    ))}
  </AbsoluteFill>
);

const Candle: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lit = spring({frame: frame - 20, fps, config: {damping: 30}});
  const flicker = 1 + Math.sin(frame / 3) * 0.05 + Math.sin(frame / 7) * 0.04;
  return (
    <svg width={160} height={300} viewBox="0 0 160 300">
      <defs>
        <radialGradient id="glow">
          <stop offset="0%" stopColor={colors.apricot} stopOpacity={0.5} />
          <stop offset="100%" stopColor={colors.apricot} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={80} cy={90} r={75 * lit} fill="url(#glow)" />
      <ellipse
        cx={80}
        cy={90}
        rx={14 * lit}
        ry={30 * lit * flicker}
        fill="#ffd27a"
        transform={`translate(0 ${(1 - flicker) * 30})`}
      />
      <line x1={80} y1={115} x2={80} y2={128} stroke="#333" strokeWidth={3} />
      <rect x={52} y={128} width={56} height={160} rx={6} fill="#ece6d6" />
    </svg>
  );
};

const Memorial: React.FC = () => (
  <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
    <Candle />
    <Reveal delay={40} style={{marginTop: 30}}>
      <Heading size={70}>In memory of the victims</Heading>
    </Reveal>
    <Reveal delay={70} style={{marginTop: 24, maxWidth: 1300}}>
      <Body>27 October is remembered in Armenia every year as a day of mourning.</Body>
    </Reveal>
  </AbsoluteFill>
);

const CHAPTERS: [keyof typeof SCENES, React.FC][] = [
  ['intro', Intro],
  ['context', Context],
  ['attack', Attack],
  ['victims', Victims],
  ['siege', Siege],
  ['aftermath', Aftermath],
  ['memorial', Memorial],
];

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top: 0, left: 0, height: 4, width: `${(frame / TOTAL_FRAMES) * 100}%`, background: colors.red}} />
  );
};

export const Oct27: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: colors.bg}}>
    <Background />
    <Series>
      {CHAPTERS.map(([key, Scene]) => (
        <Series.Sequence key={key} durationInFrames={SCENES[key]}>
          <SceneFade duration={SCENES[key]}>
            <Scene />
          </SceneFade>
        </Series.Sequence>
      ))}
    </Series>
    <ProgressBar />
  </AbsoluteFill>
);
