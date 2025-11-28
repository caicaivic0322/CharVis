export interface CharData {
  id: string; // Unique ID for React keys to help animation
  char: string;
  index: number;
  address: string;
}

export enum AlgorithmType {
  WHOLE_REVERSE = 'WHOLE_REVERSE', // In-place whole string reversal (Two Pointers)
  WORD_REVERSE = 'WORD_REVERSE',   // Scan and print reversed words
}

export enum AlgorithmStep {
  // Common / General
  IDLE = 'IDLE',
  FINISHED = 'FINISHED',

  // Whole Reversal Steps
  CHECK_LOOP = 'CHECK_LOOP',
  SWAP = 'SWAP',
  MOVE_POINTERS = 'MOVE_POINTERS',

  // Word Reversal Steps
  SCAN_I = 'SCAN_I',
  CHECK_BOUNDARY = 'CHECK_BOUNDARY',
  PRINT_LOOP_INIT = 'PRINT_LOOP_INIT',
  PRINT_LOOP_CHECK = 'PRINT_LOOP_CHECK',
  PRINT_CHAR = 'PRINT_CHAR',
  CHECK_SPACE = 'CHECK_SPACE',
  UPDATE_START = 'UPDATE_START'
}

export interface SimulationState {
  chars: CharData[];
  
  // Pointers
  leftIndex: number;  // Used as 'left' in Algo2
  rightIndex: number; // Used as 'right' in Algo2
  iIndex: number;     // Used as 'i' in Algo1
  jIndex: number;     // Used as 'j' in Algo1
  startIndex: number; // Used as 'start' in Algo1

  step: AlgorithmStep;
  message: string;
  codeLineIndex: number; // For highlighting code
  
  // For Algo1 (Output based)
  outputBuffer: string; 
}