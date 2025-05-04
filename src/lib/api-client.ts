
/**
 * API-клиент с поддержкой токен-аутентификации и перехватчиками ошибок
 */

import { getAuthData, isTokenExpired, saveAuthData, clearAuthData, AuthTokens, AuthUser } from "./auth";

// Типы ошибок API
export enum ApiErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

// Класс ошибки API
export class ApiError extends Error {
  type: ApiErrorType;
  status?: number;
  details?: any;

  constructor(message: string, type: ApiErrorType, status?: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.details = details;
  }
}

// Базовый URL API
const API_URL = "https://api.autopro.ru/v1";

// Обработчики глобальных ошибок
const errorHandlers: Record<ApiErrorType, ((error: ApiError) => void)[]> = {
  [ApiErrorType.NETWORK]: [],
  [ApiErrorType.AUTH]: [],
  [ApiErrorType.VALIDATION]: [],
  [ApiErrorType.SERVER]: [],
  [ApiErrorType.UNKNOWN]: []
};

// Регистрация обработчика ошибок
export const registerErrorHandler = (type: ApiErrorType, handler: (error: ApiError) => void): () => void => {
  errorHandlers[type].push(handler);
  
  // Функция для удаления обработчика
  return () => {
    const index = errorHandlers[type].indexOf(handler);
    if (index > -1) {
      errorHandlers[type].splice(index, 1);
    }
  };
};

// Обработка ошибок по типу
const handleApiError = (error: ApiError): void => {
  const handlers = errorHandlers[error.type];
  handlers.forEach(handler => handler(error));
  
  // Если ошибка авторизации - очищаем данные аутентификации
  if (error.type === ApiErrorType.AUTH && error.status === 401) {
    clearAuthData();
  }
};

// Обновление токена
const refreshToken = async (): Promise<AuthTokens> => {
  const { tokens } = getAuthData();
  
  if (!tokens) {
    throw new ApiError('Отсутствует refresh token', ApiErrorType.AUTH);
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken: tokens.refreshToken })
    });
    
    if (!response.ok) {
      throw new ApiError('Не удалось обновить токен', ApiErrorType.AUTH, response.status);
    }
    
    const data = await response.json();
    
    // Обновленные токены
    const newTokens: AuthTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: Date.now() + data.expiresIn * 1000
    };
    
    // Сохраняем обновленные токены
    const { user } = getAuthData();
    if (user) {
      saveAuthData(newTokens, user);
    }
    
    return newTokens;
  } catch (error) {
    clearAuthData(); // При ошибке обновления токена выходим из системы
    throw new ApiError(
      'Ошибка при обновлении токена, пожалуйста, войдите снова',
      ApiErrorType.AUTH
    );
  }
};

// Функция для создания заголовков с авторизацией
const createAuthHeaders = async (): Promise<Headers> => {
  const headers = new Headers({
    'Content-Type': 'application/json'
  });
  
  // Если пользователь не авторизован, возвращаем базовые заголовки
  if (!getAuthData().tokens) return headers;
  
  // Если токен истек, обновляем его
  if (isTokenExpired()) {
    try {
      const newTokens = await refreshToken();
      headers.append('Authorization', `Bearer ${newTokens.accessToken}`);
    } catch (error) {
      // Если не удалось обновить токен, продолжаем без авторизации
      console.error('Ошибка обновления токена:', error);
    }
  } else {
    // Используем существующий токен
    const { tokens } = getAuthData();
    if (tokens) {
      headers.append('Authorization', `Bearer ${tokens.accessToken}`);
    }
  }
  
  return headers;
};

// Обработка ответа API
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorType = ApiErrorType.UNKNOWN;
    let details = null;
    
    try {
      const errorData = await response.json();
      details = errorData;
      
      // Определяем тип ошибки по статусу
      if (response.status === 401 || response.status === 403) {
        errorType = ApiErrorType.AUTH;
      } else if (response.status === 400 || response.status === 422) {
        errorType = ApiErrorType.VALIDATION;
      } else if (response.status >= 500) {
        errorType = ApiErrorType.SERVER;
      }
    } catch (e) {
      // Ошибка при парсинге JSON
    }
    
    const error = new ApiError(
      details?.message || `Ошибка API: ${response.statusText}`,
      errorType,
      response.status,
      details
    );
    
    handleApiError(error);
    throw error;
  }
  
  return await response.json();
};

// Основная функция для отправки запроса к API
export const apiRequest = async <T>(
  url: string,
  method: string = 'GET',
  data?: any,
  skipAuth: boolean = false
): Promise<T> => {
  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
  const headers = skipAuth ? new Headers({ 'Content-Type': 'application/json' }) : await createAuthHeaders();
  
  const options: RequestInit = {
    method,
    headers,
  };
  
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(fullUrl, options);
    return await handleApiResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Обработка сетевых ошибок
    const networkError = new ApiError(
      'Ошибка сети при выполнении запроса',
      ApiErrorType.NETWORK,
      undefined,
      { originalError: error }
    );
    
    handleApiError(networkError);
    throw networkError;
  }
};

// Методы API-клиента
export const apiClient = {
  get: <T>(url: string, skipAuth: boolean = false): Promise<T> => 
    apiRequest<T>(url, 'GET', undefined, skipAuth),
    
  post: <T>(url: string, data: any, skipAuth: boolean = false): Promise<T> => 
    apiRequest<T>(url, 'POST', data, skipAuth),
    
  put: <T>(url: string, data: any, skipAuth: boolean = false): Promise<T> => 
    apiRequest<T>(url, 'PUT', data, skipAuth),
    
  patch: <T>(url: string, data: any, skipAuth: boolean = false): Promise<T> => 
    apiRequest<T>(url, 'PATCH', data, skipAuth),
    
  delete: <T>(url: string, skipAuth: boolean = false): Promise<T> => 
    apiRequest<T>(url, 'DELETE', undefined, skipAuth),
    
  // Специальный метод аутентификации
  login: async (username: string, password: string): Promise<{tokens: AuthTokens, user: AuthUser}> => {
    try {
      const response = await apiRequest<{
        accessToken: string, 
        refreshToken: string, 
        expiresIn: number,
        user: AuthUser
      }>('/auth/login', 'POST', { username, password }, true);
      
      const tokens: AuthTokens = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAt: Date.now() + response.expiresIn * 1000
      };
      
      saveAuthData(tokens, response.user);
      
      return {
        tokens,
        user: response.user
      };
    } catch (error) {
      // Преобразование ошибок в ApiError
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        'Ошибка при входе в систему',
        ApiErrorType.UNKNOWN,
        undefined,
        { originalError: error }
      );
    }
  },
  
  // Выход пользователя
  logout: (): void => {
    clearAuthData();
  }
};

// Регистрация глобальных обработчиков ошибок по умолчанию
registerErrorHandler(ApiErrorType.AUTH, (error) => {
  if (error.status === 401) {
    console.log('Необходима авторизация, перенаправление на страницу входа...');
    // В реальном приложении здесь будет редирект на страницу логина
  }
});
