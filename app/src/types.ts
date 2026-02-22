export type PuzzleType = 'text' | 'number' | 'select';

export interface Puzzle {
  id: string;
  title: string;
  description: string;
  flavorText: string;
  type: PuzzleType;
  answer: string;
  options?: string[]; // select型のみ
  hints: string[];
  successMessage: string;
  failMessage: string;
}

export interface GameConfig {
  title: string;
  description: string;
  theme: 'mystery' | 'sci-fi' | 'horror' | 'fantasy';
  puzzles: Puzzle[];
  clearMessage: string;
}

export type GameMode = 'editor' | 'play' | 'clear' | 'menu';

export interface PlayState {
  currentPuzzleIndex: number;
  solvedPuzzles: Set<string>;
  hintsUsed: Record<string, number>;
  attempts: Record<string, number>;
  startTime: number;
}
