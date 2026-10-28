import {Composition} from 'remotion';
import {Oct27, TOTAL_FRAMES} from './Oct27';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Oct27"
      component={Oct27}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
