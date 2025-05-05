
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, getAuthData, isAuthenticated, clearAuthData } from '@/lib/auth';
import { ApiErrorType, registerErrorHandler } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: AuthUser | null;
  isAuth: boolean;
  isAdmin: boolean;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuth: false,
  isAdmin: false,
  logout: () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const { toast } = useToast();

  // Загружаем пользователя из localStorage при инициализации
  useEffect(() => {
    const { user } = getAuthData();
    const authStatus = isAuthenticated();
    
    setUser(user);
    setIsAuth(authStatus);
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
  
  const isAdmin = user?.role === 'admin';
  
  return (
    <AuthContext.Provider value={{ user, isAuth, isAdmin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
