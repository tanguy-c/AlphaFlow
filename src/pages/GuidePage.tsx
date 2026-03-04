import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  PartyPopper,
  RefreshCw,
  Volume2,
  VolumeOff,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import ContextRibbon from '../components/guide/ContextRibbon';
import StepCard from '../components/guide/StepCard';
import { useVoice } from '../hooks/useVoice';
import { useSessionStore } from '../providers/SessionProvider';
import { getCodeInstructions, getStepContext } from '../utils/instructionGenerator';

export default function GuidePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { instructions, currentStep, isCompleted, nextStep, previousStep, restart, goToStep } =
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

  const instruction = instructions.length > 0 ? instructions[currentStep] : null;
  const context =
    instructions.length > 0 ? getStepContext(instructions, currentStep) : { before: [], after: [] };
  const codeInstructions = useMemo(() => getCodeInstructions(instructions), [instructions]);
  const totalChars = codeInstructions.length;

  // Count how many characters (code instructions) have been completed up to current step
  const charsCompleted = useMemo(() => {
    let count = 0;
    for (let i = 0; i <= currentStep; i++) {
      if (instructions[i]?.type === 'code') count++;
    }
    return count;
  }, [instructions, currentStep]);

  // Build a mapping from character index to step index for the slider
  const charToStep = useMemo(() => {
    const map: number[] = [];
    for (let i = 0; i < instructions.length; i++) {
      if (instructions[i].type === 'code') {
        map.push(i);
      }
    }
    return map;
  }, [instructions]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const charIndex = parseInt(e.target.value, 10);
    const stepIndex = charToStep[charIndex - 1] ?? 0;
    goToStep(stepIndex);
  };

  if (instructions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
          <FileText size={32} className="text-gray-400 dark:text-gray-500" />
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
        <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center mb-5">
          <PartyPopper size={40} className="text-green-500" />
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
            className="btn-press flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-md"
          >
            <RefreshCw size={16} /> {t('guide.restart')}
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
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeOff size={16} />}
            <span className="hidden sm:inline">
              {t(voiceEnabled ? 'guide.voiceOff' : 'guide.voiceOn')}
            </span>
          </button>
        )}
      </div>

      {/* Progress — character based with slider */}
      <div className="space-y-2 animate-card-in">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {t('guide.charProgress', {
              current: charsCompleted,
              total: totalChars,
            })}
          </p>
          <p className="text-sm font-semibold text-indigo-600 tabular-nums">
            {Math.round((charsCompleted / totalChars) * 100)}%
          </p>
        </div>
        <input
          type="range"
          min={1}
          max={totalChars}
          value={charsCompleted || 1}
          onChange={handleSliderChange}
          className="w-full h-2.5 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-indigo-600"
        />
      </div>

      {/* Context ribbon */}
      <ContextRibbon instructions={instructions} currentStep={currentStep} context={context} />

      {/* Step card */}
      <StepCard instruction={instruction!} t={t} />

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
          className="btn-press flex-1 flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3.5 rounded-2xl font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all disabled:opacity-30"
        >
          <ArrowLeft size={16} /> {t('guide.previous')}
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="btn-press flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 rounded-2xl font-semibold text-sm hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md"
        >
          {currentStep === instructions.length - 1 ? (
            <>
              <Check size={16} /> {t('guide.finish')}
            </>
          ) : (
            <>
              {t('guide.next')} <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
