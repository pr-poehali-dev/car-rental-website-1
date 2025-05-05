
import { useState } from 'react';
import { apiClient, ApiError, ApiErrorType } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
import { clearApiCacheByPrefix } from '@/hooks/useApiCache';

type MutationStatus = 'idle' | 'loading' | 'success' | 'error';

interface OptimisticMutationOptions<T, R> {
  // Функция оптимистичного обновления данных
  onOptimisticUpdate?: (data: T) => void;
  
  // Префикс кэша для очистки после успешной мутации
  cachePrefix?: string;
  
  // URL для запроса
  url: string;
  
  // Метод HTTP запроса
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  
  // Максимальное количество повторных попыток
  maxRetries?: number;
  
  // Задержка перед повторной попыткой (мс)
  retryDelay?: number;
  
  // Функция для проверки, нужна ли повторная попытка
  shouldRetry?: (error: ApiError, attemptNumber: number) => boolean;
  
  // Обработчики успеха/ошибки
  onSuccess?: (data: R) => void;
  onError?: (error: ApiError) => void;
}

/**
 * Хук для оптимистичного обновления данных при мутациях
 */
export function useOptimisticMutation<T, R = any>(options: OptimisticMutationOptions<T, R>) {
  const [status, setStatus] = useState<MutationStatus>('idle');
  const [data, setData] = useState<R | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const { toast } = useToast();

  const {
    onOptimisticUpdate,
    cachePrefix,
    url,
    method,
    maxRetries = 3,
    retryDelay = 1000,
    shouldRetry = (error: ApiError) => error.type === ApiErrorType.NETWORK,
    onSuccess,
    onError
  } = options;

  // Функция для выполнения мутации с ретраями
  const executeWithRetry = async (
    data: T, 
    attempt: number = 0
  ): Promise<R> => {
    try {
      let response: R;
      
      switch (method) {
        case 'POST':
          response = await apiClient.post<R>(url, data);
          break;
        case 'PUT':
          response = await apiClient.put<R>(url, data);
          break;
        case 'PATCH':
          response = await apiClient.patch<R>(url, data);
          break;
        case 'DELETE':
          response = await apiClient.delete<R>(url);
          break;
      }
      
      return response;
    } catch (err) {
      const error = err as ApiError;
      
      // Проверяем, нужна ли повторная попытка
      if (attempt < maxRetries && shouldRetry(error, attempt)) {
        // Увеличиваем задержку с каждой попыткой (exponential backoff)
        const delay = retryDelay * Math.pow(2, attempt);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeWithRetry(data, attempt + 1);
      }
      
      throw error;
    }
  };

  // Основная функция мутации
  const mutate = async (mutationData: T): Promise<R | null> => {
    setStatus('loading');
    setError(null);

    try {
      // Применяем оптимистичное обновление, если предоставлено
      if (onOptimisticUpdate) {
        onOptimisticUpdate(mutationData);
      }
      
      // Выполняем запрос с возможностью ретраев
      const response = await executeWithRetry(mutationData);
      
      // Очищаем кэш при успехе, если указан префикс
      if (cachePrefix) {
        clearApiCacheByPrefix(cachePrefix);
      }
      
      setData(response);
      setStatus('success');
      
      if (onSuccess) {
        onSuccess(response);
      }
      
      return response;
    } catch (err) {
      const error = err as ApiError;
      setError(error);
      setStatus('error');
      
      if (onError) {
        onError(error);
      }
      
      return null;
    }
  };

  // Сброс состояния
  const reset = () => {
    setStatus('idle');
    setData(null);
    setError(null);
  };

  return {
    mutate,
    reset,
    status,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    data,
    error
  };
}
