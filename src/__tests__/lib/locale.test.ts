import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
 isValidLocale,
 getLocaleFromPath,
 getUserLocale,
 setUserLocale,
} from '../../lib/locale';
import { cookies } from 'next/headers';

vi.mock('next/headers', () => ({
 cookies: vi.fn(),
}));

// Note: getUserLocale and setUserLocale use next/headers (server-only).
// We test only the pure utility functions here.

describe('locale utilities', () => {
 const mockedCookies = vi.mocked(cookies);

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

 describe('cookie-backed locale', () => {
 it('getUserLocale returns cookie locale when set', async () => {
 mockedCookies.mockResolvedValueOnce({
 get: vi.fn().mockReturnValue({ value: 'mi' }),
 } as unknown as Awaited<ReturnType<typeof cookies>>);

 await expect(getUserLocale()).resolves.toBe('mi');
 });

 it('getUserLocale falls back to default locale when cookie is missing', async () => {
 mockedCookies.mockResolvedValueOnce({
 get: vi.fn().mockReturnValue(undefined),
 } as unknown as Awaited<ReturnType<typeof cookies>>);

 await expect(getUserLocale()).resolves.toBe('en-NZ');
 });

 it('setUserLocale writes locale to NEXT_LOCALE cookie', async () => {
 const set = vi.fn();
 mockedCookies.mockResolvedValueOnce({
 set,
 } as unknown as Awaited<ReturnType<typeof cookies>>);

 await setUserLocale('mi');

 expect(set).toHaveBeenCalledWith('NEXT_LOCALE', 'mi');
 });
 });
});
