import { describe, expect, it, vi } from 'vitest';

import type { HackTarget } from '../engine';
import type { PuzzleRng } from './BasePuzzle';
import { PuzzleFactory } from './PuzzleFactory';

const baseTarget: HackTarget = {
  id: 'target-1',
  name: 'Test Node',
  difficulty: 3,
  puzzleTypes: [],
  defenses: [],
  reward: 100,
};

const LEVEL_GENERATOR_ROUTING_CASES: Array<[string, string]> = [
  ['password-crack', 'PasswordCrackPuzzle'],
  ['port-scan', 'PortScanPuzzle'],
  ['log-forensics', 'MemoryMatrixPuzzle'],
  ['packet-routing', 'PortScanPuzzle'],
  ['hash-reversal', 'CipherPuzzle'],
  ['node-mapping', 'MemoryMatrixPuzzle'],
  ['timing-analysis', 'CipherPuzzle'],
  ['trace-scrubbing', 'MemoryMatrixPuzzle'],
  ['access-graph', 'MemoryMatrixPuzzle'],
  ['cipher-break', 'CipherPuzzle'],
  ['exploit-chain', 'LogicGatePuzzle'],
  ['kernel-injection', 'LogicGatePuzzle'],
  ['quantum-auth', 'CipherPuzzle'],
  ['zero-day-synthesis', 'LogicGatePuzzle'],
  ['distributed-overload', 'PortScanPuzzle'],
];

function withPuzzleType(puzzleType: string): HackTarget {
  return {
    ...baseTarget,
    puzzleTypes: [puzzleType],
  };
}

function sequenceRng(values: number[]): PuzzleRng {
  let index = 0;
  return () => {
    const value = values[index] ?? values[values.length - 1] ?? 0;
    index += 1;
    return value;
  };
}

describe('PuzzleFactory', () => {
  it('routes LevelGenerator puzzle types to intentional puzzle implementations', () => {
    for (const [puzzleType, expectedPuzzleClass] of LEVEL_GENERATOR_ROUTING_CASES) {
      const rng = vi.fn<PuzzleRng>(() => 0);
      const puzzle = PuzzleFactory.createForTarget(withPuzzleType(puzzleType), rng);

      expect(puzzle.constructor.name, puzzleType).toBe(expectedPuzzleClass);
      expect(rng, `${puzzleType} should not use fallback selection`).toHaveBeenCalledTimes(1);
    }
  });

  it('selects PasswordCrackPuzzle intentionally for password-crack type', () => {
    const puzzle = PuzzleFactory.createForTarget(withPuzzleType('password-crack'), () => 0);

    expect(puzzle.constructor.name).toBe('PasswordCrackPuzzle');
  });

  it('uses fallback selection only for unknown puzzle types', () => {
    const rng = vi.fn(sequenceRng([0, 0.8]));

    const puzzle = PuzzleFactory.createForTarget(withPuzzleType('unknown-puzzle-type'), rng);

    expect(rng).toHaveBeenCalledTimes(2);
    expect(puzzle.constructor.name).toBe('PasswordCrackPuzzle');
  });
});
