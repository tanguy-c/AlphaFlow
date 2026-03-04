import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const persistedMachineState = {
  state: {
    machines: [
      {
        id: 'machine-1',
        name: 'Test Machine',
        description: '',
        codeFormat: { padding: 2 },
        defaultModeId: 'mode-1',
        modes: [
          {
            id: 'mode-1',
            name: 'Mode 1',
            characters: [{ character: 'A', code: '01' }],
          },
        ],
        createdAt: '2026-03-04T00:00:00.000Z',
        updatedAt: '2026-03-04T00:00:00.000Z',
      },
    ],
    activeMachineId: 'machine-1',
    hasCompletedSetup: true,
  },
  version: 0,
};

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('alphaflow-machines', JSON.stringify(persistedMachineState));

    vi.stubEnv('BASE_URL', '/AlphaFlow/');

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    window.history.pushState({}, '', '/AlphaFlow/');
    window.location.hash = '';
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders the text page on the repository root after setup completes', async () => {
    await import('../i18n');
    const { default: App } = await import('../App');

    render(<App />);

    expect(await screen.findByRole('textbox')).toBeInTheDocument();
  });
});
