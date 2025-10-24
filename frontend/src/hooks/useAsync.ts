import { useCallback, useEffect, useRef, useState } from "react";

type AsyncFn<TArgs extends unknown[], TResult> = (...args: TArgs) => Promise<TResult>;

interface UseAsyncOptions<TArgs extends unknown[]> {
  immediate?: boolean;
  initialArgs?: TArgs;
}

interface UseAsyncState<TResult> {
  loading: boolean;
  data: TResult | null;
  error: Error | null;
}

export const useAsync = <TArgs extends unknown[], TResult>(
  asyncFunction: AsyncFn<TArgs, TResult>,
  options: UseAsyncOptions<TArgs> = {}
) => {
  const { immediate = false, initialArgs } = options;
  const [state, setState] = useState<UseAsyncState<TResult>>({
    loading: immediate,
    data: null,
    error: null,
  });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: TArgs) => {
      setState({ loading: true, data: null, error: null });
      try {
        const result = await asyncFunction(...args);
        if (mountedRef.current) {
          setState({ loading: false, data: result, error: null });
        }
        return result;
      } catch (error) {
        if (mountedRef.current) {
          setState({
            loading: false,
            data: null,
            error: error instanceof Error ? error : new Error("Unbekannter Fehler"),
          });
        }
        throw error;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ loading: false, data: null, error: null });
  }, []);

  useEffect(() => {
    if (immediate && initialArgs) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      execute(...initialArgs);
    }
  }, [execute, immediate, initialArgs]);

  return {
    ...state,
    execute,
    reset,
    setData: (data: TResult) => {
      if (mountedRef.current) {
        setState({ loading: false, data, error: null });
      }
    },
  };
};

