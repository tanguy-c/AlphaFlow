import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';
import { getInitialLanguage, LANGUAGE_STORAGE_KEY } from './detectLanguage';
import fr from './fr';

const initialLanguage = getInitialLanguage();

i18n.use(initReactI18next).init({
  resources: {
    en,
    fr,
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLanguage;
}

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  }

  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
});

export default i18n;
