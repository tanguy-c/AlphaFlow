export interface CharacterMapping {
  character: string;
  code: string;
}

export interface MachineMode {
  id: string;
  name: string;
  characters: CharacterMapping[];
}

export interface CodeFormat {
  /** Minimum number of digits (e.g., 2 → "01", 1 → "1") */
  padding: number;
}

export interface MachineConfig {
  id: string;
  name: string;
  description: string;
  codeFormat: CodeFormat;
  modes: MachineMode[];
  defaultModeId: string;
  /** If true, 'a' and 'A' are distinct characters. Default false (case-insensitive). */
  caseSensitive?: boolean;
  /** Maximum number of characters allowed per text. Undefined or 0 means no limit. */
  maxChars?: number;
  createdAt: string;
  updatedAt: string;
}
