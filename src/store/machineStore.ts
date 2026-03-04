import { createStore } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MachineConfig } from '../types/machine';

export interface MachineState {
  machines: MachineConfig[];
  activeMachineId: string | null;
  /** Whether the user has completed the initial machine setup. */
  hasCompletedSetup: boolean;

  // Actions
  addMachine: (machine: MachineConfig) => void;
  updateMachine: (machine: MachineConfig) => void;
  deleteMachine: (id: string) => void;
  setActiveMachine: (id: string) => void;
  importMachine: (machine: MachineConfig) => void;
  getActiveMachine: () => MachineConfig | null;
  completeSetup: () => void;
}

export const createMachineStore = () =>
  createStore<MachineState>()(
    persist(
      (set, get) => ({
        machines: [],
        activeMachineId: null,
        hasCompletedSetup: false,

        addMachine: (machine) =>
          set((state) => ({
            machines: [...state.machines, machine],
            activeMachineId: machine.id,
          })),

        updateMachine: (machine) =>
          set((state) => ({
            machines: state.machines.map((m) =>
              m.id === machine.id ? { ...machine, updatedAt: new Date().toISOString() } : m,
            ),
          })),

        deleteMachine: (id) =>
          set((state) => {
            const remaining = state.machines.filter((m) => m.id !== id);
            return {
              machines: remaining,
              activeMachineId:
                state.activeMachineId === id
                  ? remaining.length > 0
                    ? remaining[0].id
                    : null
                  : state.activeMachineId,
            };
          }),

        setActiveMachine: (id) => set({ activeMachineId: id }),

        importMachine: (machine) =>
          set((state) => {
            // Replace if same id exists, otherwise add
            const exists = state.machines.some((m) => m.id === machine.id);
            if (exists) {
              return {
                machines: state.machines.map((m) => (m.id === machine.id ? machine : m)),
                activeMachineId: machine.id,
              };
            }
            return {
              machines: [...state.machines, machine],
              activeMachineId: machine.id,
            };
          }),

        getActiveMachine: () => {
          const state = get();
          return state.machines.find((m) => m.id === state.activeMachineId) || null;
        },

        completeSetup: () => set({ hasCompletedSetup: true }),
      }),
      {
        name: 'alphaflow-machines',
      },
    ),
  );
