import { ClipboardList, Download, Plus, Settings, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import CatalogModal from '../components/config/CatalogModal';
import MachineEditor from '../components/config/MachineEditor';
import { getCatalogMachine } from '../data/catalog';
import { useMachineStore } from '../providers/MachineProvider';
import type { MachineConfig } from '../types/machine';
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
    <>
      {/* Toast */}
      {toast &&
        createPortal(
          <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium animate-fade-up ${
              toast.type === 'success'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-red-500 to-rose-500'
            }`}
          >
            {toast.message}
          </div>,
          document.body,
        )}

      {/* Catalog modal */}
      {showCatalog &&
        createPortal(
          <CatalogModal
            onSelect={handleImportFromCatalog}
            onClose={() => setShowCatalog(false)}
            t={t}
          />,
          document.body,
        )}

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('config.title')}</h2>

        {/* Add machine */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-3 animate-card-in">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {t('config.addMachineTitle')}
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowCatalog(true)}
              className="btn-press flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950 dark:to-indigo-950 text-indigo-700 dark:text-indigo-300 px-3 py-2.5 rounded-xl text-sm font-medium hover:from-violet-100 hover:to-indigo-100 dark:hover:from-violet-900 dark:hover:to-indigo-900 transition-colors border border-indigo-200 dark:border-indigo-800"
            >
              <ClipboardList size={16} /> {t('config.fromCatalog')}
            </button>
            <button
              type="button"
              onClick={handleImport}
              className="btn-press flex-1 flex items-center justify-center gap-1.5 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
            >
              <Download size={16} /> {t('config.import')}
            </button>
            <button
              type="button"
              onClick={handleNewMachine}
              className="btn-press flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-3 py-2.5 rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md"
            >
              <Plus size={16} /> {t('config.createCustom')}
            </button>
          </div>
        </div>

        {/* Machine selector */}
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
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={!activeMachine}
              className="btn-press flex-1 flex items-center justify-center gap-1.5 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-40"
            >
              <Upload size={16} /> {t('config.export')}
            </button>
            <button
              type="button"
              onClick={handleDeleteMachine}
              disabled={!activeMachine}
              className="btn-press bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400 px-3 py-2.5 rounded-xl text-sm hover:bg-red-100 dark:hover:bg-red-900 transition-colors border border-red-100 dark:border-red-800 disabled:opacity-40"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Machine editor */}
        {activeMachine ? (
          <MachineEditor machine={activeMachine} onUpdate={updateMachine} t={t} />
        ) : (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500 animate-fade-up">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Settings size={32} className="text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
              {t('config.noConfigs')}
            </p>
            <p className="mt-1 text-sm">{t('config.createFirst')}</p>
          </div>
        )}
      </div>
    </>
  );
}
