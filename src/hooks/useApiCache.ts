
import { useState, useCallback, useEffect } from 'react';

// Тип для кэша API
type ApiCache<T> = {
  [key: string]: {
    data: T;
    timestamp: number;
    ttl: number;
  };
};

// Глобальный кэш для всех запросов API
const globalApiCache: ApiCache<any> = {};

// Опции хука кэширования API
interface ApiCacheOptions<T> {
  cacheKey: string;       // Ключ для элемента кэша
  ttl?: number;          // Время жизни кэша в миллисекундах
  initialData?: T;       // Начальные данные
  queryFn: () => Promise<T>; // Функция запроса
  enabled?: boolean;     // Автоматически выполнять запрос при монтировании
}

/**
 * Хук для кэширования результатов API запросов
 */
export function useApiCache<T>({
  cacheKey,
  ttl = 5 * 60 * 1000, // 5 минут по умолчанию
  initialData,
  queryFn,
  enabled = true
}: ApiCacheOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Проверка, действителен ли кэш
  const isCacheValid = useCallback((key: string): boolean => {
    const cache = globalApiCache[key];
    if (!cache) return false;
    
    const now = Date.now();
    return now - cache.timestamp < cache.ttl;
  }, []);

  // Получение данных из кэша
  const getFromCache = useCallback((key: string): T | undefined => {
    if (isCacheValid(key)) {
      return globalApiCache[key].data;
    }
    return undefined;
  }, [isCacheValid]);

  // Сохранение данных в кэш
  const saveToCache = useCallback((key: string, data: T, customTtl?: number) => {
    globalApiCache[key] = {
      data,
      timestamp: Date.now(),
      ttl: customTtl || ttl
    };
  }, [ttl]);

  // Функция для выполнения запроса
  const fetchData = useCallback(async (skipCache = false): Promise<T> => {
    // Проверяем кэш, если не требуется пропустить
    if (!skipCache) {
      const cachedData = getFromCache(cacheKey);
      if (cachedData) {
        setData(cachedData);
        return cachedData;
      }
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await queryFn();
      setData(result);
      
      // Сохраняем в кэш
      saveToCache(cacheKey, result);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Произошла ошибка при выполнении запроса');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, queryFn, getFromCache, saveToCache]);

  // Функция для принудительного обновления данных
  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Функция для очистки кэша
  const clearCache = useCallback(() => {
    delete globalApiCache[cacheKey];
  }, [cacheKey]);

  // Автоматическое выполнение запроса при монтировании компонента
  useEffect(() => {
    if (enabled) {
      fetchData().catch(() => {}); // Подавляем ошибки, так как они уже обрабатываются в состоянии
    }
  }, [enabled, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch,
    clearCache
  };
}

// Утилита для очистки всего кэша
export function clearAllApiCache() {
  Object.keys(globalApiCache).forEach(key => {
    delete globalApiCache[key];
  });
}

// Утилита для очистки кэша по префиксу
export function clearApiCacheByPrefix(prefix: string) {
  Object.keys(globalApiCache)
    .filter(key => key.startsWith(prefix))
    .forEach(key => {
      delete globalApiCache[key];
    });
}
