import { useTranslation } from 'react-i18next';

type LanguageSwitchProps = {
  variant?: 'header' | 'surface';
};

export default function LanguageSwitch({ variant = 'header' }: LanguageSwitchProps) {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  const variantClassName =
    variant === 'surface'
      ? 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-sm dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-700'
      : 'bg-white/15 hover:bg-white/25 text-white border-white/10';

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`btn-press flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-colors backdrop-blur-sm border ${variantClassName}`}
      aria-label={t('common.language')}
      title={t('common.language')}
    >
      <span className="text-base">{i18n.language === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
      <span className="font-medium uppercase text-xs tracking-wide">{i18n.language}</span>
    </button>
  );
}
