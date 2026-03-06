import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { EventBus } from './EventBus';
import { GameStore } from './GameState';
import { LevelGenerator } from './LevelGenerator';

describe('EventBus', () => {
  it('registers handlers, emits payloads, and unsubscribes cleanly', () => {
    const bus = new EventBus();
    const solvedHandler = vi.fn();

    const unsubscribe = bus.on('PUZZLE_SOLVED', solvedHandler);

    bus.emit('PUZZLE_SOLVED', {
      systemId: 'L1-S1',
      puzzleType: 'logic-gate',
      points: 150,
    });

    expect(solvedHandler).toHaveBeenCalledTimes(1);
    expect(solvedHandler).toHaveBeenCalledWith({
      systemId: 'L1-S1',
      puzzleType: 'logic-gate',
      points: 150,
    });

    unsubscribe();
    bus.emit('PUZZLE_SOLVED', {
      systemId: 'L1-S2',
      puzzleType: 'cipher',
      points: 200,
    });

    expect(solvedHandler).toHaveBeenCalledTimes(1);
  });
});

describe('GameStore', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: vi.fn((key: string) => storage.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => {
          storage.set(key, value);
        }),
        removeItem: vi.fn((key: string) => {
          storage.delete(key);
        }),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('applies score/life transitions and emits change snapshots', () => {
    const store = new GameStore({ phase: 'running', score: 100, lives: 3, streak: 1 });
    const snapshots: number[] = [];

    const unsubscribe = store.subscribe((state) => {
      snapshots.push(state.score);
    });

    // solved path: gain score and streak
    store.patchState({ score: 250, streak: 2 });

    // failed path: lose life and reset streak
    store.patchState({ lives: 2, streak: 0 });

    unsubscribe();

    expect(store.getState()).toMatchObject({
      phase: 'running',
      score: 250,
      lives: 2,
      streak: 0,
    });
    expect(snapshots).toEqual([250, 250]);
  });

  it('persists save data and clears it on gameover transition', () => {
    const store = new GameStore({ phase: 'running', currentLevel: 3, score: 420, lives: 2, streak: 4 });

    store.patchState({ score: 421 });

    const raw = storage.get('ghost-terminal:save');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toMatchObject({
      currentLevel: 3,
      score: 421,
      lives: 2,
      streak: 4,
    });

    store.patchState({ phase: 'gameover' });

    expect(storage.has('ghost-terminal:save')).toBe(false);
    expect(store.hasSavedGame()).toBe(false);
  });

  it('sanitizes loaded save payload bounds', () => {
    storage.set(
      'ghost-terminal:save',
      JSON.stringify({
        currentLevel: -8,
        score: -100,
        lives: 0,
        streak: -5,
      }),
    );

    const store = new GameStore();

    expect(store.loadSavedGame()).toEqual({
      currentLevel: 1,
      score: 0,
      lives: 1,
      streak: 0,
    });
  });
});

describe('LevelGenerator', () => {
  it('is deterministic for a seed and respects tier constraints', () => {
    const seed = 1337;
    const first = new LevelGenerator(seed).generateLevel(2, 4);
    const second = new LevelGenerator(seed).generateLevel(2, 4);

    expect(second).toEqual(first);

    for (const target of first) {
      expect(target.difficulty).toBeGreaterThanOrEqual(2);
      expect(target.difficulty).toBeLessThanOrEqual(4);
      expect(target.puzzleTypes.length).toBeGreaterThanOrEqual(2);
      expect(target.puzzleTypes.length).toBeLessThanOrEqual(4);
      expect(target.defenses.length).toBeGreaterThanOrEqual(1);
      expect(target.defenses.length).toBeLessThanOrEqual(2);
      expect(target.reward).toBeGreaterThan(0);
    }
  });
});
