import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockSetRole = vi.fn();
vi.mock('@/context', () => ({
  useRole: () => ({ setRole: mockSetRole }),
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'en-NZ',
  useTranslations: () => (key: string) => {
    const keys: Record<string, string> = {
      title: 'Nau mai, haere mai — Welcome',
      subtitle: 'Supporting whānau of preterm twins across Aotearoa New Zealand',
      parentTitle: 'I am a Parent / Whānau',
      parentDescription: 'Get support, information, and guidance for your journey',
      practitionerTitle: 'I am a Practitioner / Organisation',
      practitionerDescription: 'Access tools, resources, and directory management',
    };
    return keys[key] || key;
  },
}));

// ── Mocks override logic ───────────────────────────────────────────────────

describe('RoleSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a heading and subtitle', async () => {
    const { default: RoleSelector } = await import('../../components/RoleSelector');
    render(<RoleSelector />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/supporting whānau/i)).toBeInTheDocument();
  });

  it('renders Parent / Whānau button', async () => {
    const { default: RoleSelector } = await import('../../components/RoleSelector');
    render(<RoleSelector />);

    expect(
      screen.getByText(/parent/i, { selector: 'button *' })
    ).toBeInTheDocument();
  });

  it('renders Practitioner / Organisation button', async () => {
    const { default: RoleSelector } = await import('../../components/RoleSelector');
    render(<RoleSelector />);

    expect(
      screen.getByText(/practitioner/i, { selector: 'button *' })
    ).toBeInTheDocument();
  });

  it('calls setRole and router.push when Parent button is clicked', async () => {
    const { default: RoleSelector } = await import('../../components/RoleSelector');
    render(<RoleSelector />);

    const parentButton = screen.getByRole('button', { name: /parent/i });
    fireEvent.click(parentButton);

    expect(mockSetRole).toHaveBeenCalledWith('parent');
    expect(mockPush).toHaveBeenCalledWith('/en-NZ/parent');
  });

  it('calls setRole and router.push when Practitioner button is clicked', async () => {
    const { default: RoleSelector } = await import('../../components/RoleSelector');
    render(<RoleSelector />);

    const practitionerButton = screen.getByRole('button', { name: /practitioner/i });
    fireEvent.click(practitionerButton);

    expect(mockSetRole).toHaveBeenCalledWith('practitioner');
    expect(mockPush).toHaveBeenCalledWith('/en-NZ/practitioner');
  });
});
