import {Composition} from 'remotion';
import {timeline} from './timeline';
import {Video} from './Video';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Oct27" component={Video} durationInFrames={timeline.total} fps={timeline.fps} width={1920} height={1080} />
    <Composition id="Oct27Reel" component={Video} durationInFrames={timeline.total} fps={timeline.fps} width={1080} height={1920} />
  </>
);
