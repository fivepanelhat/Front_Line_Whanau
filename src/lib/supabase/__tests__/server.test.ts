import { describe, it, expect, vi, beforeEach } from 'vitest';

const cookieSet = vi.fn();
const cookieGetAll = vi.fn(() => [{ name: 'sb', value: 'token' }]);

vi.mock('next/headers', () => ({
 cookies: vi.fn(async () => ({ getAll: cookieGetAll, set: cookieSet })),
}));

const createServerClientMock = vi.fn(
 (url: string, key: string, opts: any) => ({ url, key, opts })
);
vi.mock('@supabase/ssr', () => ({
 createServerClient: (url: string, key: string, opts: any) =>
 createServerClientMock(url, key, opts),
}));

const mockEnv = vi.hoisted(
 (): Record<string, string | undefined> => ({
 NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
 NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
 SUPABASE_SERVICE_ROLE_KEY: 'service-key',
 })
);
vi.mock('@/env', () => ({ env: mockEnv }));

import { createClient, createAdminClient } from '../server';

describe('supabase server clients', () => {
 beforeEach(() => {
 vi.clearAllMocks();
 mockEnv.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
 });

 it('createClient uses the anon key', async () => {
 const client: any = await createClient();
 expect(client.url).toBe('https://test.supabase.co');
 expect(client.key).toBe('anon-key');
 });

 it('createClient cookie adapter reads and writes the cookie store', async () => {
 const client: any = await createClient();
 expect(client.opts.cookies.getAll()).toEqual([{ name: 'sb', value: 'token' }]);

 client.opts.cookies.setAll([{ name: 'a', value: '1', options: { path: '/' } }]);
 expect(cookieSet).toHaveBeenCalledWith('a', '1', { path: '/' });
 });

 it('createClient setAll swallows Server Component write errors', async () => {
 cookieSet.mockImplementationOnce(() => {
 throw new Error('read-only in Server Component');
 });
 const client: any = await createClient();
 expect(() =>
 client.opts.cookies.setAll([{ name: 'a', value: '1', options: {} }])
 ).not.toThrow();
 });

 it('createAdminClient uses the service role key', async () => {
 const client: any = await createAdminClient();
 expect(client.key).toBe('service-key');
 });

 it('createAdminClient cookie adapter reads and swallows write errors', async () => {
 const client: any = await createAdminClient();
 expect(client.opts.cookies.getAll()).toEqual([{ name: 'sb', value: 'token' }]);

 cookieSet.mockImplementationOnce(() => {
 throw new Error('read-only');
 });
 expect(() =>
 client.opts.cookies.setAll([{ name: 'a', value: '1', options: {} }])
 ).not.toThrow();

 client.opts.cookies.setAll([{ name: 'b', value: '2', options: {} }]);
 expect(cookieSet).toHaveBeenCalledWith('b', '2', {});
 });

 it('createAdminClient throws when the service role key is missing', async () => {
 mockEnv.SUPABASE_SERVICE_ROLE_KEY = undefined;
 await expect(createAdminClient()).rejects.toThrow(
 'SUPABASE_SERVICE_ROLE_KEY is not set'
 );
 });
});
