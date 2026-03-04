import { createStore } from 'zustand';
import type { Instruction } from '../types/instruction';

export interface SessionState {
  text: string;
  instructions: Instruction[];
  currentStep: number;
  isCompleted: boolean;

  // Actions
  setText: (text: string) => void;
  setInstructions: (instructions: Instruction[]) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  reset: () => void;
  restart: () => void;
}

export const createSessionStore = () =>
  createStore<SessionState>()((set, get) => ({
    text: '',
    instructions: [],
    currentStep: 0,
    isCompleted: false,

    setText: (text) => set({ text }),

    setInstructions: (instructions) => set({ instructions, currentStep: 0, isCompleted: false }),

    goToStep: (step) => {
      const { instructions } = get();
      if (step >= 0 && step < instructions.length) {
        set({ currentStep: step, isCompleted: false });
      }
    },

    nextStep: () => {
      const { currentStep, instructions } = get();
      if (currentStep < instructions.length - 1) {
        set({ currentStep: currentStep + 1 });
      } else {
        set({ isCompleted: true });
      }
    },

    previousStep: () => {
      const { currentStep } = get();
      if (currentStep > 0) {
        set({ currentStep: currentStep - 1, isCompleted: false });
      }
    },

    reset: () => set({ text: '', instructions: [], currentStep: 0, isCompleted: false }),

    restart: () => set({ currentStep: 0, isCompleted: false }),
  }));
