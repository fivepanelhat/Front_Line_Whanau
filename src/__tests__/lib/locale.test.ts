import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGet, mockSet, mockCookies } = vi.hoisted(() => {
  const mockGet = vi.fn();
  const mockSet = vi.fn();
  const mockCookies = vi.fn(async () => ({
    get: mockGet,
    set: mockSet,
  }));

  return { mockGet, mockSet, mockCookies };
});

vi.mock('next/headers', () => ({
  cookies: mockCookies,
}));

import {
  isValidLocale,
  getLocaleFromPath,
  getUserLocale,
  setUserLocale,
} from '../../lib/locale';

describe('locale utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    it('returns the locale from cookies when present', async () => {
      mockGet.mockReturnValue({ value: 'mi' });

      await expect(getUserLocale()).resolves.toBe('mi');
      expect(mockCookies).toHaveBeenCalled();
      expect(mockGet).toHaveBeenCalledWith('NEXT_LOCALE');
    });

    it('returns the default locale when the cookie is missing', async () => {
      mockGet.mockReturnValue(undefined);

      await expect(getUserLocale()).resolves.toBe('en-NZ');
    });
  });

  describe('setUserLocale', () => {
    it('stores the requested locale in cookies', async () => {
      await setUserLocale('mi');

      expect(mockCookies).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith('NEXT_LOCALE', 'mi');
    });
  });
});
