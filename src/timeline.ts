import data from './data/timeline.json';

export type Line = {text: string; audio: string; start: number; duration: number; human: boolean};
export type SceneData = {id: string; from: number; duration: number; lines: Line[]};

export const timeline = data as {fps: number; total: number; scenes: SceneData[]};

export const usesHumanVoice = timeline.scenes.some((s) => s.lines.some((l) => l.human));
