import { beforeEach, describe, expect, it } from 'vitest';
import {
  getBrowserPreferredLanguage,
  getInitialLanguage,
  LANGUAGE_STORAGE_KEY,
} from '../i18n/detectLanguage';

describe('language detection', () => {
  beforeEach(() => {
    localStorage.clear();

    Object.defineProperty(window.navigator, 'languages', {
      configurable: true,
      value: ['en-US'],
    });

    Object.defineProperty(window.navigator, 'language', {
      configurable: true,
      value: 'en-US',
    });
  });

  it('prefers french when it appears before english', () => {
    expect(getBrowserPreferredLanguage(['fr-FR', 'en-US'])).toBe('fr');
  });

  it('defaults to english when english appears before french', () => {
    expect(getBrowserPreferredLanguage(['en-US', 'fr-FR'])).toBe('en');
  });

  it('keeps an explicit saved language over browser preferences', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'fr');

    expect(getInitialLanguage()).toBe('fr');
  });
});
