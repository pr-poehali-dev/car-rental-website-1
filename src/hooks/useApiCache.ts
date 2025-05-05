
import { useEffect, useState } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // время жизни кэша в миллисекундах
}

// Глобальное хранилище кэша
const globalCache: Record<string, CacheEntry<any>> = {};

export interface ApiCacheOptions<T> {
  cacheKey: string;        // уникальный ключ для кэширования
  ttl?: number;            // время жизни кэша в миллисекундах
  queryFn: () => Promise<T>; // функция для получения данных
  enabled?: boolean;       // выполнять ли запрос сразу
  onSuccess?: (data: T) => void; // коллбэк при успешном получении данных
  onError?: (error: Error) => void; // коллбэк при ошибке
}

/**
 * Хук для кэширования API-запросов с контролем времени жизни кэша
 */
export function useApiCache<T = any>({
  cacheKey,
  ttl = 5 * 60 * 1000, // по умолчанию 5 минут
  queryFn,
  enabled = true,
  onSuccess,
  onError
}: ApiCacheOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Функция проверки валидности кэша
  const isCacheValid = (entry: CacheEntry<T>): boolean => {
    return Date.now() - entry.timestamp < entry.ttl;
  };

  // Получение данных из кэша или через API-запрос
  const fetchData = async (force = false): Promise<T> => {
    setIsLoading(true);
    setError(null);

    try {
      // Проверяем кэш, если не требуется принудительная загрузка
      if (!force && globalCache[cacheKey] && isCacheValid(globalCache[cacheKey])) {
        const cachedData = globalCache[cacheKey].data;
        setData(cachedData);
        setIsLoading(false);
        onSuccess?.(cachedData);
        return cachedData;
      }

      // Выполняем запрос
      const result = await queryFn();
      
      // Сохраняем в кэш
      globalCache[cacheKey] = {
        data: result,
        timestamp: Date.now(),
        ttl
      };
      
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Неизвестная ошибка');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Метод для принудительного обновления данных
  const refetch = () => fetchData(true);

  // Очистка кэша для конкретного ключа
  const invalidateCache = () => {
    delete globalCache[cacheKey];
  };

  // Получение данных при первом рендере, если enabled=true
  useEffect(() => {
    if (enabled) {
      fetchData().catch(() => {}); // игнорируем ошибки здесь, они обрабатываются в fetchData
    }
  }, [cacheKey, enabled]);

  return {
    data,
    isLoading,
    error,
    refetch,
    invalidateCache
  };
}

/**
 * Очистка всего кэша API
 */
export function clearApiCache(): void {
  Object.keys(globalCache).forEach(key => {
    delete globalCache[key];
  });
}

/**
 * Очистка кэша API по префиксу ключа
 */
export function clearApiCacheByPrefix(prefix: string): void {
  Object.keys(globalCache)
    .filter(key => key.startsWith(prefix))
    .forEach(key => {
      delete globalCache[key];
    });
}

/**
 * Функция для предварительной загрузки данных в кэш
 */
export function prefetchApiData<T>(
  cacheKey: string, 
  queryFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    queryFn()
      .then(data => {
        globalCache[cacheKey] = {
          data,
          timestamp: Date.now(),
          ttl
        };
        resolve(data);
      })
      .catch(reject);
  });
}

/**
 * Функция для пакетной загрузки данных
 */
export function batchPrefetch<T>(
  queries: Array<{ cacheKey: string; queryFn: () => Promise<T>; ttl?: number }>
): Promise<Array<T>> {
  return Promise.all(
    queries.map(({ cacheKey, queryFn, ttl = 5 * 60 * 1000 }) => 
      prefetchApiData(cacheKey, queryFn, ttl)
    )
  );
}
