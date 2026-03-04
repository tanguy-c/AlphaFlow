import { X } from 'lucide-react';
import { useState } from 'react';
import { getCatalogEntries } from '../../data/catalog';

export default function CatalogModal({
  onSelect,
  onClose,
  t,
}: {
  onSelect: (id: string) => void;
  onClose: () => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}) {
  const entries = getCatalogEntries();
  const [search, setSearch] = useState('');

  const filtered = entries.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-up">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {t('config.catalogTitle')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-4 pt-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${t('codeGuide.search')}`}
            className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            autoFocus
          />
        </div>
        <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 dark:text-gray-500 py-6 text-sm">
              {t('config.catalogEmpty')}
            </p>
          ) : (
            filtered.map((entry) => (
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
                <div className="flex gap-3 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                  <span>{t('config.catalogModes', { count: entry.modesCount })}</span>
                  <span>{t('config.catalogChars', { count: entry.charsCount })}</span>
                </div>
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
