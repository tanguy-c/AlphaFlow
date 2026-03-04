import { createContext, type ReactNode, useContext, useRef } from 'react';
import { useStore } from 'zustand';
import { createSessionStore, type SessionState } from '../store/sessionStore';

export type SessionStoreApi = ReturnType<typeof createSessionStore>;

export const SessionStoreContext = createContext<SessionStoreApi | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const storeRef = useRef<SessionStoreApi | null>(null);
  if (!storeRef.current) {
    storeRef.current = createSessionStore();
  }

  return (
    <SessionStoreContext.Provider value={storeRef.current}>{children}</SessionStoreContext.Provider>
  );
};

export const useSessionStore = <T = SessionState>(
  selector: (store: SessionState) => T = (state) => state as unknown as T,
): T => {
  const context = useContext(SessionStoreContext);
  if (!context) {
    throw new Error('useSessionStore must be used within SessionProvider');
  }
  return useStore(context, selector);
};
