import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Instruction } from '../types/instruction';

export function useVoice() {
  const { t, i18n } = useTranslation();
  const [enabled, setEnabled] = useState(false);
  // supported means API exists in browser
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window);
  // available means voices have been loaded and at least one is usable
  const [available, setAvailable] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
    }
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !enabled) return;
      stop();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
      utterance.rate = 0.9;
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [supported, enabled, stop, i18n.language],
  );

  const speakInstruction = useCallback(
    (instruction: Instruction) => {
      if (!enabled) return;

      if (instruction.type === 'mode_change') {
        speak(t('guide.voiceModeChange', { mode: instruction.toModeName }));
      } else {
        const charLabel =
          instruction.character === ' ' ? t('guide.voiceSpace') : instruction.character;
        speak(t('guide.voiceCode', { char: charLabel, code: instruction.code }));
      }
    },
    [enabled, speak, t],
  );

  const toggle = useCallback(() => {
    if (!supported || !available) return;
    setEnabled((prev) => {
      if (prev) stop();
      return !prev;
    });
  }, [supported, available, stop]);

  // track voice availability (voices may load asynchronously)
  useEffect(() => {
    if (!supported) return;

    const update = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailable(voices && voices.length > 0);
    };

    // initial check
    update();

    window.speechSynthesis.addEventListener('voiceschanged', update);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', update);
      stop();
    };
  }, [supported, stop]);

  // disable voice if it becomes unavailable
  useEffect(() => {
    if (!available && enabled) {
      stop();
      setEnabled(false);
    }
  }, [available, enabled, stop]);

  return { enabled, supported, available, toggle, speakInstruction, stop };
}
