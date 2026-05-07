import { useState, useCallback } from 'react';

interface AsyncActionState<T> {
  isLoading: boolean;
  error: string | null;
  data: T | null;
}

interface AsyncActionReturn<T, A extends unknown[]> extends AsyncActionState<T> {
  execute: (...args: A) => Promise<T | null>;
  reset: () => void;
}

export function useAsyncAction<T, A extends unknown[]>(
  fn: (...args: A) => Promise<T>
): AsyncActionReturn<T, A> {
  const [state, setState] = useState<AsyncActionState<T>>({
    isLoading: false,
    error: null,
    data: null,
  });

  const execute = useCallback(
    async (...args: A): Promise<T | null> => {
      setState({ isLoading: true, error: null, data: null });
      try {
        const result = await fn(...args);
        setState({ isLoading: false, error: null, data: result });
        return result;
      } catch (err: any) {
        const message = err?.message || 'An unexpected error occurred';
        setState({ isLoading: false, error: message, data: null });
        return null;
      }
    },
    [fn]
  );

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, data: null });
  }, []);

  return { ...state, execute, reset };
}
