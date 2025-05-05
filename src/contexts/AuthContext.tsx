
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  AuthUser, 
  getAuthData, 
  isAuthenticated, 
  clearAuthData, 
  hasPermission, 
  hasRole,
  UserRole,
  Permission
} from '@/lib/auth';
import { ApiErrorType, registerErrorHandler } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: AuthUser | null;
  isAuth: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isLoading: boolean;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
  checkPermission: (permission: Permission) => boolean;
  checkRole: (role: UserRole) => boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  loginWithProvider: (provider: 'google' | 'facebook') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuth: false,
  isAdmin: false,
  isManager: false,
  isLoading: true,
  logout: () => {},
  updateUser: () => {},
  checkPermission: () => false,
  checkRole: () => false,
  login: async () => ({ id: '', name: '', role: UserRole.GUEST }),
  loginWithProvider: async () => {},
  resetPassword: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Загружаем пользователя из localStorage при инициализации
  useEffect(() => {
    const { user } = getAuthData();
    const authStatus = isAuthenticated();
    
    setUser(user);
    setIsAuth(authStatus);
    setIsLoading(false);
  }, []);

  // Регистрируем обработчик ошибок авторизации
  useEffect(() => {
    const unregister = registerErrorHandler(ApiErrorType.AUTH, (error) => {
      if (error.status === 401) {
        toast({
          variant: "destructive",
          title: "Ошибка авторизации",
          description: "Ваша сессия истекла. Пожалуйста, войдите снова.",
        });
        logout();
        navigate('/login');
      }
    });
    
    return () => unregister();
  }, []);
  
  // Выход из системы
  const logout = () => {
    clearAuthData();
    setUser(null);
    setIsAuth(false);
  };
  
  // Обновление данных пользователя
  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
  };
  
  // Проверка наличия разрешения
  const checkPermission = (permission: Permission): boolean => {
    return hasPermission(permission);
  };
  
  // Проверка наличия роли
  const checkRole = (role: UserRole): boolean => {
    return hasRole(role);
  };
  
  // Вход в систему
  const login = async (email: string, password: string): Promise<AuthUser> => {
    // Заглушка для демонстрации - в реальном приложении здесь будет API-запрос
    setIsLoading(true);
    
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'admin@example.com' && password === 'admin') {
        const user: AuthUser = {
          id: '1',
          name: 'Администратор',
          email: 'admin@example.com',
          role: UserRole.ADMIN,
          authProvider: 'email'
        };
        
        // В реальном приложении здесь будут токены от сервера
        const tokens = {
          accessToken: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
          expiresAt: Date.now() + 3600000 // +1 час
        };
        
        setUser(user);
        setIsAuth(true);
        return user;
      } else if (email === 'manager@example.com' && password === 'manager') {
        const user: AuthUser = {
          id: '2',
          name: 'Менеджер',
          email: 'manager@example.com',
          role: UserRole.MANAGER,
          authProvider: 'email'
        };
        
        const tokens = {
          accessToken: 'mock-manager-token',
          refreshToken: 'mock-refresh-token',
          expiresAt: Date.now() + 3600000
        };
        
        setUser(user);
        setIsAuth(true);
        return user;
      }
      
      throw new Error('Неверные учетные данные');
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Ошибка входа",
          description: error.message,
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Вход через сторонний сервис (Google, Facebook)
  const loginWithProvider = async (provider: 'google' | 'facebook'): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Заглушка для интеграции с провайдерами
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const user: AuthUser = {
        id: `${provider}-user-id`,
        name: `Пользователь ${provider}`,
        email: `user@${provider}.com`,
        role: UserRole.USER,
        authProvider: provider,
        avatar: `https://ui-avatars.com/api/?name=User+${provider}`
      };
      
      const tokens = {
        accessToken: `mock-${provider}-token`,
        refreshToken: `mock-${provider}-refresh`,
        expiresAt: Date.now() + 3600000
      };
      
      setUser(user);
      setIsAuth(true);
      
      toast({
        title: "Успешный вход",
        description: `Вы вошли через ${provider}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка входа",
        description: `Не удалось войти через ${provider}`,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Сброс пароля
  const resetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Заглушка для сброса пароля
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Сброс пароля",
        description: `Инструкции по сбросу пароля отправлены на ${email}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось отправить инструкции по сбросу пароля",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const isAdmin = user?.role === UserRole.ADMIN;
  const isManager = user?.role === UserRole.MANAGER || isAdmin;
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuth, 
        isAdmin, 
        isManager, 
        isLoading, 
        logout, 
        updateUser, 
        checkPermission, 
        checkRole, 
        login, 
        loginWithProvider, 
        resetPassword 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
