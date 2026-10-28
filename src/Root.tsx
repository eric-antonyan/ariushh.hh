import {Composition} from 'remotion';
import {BASE_FPS} from './time';
import {timeline} from './timeline';
import {Video} from './Video';
import {CinematicVideo} from './cinematic/CinematicVideo';

const FPS = 60;

const duration = Math.round((timeline.total * FPS) / BASE_FPS);

// 9:16 reels at 60 fps. Timeline values are in 30 fps base frames (see src/time.ts).
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Oct27Reel" component={Video} durationInFrames={duration} fps={FPS} width={1080} height={1920} />
    <Composition id="Oct27Cinematic" component={CinematicVideo} durationInFrames={duration} fps={FPS} width={1080} height={1920} />
  </>
);
