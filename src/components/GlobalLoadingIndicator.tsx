
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Создаем глобальную шину событий для отслеживания API запросов
interface GlobalLoadingState {
  loading: boolean;
  count: number;
  listeners: Array<(loading: boolean, count: number) => void>;
}

const globalLoadingState: GlobalLoadingState = {
  loading: false,
  count: 0,
  listeners: [],
};

// Функции для управления глобальным состоянием загрузки
export function startLoading() {
  globalLoadingState.count++;
  globalLoadingState.loading = true;
  notifyListeners();
}

export function endLoading() {
  globalLoadingState.count = Math.max(0, globalLoadingState.count - 1);
  globalLoadingState.loading = globalLoadingState.count > 0;
  notifyListeners();
}

function notifyListeners() {
  globalLoadingState.listeners.forEach(listener => 
    listener(globalLoadingState.loading, globalLoadingState.count)
  );
}

export function subscribeToLoading(listener: (loading: boolean, count: number) => void) {
  globalLoadingState.listeners.push(listener);
  
  // Возвращаем функцию отписки
  return () => {
    const index = globalLoadingState.listeners.indexOf(listener);
    if (index > -1) {
      globalLoadingState.listeners.splice(index, 1);
    }
  };
}

// Компонент индикатора загрузки
interface GlobalLoadingIndicatorProps {
  position?: 'top' | 'bottom';
  className?: string;
}

const GlobalLoadingIndicator = ({ 
  position = 'top',
  className
}: GlobalLoadingIndicatorProps) => {
  const [loading, setLoading] = useState(globalLoadingState.loading);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Подписываемся на изменения состояния загрузки
    const unsubscribe = subscribeToLoading((isLoading) => {
      if (isLoading) {
        setVisible(true);
        
        // Плавно увеличиваем прогресс
        setProgress(30); // Быстро доходим до 30%
        
        // Затем медленнее до 90%
        setTimeout(() => {
          if (globalLoadingState.loading) {
            setProgress(70);
            
            setTimeout(() => {
              if (globalLoadingState.loading) {
                setProgress(90);
              }
            }, 500);
          }
        }, 300);
      } else {
        setProgress(100); // При завершении быстро заполняем до 100%
        
        // Небольшая задержка перед скрытием индикатора для завершения анимации
        setTimeout(() => {
          setVisible(false);
          setTimeout(() => setProgress(0), 200);
        }, 300);
      }
      
      setLoading(isLoading);
    });
    
    return unsubscribe;
  }, []);

  // Создаем портал для отображения индикатора загрузки
  return createPortal(
    <div 
      className={cn(
        "fixed z-50 left-0 right-0 pointer-events-none transition-opacity duration-300",
        position === 'top' ? 'top-0' : 'bottom-0',
        visible ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      <Progress
        value={progress}
        className={cn(
          "h-1 w-full rounded-none bg-transparent",
          loading ? "bg-primary/10" : "bg-transparent"
        )}
        indicatorClassName="bg-primary transition-all duration-300 ease-in-out"
      />
    </div>,
    document.body
  );
};

export default GlobalLoadingIndicator;
