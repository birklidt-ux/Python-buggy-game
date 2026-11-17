export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  speed: number;
  jumpForce: number;
  isGrounded: boolean;
  color: string;
}

export interface Star {
  id: number;
  x: number;
  y: number;
  radius: number;
  points: number;
  speedY: number;
  rotation: number;
  collected: boolean;
}

export interface Meteor {
  id: number;
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  rotation: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface GameState {
  score: number;
  lives: number;
  isGameOver: boolean;
  isVictory: boolean;
  wave: number;
  starsCollected: number;
  meteorsDodged: number;
}

export interface KeysState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  space: boolean;
}

export interface Mission {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  csConcept: string;
  conceptDescription: string;
  qaBugReport: string;
  expectedBehavior: string;
  starterCode: string;
  solutionCode: string;
  hints: {
    level1: string; // Where to look
    level2: string; // The flaw explained
    level3: string; // Direct code suggestion
  };
  testCases: {
    id: string;
    description: string;
    testFn: (code: string, runner: any) => Promise<{ passed: boolean; message: string }>;
  }[];
}

export interface PythonExecutionResult {
  success: boolean;
  error?: {
    line?: number;
    name: string;
    message: string;
    friendlyExplanation: string;
  };
  output: string[];
}
