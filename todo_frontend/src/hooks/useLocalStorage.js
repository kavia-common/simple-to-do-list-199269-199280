import { useEffect, useState } from 'react';

/**
 * Safely parse JSON and fall back to a default value.
 * Kept internal (not a public interface).
 */
function safeJsonParse(value, fallbackValue) {
  try {
    return JSON.parse(value);
  } catch (_e) {
    return fallbackValue;
  }
}

/**
 * Persisted state backed by localStorage.
 *
 * Notes:
 * - Reads from localStorage once on initial render.
 * - Writes back whenever the value changes.
 * - If localStorage is unavailable (privacy modes), it gracefully degrades to in-memory state.
 *
 * @param {string} key localStorage key
 * @param {any} initialValue default value used when key is missing
 * @returns {[any, Function]} state value and setter
 */
// PUBLIC_INTERFACE
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item === null ? initialValue : safeJsonParse(item, initialValue);
    } catch (_e) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (_e) {
      // Intentionally ignore write errors (e.g., storage full or disabled).
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
