export const LANGUAGE_STORAGE_KEY = 'alphaflow-lang';

export type AppLanguage = 'en' | 'fr';

function normalizeLanguage(value: string | null | undefined): AppLanguage | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.toLowerCase();

  if (normalizedValue.startsWith('fr')) {
    return 'fr';
  }

  if (normalizedValue.startsWith('en')) {
    return 'en';
  }

  return null;
}

export function getBrowserPreferredLanguage(languages: readonly string[] = []): AppLanguage {
  const normalizedLanguages = languages
    .map((language) => normalizeLanguage(language))
    .filter((language): language is AppLanguage => language !== null);

  const frenchIndex = normalizedLanguages.indexOf('fr');
  const englishIndex = normalizedLanguages.indexOf('en');

  if (frenchIndex !== -1 && (englishIndex === -1 || frenchIndex < englishIndex)) {
    return 'fr';
  }

  return 'en';
}

export function getInitialLanguage(): AppLanguage {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const savedLanguage = normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));

  if (savedLanguage) {
    return savedLanguage;
  }

  const browserLanguages =
    window.navigator.languages.length > 0
      ? window.navigator.languages
      : [window.navigator.language];

  return getBrowserPreferredLanguage(browserLanguages);
}
