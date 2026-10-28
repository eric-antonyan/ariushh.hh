import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts} from './theme';

// Fades a scene in at the start and out at the end of its Sequence.
export const SceneFade: React.FC<{duration: number; children: React.ReactNode}> = ({
  duration,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15, duration - 15, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = frame * 0.15;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${30 + Math.sin(drift / 40) * 10}% 40%, #1a2030 0%, ${colors.bg} 65%)`,
      }}
    >
      {/* Faint tricolour band along the bottom edge */}
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, display: 'flex', flexDirection: 'column'}}>
        <div style={{flex: 1, background: colors.red}} />
        <div style={{flex: 1, background: colors.blue}} />
        <div style={{flex: 1, background: colors.apricot}} />
      </div>
    </AbsoluteFill>
  );
};

// Text that slides up and fades in after `delay` frames.
export const Reveal: React.FC<{delay?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  delay = 0,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 200}});
  return (
    <div style={{opacity: p, transform: `translateY(${(1 - p) * 40}px)`, ...style}}>{children}</div>
  );
};

export const Kicker: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = colors.apricot}) => (
  <div
    style={{
      fontFamily: fonts.sans,
      fontSize: 30,
      letterSpacing: 8,
      textTransform: 'uppercase',
      color,
      fontWeight: 700,
    }}
  >
    {children}
  </div>
);

export const Heading: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 84}) => (
  <div style={{fontFamily: fonts.serif, fontSize: size, color: colors.text, lineHeight: 1.1}}>{children}</div>
);

export const Body: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{fontFamily: fonts.sans, fontSize: 40, color: colors.muted, lineHeight: 1.45}}>{children}</div>
);

// A horizontal line that draws itself from left to right.
export const DrawLine: React.FC<{delay?: number; width?: number; color?: string}> = ({
  delay = 0,
  width = 240,
  color = colors.red,
}) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 25], [0, width], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <div style={{height: 4, width: w, background: color, margin: '28px 0'}} />;
};
