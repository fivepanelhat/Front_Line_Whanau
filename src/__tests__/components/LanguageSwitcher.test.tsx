import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/en-NZ/directory',
}));

vi.mock('next-intl', () => ({
  useLocale: vi.fn(() => 'en-NZ'),
}));

vi.mock('@/lib/locale-config', () => ({
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

    // Buttons render visible text: "English (NZ)" and "Te Reo Māori"
    expect(screen.getByText('English (NZ)')).toBeInTheDocument();
    expect(screen.getByText('Te Reo Māori')).toBeInTheDocument();
  });

  it('marks the current locale button as active', async () => {
    const { LanguageSwitcher } = await import('../../components/LanguageSwitcher');
    render(<LanguageSwitcher />);

    const enButton = screen.getByRole('button', { name: 'Switch to English (NZ)' });
    expect(enButton).toHaveAttribute('aria-pressed', 'true');

    const miButton = screen.getByRole('button', { name: 'Switch to Te Reo Māori' });
    expect(miButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls router.push with correct path when a different locale is clicked', async () => {
    const { LanguageSwitcher } = await import('../../components/LanguageSwitcher');
    render(<LanguageSwitcher />);

    const miButton = screen.getByRole('button', { name: 'Switch to Te Reo Māori' });
    fireEvent.click(miButton);

    expect(mockPush).toHaveBeenCalledWith('/mi/directory');
  });

  it('displays "Te Reo Māori" label text — never the bare string "Maori"', async () => {
    const { LanguageSwitcher } = await import('../../components/LanguageSwitcher');
    render(<LanguageSwitcher />);

    // Cultural safety: the unadorned string "Maori" must never appear in the DOM
    expect(screen.queryByText('Maori')).not.toBeInTheDocument();
    expect(screen.getByText('Te Reo Māori')).toBeInTheDocument();
  });
});
