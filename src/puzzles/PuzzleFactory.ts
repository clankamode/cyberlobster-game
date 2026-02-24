import type { HackTarget } from '../engine';
import { CipherPuzzle } from './CipherPuzzle';
import { LogicGatePuzzle } from './LogicGatePuzzle';
import { PortScanPuzzle } from './PortScanPuzzle';
import type { BasePuzzle } from './BasePuzzle';

export class PuzzleFactory {
  static createForTarget(target: HackTarget): BasePuzzle {
    const difficulty = Math.max(1, target.difficulty);
    const selectedType = this.pickPuzzleType(target.puzzleTypes);

    if (this.isPortPuzzle(selectedType)) {
      return new PortScanPuzzle(difficulty);
    }

    if (this.isCipherPuzzle(selectedType)) {
      return new CipherPuzzle(difficulty);
    }

    return new LogicGatePuzzle(difficulty);
  }

  private static pickPuzzleType(puzzleTypes: string[]): string {
    if (puzzleTypes.length === 0) {
      return 'logic-gate';
    }

    const index = Math.floor(Math.random() * puzzleTypes.length);
    return puzzleTypes[index] ?? 'logic-gate';
  }

  private static isPortPuzzle(type: string): boolean {
    const normalized = type.toLowerCase();
    return normalized.includes('port') || normalized.includes('scan') || normalized.includes('network');
  }

  private static isCipherPuzzle(type: string): boolean {
    const normalized = type.toLowerCase();
    return normalized.includes('cipher') || normalized.includes('hash') || normalized.includes('quantum');
  }
}
