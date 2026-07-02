import { useState, useCallback } from 'react';

interface OptimisticUpdateOptions<T, R> {
  updateFn: (data: T) => Promise<R>;
  onSuccess?: (result: R) => void;
  onError?: (error: unknown) => void;
  rollbackDelay?: number;
}

interface OptimisticUpdateReturn<T, R> {
  execute: (optimisticData: T, actualData?: T) => Promise<R | undefined>;
  isUpdating: boolean;
  error: unknown | null;
}

export function useOptimisticUpdate<T, R>({
  updateFn,
  onSuccess,
  onError,
  rollbackDelay = 0,
}: OptimisticUpdateOptions<T, R>): OptimisticUpdateReturn<T, R> {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const execute = useCallback(
    async (optimisticData: T, actualData?: T): Promise<R | undefined> => {
      setIsUpdating(true);
      setError(null);

      try {
        const result = await updateFn(actualData || optimisticData);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        setIsUpdating(false);
        return result;
      } catch (err) {
        setError(err);
        
        if (rollbackDelay > 0) {
          setTimeout(() => {
            setIsUpdating(false);
            if (onError) {
              onError(err);
            }
          }, rollbackDelay);
        } else {
          setIsUpdating(false);
          if (onError) {
            onError(err);
          }
        }
        
        throw err;
      }
    },
    [updateFn, onSuccess, onError, rollbackDelay]
  );

  return { execute, isUpdating, error };
}

export function useOptimisticList<T extends { id: number | string }>() {
  const [items, setItems] = useState<T[]>([]);
  const [pendingItems, setPendingItems] = useState<Map<number | string, T>>(new Map());

  const addOptimistic = useCallback((item: T) => {
    setPendingItems(prev => new Map(prev).set(item.id, item));
  }, []);

  const removeOptimistic = useCallback((id: number | string) => {
    setPendingItems(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const commitAdd = useCallback((tempId: number | string, actualItem: T) => {
    removeOptimistic(tempId);
    setItems(prev => [...prev, actualItem]);
  }, [removeOptimistic]);

  const commitUpdate = useCallback((id: number | string, updatedItem: T) => {
    removeOptimistic(id);
    setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
  }, [removeOptimistic]);

  const commitDelete = useCallback((id: number | string) => {
    removeOptimistic(id);
    setItems(prev => prev.filter(item => item.id !== id));
  }, [removeOptimistic]);

  const rollbackOptimistic = useCallback((id: number | string) => {
    removeOptimistic(id);
  }, [removeOptimistic]);

  const allItems = [...items, ...Array.from(pendingItems.values())];

  return {
    items,
    setItems,
    pendingItems,
    allItems,
    addOptimistic,
    removeOptimistic,
    commitAdd,
    commitUpdate,
    commitDelete,
    rollbackOptimistic,
  };
}

interface OptimisticMutationOptions<TData, TVariables, TContext> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onMutate?: (variables: TVariables) => TContext | Promise<TContext>;
  onSuccess?: (data: TData, variables: TVariables, context: TContext) => void;
  onError?: (error: unknown, variables: TVariables, context: TContext | undefined) => void;
  onSettled?: (data: TData | undefined, error: unknown | null, variables: TVariables, context: TContext | undefined) => void;
}

export function useOptimisticMutation<TData = unknown, TVariables = void, TContext = unknown>({
  mutationFn,
  onMutate,
  onSuccess,
  onError,
  onSettled,
}: OptimisticMutationOptions<TData, TVariables, TContext>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<TData | undefined>(undefined);

  const mutate = useCallback(
    async (variables: TVariables) => {
      setIsLoading(true);
      setError(null);

      let context: TContext | undefined;

      try {
        if (onMutate) {
          context = await onMutate(variables);
        }

        const result = await mutationFn(variables);
        setData(result);

        if (onSuccess) {
          onSuccess(result, variables, context!);
        }

        if (onSettled) {
          onSettled(result, null, variables, context);
        }

        return result;
      } catch (err) {
        setError(err);

        if (onError) {
          onError(err, variables, context);
        }

        if (onSettled) {
          onSettled(undefined, err, variables, context);
        }

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, onMutate, onSuccess, onError, onSettled]
  );

  return {
    mutate,
    isLoading,
    error,
    data,
  };
}
