import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isValidLocale, getLocaleFromPath } from '../../lib/locale';

// Note: getUserLocale and setUserLocale use next/headers (server-only).
// We test only the pure utility functions here.

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
});
