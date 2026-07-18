import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// -- Mocks ------------------------------------------------------------------

const mockSetRole = vi.fn();
vi.mock('@/context', () => ({
  useRole: () => ({ setRole: mockSetRole }),
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'en-NZ',
  useTranslations: () => (key: string) => {
    const keys: Record<string, string> = {
      title: 'Nau mai, haere mai - Welcome',
      subtitle: 'Supporting whanau of preterm twins across Aotearoa New Zealand',
      parentTitle: 'I am a Parent / Whanau',
      parentDescription: 'Get support, information, and guidance for your journey',
      practitionerTitle: 'I am a Practitioner / Organisation',
      practitionerDescription: 'Access tools, resources, and directory management',
    };
    return keys[key] || key;
  },
}));

// -- Mocks override logic ---------------------------------------------------

describe('RoleSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a heading and subtitle', async () => {
    const { default: RoleSelector } = await import('../../components/RoleSelector');
    render(<RoleSelector />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/supporting whanau/i)).toBeInTheDocument();
  });

  it('renders Parent / Whanau link', async () => {
    const { default: RoleSelector } = await import('../../components/RoleSelector');
    render(<RoleSelector />);

    expect(screen.getByRole('link', { name: /parent/i })).toBeInTheDocument();
  });

  it('renders Practitioner / Organisation link', async () => {
    const { default: RoleSelector } = await import('../../components/RoleSelector');
    render(<RoleSelector />);

    expect(screen.getByRole('link', { name: /practitioner/i })).toBeInTheDocument();
  });

  it('calls setRole when Parent link is clicked', async () => {
    const { default: RoleSelector } = await import('../../components/RoleSelector');
    render(<RoleSelector />);

    const parentLink = screen.getByRole('link', { name: /parent/i });
    expect(parentLink).toHaveAttribute('href', '/en-NZ/parent');
    fireEvent.click(parentLink);

    expect(mockSetRole).toHaveBeenCalledWith('parent');
  });

  it('calls setRole when Practitioner link is clicked', async () => {
    const { default: RoleSelector } = await import('../../components/RoleSelector');
    render(<RoleSelector />);

    const practitionerLink = screen.getByRole('link', { name: /practitioner/i });
    expect(practitionerLink).toHaveAttribute('href', '/en-NZ/practitioner');
    fireEvent.click(practitionerLink);

    expect(mockSetRole).toHaveBeenCalledWith('practitioner');
  });
});
