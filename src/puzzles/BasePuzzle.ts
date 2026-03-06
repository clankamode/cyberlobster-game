export interface PuzzleSolvedDetail {
  puzzle: string;
  difficulty: number;
}

export interface PuzzleFailedDetail {
  puzzle: string;
  difficulty: number;
  reason?: string;
}

export type PuzzleRng = () => number;

export abstract class BasePuzzle extends EventTarget {
  public readonly timeLimit: number;
  public readonly difficulty: number;

  private readonly rng: PuzzleRng;
  private isCompleted = false;
  private isFailed = false;

  protected constructor(timeLimit: number, difficulty: number, rng: PuzzleRng = Math.random) {
    super();
    this.timeLimit = timeLimit;
    this.difficulty = difficulty;
    this.rng = rng;
  }

  abstract start(): string;
  abstract solve(input: string): boolean;
  abstract getHint(): string;

  protected markSolved(): void {
    if (this.isCompleted || this.isFailed) {
      return;
    }

    this.isCompleted = true;
    this.dispatchEvent(
      new CustomEvent<PuzzleSolvedDetail>('puzzle-solved', {
        detail: {
          puzzle: this.constructor.name,
          difficulty: this.difficulty,
        },
      }),
    );
  }

  protected markFailed(reason?: string): void {
    if (this.isCompleted || this.isFailed) {
      return;
    }

    this.isFailed = true;
    this.dispatchEvent(
      new CustomEvent<PuzzleFailedDetail>('puzzle-failed', {
        detail: {
          puzzle: this.constructor.name,
          difficulty: this.difficulty,
          reason,
        },
      }),
    );
  }

  protected random(): number {
    return this.rng();
  }

  protected randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  protected normalizeInput(input: string): string {
    return input.trim();
  }
}
