
import { useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { useApiCache } from '@/hooks/useApiCache';

interface PrefetchOptions {
  // Задержка перед загрузкой, позволяет отменить, если пользователь быстро покинул страницу
  delayMs?: number;
  
  // Включить/выключить предзагрузку
  enabled?: boolean;
  
  // Время жизни кэша (по умолчанию 5 минут)
  cacheTtl?: number;
}

/**
 * Хук для предварительной загрузки данных с сервера
 * и их кэширования для будущего использования
 */
export function usePrefetch<T = any>(
  urls: string[], 
  options: PrefetchOptions = {}
) {
  const {
    delayMs = 300,
    enabled = true,
    cacheTtl = 5 * 60 * 1000 // 5 минут
  } = options;
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!enabled || urls.length === 0) return;
    
    // Устанавливаем задержку, чтобы не загружать ненужные данные
    timeoutRef.current = setTimeout(() => {
      // Предзагрузка данных
      urls.forEach(url => {
        const cacheKey = `prefetch_${url}`;
        
        // Используем существующий хук кэширования
        // Но устанавливаем enabled в false, чтобы не делать запрос сразу
        const { refetch } = useApiCache({
          cacheKey,
          ttl: cacheTtl,
          queryFn: () => apiClient.get<T>(url),
          enabled: false
        });
        
        // Выполняем запрос и сохраняем в кэш
        refetch().catch(error => {
          // Тихо подавляем ошибки предзагрузки, чтобы не ломать UX
          console.warn(`Ошибка предзагрузки ${url}:`, error);
        });
      });
    }, delayMs);
    
    // Очистка таймаута при размонтировании компонента
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [urls, enabled]);
  
  // Не возвращаем данные, так как они будут получены из кэша
  // когда потребуются реальному компоненту
}

/**
 * Утилита для предварительной загрузки данных для маршрутов навигации
 * Вызывается при наведении на ссылку для ускорения перехода
 */
export const prefetchRouteDatas = (urls: string[]) => {
  urls.forEach(url => {
    // Для экономии ресурсов, делаем запрос и сохраняем в кэш
    apiClient.get(url)
      .catch(error => {
        // Игнорируем ошибки, так как это необязательная оптимизация
      });
  });
};
