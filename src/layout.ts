import {useVideoConfig} from 'remotion';

export const useLayout = () => {
  const {width, height} = useVideoConfig();
  const vertical = height > width;
  return {
    vertical,
    width,
    height,
    // Bottom band reserved for captions.
    captionTop: vertical ? 1400 : 900,
  };
};

// Pick a value depending on orientation: pick(vertical, valueForReel, valueForLandscape).
export const pick = <T,>(vertical: boolean, v: T, h: T): T => (vertical ? v : h);
