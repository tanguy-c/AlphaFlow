import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { useVoice } from '../hooks/useVoice';
import { useSessionStore } from '../providers/SessionProvider';
import type { Instruction } from '../types/instruction';
import { getStepContext } from '../utils/instructionGenerator';

export default function GuidePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { instructions, currentStep, isCompleted, nextStep, previousStep, restart } =
    useSessionStore();
  const {
    enabled: voiceEnabled,
    supported: voiceSupported,
    available: voiceAvailable,
    toggle: toggleVoice,
    speakInstruction,
    stop: stopVoice,
  } = useVoice();
  const prevStepRef = useRef(currentStep);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => nextStep(),
    onSwipedRight: () => previousStep(),
    trackMouse: false,
    trackTouch: true,
    delta: 30,
  });

  // Arrow key navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        previousStep();
      }
    },
    [nextStep, previousStep],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Speak instruction on step change
  useEffect(() => {
    if (voiceEnabled && instructions.length > 0 && !isCompleted) {
      speakInstruction(instructions[currentStep]);
    }
    prevStepRef.current = currentStep;
  }, [currentStep, voiceEnabled, instructions, isCompleted, speakInstruction]);

  // Stop voice on completion
  useEffect(() => {
    if (isCompleted) stopVoice();
  }, [isCompleted, stopVoice]);

  if (instructions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-3xl mb-5">
          📝
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {t('guide.noInstructions')}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
          {t('guide.writeTextFirst')}
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-press bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-md"
        >
          {t('guide.goToText')}
        </button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
        <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center text-5xl mb-5">
          🎉
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {t('guide.completed')}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs">
          {t('guide.completedMessage', { total: instructions.length })}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={restart}
            className="btn-press bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-md"
          >
            ↺ {t('guide.restart')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-press bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {t('guide.goToText')}
          </button>
        </div>
      </div>
    );
  }

  const instruction = instructions[currentStep];
  const context = getStepContext(instructions, currentStep);

  return (
    <div className="space-y-4" {...swipeHandlers}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('guide.title')}</h2>
        {voiceSupported && voiceAvailable && (
          <button
            type="button"
            onClick={toggleVoice}
            className={`btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              voiceEnabled
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            aria-label={t(voiceEnabled ? 'guide.voiceOff' : 'guide.voiceOn')}
          >
            <span>{voiceEnabled ? '🔊' : '🔇'}</span>
            <span className="hidden sm:inline">
              {t(voiceEnabled ? 'guide.voiceOff' : 'guide.voiceOn')}
            </span>
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-2 animate-card-in">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {t('guide.step', {
              current: currentStep + 1,
              total: instructions.length,
            })}
          </p>
          <p className="text-sm font-semibold text-indigo-600 tabular-nums">
            {Math.round(((currentStep + 1) / instructions.length) * 100)}%
          </p>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep + 1) / instructions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Context ribbon */}
      <ContextRibbon instructions={instructions} currentStep={currentStep} context={context} />

      {/* Step card */}
      <StepCard instruction={instruction} t={t} />

      {/* Navigation hint */}
      <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 tracking-wide">
        {t('guide.swipeHint')} · ← → {t('guide.arrowHint')}
      </p>

      {/* Navigation buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={previousStep}
          disabled={currentStep === 0}
          className="btn-press flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3.5 rounded-2xl font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-30"
        >
          ← {t('guide.previous')}
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="btn-press flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 rounded-2xl font-semibold text-sm hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md"
        >
          {currentStep === instructions.length - 1
            ? `✓ ${t('guide.finish')}`
            : `${t('guide.next')} →`}
        </button>
      </div>
    </div>
  );
}

function ContextRibbon({
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

function StepCard({
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
      {/* Character */}
      <div>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold mb-2">
          {t('guide.currentChar')}
        </p>
        <p className="text-6xl font-bold text-gray-800 dark:text-gray-100 leading-none">
          {instruction.character === ' ' ? '␣' : instruction.character}
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
        <span className="text-gray-300 dark:text-gray-600 text-xs">▼</span>
        <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
      </div>

      {/* Code */}
      <div>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold mb-2">
          {t('guide.enterCode')}
        </p>
        <p className="text-5xl font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-widest leading-none">
          {instruction.code}
        </p>
      </div>

      {/* Mode badge */}
      <div className="inline-flex items-center bg-indigo-50 text-indigo-600 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide">
        {instruction.modeName}
      </div>
    </div>
  );
}
