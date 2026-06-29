import { describe, it, expect, vi } from 'vitest';
import { isValidLocale, getLocaleFromPath, getUserLocale, setUserLocale } from '../../lib/locale';

// Mock next/headers for server-side cookie functions
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('locale utilities', () => {
  describe('isValidLocale', () => {
    it('returns true for en-NZ', () => {
      expect(isValidLocale('en-NZ')).toBe(true);
    });

    it('returns true for mi', () => {
      expect(isValidLocale('mi')).toBe(true);
    });

    it('returns false for unknown locale', () => {
      expect(isValidLocale('fr')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isValidLocale('')).toBe(false);
    });

    it('returns false for partial match', () => {
      expect(isValidLocale('en')).toBe(false);
    });
  });

  describe('getLocaleFromPath', () => {
    it('extracts en-NZ from path', () => {
      expect(getLocaleFromPath('/en-NZ/directory')).toBe('en-NZ');
    });

    it('extracts mi from path', () => {
      expect(getLocaleFromPath('/mi/directory')).toBe('mi');
    });

    it('returns defaultLocale for unknown locale in path', () => {
      expect(getLocaleFromPath('/fr/directory')).toBe('en-NZ');
    });

    it('returns defaultLocale for root path', () => {
      expect(getLocaleFromPath('/')).toBe('en-NZ');
    });

    it('returns defaultLocale for path with no locale segment', () => {
      expect(getLocaleFromPath('/api/health')).toBe('en-NZ');
    });
  });

  describe('getUserLocale', () => {
    it('returns the stored locale from cookie when present', async () => {
      const { cookies } = await import('next/headers');
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'mi' }),
        set: vi.fn(),
      } as any);

      const locale = await getUserLocale();
      expect(locale).toBe('mi');
    });

    it('returns defaultLocale when no cookie is set', async () => {
      const { cookies } = await import('next/headers');
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
        set: vi.fn(),
      } as any);

      const locale = await getUserLocale();
      expect(locale).toBe('en-NZ');
    });
  });

  describe('setUserLocale', () => {
    it('sets the locale cookie', async () => {
      const mockSet = vi.fn();
      const { cookies } = await import('next/headers');
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn(),
        set: mockSet,
      } as any);

      await setUserLocale('mi');
      expect(mockSet).toHaveBeenCalledWith('NEXT_LOCALE', 'mi');
    });
  });
});
