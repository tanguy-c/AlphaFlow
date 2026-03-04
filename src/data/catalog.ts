import type { MachineConfig } from '../types/machine';
import bernetteb38 from './machines/bernette-b38.json';

/**
 * Catalog entry: metadata shown in the picker + the full config.
 */
export interface CatalogEntry {
  id: string;
  name: string;
  description: string;
  modesCount: number;
  charsCount: number;
}

/** All built-in machines shipped with AlphaFlow. */
const catalogMachines: MachineConfig[] = [bernetteb38 as MachineConfig];

/**
 * Returns the list of catalog entries (id + name + description)
 * for display in the machine picker.
 */
export function getCatalogEntries(): CatalogEntry[] {
  return catalogMachines.map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description,
    modesCount: m.modes.length,
    charsCount: m.modes.reduce((sum, mode) => sum + mode.characters.length, 0),
  }));
}

/**
 * Returns a deep copy of the full machine config by catalog id.
 * Adds timestamps so it's ready to be stored.
 */
export function getCatalogMachine(id: string): MachineConfig | null {
  const machine = catalogMachines.find((m) => m.id === id);
  if (!machine) return null;

  const now = new Date().toISOString();
  return {
    ...structuredClone(machine),
    createdAt: now,
    updatedAt: now,
  };
}
