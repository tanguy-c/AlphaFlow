import type { Instruction } from '../../types/instruction';

export default function StepCard({
  instruction,
  t,
}: {
  instruction: Instruction;
  t: (key: string, options?: Record<string, string | number>) => string;
}) {
  if (instruction.type === 'mode_change') {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-6 text-center space-y-3 shadow-sm animate-card-in">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-3xl mx-auto">
          ⇌
        </div>
        <p className="text-amber-800 dark:text-amber-300 font-bold text-lg">
          {t('guide.switchToMode')}
        </p>
        <p className="text-3xl font-bold text-amber-900 dark:text-amber-200">
          {instruction.toModeName}
        </p>
        {instruction.fromModeName && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {t('guide.from')} <span className="font-medium">{instruction.fromModeName}</span>{' '}
            {t('guide.to')} <span className="font-medium">{instruction.toModeName}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center space-y-5 shadow-sm animate-card-in">
      <div className="inline-flex items-center bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide">
        {instruction.modeName}
      </div>

      <div>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold mb-2">
          {t('guide.enterCode')}
        </p>
        <p className="text-5xl font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-widest leading-none">
          {instruction.code}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
        <span className="text-gray-300 dark:text-gray-600 text-xs">▼</span>
        <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
      </div>

      <div>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold mb-2">
          {t('guide.currentChar')}
        </p>
        <p className="text-6xl font-bold text-gray-800 dark:text-gray-100 leading-none">
          {instruction.character === ' ' ? '␣' : instruction.character}
        </p>
      </div>
    </div>
  );
}
