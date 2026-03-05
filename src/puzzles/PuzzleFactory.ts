import type { HackTarget } from '../engine';
import { CipherPuzzle } from './CipherPuzzle';
import { LogicGatePuzzle } from './LogicGatePuzzle';
import { MemoryMatrixPuzzle } from './MemoryMatrixPuzzle';
import { PortScanPuzzle } from './PortScanPuzzle';
import type { BasePuzzle } from './BasePuzzle';
import { defaultPuzzleRng, type PuzzleRng } from './rng';

export class PuzzleFactory {
  static createForTarget(target: HackTarget, rng: PuzzleRng = defaultPuzzleRng): BasePuzzle {
    const difficulty = Math.max(1, target.difficulty);
    const selectedType = this.pickPuzzleType(target.puzzleTypes, rng);

    if (this.isPortPuzzle(selectedType)) {
      return new PortScanPuzzle(difficulty, rng);
    }

    if (this.isCipherPuzzle(selectedType)) {
      return new CipherPuzzle(difficulty, rng);
    }

    if (this.isMemoryPuzzle(selectedType)) {
      return new MemoryMatrixPuzzle(difficulty, rng);
    }

    const fallbacks = [LogicGatePuzzle, CipherPuzzle, PortScanPuzzle, MemoryMatrixPuzzle];
    const index = Math.floor(rng() * fallbacks.length);
    const PuzzleType = fallbacks[index] ?? LogicGatePuzzle;
    return new PuzzleType(difficulty, rng);
  }

  private static pickPuzzleType(puzzleTypes: string[], rng: PuzzleRng): string {
    if (puzzleTypes.length === 0) {
      return 'logic-gate';
    }

    const index = Math.floor(rng() * puzzleTypes.length);
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

  private static isMemoryPuzzle(type: string): boolean {
    const normalized = type.toLowerCase();
    return normalized.includes('memory') || normalized.includes('matrix') || normalized.includes('mapping');
  }
}
