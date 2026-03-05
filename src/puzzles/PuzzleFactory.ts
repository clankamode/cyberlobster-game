import type { HackTarget } from '../engine';
import { CipherPuzzle } from './CipherPuzzle';
import { LogicGatePuzzle } from './LogicGatePuzzle';
import { MemoryMatrixPuzzle } from './MemoryMatrixPuzzle';
import { PasswordCrackPuzzle } from './PasswordCrackPuzzle';
import { PortScanPuzzle } from './PortScanPuzzle';
import type { BasePuzzle } from './BasePuzzle';

export class PuzzleFactory {
  static createForTarget(target: HackTarget): BasePuzzle {
    const difficulty = Math.max(1, target.difficulty);
    const selectedType = this.pickPuzzleType(target.puzzleTypes);

    if (this.isPasswordPuzzle(selectedType)) {
      return new PasswordCrackPuzzle(difficulty);
    }

    if (this.isPortPuzzle(selectedType)) {
      return new PortScanPuzzle(difficulty);
    }

    if (this.isCipherPuzzle(selectedType)) {
      return new CipherPuzzle(difficulty);
    }

    if (this.isMemoryPuzzle(selectedType)) {
      return new MemoryMatrixPuzzle(difficulty);
    }

    if (this.isLogicPuzzle(selectedType)) {
      return new LogicGatePuzzle(difficulty);
    }

    const fallbacks = [LogicGatePuzzle, CipherPuzzle, PortScanPuzzle, MemoryMatrixPuzzle, PasswordCrackPuzzle];
    const index = Math.floor(Math.random() * fallbacks.length);
    const PuzzleType = fallbacks[index] ?? LogicGatePuzzle;
    return new PuzzleType(difficulty);
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
    return (
      normalized.includes('port') ||
      normalized.includes('scan') ||
      normalized.includes('network') ||
      normalized.includes('packet') ||
      normalized.includes('routing') ||
      normalized.includes('distributed') ||
      normalized.includes('overload')
    );
  }

  private static isCipherPuzzle(type: string): boolean {
    const normalized = type.toLowerCase();
    return (
      normalized.includes('cipher') ||
      normalized.includes('hash') ||
      normalized.includes('quantum') ||
      normalized.includes('timing')
    );
  }

  private static isMemoryPuzzle(type: string): boolean {
    const normalized = type.toLowerCase();
    return (
      normalized.includes('memory') ||
      normalized.includes('matrix') ||
      normalized.includes('mapping') ||
      normalized.includes('forensics') ||
      normalized.includes('trace') ||
      normalized.includes('graph')
    );
  }

  private static isPasswordPuzzle(type: string): boolean {
    const normalized = type.toLowerCase();
    return normalized.includes('password') || /(^|[^a-z])pin([^a-z]|$)/.test(normalized);
  }

  private static isLogicPuzzle(type: string): boolean {
    const normalized = type.toLowerCase();
    return (
      normalized.includes('logic') ||
      normalized.includes('gate') ||
      normalized.includes('exploit') ||
      normalized.includes('kernel') ||
      normalized.includes('synthesis')
    );
  }
}
