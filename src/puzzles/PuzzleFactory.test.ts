import { afterEach, describe, expect, it, vi } from 'vitest';

import type { HackTarget } from '../engine';
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

describe('PuzzleFactory', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('routes LevelGenerator puzzle types to intentional puzzle implementations', () => {
    for (const [puzzleType, expectedPuzzleClass] of LEVEL_GENERATOR_ROUTING_CASES) {
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
      const puzzle = PuzzleFactory.createForTarget(withPuzzleType(puzzleType));

      expect(puzzle.constructor.name, puzzleType).toBe(expectedPuzzleClass);
      expect(randomSpy, `${puzzleType} should not use fallback selection`).toHaveBeenCalledTimes(1);

      randomSpy.mockRestore();
    }
  });

  it('selects PasswordCrackPuzzle intentionally for password-crack type', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const puzzle = PuzzleFactory.createForTarget(withPuzzleType('password-crack'));

    expect(puzzle.constructor.name).toBe('PasswordCrackPuzzle');
  });

  it('uses fallback selection only for unknown puzzle types', () => {
    const randomSpy = vi
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.8);

    const puzzle = PuzzleFactory.createForTarget(withPuzzleType('unknown-puzzle-type'));

    expect(randomSpy).toHaveBeenCalledTimes(2);
    expect(puzzle.constructor.name).toBe('PasswordCrackPuzzle');
  });
});
