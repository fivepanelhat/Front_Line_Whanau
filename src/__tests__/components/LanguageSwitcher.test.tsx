import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('next-intl', () => ({
  useLocale: vi.fn(() => 'en-NZ'),
  // Return the translation key as the value — so aria-label="choosingMaori" etc.
  useTranslations: vi.fn(() => (key: string) => key),
}));

vi.mock('@/lib/actions/locale', () => ({
  switchLocale: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/i18n', () => ({
  locales: ['en-NZ', 'mi'] as const,
  localeNames: { 'en-NZ': 'English (NZ)', mi: 'Te Reo Māori' },
}));

// ── Tests ──────────────────────────────────────────────────────────────────

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders both locale buttons', async () => {
    const { LanguageSwitcher } = await import('../../components/LanguageSwitcher');
    render(<LanguageSwitcher />);

    // Buttons render visible text: "EN" and "Te Reo"
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('Te Reo')).toBeInTheDocument();
  });

  it('renders as a group with accessible label', async () => {
    const { LanguageSwitcher } = await import('../../components/LanguageSwitcher');
    render(<LanguageSwitcher />);

    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('marks the current locale button as pressed', async () => {
    const { LanguageSwitcher } = await import('../../components/LanguageSwitcher');
    render(<LanguageSwitcher />);

    // aria-label comes from t('choosingEnglish') => 'choosingEnglish' via mock
    const enButton = screen.getByRole('button', { name: 'choosingEnglish' });
    expect(enButton).toHaveAttribute('aria-pressed', 'true');

    const miButton = screen.getByRole('button', { name: 'choosingMaori' });
    expect(miButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls switchLocale when a different locale is clicked', async () => {
    const { LanguageSwitcher } = await import('../../components/LanguageSwitcher');
    const { switchLocale } = await import('@/lib/actions/locale');

    render(<LanguageSwitcher />);

    const miButton = screen.getByRole('button', { name: 'choosingMaori' });
    fireEvent.click(miButton);

    await waitFor(() => {
      expect(switchLocale).toHaveBeenCalledWith('mi');
    });
  });

  it('does not call switchLocale when the active locale is clicked', async () => {
    const { LanguageSwitcher } = await import('../../components/LanguageSwitcher');
    const { switchLocale } = await import('@/lib/actions/locale');

    render(<LanguageSwitcher />);

    const enButton = screen.getByRole('button', { name: 'choosingEnglish' });
    fireEvent.click(enButton);

    await waitFor(() => {
      expect(switchLocale).not.toHaveBeenCalled();
    });
  });

  it('displays "Te Reo" label text — never the bare string "Maori"', async () => {
    const { LanguageSwitcher } = await import('../../components/LanguageSwitcher');
    render(<LanguageSwitcher />);

    // Cultural safety: the unadorned string "Maori" must never appear in the DOM
    expect(screen.queryByText('Maori')).not.toBeInTheDocument();
    // "Te Reo" is the visible label for the Māori locale button
    expect(screen.getByText('Te Reo')).toBeInTheDocument();
  });
});
