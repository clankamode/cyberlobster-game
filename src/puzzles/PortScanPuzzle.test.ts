import { describe, expect, it } from 'vitest';

import { PortScanPuzzle } from './PortScanPuzzle';

describe('PortScanPuzzle', () => {
  it('solves when the vulnerable port is entered', () => {
    const puzzle = new PortScanPuzzle(2);

    puzzle.start();
    const vulnerablePort = puzzle.getPorts().find((entry) => entry.vulnerable)?.port;

    expect(vulnerablePort).toBeTypeOf('number');
    expect(puzzle.solve(String(vulnerablePort))).toBe(true);
  });

  it('consumes attempts for wrong numeric guesses and hard-fails on the third miss', () => {
    const puzzle = new PortScanPuzzle(2);
    const feedback: string[] = [];
    const failures: string[] = [];

    puzzle.addEventListener('terminal-feedback', (event) => {
      feedback.push((event as CustomEvent<string>).detail);
    });
    puzzle.addEventListener('puzzle-failed', (event) => {
      failures.push((event as CustomEvent<{ reason?: string }>).detail.reason ?? '');
    });

    puzzle.start();
    const wrongPort = puzzle.getPorts().find((entry) => !entry.vulnerable)?.port;

    expect(wrongPort).toBeTypeOf('number');
    expect(puzzle.solve(String(wrongPort))).toBe(false);
    expect(puzzle.solve(String(wrongPort))).toBe(false);
    expect(puzzle.solve(String(wrongPort))).toBe(false);

    expect(feedback).toEqual([
      `Port ${wrongPort} rejected. Attempts left: 2.`,
      `Port ${wrongPort} rejected. Attempts left: 1.`,
    ]);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toMatch(/^No attempts left\. Vulnerable port was \d+\.$/);
  });

  it('ignores non-numeric input without consuming attempts', () => {
    const puzzle = new PortScanPuzzle(2);
    const feedback: string[] = [];

    puzzle.addEventListener('terminal-feedback', (event) => {
      feedback.push((event as CustomEvent<string>).detail);
    });

    puzzle.start();
    const wrongPort = puzzle.getPorts().find((entry) => !entry.vulnerable)?.port;

    expect(puzzle.solve('not-a-port')).toBe(false);
    expect(puzzle.solve(String(wrongPort))).toBe(false);

    expect(feedback).toEqual([`Port ${wrongPort} rejected. Attempts left: 2.`]);
  });
});
