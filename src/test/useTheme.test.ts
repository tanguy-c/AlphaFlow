import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useTheme } from '../hooks/useTheme';

function ThemeTester() {
  const { theme, isDark, isSystem, toggleTheme } = useTheme();
  return React.createElement(
    'div',
    {
      'data-testid': 'root',
      'data-theme': theme,
      'data-dark': isDark.toString(),
      'data-system': isSystem.toString(),
    },
    React.createElement(
      'button',
      {
        onClick: toggleTheme,
        type: 'button',
      },
      'toggle',
    ),
  );
}

describe('useTheme hook', () => {
  let listeners: Array<(e: MediaQueryListEvent) => void>;
  let currentMatches = false;

  beforeEach(() => {
    // reset storage
    localStorage.clear();

    listeners = [];
    currentMatches = false;

    // provide a fake matchMedia implementation
    // store matches value in closure so we can change it
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => {
        return {
          matches: currentMatches,
          media: query,
          addEventListener: (evt: string, cb: (e: MediaQueryListEvent) => void) => {
            if (evt === 'change') listeners.push(cb);
          },
          removeEventListener: (evt: string, cb: (e: MediaQueryListEvent) => void) => {
            if (evt === 'change') {
              const idx = listeners.indexOf(cb);
              if (idx !== -1) listeners.splice(idx, 1);
            }
          },
          addListener: (cb: (e: MediaQueryListEvent) => void) => {
            listeners.push(cb);
          },
          removeListener: (cb: (e: MediaQueryListEvent) => void) => {
            const idx = listeners.indexOf(cb);
            if (idx !== -1) listeners.splice(idx, 1);
          },
          dispatchEvent: () => false,
        } as unknown as MediaQueryList;
      },
    });
  });

  function setSystemPref(dark: boolean) {
    currentMatches = dark;
    const event = { matches: dark } as MediaQueryListEvent;
    listeners.forEach((cb) => {
      cb(event);
    });
  }

  it('starts with system preference by default', () => {
    act(() => {
      setSystemPref(false);
    });
    render(React.createElement(ThemeTester));
    const root = screen.getByTestId('root');
    expect(root.getAttribute('data-theme')).toBe('system');
    expect(root.getAttribute('data-dark')).toBe('false');
    expect(root.getAttribute('data-system')).toBe('true');

    // if system flips to dark we should see update
    act(() => {
      setSystemPref(true);
    });
    expect(root.getAttribute('data-dark')).toBe('true');
  });

  it('cycles through light, dark, system when toggling', () => {
    act(() => {
      setSystemPref(false);
    });
    render(React.createElement(ThemeTester));
    const root = screen.getByTestId('root');
    const btn = screen.getByText('toggle');

    // initial system mode
    expect(root.getAttribute('data-theme')).toBe('system');

    // first toggle -> light
    fireEvent.click(btn);
    expect(root.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('alphaflow-theme')).toBe('light');

    // second toggle -> dark
    fireEvent.click(btn);
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('alphaflow-theme')).toBe('dark');

    // third toggle -> system
    fireEvent.click(btn);
    expect(root.getAttribute('data-theme')).toBe('system');
    expect(localStorage.getItem('alphaflow-theme')).toBe('system');

    // next toggle returns to light again
    fireEvent.click(btn);
    expect(root.getAttribute('data-theme')).toBe('light');
  });

  it('respects explicit storage value on mount', () => {
    localStorage.setItem('alphaflow-theme', 'dark');
    act(() => {
      setSystemPref(false);
    });
    render(React.createElement(ThemeTester));
    const root = screen.getByTestId('root');
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(root.getAttribute('data-dark')).toBe('true');
  });
});
