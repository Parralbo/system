
export interface Topic {
  id: string;
  name: string;
}

export interface Chapter {
  id: string;
  name: string;
  topics: string[];
}

export interface Subject {
  id: string;
  name: string;
  chapters: Record<string, string[]>;
}

export interface ProgressState {
  completedTopics: Record<string, boolean>; // key: subject-chapter-topic
  chapterCheckboxes: Record<string, boolean>; // key: subject-chapter-type
}

export interface UserProfile {
  username: string;
  password?: string;
  xp: number;
  progress: ProgressState;
  lastActive: number;
  followedUsers?: UserProfile[]; // Real snapshots of other users
}

export enum PrepType {
  THEORY_FAMILIAR = 'theory-familiar',
  THEORY_COMPREHENSIVE = 'theory-comprehensive',
  THEORY_FINALIZED = 'theory-finalized',
  PRACTICE_BASIC = 'practice-basic',
  PRACTICE_HSC = 'practice-hsc',
  PRACTICE_ADM = 'practice-adm'
}

export interface LevelInfo {
  level: number;
  name: string;
  min: number;
  max: number;
  color: string;
  emoji: string;
}
