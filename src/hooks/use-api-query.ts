
import { useState, useEffect } from 'react';

interface ApiQueryOptions<T> {
  queryFn: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

interface ApiQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Хук для выполнения API-запросов с обработкой загрузки и ошибок
 */
export function useApiQuery<T>({
  queryFn,
  onSuccess,
  onError,
  enabled = true
}: ApiQueryOptions<T>): ApiQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await queryFn();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Произошла ошибка при выполнении запроса');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [enabled]);
  
  const refetch = () => {
    fetchData();
  };
  
  return { data, isLoading, error, refetch };
}
