import { ChevronDown, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMachineStore } from '../../providers/MachineProvider';

export default function MachineSelector() {
  const { t } = useTranslation();
  const { machines, activeMachineId, setActiveMachine } = useMachineStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const activeMachine = machines.find((m) => m.id === activeMachineId);

  const filtered = machines.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      ref={ref}
      className={`relative animate-card-in ${isOpen ? 'z-50' : 'z-10'}`}
      style={{ animationDelay: '50ms' }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn-press w-full flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3.5 text-left shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0">
            <Settings size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
              {activeMachine?.name || t('config.selectMachine')}
            </p>
            {activeMachine?.description && (
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                {activeMachine.description}
              </p>
            )}
          </div>
        </div>
        <span
          className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <ChevronDown size={16} />
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-40 overflow-hidden animate-fade-up">
          {/* Search */}
          <div className="p-2.5 border-b border-gray-100 dark:border-gray-700">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`${t('config.selectMachine')}…`}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              autoFocus
            />
          </div>

          {/* Options */}
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-4 text-sm text-gray-400 dark:text-gray-500 text-center">
                {t('codeGuide.noResults')}
              </div>
            ) : (
              filtered.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => {
                    setActiveMachine(m.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors ${
                    m.id === activeMachineId
                      ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${m.id === activeMachineId ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    {m.id === activeMachineId && <span className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{m.name}</p>
                    {m.description && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                        {m.description}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
