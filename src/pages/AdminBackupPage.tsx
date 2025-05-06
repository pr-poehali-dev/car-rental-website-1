
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Icon from "@/components/ui/icon";
import { AuditLogger, AuditEventType, AuditLogLevel } from "@/lib/audit-logger";
import { Permission, hasPermission } from "@/lib/auth";

// Типы данных для резервных копий
interface Backup {
  id: string;
  name: string;
  size: number; // в байтах
  timestamp: number;
  type: 'auto' | 'manual';
  status: 'completed' | 'failed' | 'in_progress';
  dbVersion: string;
  contents: Array<'users' | 'cars' | 'bookings' | 'settings' | 'logs'>;
}

// Типы для планировщика
type BackupScheduleFrequency = 'daily' | 'weekly' | 'monthly';
type BackupScheduleTime = '00:00' | '03:00' | '06:00' | '12:00' | '18:00' | '21:00';
type BackupScheduleDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface BackupSchedule {
  enabled: boolean;
  frequency: BackupScheduleFrequency;
  time: BackupScheduleTime;
  day?: BackupScheduleDay; // только для еженедельных бэкапов
  retention: number; // количество копий для хранения
  includeUsers: boolean;
  includeCars: boolean;
  includeBookings: boolean;
  includeSettings: boolean;
  includeLogs: boolean;
}

// Мок-данные для резервных копий
const mockBackups: Backup[] = [
  {
    id: 'backup_20230610120000',
    name: 'Автоматическая резервная копия',
    size: 1024 * 1024 * 10.5, // 10.5 MB
    timestamp: new Date('2023-06-10T12:00:00').getTime(),
    type: 'auto',
    status: 'completed',
    dbVersion: '1.2.0',
    contents: ['users', 'cars', 'bookings', 'settings']
  },
  {
    id: 'backup_20230605060000',
    name: 'Еженедельная резервная копия',
    size: 1024 * 1024 * 12.3, // 12.3 MB
    timestamp: new Date('2023-06-05T06:00:00').getTime(),
    type: 'auto',
    status: 'completed',
    dbVersion: '1.2.0',
    contents: ['users', 'cars', 'bookings', 'settings', 'logs']
  },
  {
    id: 'backup_20230601180000',
    name: 'Перед обновлением системы',
    size: 1024 * 1024 * 11.8, // 11.8 MB
    timestamp: new Date('2023-06-01T18:00:00').getTime(),
    type: 'manual',
    status: 'completed',
    dbVersion: '1.1.5',
    contents: ['users', 'cars', 'bookings', 'settings', 'logs']
  },
  {
    id: 'backup_20230525120000',
    name: 'Автоматическая резервная копия',
    size: 1024 * 1024 * 9.7, // 9.7 MB
    timestamp: new Date('2023-05-25T12:00:00').getTime(),
    type: 'auto',
    status: 'completed',
    dbVersion: '1.1.5',
    contents: ['users', 'cars', 'bookings', 'settings']
  },
  {
    id: 'backup_20230520120000',
    name: 'Перед изменением базы данных',
    size: 1024 * 1024 * 7.2, // 7.2 MB
    timestamp: new Date('2023-05-20T12:00:00').getTime(),
    type: 'manual',
    status: 'failed',
    dbVersion: '1.1.4',
    contents: ['users', 'cars', 'bookings']
  }
];

// Начальные настройки планировщика
const initialBackupSchedule: BackupSchedule = {
  enabled: true,
  frequency: 'daily',
  time: '03:00',
  retention: 7, // хранить последние 7 копий
  includeUsers: true,
  includeCars: true,
  includeBookings: true,
  includeSettings: true,
  includeLogs: false
};

const AdminBackupPage = () => {
  // Состояния
  const [backups, setBackups] = useState<Backup[]>([]);
  const [backupSchedule, setBackupSchedule] = useState<BackupSchedule>(initialBackupSchedule);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackupInProgress, setIsBackupInProgress] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isRestoreInProgress, setIsRestoreInProgress] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  
  // Хуки
  const { toast } = useToast();
  const { isAdmin, checkPermission } = useAuth();
  
  // Загрузка данных при монтировании компонента
  useEffect(() => {
    loadBackups();
  }, []);
  
  // Функция загрузки резервных копий
  const loadBackups = () => {
    setIsLoading(true);
    
    // Имитация загрузки данных
    setTimeout(() => {
      setBackups(mockBackups);
      setIsLoading(false);
    }, 1000);
  };
  
  // Функция создания резервной копии
  const createBackup = () => {
    if (!checkPermission(Permission.MANAGE_SETTINGS)) {
      toast({
        variant: "destructive",
        title: "Доступ запрещен",
        description: "У вас нет прав для создания резервных копий"
      });
      return;
    }
    
    setIsBackupInProgress(true);
    setBackupProgress(0);
    
    // Имитация процесса создания резервной копии
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
    
    // Имитация завершения процесса
    setTimeout(() => {
      clearInterval(interval);
      
      const newBackup: Backup = {
        id: `backup_${format(new Date(), 'yyyyMMddHHmmss')}`,
        name: 'Ручная резервная копия',
        size: 1024 * 1024 * (8 + Math.random() * 5).toFixed(1), // 8-13 MB
        timestamp: Date.now(),
        type: 'manual',
        status: 'completed',
        dbVersion: '1.2.0',
        contents: ['users', 'cars', 'bookings', 'settings', 'logs']
      };
      
      setBackups(prev => [newBackup, ...prev]);
      setIsBackupInProgress(false);
      setBackupProgress(0);
      
      AuditLogger.adminAction(
        "Создание резервной копии", 
        "backup", 
        { backupId: newBackup.id, timestamp: newBackup.timestamp }
      );
      
      toast({
        title: "Резервная копия создана",
        description: "Резервная копия успешно создана и сохранена в системе"
      });
    }, 5000);
  };
  
  // Функция восстановления из резервной копии
  const restoreFromBackup = () => {
    if (!selectedBackup) return;
    
    if (!checkPermission(Permission.MANAGE_SETTINGS)) {
      toast({
        variant: "destructive",
        title: "Доступ запрещен",
        description: "У вас нет прав для восстановления из резервных копий"
      });
      return;
    }
    
    setIsRestoreDialogOpen(false);
    setIsRestoreInProgress(true);
    setRestoreProgress(0);
    
    // Имитация процесса восстановления
    const interval = setInterval(() => {
      setRestoreProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 300);
    
    // Имитация завершения процесса
    setTimeout(() => {
      clearInterval(interval);
      setIsRestoreInProgress(false);
      setRestoreProgress(0);
      
      AuditLogger.adminAction(
        "Восстановление из резервной копии", 
        "backup", 
        { backupId: selectedBackup.id, timestamp: selectedBackup.timestamp },
        { level: AuditLogLevel.WARNING }
      );
      
      toast({
        title: "Восстановление завершено",
        description: `Система успешно восстановлена из резервной копии от ${format(new Date(selectedBackup.timestamp), 'dd.MM.yyyy HH:mm')}`
      });
    }, 6000);
  };
  
  // Функция скачивания резервной копии
  const downloadBackup = (backup: Backup) => {
    if (!checkPermission(Permission.MANAGE_SETTINGS)) {
      toast({
        variant: "destructive",
        title: "Доступ запрещен",
        description: "У вас нет прав для скачивания резервных копий"
      });
      return;
    }
    
    // Имитация скачивания (в реальном приложении здесь был бы запрос на сервер)
    toast({
      title: "Скачивание резервной копии",
      description: "Начато скачивание резервной копии. Это может занять некоторое время."
    });
    
    AuditLogger.adminAction(
      "Скачивание резервной копии", 
      "backup", 
      { backupId: backup.id, timestamp: backup.timestamp }
    );
    
    // Имитация скачивания файла
    setTimeout(() => {
      toast({
        title: "Скачивание завершено",
        description: "Резервная копия успешно скачана"
      });
    }, 3000);
  };
  
  // Функция удаления резервной копии
  const deleteBackup = (backup: Backup) => {
    if (!checkPermission(Permission.MANAGE_SETTINGS)) {
      toast({
        variant: "destructive",
        title: "Доступ запрещен",
        description: "У вас нет прав для удаления резервных копий"
      });
      return;
    }
    
    if (window.confirm(`Вы уверены, что хотите удалить резервную копию от ${format(new Date(backup.timestamp), 'dd.MM.yyyy HH:mm')}?`)) {
      setBackups(prev => prev.filter(b => b.id !== backup.id));
      
      AuditLogger.adminAction(
        "Удаление резервной копии", 
        "backup", 
        { backupId: backup.id, timestamp: backup.timestamp },
        { level: AuditLogLevel.WARNING }
      );
      
      toast({
        title: "Резервная копия удалена",
        description: "Резервная копия успешно удалена из системы"
      });
    }
  };
  
  // Функция сохранения расписания резервного копирования
  const saveBackupSchedule = () => {
    if (!checkPermission(Permission.MANAGE_SETTINGS)) {
      toast({
        variant: "destructive",
        title: "Доступ запрещен",
        description: "У вас нет прав для изменения расписания резервного копирования"
      });
      return;
    }
    
    // Проверка, выбрана ли хотя бы одна категория данных
    if (!backupSchedule.includeUsers && !backupSchedule.includeCars && 
        !backupSchedule.includeBookings && !backupSchedule.includeSettings && 
        !backupSchedule.includeLogs) {
      toast({
        variant: "destructive",
        title: "Ошибка настройки",
        description: "Необходимо выбрать хотя бы одну категорию данных для резервного копирования"
      });
      return;
    }
    
    setIsScheduleDialogOpen(false);
    
    // Имитация сохранения настроек
    AuditLogger.adminAction(
      "Изменение расписания резервного копирования", 
      "settings", 
      { backupSchedule }
    );
    
    toast({
      title: "Расписание сохранено",
      description: "Расписание резервного копирования успешно обновлено"
    });
  };
  
  // Форматирование размера файла
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };
  
  // Перевод типа резервной копии
  const getBackupTypeLabel = (type: 'auto' | 'manual') => {
    return type === 'auto' ? 'Автоматическая' : 'Ручная';
  };
  
  // Перевод статуса резервной копии
  const getBackupStatusLabel = (status: 'completed' | 'failed' | 'in_progress') => {
    switch (status) {
      case 'completed': return 'Завершена';
      case 'failed': return 'Ошибка';
      case 'in_progress': return 'В процессе';
      default: return status;
    }
  };
  
  // Получение цвета для статуса
  const getStatusColor = (status: 'completed' | 'failed' | 'in_progress') => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'in_progress': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Получение частоты резервного копирования в текстовом формате
  const getFrequencyLabel = (frequency: BackupScheduleFrequency) => {
    switch (frequency) {
      case 'daily': return 'Ежедневно';
      case 'weekly': return 'Еженедельно';
      case 'monthly': return 'Ежемесячно';
      default: return frequency;
    }
  };
  
  // Получение дня недели в текстовом формате
  const getDayLabel = (day?: BackupScheduleDay) => {
    if (!day) return '';
    
    const days: Record<BackupScheduleDay, string> = {
      monday: 'Понедельник',
      tuesday: 'Вторник',
      wednesday: 'Среда',
      thursday: 'Четверг',
      friday: 'Пятница',
      saturday: 'Суббота',
      sunday: 'Воскресенье'
    };
    
    return days[day];
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Резервное копирование</h1>
            <p className="text-gray-500 mt-1">
              Управление резервными копиями базы данных и системных настроек
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsScheduleDialogOpen(true)}
              disabled={!checkPermission(Permission.MANAGE_SETTINGS) || isBackupInProgress || isRestoreInProgress}
            >
              <Icon name="Calendar" className="mr-2 h-4 w-4" />
              Расписание
            </Button>
            
            <Button
              onClick={createBackup}
              disabled={!checkPermission(Permission.MANAGE_SETTINGS) || isBackupInProgress || isRestoreInProgress}
            >
              {isBackupInProgress ? (
                <>
                  <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                  Создание резервной копии...
                </>
              ) : (
                <>
                  <Icon name="Save" className="mr-2 h-4 w-4" />
                  Создать резервную копию
                </>
              )}
            </Button>
          </div>
        </div>
        
        {(isBackupInProgress || isRestoreInProgress) && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">
                    {isBackupInProgress && "Создание резервной копии..."}
                    {isRestoreInProgress && "Восстановление из резервной копии..."}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {isBackupInProgress && `${backupProgress}%`}
                    {isRestoreInProgress && `${restoreProgress}%`}
                  </span>
                </div>
                <Progress 
                  value={isBackupInProgress ? backupProgress : restoreProgress} 
                  className="h-2"
                />
                <p className="text-sm text-gray-500">
                  {isBackupInProgress && "Пожалуйста, подождите. Создание резервной копии может занять некоторое время."}
                  {isRestoreInProgress && "Восстановление системы из резервной копии. Не закрывайте страницу."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Список резервных копий</CardTitle>
                <CardDescription>
                  История резервных копий системы с возможностью восстановления
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center p-12">
                    <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Загрузка резервных копий...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Название</TableHead>
                        <TableHead>Дата создания</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Размер</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backups.length > 0 ? (
                        backups.map((backup) => (
                          <TableRow key={backup.id}>
                            <TableCell>
                              <div>
                                {backup.name}
                                <div className="text-xs text-gray-500">
                                  Версия БД: {backup.dbVersion}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {format(new Date(backup.timestamp), 'dd MMM yyyy, HH:mm', { locale: ru })}
                            </TableCell>
                            <TableCell>
                              <Badge variant={backup.type === 'auto' ? 'outline' : 'default'}>
                                {getBackupTypeLabel(backup.type)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatFileSize(backup.size)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(backup.status)}`}></div>
                                {getBackupStatusLabel(backup.status)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => downloadBackup(backup)}
                                  disabled={backup.status !== 'completed' || isBackupInProgress || isRestoreInProgress}
                                >
                                  <Icon name="Download" className="h-4 w-4" />
                                </Button>
                                
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBackup(backup);
                                    setIsRestoreDialogOpen(true);
                                  }}
                                  disabled={backup.status !== 'completed' || isBackupInProgress || isRestoreInProgress}
                                >
                                  <Icon name="History" className="h-4 w-4" />
                                </Button>
                                
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => deleteBackup(backup)}
                                  disabled={isBackupInProgress || isRestoreInProgress}
                                >
                                  <Icon name="Trash2" className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            Нет доступных резервных копий
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Текущие настройки</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium">Статус:</div>
                    <div className="flex items-center mt-1">
                      <div className={`w-2 h-2 rounded-full mr-2 ${backupSchedule.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {backupSchedule.enabled ? 'Активно' : 'Отключено'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium">Расписание:</div>
                    <div className="mt-1">
                      {getFrequencyLabel(backupSchedule.frequency)}
                      {backupSchedule.frequency === 'weekly' && backupSchedule.day && (
                        <>, {getDayLabel(backupSchedule.day)}</>
                      )}
                      {` в ${backupSchedule.time}`}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium">Хранение:</div>
                    <div className="mt-1">
                      {backupSchedule.retention} {backupSchedule.retention === 1 ? 'копия' : 
                        backupSchedule.retention < 5 ? 'копии' : 'копий'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium">Включено в копию:</div>
                    <div className="mt-1 space-y-1">
                      {backupSchedule.includeUsers && (
                        <Badge variant="outline" className="mr-1">Пользователи</Badge>
                      )}
                      {backupSchedule.includeCars && (
                        <Badge variant="outline" className="mr-1">Автомобили</Badge>
                      )}
                      {backupSchedule.includeBookings && (
                        <Badge variant="outline" className="mr-1">Бронирования</Badge>
                      )}
                      {backupSchedule.includeSettings && (
                        <Badge variant="outline" className="mr-1">Настройки</Badge>
                      )}
                      {backupSchedule.includeLogs && (
                        <Badge variant="outline">Журналы</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium">Следующая копия:</div>
                    <div className="mt-1">
                      {backupSchedule.enabled 
                        ? format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'dd.MM.yyyy, HH:mm')
                        : 'Не запланирована'
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Диалог восстановления из резервной копии */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Восстановление системы</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите восстановить систему из выбранной резервной копии?
              Это действие перезапишет текущие данные.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBackup && (
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium">Резервная копия:</div>
                  <div className="mt-1">{selectedBackup.name}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium">Дата создания:</div>
                  <div className="mt-1">
                    {format(new Date(selectedBackup.timestamp), 'dd MMM yyyy, HH:mm', { locale: ru })}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium">Версия БД:</div>
                  <div className="mt-1">{selectedBackup.dbVersion}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium">Содержимое:</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedBackup.contents.map(content => (
                      <Badge key={content} variant="outline">
                        {content === 'users' && 'Пользователи'}
                        {content === 'cars' && 'Автомобили'}
                        {content === 'bookings' && 'Бронирования'}
                        {content === 'settings' && 'Настройки'}
                        {content === 'logs' && 'Журналы'}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                    <div className="flex">
                      <Icon name="AlertTriangle" className="h-5 w-5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Внимание!</p>
                        <p className="text-sm mt-1">
                          Восстановление системы из резервной копии приведет к перезаписи текущих данных.
                          Этот процесс нельзя отменить. Рекомендуется создать новую резервную копию перед восстановлением.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRestoreDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button 
              variant="destructive"
              onClick={restoreFromBackup}
            >
              Восстановить систему
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Диалог настройки расписания резервного копирования */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Расписание резервного копирования</DialogTitle>
            <DialogDescription>
              Настройте автоматическое создание резервных копий системы
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="backup-enabled">Включить автобэкап</Label>
              <Switch
                id="backup-enabled"
                checked={backupSchedule.enabled}
                onCheckedChange={(checked) => setBackupSchedule(prev => ({ ...prev, enabled: checked }))}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Частота копирования</Label>
                <Select
                  value={backupSchedule.frequency}
                  onValueChange={(value: BackupScheduleFrequency) => 
                    setBackupSchedule(prev => ({ 
                      ...prev, 
                      frequency: value,
                      // Если частота изменилась с еженедельной, сбросить день
                      day: value === 'weekly' ? prev.day || 'monday' : undefined
                    }))
                  }
                  disabled={!backupSchedule.enabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите частоту" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Ежедневно</SelectItem>
                    <SelectItem value="weekly">Еженедельно</SelectItem>
                    <SelectItem value="monthly">Ежемесячно</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {backupSchedule.frequency === 'weekly' && (
                <div className="space-y-2">
                  <Label htmlFor="backup-day">День недели</Label>
                  <Select
                    value={backupSchedule.day || 'monday'}
                    onValueChange={(value: BackupScheduleDay) => 
                      setBackupSchedule(prev => ({ ...prev, day: value }))
                    }
                    disabled={!backupSchedule.enabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите день" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Понедельник</SelectItem>
                      <SelectItem value="tuesday">Вторник</SelectItem>
                      <SelectItem value="wednesday">Среда</SelectItem>
                      <SelectItem value="thursday">Четверг</SelectItem>
                      <SelectItem value="friday">Пятница</SelectItem>
                      <SelectItem value="saturday">Суббота</SelectItem>
                      <SelectItem value="sunday">Воскресенье</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="backup-time">Время</Label>
                <Select
                  value={backupSchedule.time}
                  onValueChange={(value: BackupScheduleTime) => 
                    setBackupSchedule(prev => ({ ...prev, time: value }))
                  }
                  disabled={!backupSchedule.enabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите время" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="00:00">00:00</SelectItem>
                    <SelectItem value="03:00">03:00</SelectItem>
                    <SelectItem value="06:00">06:00</SelectItem>
                    <SelectItem value="12:00">12:00</SelectItem>
                    <SelectItem value="18:00">18:00</SelectItem>
                    <SelectItem value="21:00">21:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="backup-retention">Хранить копий</Label>
                <Select
                  value={backupSchedule.retention.toString()}
                  onValueChange={(value) => 
                    setBackupSchedule(prev => ({ ...prev, retention: parseInt(value) }))
                  }
                  disabled={!backupSchedule.enabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Количество копий" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 копия</SelectItem>
                    <SelectItem value="3">3 копии</SelectItem>
                    <SelectItem value="7">7 копий</SelectItem>
                    <SelectItem value="14">14 копий</SelectItem>
                    <SelectItem value="30">30 копий</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Включить в резервную копию:</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-users"
                    checked={backupSchedule.includeUsers}
                    onCheckedChange={(checked) => 
                      setBackupSchedule(prev => ({ ...prev, includeUsers: checked }))
                    }
                    disabled={!backupSchedule.enabled}
                  />
                  <Label htmlFor="include-users">Пользователи</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-cars"
                    checked={backupSchedule.includeCars}
                    onCheckedChange={(checked) => 
                      setBackupSchedule(prev => ({ ...prev, includeCars: checked }))
                    }
                    disabled={!backupSchedule.enabled}
                  />
                  <Label htmlFor="include-cars">Автомобили</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-bookings"
                    checked={backupSchedule.includeBookings}
                    onCheckedChange={(checked) => 
                      setBackupSchedule(prev => ({ ...prev, includeBookings: checked }))
                    }
                    disabled={!backupSchedule.enabled}
                  />
                  <Label htmlFor="include-bookings">Бронирования</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-settings"
                    checked={backupSchedule.includeSettings}
                    onCheckedChange={(checked) => 
                      setBackupSchedule(prev => ({ ...prev, includeSettings: checked }))
                    }
                    disabled={!backupSchedule.enabled}
                  />
                  <Label htmlFor="include-settings">Настройки</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-logs"
                    checked={backupSchedule.includeLogs}
                    onCheckedChange={(checked) => 
                      setBackupSchedule(prev => ({ ...prev, includeLogs: checked }))
                    }
                    disabled={!backupSchedule.enabled}
                  />
                  <Label htmlFor="include-logs">Журналы</Label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsScheduleDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={saveBackupSchedule}>
              Сохранить расписание
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBackupPage;
