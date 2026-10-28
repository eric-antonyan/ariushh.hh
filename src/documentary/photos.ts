import data from '../data/doc-photos.json';

// Archive photographs (Wikimedia Commons, free licences) — see src/data/doc-photos.json for sources.
export type PhotoId =
  | 'collage'
  | 'memorialStamp'
  | 'leadersStamps'
  | 'leaders1999'
  | 'demirchyan1999'
  | 'sargsyan1999'
  | 'sargsyanUniform'
  | 'parliament'
  | 'parliamentBw'
  | 'apc'
  | 'crowd'
  | 'running'
  | 'apc102'
  | 'release'
  | 'monument'
  | 'monument2';

export type Photo = {file: string; credit: string; aspect: number; source: string; license: string};

export const PHOTOS = data as Record<PhotoId, Photo>;
