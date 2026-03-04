import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { getCatalogEntries, getCatalogMachine } from '../data/catalog';
import { useMachineStore } from '../providers/MachineProvider';
import type { CharacterMapping, MachineConfig, MachineMode } from '../types/machine';
import { exportConfig, openFileDialog, parseConfigFile } from '../utils/importExport';

export default function ConfigPage() {
  const { t } = useTranslation();
  const {
    machines,
    activeMachineId,
    setActiveMachine,
    addMachine,
    updateMachine,
    deleteMachine,
    importMachine,
  } = useMachineStore();
  const activeMachine = machines.find((m) => m.id === activeMachineId) || null;

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleNewMachine = () => {
    const now = new Date().toISOString();
    const machine: MachineConfig = {
      id: uuidv4(),
      name: t('config.newMachine'),
      description: '',
      codeFormat: { padding: 2 },
      defaultModeId: 'mode-1',
      modes: [
        {
          id: 'mode-1',
          name: 'Mode 1',
          characters: [],
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    addMachine(machine);
  };

  const handleImport = async () => {
    try {
      const content = await openFileDialog();
      const config = parseConfigFile(content);
      importMachine(config);
      showToast(t('config.importSuccess'), 'success');
    } catch {
      showToast(t('config.importError'), 'error');
    }
  };

  const handleExport = () => {
    if (activeMachine) {
      exportConfig(activeMachine);
    }
  };

  const handleDeleteMachine = () => {
    if (activeMachine && window.confirm(t('config.confirmDelete'))) {
      deleteMachine(activeMachine.id);
    }
  };

  const handleImportFromCatalog = (catalogId: string) => {
    const machine = getCatalogMachine(catalogId);
    if (machine) {
      importMachine(machine);
      setShowCatalog(false);
      showToast(t('config.importSuccess'), 'success');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('config.title')}</h2>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-fade-up ${
            toast.type === 'success'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : 'bg-gradient-to-r from-red-500 to-rose-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Catalog modal */}
      {showCatalog && (
        <CatalogModal
          onSelect={handleImportFromCatalog}
          onClose={() => setShowCatalog(false)}
          t={t}
        />
      )}

      {/* Machine selector + actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-3 animate-card-in">
        <div className="flex flex-wrap gap-2">
          <select
            value={activeMachineId || ''}
            onChange={(e) => setActiveMachine(e.target.value)}
            className="flex-1 min-w-0 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {machines.length === 0 && <option value="">{t('config.selectMachine')}</option>}
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleNewMachine}
            className="btn-press bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md"
          >
            + {t('config.newMachine')}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowCatalog(true)}
            className="btn-press flex-1 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950 dark:to-indigo-950 text-indigo-700 dark:text-indigo-300 px-3 py-2.5 rounded-xl text-sm font-medium hover:from-violet-100 hover:to-indigo-100 dark:hover:from-violet-900 dark:hover:to-indigo-900 transition-colors border border-indigo-200 dark:border-indigo-800"
          >
            📋 {t('config.fromCatalog')}
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="btn-press flex-1 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
          >
            📥 {t('config.import')}
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!activeMachine}
            className="btn-press flex-1 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-40"
          >
            📤 {t('config.export')}
          </button>
          <button
            type="button"
            onClick={handleDeleteMachine}
            disabled={!activeMachine}
            className="btn-press bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400 px-3 py-2.5 rounded-xl text-sm hover:bg-red-100 dark:hover:bg-red-900 transition-colors border border-red-100 dark:border-red-800 disabled:opacity-40"
          >
            🗑
          </button>
        </div>
      </div>

      {/* Machine editor */}
      {activeMachine ? (
        <MachineEditor
          machine={activeMachine}
          onUpdate={updateMachine}
          onSave={() => showToast(t('config.saved'), 'success')}
          t={t}
        />
      ) : (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500 animate-fade-up">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-3xl mx-auto mb-4">
            ⚙
          </div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
            {t('config.noConfigs')}
          </p>
          <p className="mt-1 text-sm">{t('config.createFirst')}</p>
        </div>
      )}
    </div>
  );
}

// Machine editor component
function MachineEditor({
  machine,
  onUpdate,
  onSave,
  t,
}: {
  machine: MachineConfig;
  onUpdate: (m: MachineConfig) => void;
  onSave: () => void;
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
    const modes = machine.modes.filter((_, i) => i !== index);
    const updatedDefault =
      machine.modes[index].id === machine.defaultModeId && modes.length > 0
        ? modes[0].id
        : machine.defaultModeId;
    update({ modes, defaultModeId: updatedDefault });
  };

  const addCharacter = (modeIndex: number) => {
    const modes = [...machine.modes];
    modes[modeIndex] = {
      ...modes[modeIndex],
      characters: [...modes[modeIndex].characters, { character: '', code: '' }],
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
      {/* Machine info */}
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

      {/* Modes */}
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
            {/* Mode header */}
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
              <span
                className={`text-gray-400 dark:text-gray-500 text-xs transition-transform duration-200 ${expandedModes.has(mode.id) ? 'rotate-90' : ''}`}
              >
                ▶
              </span>
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
                🗑
              </button>
            </div>

            {/* Characters */}
            {expandedModes.has(mode.id) && (
              <div className="p-4 space-y-2">
                {mode.characters.map((char, charIndex) => (
                  <div key={charIndex} className="flex items-center gap-2">
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
                    <span className="text-gray-300 dark:text-gray-600">→</span>
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
                    <button
                      type="button"
                      onClick={() => deleteCharacter(modeIndex, charIndex)}
                      className="text-red-300 hover:text-red-500 text-xs ml-auto transition-colors"
                    >
                      ✕
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

      {/* Save button */}
      <button
        type="button"
        onClick={onSave}
        className="btn-press w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 rounded-2xl font-semibold text-sm hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md"
      >
        ✓ {t('config.save')}
      </button>
    </div>
  );
}

// Catalog picker modal
function CatalogModal({
  onSelect,
  onClose,
  t,
}: {
  onSelect: (id: string) => void;
  onClose: () => void;
  t: (key: string) => string;
}) {
  const entries = getCatalogEntries();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-up">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {t('config.catalogTitle')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>
        <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
          {entries.length === 0 ? (
            <p className="text-center text-gray-400 dark:text-gray-500 py-6 text-sm">
              {t('config.catalogEmpty')}
            </p>
          ) : (
            entries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSelect(entry.id)}
                className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all"
              >
                <div className="font-medium text-gray-800 dark:text-gray-100">{entry.name}</div>
                {entry.description && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {entry.description}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
        <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
