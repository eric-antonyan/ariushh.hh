import {useCurrentFrame, useVideoConfig} from 'remotion';

// All animation timings in this project are written in 30 fps "base frames" (1 unit = 1/30 s),
// so the video can render at any frame rate (e.g. 60 fps) without retiming every scene.
export const BASE_FPS = 30;

// Current time in base frames (fractional at higher frame rates).
export const useFrame = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (frame * BASE_FPS) / fps;
};

// Converts base frames to real frames for <Sequence> offsets and durations.
export const useToFrames = () => {
  const {fps} = useVideoConfig();
  return (base: number) => Math.round((base * fps) / BASE_FPS);
};
