import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMachineStore } from '../providers/MachineProvider';

export default function CodeGuidePage() {
  const { t } = useTranslation();
  const activeMachine = useMachineStore((s) => s.getActiveMachine());
  const [search, setSearch] = useState('');
  const [selectedModeId, setSelectedModeId] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    if (!activeMachine) return [];

    const modes =
      selectedModeId === null
        ? activeMachine.modes
        : activeMachine.modes.filter((m) => m.id === selectedModeId);

    if (!search.trim() && search !== ' ') return modes;

    const query = search.toLowerCase();

    return modes
      .map((mode) => ({
        ...mode,
        characters: mode.characters.filter((c) => {
          return c.character.toLowerCase().includes(query) || c.code.toLowerCase().includes(query);
        }),
      }))
      .filter((mode) => mode.characters.length > 0);
  }, [activeMachine, selectedModeId, search]);

  if (!activeMachine) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-3xl mb-5">
          📋
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {t('text.noMachine')}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs">{t('text.selectMachineFirst')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        {t('codeGuide.title')}
      </h2>

      {/* Machine badge */}
      <div className="inline-flex items-center bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-3.5 py-1.5 rounded-full text-sm font-medium gap-1.5">
        <span className="w-2 h-2 rounded-full bg-indigo-400" />
        {activeMachine.name}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 animate-card-in">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('codeGuide.search')}
            className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-300 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          type="button"
          onClick={() => setSelectedModeId(null)}
          className={`btn-press whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedModeId === null
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {t('codeGuide.allModes')}
        </button>
        {activeMachine.modes.map((mode) => (
          <button
            type="button"
            key={mode.id}
            onClick={() => setSelectedModeId(mode.id)}
            className={`btn-press whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedModeId === mode.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {mode.name}
          </button>
        ))}
      </div>

      {/* Code grids */}
      {filteredData.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500 animate-fade-up">
          <p className="text-lg">{t('codeGuide.noResults')}</p>
        </div>
      ) : (
        filteredData.map((mode, i) => (
          <div
            key={mode.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-card-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                {mode.name}
              </h3>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-px bg-gray-100 dark:bg-gray-700">
              {mode.characters.map((char) => (
                <div
                  key={`${char.character}-${char.code}`}
                  className="bg-white dark:bg-gray-800 flex flex-col items-center justify-center py-3.5 px-1 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors group cursor-default"
                >
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                    {char.character === ' ' ? '␣' : char.character}
                  </span>
                  <span className="text-[11px] font-mono text-indigo-500 mt-0.5 group-hover:text-indigo-600 tabular-nums">
                    {char.code}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
