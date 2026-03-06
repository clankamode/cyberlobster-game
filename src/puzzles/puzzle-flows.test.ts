import { describe, expect, it } from 'vitest';

import type { PuzzleRng } from './BasePuzzle';
import { CipherPuzzle } from './CipherPuzzle';
import { LogicGatePuzzle } from './LogicGatePuzzle';
import { MemoryMatrixPuzzle } from './MemoryMatrixPuzzle';
import { PasswordCrackPuzzle } from './PasswordCrackPuzzle';
import { PortScanPuzzle } from './PortScanPuzzle';

type FeedbackDetail = { reason?: string };

function sequenceRng(values: number[]): PuzzleRng {
  let index = 0;
  return () => {
    const value = values[index] ?? values[values.length - 1] ?? 0;
    index += 1;
    return value;
  };
}

describe('Puzzle flows', () => {
  it('solves PortScanPuzzle when vulnerable port is provided', () => {
    const puzzle = new PortScanPuzzle(2, sequenceRng([0.12, 0.34, 0.56, 0.78]));
    puzzle.start();

    const vulnerable = puzzle.getPorts().find((entry) => entry.vulnerable);
    expect(vulnerable).toBeDefined();

    const solvedEvents: Array<{ puzzle: string; difficulty: number }> = [];
    puzzle.addEventListener('puzzle-solved', (event) => {
      solvedEvents.push((event as CustomEvent<{ puzzle: string; difficulty: number }>).detail);
    });

    const solved = puzzle.solve(String(vulnerable!.port));

    expect(solved).toBe(true);
    expect(solvedEvents).toEqual([
      {
        puzzle: 'PortScanPuzzle',
        difficulty: 2,
      },
    ]);
  });

  it('fails PasswordCrackPuzzle after max wrong guesses and emits feedback', () => {
    const puzzle = new PasswordCrackPuzzle(1, sequenceRng([0.1, 0.2, 0.3, 0.4, 0, 0, 0]));
    puzzle.start();

    const feedback: string[] = [];
    const failedEvents: FeedbackDetail[] = [];

    puzzle.addEventListener('terminal-feedback', (event) => {
      feedback.push((event as CustomEvent<string>).detail);
    });

    puzzle.addEventListener('puzzle-failed', (event) => {
      failedEvents.push((event as CustomEvent<FeedbackDetail>).detail);
    });

    for (let i = 0; i < 8; i += 1) {
      expect(puzzle.solve('9999')).toBe(false);
    }

    expect(feedback.length).toBe(8);
    expect(failedEvents).toHaveLength(1);
    expect(failedEvents[0]?.reason).toContain('Out of guesses. PIN was 1234.');
  });

  it('produces deterministic puzzle prompts when using the same RNG sequence', () => {
    const existingWindow = (globalThis as { window?: Window }).window;
    if (!existingWindow) {
      Object.defineProperty(globalThis, 'window', {
        value: {
          setTimeout: globalThis.setTimeout,
          clearTimeout: globalThis.clearTimeout,
        },
        configurable: true,
      });
    }

    const runs: Array<[string, string]> = [
      [new CipherPuzzle(3, sequenceRng([0.05, 0.45, 0.22])).start(), new CipherPuzzle(3, sequenceRng([0.05, 0.45, 0.22])).start()],
      [new LogicGatePuzzle(2, sequenceRng([0.2, 0.8, 0.1, 0.6, 0.3])).start(), new LogicGatePuzzle(2, sequenceRng([0.2, 0.8, 0.1, 0.6, 0.3])).start()],
      [new MemoryMatrixPuzzle(1, sequenceRng([0.1, 0.3, 0.5, 0.7, 0.9])).start(), new MemoryMatrixPuzzle(1, sequenceRng([0.1, 0.3, 0.5, 0.7, 0.9])).start()],
      [new PasswordCrackPuzzle(2, sequenceRng([0.1, 0.2, 0.3, 0.4, 0.1, 0.2, 0.3])).start(), new PasswordCrackPuzzle(2, sequenceRng([0.1, 0.2, 0.3, 0.4, 0.1, 0.2, 0.3])).start()],
      [new PortScanPuzzle(1, sequenceRng([0.15, 0.25, 0.35, 0.45, 0.55])).start(), new PortScanPuzzle(1, sequenceRng([0.15, 0.25, 0.35, 0.45, 0.55])).start()],
    ];

    try {
      for (const [first, second] of runs) {
        expect(first).toBe(second);
      }
    } finally {
      if (!existingWindow) {
        delete (globalThis as { window?: Window }).window;
      }
    }
  });
});
