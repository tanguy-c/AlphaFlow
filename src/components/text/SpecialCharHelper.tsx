import { ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMachineStore } from '../../providers/MachineProvider';

export default function SpecialCharHelper({ onInsert }: { onInsert: (char: string) => void }) {
  const { t } = useTranslation();
  const activeMachine = useMachineStore((s) => s.getActiveMachine());
  const [isOpen, setIsOpen] = useState(false);

  const specialChars = useMemo(() => {
    if (!activeMachine) return [];
    const seen = new Set<string>();
    const result: { character: string; label: string }[] = [];
    for (const mode of activeMachine.modes) {
      for (const c of mode.characters) {
        const ch = c.character;
        if (seen.has(ch)) continue;
        seen.add(ch);
        // Keep non-alphanumeric, non-basic-punctuation characters
        if (ch.length > 0 && !/^[a-zA-Z0-9 .,;:!?'"()\-/]$/.test(ch)) {
          result.push({ character: ch, label: ch });
        }
      }
    }
    return result;
  }, [activeMachine]);

  if (specialChars.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors"
      >
        <span>{isOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}</span>
        {t('text.specialChars')}
        <span className="text-gray-300">({specialChars.length})</span>
      </button>
      {isOpen && (
        <div className="flex flex-wrap gap-1.5 mt-2 animate-fade-up">
          {specialChars.map((sc) => (
            <button
              key={sc.character}
              type="button"
              onClick={() => onInsert(sc.character)}
              className="btn-press w-9 h-9 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-400 transition-all"
              title={sc.character}
            >
              {sc.character}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
