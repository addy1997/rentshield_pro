import { useRef, useCallback } from 'react';

export function useDebounceStorage(delay = 500) {
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const set = useCallback(
    (key: string, value: unknown) => {
      clearTimeout(timers.current[key]);
      timers.current[key] = setTimeout(() => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch {
          // quota exceeded — ignore silently
        }
      }, delay);
    },
    [delay]
  );

  const remove = useCallback((key: string) => {
    clearTimeout(timers.current[key]);
    localStorage.removeItem(key);
  }, []);

  return { set, remove };
}
