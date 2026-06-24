import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/context', () => ({
  useRole: () => ({ setRole: vi.fn() }),
}));

// ── Tests ──────────────────────────────────────────────────────────────────

describe('RoleSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a heading and subtitle', async () => {
    const { default: RoleSelector } = await import('../../components/RoleSelector');
    render(<RoleSelector />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
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
    const mockSetRole = vi.fn();
    const mockPush = vi.fn();

    vi.mocked(await import('@/context')).useRole = () => ({ setRole: mockSetRole });
    vi.mocked(await import('next/navigation')).useRouter = () => ({ push: mockPush });

    const { default: RoleSelector } = await import('../../components/RoleSelector');
    render(<RoleSelector />);

    const parentButton = screen.getByRole('button', { name: /parent/i });
    fireEvent.click(parentButton);

    expect(mockSetRole).toHaveBeenCalledWith('parent');
    expect(mockPush).toHaveBeenCalledWith('/parent');
  });

  it('calls setRole and router.push when Practitioner button is clicked', async () => {
    const mockSetRole = vi.fn();
    const mockPush = vi.fn();

    vi.mocked(await import('@/context')).useRole = () => ({ setRole: mockSetRole });
    vi.mocked(await import('next/navigation')).useRouter = () => ({ push: mockPush });

    const { default: RoleSelector } = await import('../../components/RoleSelector');
    render(<RoleSelector />);

    const practitionerButton = screen.getByRole('button', { name: /practitioner/i });
    fireEvent.click(practitionerButton);

    expect(mockSetRole).toHaveBeenCalledWith('practitioner');
    expect(mockPush).toHaveBeenCalledWith('/practitioner');
  });
});
