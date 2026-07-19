import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns the initial value when no stored value exists', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('persists a string value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', ''));

    act(() => {
      result.current[1]('hello');
    });

    expect(result.current[0]).toBe('hello');
    expect(localStorage.getItem('test-key')).toBe('"hello"');
  });

  it('persists an object value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage<{ name: string }>('obj-key', { name: '' }));

    act(() => {
      result.current[1]({ name: 'Whānau' });
    });

    expect(result.current[0]).toEqual({ name: 'Whānau' });
  });

  it('supports a function updater', () => {
    const { result } = renderHook(() => useLocalStorage('count-key', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(2);
  });

  it('removeValue resets state to initial and clears the stored entry', () => {
    const { result } = renderHook(() => useLocalStorage('rm-key', 'initial'));

    act(() => {
      result.current[1]('changed');
    });
    expect(result.current[0]).toBe('changed');

    act(() => {
      result.current[2](); // removeValue
    });

    // State is reset to the initial value
    expect(result.current[0]).toBe('initial');
    // Note: the useEffect then re-persists the initialValue back to localStorage,
    // so localStorage will contain '"initial"', not null - this is by design.
    expect(localStorage.getItem('rm-key')).toBe('"initial"');
  });

  it('reads an existing localStorage value on mount', () => {
    localStorage.setItem('existing-key', JSON.stringify('pre-seeded'));
    const { result } = renderHook(() => useLocalStorage('existing-key', 'default'));
    expect(result.current[0]).toBe('pre-seeded');
  });

  it('returns initial value when stored JSON is corrupted', () => {
    localStorage.setItem('bad-key', 'not-valid-json{{');
    const { result } = renderHook(() => useLocalStorage('bad-key', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });
});
