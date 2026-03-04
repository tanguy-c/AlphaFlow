import type { MachineConfig } from '../types/machine';

/**
 * Export a machine configuration to a JSON file and trigger download.
 */
export function exportConfig(config: MachineConfig): void {
  const json = JSON.stringify(config, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `alphaflow-${config.name.toLowerCase().replace(/\s+/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import a machine configuration from a JSON file.
 * Returns the parsed config or throws an error.
 */
export function parseConfigFile(content: string): MachineConfig {
  const parsed = JSON.parse(content);

  // Basic validation
  if (!parsed.id || typeof parsed.id !== 'string') {
    throw new Error('Missing or invalid "id"');
  }
  if (!parsed.name || typeof parsed.name !== 'string') {
    throw new Error('Missing or invalid "name"');
  }
  if (!Array.isArray(parsed.modes) || parsed.modes.length === 0) {
    throw new Error('Missing or empty "modes"');
  }
  if (!parsed.defaultModeId || typeof parsed.defaultModeId !== 'string') {
    throw new Error('Missing or invalid "defaultModeId"');
  }

  for (const mode of parsed.modes) {
    if (!mode.id || !mode.name || !Array.isArray(mode.characters)) {
      throw new Error(`Invalid mode: ${JSON.stringify(mode)}`);
    }
    for (const char of mode.characters) {
      if (typeof char.character !== 'string' || typeof char.code !== 'string') {
        throw new Error(
          `Invalid character mapping in mode "${mode.name}": ${JSON.stringify(char)}`,
        );
      }
    }
  }

  // Ensure codeFormat exists
  if (!parsed.codeFormat) {
    parsed.codeFormat = { padding: 2 };
  }

  return parsed as MachineConfig;
}

/**
 * Open a file dialog and read the contents.
 */
export function openFileDialog(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    };

    input.click();
  });
}
