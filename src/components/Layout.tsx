import type { LucideIcon } from 'lucide-react';
import { BookOpen, Monitor, Moon, Pen, Play, Settings, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import LanguageSwitch from './LanguageSwitch';

const navItems: { path: string; labelKey: string; Icon: LucideIcon }[] = [
  { path: '/', labelKey: 'nav.text', Icon: Pen },
  { path: '/guide', labelKey: 'nav.guide', Icon: Play },
  { path: '/codes', labelKey: 'nav.codeGuide', Icon: BookOpen },
  { path: '/settings', labelKey: 'nav.settings', Icon: Settings },
];

const themeIcons: Record<string, LucideIcon> = {
  light: Sun,
  system: Monitor,
  dark: Moon,
};

const themeLabel: Record<string, string> = {
  light: 'common.lightMode',
  system: 'common.systemMode',
  dark: 'common.darkMode',
};

export default function Layout() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 dark:from-indigo-800 dark:via-indigo-900 dark:to-violet-900 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg font-bold backdrop-blur-sm">
              α
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-tight">{t('app.name')}</h1>
              <p className="text-indigo-200 text-[11px] leading-tight">{t('app.tagline')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="btn-press flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm px-3 py-1.5 rounded-full transition-colors backdrop-blur-sm border border-white/10"
              aria-label={t(themeLabel[theme])}
              title={t(themeLabel[theme])}
            >
              {(() => {
                const ThemeIcon = themeIcons[theme];
                return <ThemeIcon size={18} />;
              })()}
            </button>
            <LanguageSwitch />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 pb-24">
        <div className="animate-fade-up">
          <Outlet />
        </div>
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] z-50">
        <div className="max-w-4xl mx-auto flex">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2.5 px-1 text-xs transition-all duration-200 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold scale-105'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`
              }
            >
              {({ isActive }) => (
                <span className="nav-indicator" data-active={isActive}>
                  <span className="flex flex-col items-center">
                    <item.Icon
                      size={20}
                      className={`mb-0.5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                    />
                    <span>{t(item.labelKey)}</span>
                  </span>
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
