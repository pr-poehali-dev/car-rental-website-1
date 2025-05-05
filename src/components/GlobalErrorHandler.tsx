
import { useEffect } from 'react';
import { ApiErrorType, registerErrorHandler } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from '@/components/ui/sonner';
import Icon from '@/components/ui/icon';

/**
 * Компонент для глобальной обработки и отображения ошибок API
 */
const GlobalErrorHandler = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Регистрируем обработчики для разных типов ошибок
    
    // Обработка сетевых ошибок
    const unregisterNetwork = registerErrorHandler(ApiErrorType.NETWORK, (error) => {
      sonnerToast.error('Ошибка сети', {
        description: 'Проверьте подключение к интернету',
        icon: <Icon name="WifiOff" className="h-5 w-5" />,
      });
    });
    
    // Обработка ошибок валидации
    const unregisterValidation = registerErrorHandler(ApiErrorType.VALIDATION, (error) => {
      // Используем более сложный toast для ошибок валидации
      toast({
        variant: "destructive",
        title: "Ошибка валидации",
        description: error.message || "Проверьте правильность введенных данных",
      });
    });
    
    // Обработка серверных ошибок
    const unregisterServer = registerErrorHandler(ApiErrorType.SERVER, (error) => {
      sonnerToast.error('Ошибка сервера', {
        description: 'Попробуйте повторить позже',
        icon: <Icon name="Server" className="h-5 w-5" />,
      });
    });
    
    // Обработка неизвестных ошибок
    const unregisterUnknown = registerErrorHandler(ApiErrorType.UNKNOWN, (error) => {
      sonnerToast.error('Что-то пошло не так', {
        description: error.message || 'Произошла неизвестная ошибка',
        icon: <Icon name="AlertTriangle" className="h-5 w-5" />,
      });
    });
    
    // Отписываемся от всех обработчиков при размонтировании
    return () => {
      unregisterNetwork();
      unregisterValidation();
      unregisterServer();
      unregisterUnknown();
    };
  }, []);

  // Это компонент не рендерит никакого UI
  return null;
};

export default GlobalErrorHandler;
