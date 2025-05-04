
/**
 * Модуль для управления аутентификацией и авторизацией
 */

// Типы данных для аутентификации
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // timestamp когда истекает access token
}

export interface AuthUser {
  id: string;
  name: string;
  role: string;
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

// Проверка роли администратора
export const isAdmin = (): boolean => {
  const { user } = getAuthData();
  return !!user && user.role === 'admin';
};

// Получение текущего пользователя
export const getCurrentUser = (): AuthUser | null => {
  const { user } = getAuthData();
  return user;
};
