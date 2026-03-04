import { ChevronRight, Trash2, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import type { CharacterMapping, MachineConfig, MachineMode } from '../../types/machine';

export default function MachineEditor({
  machine,
  onUpdate,
  t,
}: {
  machine: MachineConfig;
  onUpdate: (m: MachineConfig) => void;
  t: (key: string) => string;
}) {
  const [expandedModes, setExpandedModes] = useState<Set<string>>(new Set());

  const toggleMode = (modeId: string) => {
    setExpandedModes((prev) => {
      const next = new Set(prev);
      if (next.has(modeId)) {
        next.delete(modeId);
      } else {
        next.add(modeId);
      }
      return next;
    });
  };

  const update = useCallback(
    (partial: Partial<MachineConfig>) => {
      onUpdate({ ...machine, ...partial });
    },
    [machine, onUpdate],
  );

  const updateMode = (modeIndex: number, partial: Partial<MachineMode>) => {
    const modes = [...machine.modes];
    modes[modeIndex] = { ...modes[modeIndex], ...partial };
    update({ modes });
  };

  const addMode = () => {
    const id = `mode-${Date.now()}`;
    update({
      modes: [...machine.modes, { id, name: '', characters: [] }],
    });
  };

  const deleteMode = (index: number) => {
    if (!window.confirm(t('config.confirmDeleteMode'))) return;
    const modes = machine.modes.filter((_, i) => i !== index);
    const updatedDefault =
      machine.modes[index].id === machine.defaultModeId && modes.length > 0
        ? modes[0].id
        : machine.defaultModeId;
    update({ modes, defaultModeId: updatedDefault });
  };

  const addCharacter = (modeIndex: number) => {
    const modes = [...machine.modes];
    const existingChars = modes[modeIndex].characters;
    const padding = machine.codeFormat.padding;

    let newCode = '';
    let newChar = '';

    if (existingChars.length === 0) {
      newCode = '1'.padStart(padding, '0');
    } else {
      const lastChar = existingChars[existingChars.length - 1];

      const lastCodeNum = parseInt(lastChar.code, 10);
      if (!Number.isNaN(lastCodeNum)) {
        newCode = String(lastCodeNum + 1).padStart(padding, '0');
      }

      if (lastChar.character.length === 1) {
        const ch = lastChar.character;
        const code = ch.charCodeAt(0);
        if ((code >= 97 && code < 122) || (code >= 65 && code < 90) || (code >= 48 && code < 57)) {
          newChar = String.fromCharCode(code + 1);
        } else if (code === 122) {
          newChar = 'a';
        } else if (code === 90) {
          newChar = 'A';
        } else if (code === 57) {
          newChar = '0';
        }
      }
    }

    modes[modeIndex] = {
      ...modes[modeIndex],
      characters: [...existingChars, { character: newChar, code: newCode }],
    };
    update({ modes });
  };

  const updateCharacter = (
    modeIndex: number,
    charIndex: number,
    partial: Partial<CharacterMapping>,
  ) => {
    const modes = [...machine.modes];
    const characters = [...modes[modeIndex].characters];
    characters[charIndex] = { ...characters[charIndex], ...partial };
    modes[modeIndex] = { ...modes[modeIndex], characters };
    update({ modes });
  };

  const deleteCharacter = (modeIndex: number, charIndex: number) => {
    const modes = [...machine.modes];
    modes[modeIndex] = {
      ...modes[modeIndex],
      characters: modes[modeIndex].characters.filter((_, i) => i !== charIndex),
    };
    update({ modes });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-3 animate-card-in">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('config.machineName')}
            <input
              type="text"
              value={machine.name}
              onChange={(e) => update({ name: e.target.value })}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mt-1"
            />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('config.machineDescription')}
            <textarea
              value={machine.description}
              onChange={(e) => update({ description: e.target.value })}
              rows={2}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none mt-1"
            />
          </label>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('config.paddingDigits')}
              <input
                type="number"
                min={1}
                max={5}
                value={machine.codeFormat.padding}
                onChange={(e) =>
                  update({
                    codeFormat: { padding: parseInt(e.target.value, 10) || 1 },
                  })
                }
                className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mt-1"
              />
            </label>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('config.maxChars')}
              <input
                type="number"
                min={0}
                value={machine.maxChars ?? 0}
                onChange={(e) =>
                  update({
                    maxChars: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mt-1"
              />
            </label>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('config.defaultMode')}
              <select
                value={machine.defaultModeId}
                onChange={(e) => update({ defaultModeId: e.target.value })}
                className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mt-1"
              >
                {machine.modes.map((mode) => (
                  <option key={mode.id} value={mode.id}>
                    {mode.name || mode.id}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={machine.caseSensitive ?? false}
              onChange={(e) => update({ caseSensitive: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-[22px] bg-gray-200 dark:bg-gray-600 peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:start-[3px] after:bg-white after:border-gray-300 dark:after:border-gray-500 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
          </label>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {t('config.caseSensitive')}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {t('config.modes')}
          </h3>
          <button
            type="button"
            onClick={addMode}
            className="btn-press bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors"
          >
            + {t('config.addMode')}
          </button>
        </div>

        {machine.modes.map((mode, modeIndex) => (
          <div
            key={mode.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-card-in"
            style={{ animationDelay: `${modeIndex * 50}ms` }}
          >
            {/* biome-ignore lint/a11y/useSemanticElements: contains nested interactive elements */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleMode(mode.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') toggleMode(mode.id);
              }}
              className="w-full bg-gray-50 dark:bg-gray-900 px-4 py-3 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 text-left cursor-pointer select-none"
            >
              <ChevronRight
                size={14}
                className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 ${expandedModes.has(mode.id) ? 'rotate-90' : ''}`}
              />
              <input
                type="text"
                value={mode.name}
                onChange={(e) => updateMode(modeIndex, { name: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                placeholder={t('config.modeName')}
                className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums whitespace-nowrap">
                {mode.characters.length} chars
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMode(modeIndex);
                }}
                className="text-red-400 hover:text-red-600 text-sm transition-colors"
                title={t('config.deleteMode')}
              >
                <Trash2 size={14} />
              </button>
            </div>

            {expandedModes.has(mode.id) && (
              <div className="p-4 space-y-2">
                {mode.characters.length > 0 && (
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-1">
                    <span className="w-24 text-center">{t('config.code')}</span>
                    <span className="w-4" />
                    <span className="w-20 text-center">{t('config.character')}</span>
                  </div>
                )}
                {mode.characters.map((char, charIndex) => (
                  <div key={charIndex} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={char.code}
                      onChange={(e) =>
                        updateCharacter(modeIndex, charIndex, {
                          code: e.target.value,
                        })
                      }
                      placeholder={t('config.code')}
                      className="w-24 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-3 py-2 text-sm text-center font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <span className="text-gray-300 dark:text-gray-600">→</span>
                    <input
                      type="text"
                      value={char.character}
                      onChange={(e) =>
                        updateCharacter(modeIndex, charIndex, {
                          character: e.target.value,
                        })
                      }
                      placeholder={t('config.character')}
                      maxLength={3}
                      className="w-20 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-3 py-2 text-sm text-center font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => deleteCharacter(modeIndex, charIndex)}
                      className="text-red-300 hover:text-red-500 text-xs ml-auto transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addCharacter(modeIndex)}
                  className="w-full py-2.5 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-400 dark:text-gray-500 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                >
                  + {t('config.addCharacter')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
