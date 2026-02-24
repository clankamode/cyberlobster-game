import { BasePuzzle } from './BasePuzzle';
import { CipherPuzzle } from './CipherPuzzle';
import { LogicGatePuzzle } from './LogicGatePuzzle';
import { PasswordCrackPuzzle } from './PasswordCrackPuzzle';
import { PortScanPuzzle } from './PortScanPuzzle';

export enum PuzzleType {
  CIPHER = 'CIPHER',
  PORT_SCAN = 'PORT_SCAN',
  LOGIC_GATE = 'LOGIC_GATE',
  PASSWORD_CRACK = 'PASSWORD_CRACK',
}

export function createPuzzle(type: PuzzleType, difficulty: number): BasePuzzle {
  switch (type) {
    case PuzzleType.CIPHER:
      return new CipherPuzzle(difficulty);
    case PuzzleType.PORT_SCAN:
      return new PortScanPuzzle(difficulty);
    case PuzzleType.LOGIC_GATE:
      return new LogicGatePuzzle(difficulty);
    case PuzzleType.PASSWORD_CRACK:
      return new PasswordCrackPuzzle(difficulty);
    default:
      throw new Error(`Unsupported puzzle type: ${type as string}`);
  }
}
