
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  redirectTo?: string;
}

/**
 * Компонент для защиты маршрутов, требующих авторизации
 * 
 * @param children Защищаемый контент
 * @param adminOnly Ограничить доступ только для администраторов
 * @param redirectTo Путь для перенаправления неавторизованных пользователей
 */
const ProtectedRoute = ({ 
  children, 
  adminOnly = false,
  redirectTo = '/admin/login'
}: ProtectedRouteProps) => {
  const { isAuth, isAdmin } = useAuth();
  const location = useLocation();

  // Проверка авторизации
  if (!isAuth) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Проверка прав администратора
  if (adminOnly && !isAdmin) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
