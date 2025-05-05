
/**
 * Модуль для логирования действий пользователей и администраторов
 */

import { getCurrentUser } from '@/lib/auth';

// Типы событий для аудита
export enum AuditEventType {
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  CAR_CREATED = 'CAR_CREATED',
  CAR_UPDATED = 'CAR_UPDATED',
  CAR_DELETED = 'CAR_DELETED',
  BOOKING_CREATED = 'BOOKING_CREATED',
  BOOKING_UPDATED = 'BOOKING_UPDATED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
  API_ERROR = 'API_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}

// Уровни важности событий
export enum AuditLogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

// Интерфейс для записи аудита
export interface AuditLogEntry {
  userId: string;
  userName: string;
  userRole: string;
  timestamp: number;
  eventType: AuditEventType;
  level: AuditLogLevel;
  action: string;
  target?: string;
  details?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  appVersion?: string;
}

// Память для хранения локальных логов (в реальном приложении логи будут отправляться на сервер)
const localLogs: AuditLogEntry[] = [];

// Максимальное количество логов в памяти
const MAX_LOCAL_LOGS = 100;

/**
 * Получение IP-адреса пользователя (заглушка, в реальном приложении получали бы с сервера)
 */
const getUserIp = (): string => {
  return '127.0.0.1'; // В браузере нельзя получить реальный IP клиента
};

/**
 * Логирование действия пользователя
 */
export const logAuditEvent = (
  eventType: AuditEventType,
  action: string,
  options?: {
    level?: AuditLogLevel;
    target?: string;
    details?: Record<string, any>;
  }
): void => {
  const currentUser = getCurrentUser();
  const { level = AuditLogLevel.INFO, target, details } = options || {};

  // Если пользователь не аутентифицирован, записываем как анонимное действие
  const userId = currentUser?.id || 'anonymous';
  const userName = currentUser?.name || 'Гость';
  const userRole = currentUser?.role || 'guest';

  const logEntry: AuditLogEntry = {
    userId,
    userName,
    userRole,
    timestamp: Date.now(),
    eventType,
    level,
    action,
    target,
    details,
    ip: getUserIp(),
    userAgent: navigator.userAgent,
    appVersion: '1.0.0', // Версию приложения можно хранить в конфигурации
  };

  // Добавляем лог в локальное хранилище
  localLogs.unshift(logEntry);
  
  // Ограничиваем размер хранимых логов
  if (localLogs.length > MAX_LOCAL_LOGS) {
    localLogs.pop();
  }

  // В реальном приложении здесь будет отправка на сервер
  console.log(`[Audit Log] ${level}: ${action}`, logEntry);
  
  // Отправка на сервер (заглушка)
  sendLogToServer(logEntry);
};

/**
 * Отправка лога на сервер (заглушка)
 */
const sendLogToServer = (logEntry: AuditLogEntry): void => {
  // В реальном приложении здесь будет запрос к API
  // Можно использовать мутацию или debounce для оптимизации
  
  // Симуляция отправки
  setTimeout(() => {
    // console.log('Лог отправлен на сервер:', logEntry);
  }, 100);
};

/**
 * Получение локальных логов с фильтрацией (для отладки и интерфейса админа)
 */
export const getAuditLogs = (
  options?: {
    userId?: string;
    level?: AuditLogLevel;
    eventType?: AuditEventType;
    from?: number;
    to?: number;
    limit?: number;
  }
): AuditLogEntry[] => {
  const { userId, level, eventType, from, to, limit = 50 } = options || {};
  
  let filteredLogs = [...localLogs];
  
  // Применяем фильтры
  if (userId) {
    filteredLogs = filteredLogs.filter(log => log.userId === userId);
  }
  
  if (level) {
    filteredLogs = filteredLogs.filter(log => log.level === level);
  }
  
  if (eventType) {
    filteredLogs = filteredLogs.filter(log => log.eventType === eventType);
  }
  
  if (from) {
    filteredLogs = filteredLogs.filter(log => log.timestamp >= from);
  }
  
  if (to) {
    filteredLogs = filteredLogs.filter(log => log.timestamp <= to);
  }
  
  // Применяем лимит
  return filteredLogs.slice(0, limit);
};

/**
 * Хелперы для быстрого логирования типичных действий
 */
export const AuditLogger = {
  // Информационные события
  info: (action: string, target?: string, details?: Record<string, any>) => 
    logAuditEvent(AuditEventType.USER_UPDATED, action, { level: AuditLogLevel.INFO, target, details }),
  
  // Предупреждения
  warning: (action: string, target?: string, details?: Record<string, any>) => 
    logAuditEvent(AuditEventType.USER_UPDATED, action, { level: AuditLogLevel.WARNING, target, details }),
  
  // Ошибки
  error: (action: string, target?: string, details?: Record<string, any>) => 
    logAuditEvent(AuditEventType.API_ERROR, action, { level: AuditLogLevel.ERROR, target, details }),
  
  // Критические события
  critical: (action: string, target?: string, details?: Record<string, any>) => 
    logAuditEvent(AuditEventType.PERMISSION_DENIED, action, { level: AuditLogLevel.CRITICAL, target, details }),
  
  // События пользователей
  userLogin: (userId: string, details?: Record<string, any>) => 
    logAuditEvent(AuditEventType.USER_LOGIN, 'Пользователь вошел в систему', { 
      target: userId, 
      details 
    }),
  
  userLogout: (userId: string) => 
    logAuditEvent(AuditEventType.USER_LOGOUT, 'Пользователь вышел из системы', { 
      target: userId 
    }),
  
  // События администраторов
  adminAction: (action: string, target?: string, details?: Record<string, any>) => 
    logAuditEvent(AuditEventType.SETTINGS_UPDATED, action, { 
      level: AuditLogLevel.WARNING, 
      target, 
      details 
    }),
};
