import {Composition} from 'remotion';
import {BASE_FPS} from './time';
import {timeline} from './timeline';
import {Video} from './Video';

const FPS = 60;

// 9:16 reel at 60 fps. Timeline values are in 30 fps base frames (see src/time.ts).
export const RemotionRoot: React.FC = () => (
  <Composition id="Oct27Reel" component={Video} durationInFrames={Math.round((timeline.total * FPS) / BASE_FPS)} fps={FPS} width={1080} height={1920} />
);
