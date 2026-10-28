import data from './data/timeline.json';

// `words`: per-word [start, duration] in base frames from the TTS engine, when available.
export type Line = {text: string; audio: string; start: number; duration: number; human: boolean; voice?: string; words?: [number, number][]};
export type SceneData = {id: string; from: number; duration: number; lines: Line[]};

export const timeline = data as {fps: number; total: number; scenes: SceneData[]};

export const usesHumanVoice = timeline.scenes.some((s) => s.lines.some((l) => l.human));
