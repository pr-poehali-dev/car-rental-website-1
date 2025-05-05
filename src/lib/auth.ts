
/**
 * Модуль для управления аутентификацией и авторизацией
 */

// Типы данных для аутентификации
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // timestamp когда истекает access token
}

// Роли пользователей системы
export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  MANAGER = 'manager',
  ADMIN = 'admin'
}

// Разрешения для ролей
export enum Permission {
  READ_CARS = 'read:cars',
  CREATE_CARS = 'create:cars',
  UPDATE_CARS = 'update:cars',
  DELETE_CARS = 'delete:cars',
  READ_USERS = 'read:users',
  CREATE_USERS = 'create:users',
  UPDATE_USERS = 'update:users',
  DELETE_USERS = 'delete:users',
  MANAGE_ORDERS = 'manage:orders',
  READ_ANALYTICS = 'read:analytics',
  MANAGE_SETTINGS = 'manage:settings'
}

// Разрешения по умолчанию для каждой роли
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.GUEST]: [
    Permission.READ_CARS
  ],
  [UserRole.USER]: [
    Permission.READ_CARS
  ],
  [UserRole.MANAGER]: [
    Permission.READ_CARS,
    Permission.CREATE_CARS,
    Permission.UPDATE_CARS,
    Permission.MANAGE_ORDERS
  ],
  [UserRole.ADMIN]: [
    Permission.READ_CARS,
    Permission.CREATE_CARS,
    Permission.UPDATE_CARS,
    Permission.DELETE_CARS,
    Permission.READ_USERS,
    Permission.CREATE_USERS,
    Permission.UPDATE_USERS,
    Permission.DELETE_USERS,
    Permission.MANAGE_ORDERS,
    Permission.READ_ANALYTICS,
    Permission.MANAGE_SETTINGS
  ]
};

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  permissions?: Permission[];
  avatar?: string;
  authProvider?: 'email' | 'google' | 'facebook';
}

// Ключи для хранения в localStorage
const ACCESS_TOKEN_KEY = 'app_access_token';
const REFRESH_TOKEN_KEY = 'app_refresh_token';
const TOKEN_EXPIRY_KEY = 'app_token_expiry';
const USER_DATA_KEY = 'app_user';

// Сохранение данных аутентификации
export const saveAuthData = (tokens: AuthTokens, user: AuthUser): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  localStorage.setItem(TOKEN_EXPIRY_KEY, tokens.expiresAt.toString());
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
};

// Получение данных аутентификации
export const getAuthData = (): { tokens: AuthTokens | null, user: AuthUser | null } => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const expiresAtStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
  const userDataStr = localStorage.getItem(USER_DATA_KEY);

  if (!accessToken || !refreshToken || !expiresAtStr) {
    return { tokens: null, user: null };
  }

  const tokens: AuthTokens = {
    accessToken,
    refreshToken,
    expiresAt: parseInt(expiresAtStr)
  };

  const user = userDataStr ? JSON.parse(userDataStr) as AuthUser : null;

  return { tokens, user };
};

// Очистка данных аутентификации (выход из системы)
export const clearAuthData = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem(USER_DATA_KEY);
};

// Проверка истечения срока токена
export const isTokenExpired = (): boolean => {
  const { tokens } = getAuthData();
  if (!tokens) return true;
  
  // Добавляем 5-секундный буфер для обеспечения актуальности токена
  return Date.now() >= tokens.expiresAt - 5000;
};

// Проверка аутентификации пользователя
export const isAuthenticated = (): boolean => {
  const { tokens, user } = getAuthData();
  return !!tokens && !!user && !isTokenExpired();
};

// Проверка наличия роли
export const hasRole = (requiredRole: UserRole): boolean => {
  const { user } = getAuthData();
  if (!user) return false;
  
  // Администратор имеет все права
  if (user.role === UserRole.ADMIN) return true;
  
  return user.role === requiredRole;
};

// Проверка наличия разрешения
export const hasPermission = (requiredPermission: Permission): boolean => {
  const { user } = getAuthData();
  if (!user) return false;
  
  // Проверяем пользовательские разрешения, если они есть
  if (user.permissions && user.permissions.includes(requiredPermission)) {
    return true;
  }
  
  // Иначе проверяем разрешения по роли
  return ROLE_PERMISSIONS[user.role].includes(requiredPermission);
};

// Получение всех разрешений пользователя
export const getUserPermissions = (): Permission[] => {
  const { user } = getAuthData();
  if (!user) return [];
  
  // Объединяем разрешения роли и пользовательские разрешения
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  const userPermissions = user.permissions || [];
  
  // Удаляем дубликаты
  return [...new Set([...rolePermissions, ...userPermissions])];
};

// Получение текущего пользователя
export const getCurrentUser = (): AuthUser | null => {
  const { user } = getAuthData();
  return user;
};
