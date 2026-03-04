import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import LanguageSwitch from '../components/LanguageSwitch';
import { getCatalogEntries, getCatalogMachine } from '../data/catalog';
import { useMachineStore } from '../providers/MachineProvider';
import type { MachineConfig } from '../types/machine';

/**
 * Full-screen setup shown the first time the user opens the app.
 * Lets them pick a machine from the AlphaFlow catalog or create a blank one.
 */
export default function MachineSetupPage() {
  const { t } = useTranslation();
  const { addMachine, completeSetup } = useMachineStore();
  const catalogEntries = getCatalogEntries();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelectCatalog = (id: string) => {
    setSelectedId(id);
  };

  const handleConfirmCatalog = () => {
    if (!selectedId) return;
    const machine = getCatalogMachine(selectedId);
    if (machine) {
      addMachine(machine);
      completeSetup();
    }
  };

  const handleCreateCustom = () => {
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
    completeSetup();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitch variant="surface" />
      </div>
      <div className="w-full max-w-lg space-y-6 animate-fade-up">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-3xl text-white mx-auto shadow-lg">
            α
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {t('setup.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('setup.subtitle')}</p>
        </div>

        {/* Catalog machines */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
            {t('setup.catalogTitle')}
          </h2>
          {catalogEntries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => handleSelectCatalog(entry.id)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                selectedId === entry.id
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}
            >
              <div className="font-medium text-gray-800 dark:text-gray-100">{entry.name}</div>
              {entry.description && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {entry.description}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleConfirmCatalog}
            disabled={!selectedId}
            className="btn-press w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 rounded-2xl font-semibold text-sm hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('setup.useMachine')}
          </button>

          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              {t('setup.or')}
            </span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          <button
            type="button"
            onClick={handleCreateCustom}
            className="btn-press w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3.5 rounded-2xl font-semibold text-sm border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
          >
            + {t('setup.createCustom')}
          </button>
        </div>
      </div>
    </div>
  );
}
