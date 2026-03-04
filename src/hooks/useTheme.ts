import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'alphaflow-theme';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';
const themeCycle = ['light', 'dark', 'system'] as const;

type ResolvedTheme = 'light' | 'dark';
type Theme = (typeof themeCycle)[number];

function getMediaQueryList() {
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia(MEDIA_QUERY);
  }

  return {
    matches: false,
    media: MEDIA_QUERY,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    onchange: null,
    dispatchEvent: () => false,
  } as MediaQueryList;
}

function getSystemTheme(): ResolvedTheme {
  return getMediaQueryList().matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  return themeCycle.includes(stored as Theme) ? (stored as Theme) : null;
}

function getThemeMode(): Theme {
  return getStoredTheme() ?? 'system';
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === 'system' ? getSystemTheme() : theme;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', resolveTheme(theme) === 'dark');
}

function notifyListeners() {
  const theme = getThemeMode();
  applyTheme(theme);
  for (const listener of listeners) {
    listener();
  }
}

function subscribeToSystemThemeChanges(callback: () => void) {
  const mediaQuery = getMediaQueryList();
  const legacyMediaQuery = mediaQuery as MediaQueryList & {
    addListener?: (listener: () => void) => void;
    removeListener?: (listener: () => void) => void;
  };
  const listener = () => {
    if (getThemeMode() === 'system') {
      callback();
    }
  };

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }

  if (typeof legacyMediaQuery.addListener === 'function') {
    legacyMediaQuery.addListener(listener);
    return () => legacyMediaQuery.removeListener?.(listener);
  }

  return () => undefined;
}

// Initialize on load
applyTheme(getThemeMode());

// Simple pub/sub for theme changes
const listeners = new Set<() => void>();
let unsubscribeFromSystemTheme: (() => void) | null = null;

function ensureSystemThemeSubscription() {
  if (!unsubscribeFromSystemTheme) {
    unsubscribeFromSystemTheme = subscribeToSystemThemeChanges(notifyListeners);
  }
}

function subscribe(listener: () => void) {
  ensureSystemThemeSubscription();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  const theme = getThemeMode();
  return `${theme}:${resolveTheme(theme)}`;
}

export function useTheme() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);
  const [theme, resolvedTheme] = snapshot.split(':') as [Theme, ResolvedTheme];

  const toggleTheme = useCallback(() => {
    const currentIndex = themeCycle.indexOf(getThemeMode());
    const next = themeCycle[(currentIndex + 1) % themeCycle.length];
    localStorage.setItem(STORAGE_KEY, next);
    notifyListeners();
  }, []);

  return {
    theme,
    isDark: resolvedTheme === 'dark',
    isSystem: theme === 'system',
    toggleTheme,
  };
}
