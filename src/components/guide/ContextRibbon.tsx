import type { Instruction } from '../../types/instruction';

export default function ContextRibbon({
  instructions,
  currentStep,
  context,
}: {
  instructions: Instruction[];
  currentStep: number;
  context: { before: string[]; after: string[] };
}) {
  const currentInstruction = instructions[currentStep];
  const currentChar = currentInstruction.type === 'code' ? currentInstruction.character : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 animate-card-in">
      <div className="flex items-center justify-center gap-1 text-lg font-mono">
        {context.before.map((char, i) => (
          <span
            key={`b-${i}`}
            className="w-8 h-8 flex items-center justify-center text-gray-300 dark:text-gray-600 text-sm rounded-lg"
          >
            {char === ' ' ? '␣' : char}
          </span>
        ))}
        {currentChar && (
          <span className="w-11 h-11 flex items-center justify-center bg-indigo-50 text-indigo-700 font-bold rounded-xl border-2 border-indigo-400 text-base animate-pulse-ring">
            {currentChar === ' ' ? '␣' : currentChar}
          </span>
        )}
        {!currentChar && (
          <span className="w-11 h-11 flex items-center justify-center bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold rounded-xl border-2 border-amber-400 dark:border-amber-600 text-xs">
            ⇌
          </span>
        )}
        {context.after.map((char, i) => (
          <span
            key={`a-${i}`}
            className="w-8 h-8 flex items-center justify-center text-gray-300 dark:text-gray-600 text-sm rounded-lg"
          >
            {char === ' ' ? '␣' : char}
          </span>
        ))}
      </div>
    </div>
  );
}
