import { describe, expect, it } from 'vitest';
import { CipherPuzzle } from './CipherPuzzle';
import { LogicGatePuzzle } from './LogicGatePuzzle';
import { PortScanPuzzle } from './PortScanPuzzle';
import { PuzzleFactory } from './PuzzleFactory';
import type { PuzzleRng } from './rng';

function createSeededRng(seed: number): PuzzleRng {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

describe('puzzle RNG injection', () => {
  it('creates deterministic puzzle class selection in PuzzleFactory with seeded rng', () => {
    const target = {
      id: 'node-1',
      name: 'Node 1',
      puzzleTypes: ['mystery'],
      defenses: [],
      reward: 100,
      difficulty: 2,
    };

    const first = PuzzleFactory.createForTarget(target, createSeededRng(42));
    const second = PuzzleFactory.createForTarget(target, createSeededRng(42));

    expect(first.constructor.name).toBe(second.constructor.name);
  });

  it('generates deterministic puzzle content when provided the same seeded rng', () => {
    const seed = 2026;

    const logicA = new LogicGatePuzzle(3, createSeededRng(seed));
    const logicB = new LogicGatePuzzle(3, createSeededRng(seed));
    expect(logicA.start()).toBe(logicB.start());

    const cipherA = new CipherPuzzle(2, createSeededRng(seed));
    const cipherB = new CipherPuzzle(2, createSeededRng(seed));
    expect(cipherA.start()).toBe(cipherB.start());

    const portA = new PortScanPuzzle(2, createSeededRng(seed));
    const portB = new PortScanPuzzle(2, createSeededRng(seed));
    expect(portA.start()).toBe(portB.start());
    expect(portA.getPorts()).toEqual(portB.getPorts());
  });

  it('preserves default runtime behavior when rng is omitted', () => {
    const puzzle = new LogicGatePuzzle(1);
    expect(typeof puzzle.start()).toBe('string');
  });
});
