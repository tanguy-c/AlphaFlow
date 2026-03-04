import { createContext, type ReactNode, useContext, useRef } from 'react';
import { useStore } from 'zustand';
import { createMachineStore, type MachineState } from '../store/machineStore';

export type MachineStoreApi = ReturnType<typeof createMachineStore>;

export const MachineStoreContext = createContext<MachineStoreApi | undefined>(undefined);

export const MachineProvider = ({ children }: { children: ReactNode }) => {
  const storeRef = useRef<MachineStoreApi | null>(null);
  if (!storeRef.current) {
    storeRef.current = createMachineStore();
  }

  return (
    <MachineStoreContext.Provider value={storeRef.current}>{children}</MachineStoreContext.Provider>
  );
};

export const useMachineStore = <T = MachineState>(
  selector: (store: MachineState) => T = (state) => state as unknown as T,
): T => {
  const context = useContext(MachineStoreContext);
  if (!context) {
    throw new Error('useMachineStore must be used within MachineProvider');
  }
  return useStore(context, selector);
};
