import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMachineStore } from '../providers/MachineProvider';
import { useSessionStore } from '../providers/SessionProvider';
import type { GenerationError } from '../types/instruction';
import type { MachineConfig } from '../types/machine';
import { generateInstructions } from '../utils/instructionGenerator';

function MachineSelector() {
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
          <span className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-500 dark:text-indigo-400 text-lg shrink-0">
            ⚙
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
          ▾
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

function SpecialCharHelper({ onInsert }: { onInsert: (char: string) => void }) {
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
        <span>{isOpen ? '▾' : '▸'}</span>
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

export default function TextPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const activeMachine = useMachineStore((s) => s.getActiveMachine());
  const { text, setText, setInstructions } = useSessionStore();
  const [errors, setErrors] = useState<GenerationError[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxChars = activeMachine?.maxChars || 0;
  const isOverLimit = maxChars > 0 && text.length > maxChars;

  /** Check if a character can be converted by the active machine */
  const isCharCompatible = useCallback((char: string, machine: MachineConfig): boolean => {
    const sensitive = machine.caseSensitive ?? false;
    for (const mode of machine.modes) {
      const found = mode.characters.some((m) =>
        sensitive ? m.character === char : m.character.toUpperCase() === char.toUpperCase(),
      );
      if (found) return true;
    }
    return false;
  }, []);

  const insertChar = (char: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = text.slice(0, start) + char + text.slice(end);
      if (maxChars > 0 && newText.length > maxChars) return;
      setText(newText);
      setErrors([]);
      // Restore cursor position after the inserted char
      requestAnimationFrame(() => {
        textarea.selectionStart = start + char.length;
        textarea.selectionEnd = start + char.length;
        textarea.focus();
      });
    } else {
      const newText = text + char;
      if (maxChars > 0 && newText.length > maxChars) return;
      setText(newText);
      setErrors([]);
    }
  };

  const handleGenerate = () => {
    if (!activeMachine || !text.trim()) return;

    const result = generateInstructions(text, activeMachine);
    setErrors(result.errors);

    if (result.instructions.length > 0) {
      setInstructions(result.instructions);
      navigate('/guide');
    }
  };

  if (!activeMachine) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-3xl mb-5">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {t('text.noMachine')}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
          {t('text.selectMachineFirst')}
        </p>
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="btn-press bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-md"
        >
          {t('text.goToConfig')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('text.title')}</h2>

      {/* Machine selector dropdown */}
      <MachineSelector />

      {/* Text input */}
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 animate-card-in"
        style={{ animationDelay: '100ms' }}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            const newVal = e.target.value;
            if (maxChars > 0 && newVal.length > maxChars) return;
            setText(newVal);
            setErrors([]);
          }}
          placeholder={t('text.placeholder')}
          rows={6}
          className={`w-full border rounded-xl px-4 py-3 text-base resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-300 dark:placeholder:text-gray-500 ${
            isOverLimit
              ? 'border-red-400 dark:border-red-600 bg-red-50/50 dark:bg-red-950/30'
              : 'border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
          }`}
          autoFocus
        />

        {/* Special character helper */}
        <SpecialCharHelper onInsert={insertChar} />

        {/* Character count & hints */}
        <div className="mt-2 flex items-center justify-end gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            {maxChars > 0 ? (
              <span
                className={`tabular-nums font-medium ${isOverLimit ? 'text-red-500' : text.length >= maxChars * 0.9 ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}
              >
                {t('text.charCounter', { count: text.length, max: maxChars })}
              </span>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">
                <span className="tabular-nums">{text.length}</span>{' '}
                {t('text.charCount', { count: text.length })}
              </span>
            )}
          </div>
        </div>
        {isOverLimit && (
          <p className="mt-1 text-xs text-red-500 font-medium">
            {t('text.maxCharsReached', { max: maxChars })}
          </p>
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl p-4 animate-fade-up">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xs">
              !
            </span>
            <p className="text-red-700 dark:text-red-400 font-medium text-sm">{t('text.errors')}</p>
          </div>
          <ul className="space-y-1 ml-7">
            {errors.map((error) => (
              <li
                key={`${error.character}-${error.position}`}
                className="text-red-600 dark:text-red-400 text-sm"
              >
                {t('text.characterNotFound', {
                  char: error.character,
                  pos: error.position,
                })}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Generate button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={!text.trim()}
        className="btn-press w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 rounded-2xl font-semibold text-base hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none animate-card-in"
        style={{ animationDelay: '150ms' }}
      >
        ▶ {t('text.generate')}
      </button>

      {/* Preview */}
      {text.trim() && activeMachine && (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-2xl p-4 border border-gray-200/60 dark:border-gray-700/60 animate-fade-up">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2 font-semibold uppercase tracking-wider">
            {t('text.preview')}
          </p>
          <p className="text-lg font-mono tracking-widest break-all leading-relaxed">
            {[...text].map((char, i) => {
              const compatible = isCharCompatible(char, activeMachine);
              return (
                <span
                  key={i}
                  className={
                    compatible
                      ? 'text-gray-700 dark:text-gray-300'
                      : 'text-red-500 bg-red-100 dark:bg-red-950 dark:text-red-400 rounded px-0.5'
                  }
                  title={compatible ? undefined : t('text.characterNotFound', { char, pos: i + 1 })}
                >
                  {char}
                </span>
              );
            })}
          </p>
        </div>
      )}
    </div>
  );
}
