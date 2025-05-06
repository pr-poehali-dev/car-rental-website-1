
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { 
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem, 
  PaginationLink, PaginationNext, PaginationPrevious 
} from "@/components/ui/pagination";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Icon from "@/components/ui/icon";
import { 
  AuditLogEntry, AuditLogLevel, AuditEventType, getAuditLogs 
} from "@/lib/audit-logger";
import { Permission, hasPermission } from "@/lib/auth";

// Функция для генерации мок-данных аудит-логов
const generateMockAuditLogs = (count: number = 50): AuditLogEntry[] => {
  const users = [
    { id: '1', name: 'Иван Смирнов', role: 'admin' },
    { id: '2', name: 'Анна Петрова', role: 'manager' },
    { id: '3', name: 'Администратор', role: 'admin' }
  ];
  
  const actions = [
    { type: AuditEventType.USER_LOGIN, action: 'Вход в систему', level: AuditLogLevel.INFO },
    { type: AuditEventType.USER_LOGOUT, action: 'Выход из системы', level: AuditLogLevel.INFO },
    { type: AuditEventType.CAR_CREATED, action: 'Создание автомобиля', level: AuditLogLevel.INFO },
    { type: AuditEventType.CAR_UPDATED, action: 'Обновление автомобиля', level: AuditLogLevel.INFO },
    { type: AuditEventType.CAR_DELETED, action: 'Удаление автомобиля', level: AuditLogLevel.WARNING },
    { type: AuditEventType.USER_CREATED, action: 'Создание пользователя', level: AuditLogLevel.INFO },
    { type: AuditEventType.USER_UPDATED, action: 'Обновление пользователя', level: AuditLogLevel.INFO },
    { type: AuditEventType.USER_DELETED, action: 'Удаление пользователя', level: AuditLogLevel.WARNING },
    { type: AuditEventType.USER_ROLE_CHANGED, action: 'Изменение роли пользователя', level: AuditLogLevel.WARNING },
    { type: AuditEventType.SETTINGS_UPDATED, action: 'Обновление настроек', level: AuditLogLevel.INFO },
    { type: AuditEventType.BOOKING_CREATED, action: 'Создание бронирования', level: AuditLogLevel.INFO },
    { type: AuditEventType.BOOKING_UPDATED, action: 'Обновление бронирования', level: AuditLogLevel.INFO },
    { type: AuditEventType.BOOKING_CANCELLED, action: 'Отмена бронирования', level: AuditLogLevel.WARNING },
    { type: AuditEventType.API_ERROR, action: 'Ошибка API', level: AuditLogLevel.ERROR },
    { type: AuditEventType.PERMISSION_DENIED, action: 'Доступ запрещен', level: AuditLogLevel.ERROR }
  ];
  
  const ips = ['192.168.1.1', '192.168.1.2', '127.0.0.1', '10.0.0.1', '10.0.0.2'];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
  ];
  
  const logs: AuditLogEntry[] = [];
  
  // Текущая дата
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const actionInfo = actions[Math.floor(Math.random() * actions.length)];
    const timestamp = now - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000); // Случайная дата в пределах 30 дней
    const ip = ips[Math.floor(Math.random() * ips.length)];
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    // Генерируем случайные детали в зависимости от типа события
    let details: Record<string, any> = {};
    let target = '';
    
    if (actionInfo.type.includes('USER')) {
      const targetUser = users[Math.floor(Math.random() * users.length)];
      target = targetUser.id;
      details = { userId: targetUser.id, userName: targetUser.name };
    } else if (actionInfo.type.includes('CAR')) {
      const carId = `car_${Math.floor(Math.random() * 1000)}`;
      target = carId;
      details = { carId, carName: `Автомобиль #${Math.floor(Math.random() * 100)}` };
    } else if (actionInfo.type.includes('BOOKING')) {
      const bookingId = `booking_${Math.floor(Math.random() * 1000)}`;
      target = bookingId;
      details = { 
        bookingId, 
        userId: users[Math.floor(Math.random() * users.length)].id,
        carId: `car_${Math.floor(Math.random() * 1000)}`
      };
    }
    
    logs.push({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      timestamp,
      eventType: actionInfo.type,
      level: actionInfo.level,
      action: actionInfo.action,
      target,
      details,
      ip,
      userAgent,
      appVersion: '1.0.0'
    });
  }
  
  // Сортируем по дате, самые новые сверху
  return logs.sort((a, b) => b.timestamp - a.timestamp);
};

const AdminAuditLogPage = () => {
  // Состояния для фильтров
  const [searchQuery, setSearchQuery] = useState("");
  const [eventLevel, setEventLevel] = useState<AuditLogLevel | "">("");
  const [eventType, setEventType] = useState<AuditEventType | "">("");
  const [userFilter, setUserFilter] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  
  // Состояния для пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(20);
  
  // Состояние для аудит-логов
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Хуки
  const { toast } = useToast();
  const { isAdmin, checkPermission } = useAuth();
  
  // Загрузка логов при монтировании компонента
  useEffect(() => {
    fetchAuditLogs();
  }, []);
  
  // Функция загрузки логов с применением фильтров
  const fetchAuditLogs = () => {
    setIsLoading(true);
    
    // Имитация задержки загрузки данных
    setTimeout(() => {
      // Сгенерировать мок-данные
      const mockLogs = generateMockAuditLogs(100);
      
      // В реальном приложении здесь будет запрос к API
      // const filteredLogs = await fetchLogsFromAPI(filters);
      
      setLogs(mockLogs);
      setIsLoading(false);
    }, 800);
  };
  
  // Применение фильтров к логам
  const filteredLogs = logs.filter(log => {
    // Фильтр по поисковому запросу
    if (searchQuery && !log.action.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !log.userName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Фильтр по уровню события
    if (eventLevel && log.level !== eventLevel) {
      return false;
    }
    
    // Фильтр по типу события
    if (eventType && log.eventType !== eventType) {
      return false;
    }
    
    // Фильтр по пользователю
    if (userFilter && log.userId !== userFilter) {
      return false;
    }
    
    // Фильтр по дате "от"
    if (dateFrom && log.timestamp < dateFrom.getTime()) {
      return false;
    }
    
    // Фильтр по дате "до"
    if (dateTo) {
      // Устанавливаем конец дня для датыTo
      const dateToEnd = new Date(dateTo);
      dateToEnd.setHours(23, 59, 59, 999);
      if (log.timestamp > dateToEnd.getTime()) {
        return false;
      }
    }
    
    return true;
  });
  
  // Пагинация
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  
  // Функция очистки фильтров
  const clearFilters = () => {
    setSearchQuery("");
    setEventLevel("");
    setEventType("");
    setUserFilter("");
    setDateFrom(undefined);
    setDateTo(undefined);
    setCurrentPage(1);
  };
  
  // Функция для экспорта логов
  const exportLogs = (format: 'csv' | 'json' | 'pdf') => {
    if (!checkPermission(Permission.READ_ANALYTICS)) {
      toast({
        variant: "destructive",
        title: "Доступ запрещен",
        description: "У вас нет прав для экспорта логов"
      });
      return;
    }
    
    // Создаем данные для экспорта
    if (format === 'csv') {
      const headers = ['Дата', 'Пользователь', 'Действие', 'Уровень', 'IP-адрес'];
      const csvContent = [
        headers.join(','),
        ...filteredLogs.map(log => [
          new Date(log.timestamp).toLocaleString('ru-RU'),
          log.userName,
          log.action,
          log.level,
          log.ip
        ].join(','))
      ].join('\n');
      
      // Создаем ссылку для скачивания
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_logs_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Экспорт выполнен",
        description: "Журнал аудита успешно экспортирован в формате CSV"
      });
    } else if (format === 'json') {
      const jsonContent = JSON.stringify(filteredLogs, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_logs_${new Date().toISOString()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Экспорт выполнен",
        description: "Журнал аудита успешно экспортирован в формате JSON"
      });
    } else {
      // PDF требует библиотеки, поэтому просто показываем сообщение
      toast({
        title: "Экспорт PDF",
        description: "Экспорт в PDF будет доступен в следующем обновлении"
      });
    }
  };
  
  // Получение цвета для уровня события
  const getLevelColor = (level: AuditLogLevel) => {
    switch (level) {
      case AuditLogLevel.INFO: return "bg-blue-500";
      case AuditLogLevel.WARNING: return "bg-amber-500";
      case AuditLogLevel.ERROR: return "bg-red-500";
      case AuditLogLevel.CRITICAL: return "bg-purple-600";
      default: return "bg-gray-500";
    }
  };
  
  // Получение иконки для типа события
  const getEventIcon = (eventType: AuditEventType) => {
    if (eventType.includes('USER')) {
      return <Icon name="User" className="h-4 w-4" />;
    } else if (eventType.includes('CAR')) {
      return <Icon name="Car" className="h-4 w-4" />;
    } else if (eventType.includes('BOOKING')) {
      return <Icon name="Calendar" className="h-4 w-4" />;
    } else if (eventType.includes('SETTINGS')) {
      return <Icon name="Settings" className="h-4 w-4" />;
    } else if (eventType.includes('ERROR')) {
      return <Icon name="AlertTriangle" className="h-4 w-4" />;
    } else if (eventType.includes('PERMISSION')) {
      return <Icon name="ShieldAlert" className="h-4 w-4" />;
    } else {
      return <Icon name="Activity" className="h-4 w-4" />;
    }
  };
  
  // Форматирование даты
  const formatTimestamp = (timestamp: number) => {
    return format(new Date(timestamp), 'dd MMM yyyy, HH:mm:ss', { locale: ru });
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Журнал аудита</h1>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Icon name="Download" className="mr-2 h-4 w-4" />
                Экспорт
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportLogs('csv')}>
                <Icon name="FileText" className="mr-2 h-4 w-4" />
                Экспорт в CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportLogs('json')}>
                <Icon name="FileJson" className="mr-2 h-4 w-4" />
                Экспорт в JSON
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exportLogs('pdf')}>
                <Icon name="FilePdf" className="mr-2 h-4 w-4" />
                Экспорт в PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Фильтры</CardTitle>
            <CardDescription>
              Уточните параметры поиска в журнале аудита
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Icon name="Search" size={18} />
                  </div>
                  <Input
                    type="search"
                    placeholder="Поиск по действию или пользователю"
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Select
                  value={eventLevel}
                  onValueChange={(value) => setEventLevel(value as AuditLogLevel | "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Уровень важности" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Все уровни</SelectItem>
                    <SelectItem value={AuditLogLevel.INFO}>Информация</SelectItem>
                    <SelectItem value={AuditLogLevel.WARNING}>Предупреждение</SelectItem>
                    <SelectItem value={AuditLogLevel.ERROR}>Ошибка</SelectItem>
                    <SelectItem value={AuditLogLevel.CRITICAL}>Критическая ошибка</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select
                  value={eventType}
                  onValueChange={(value) => setEventType(value as AuditEventType | "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Тип события" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Все события</SelectItem>
                    <SelectItem value={AuditEventType.USER_LOGIN}>Вход пользователя</SelectItem>
                    <SelectItem value={AuditEventType.USER_LOGOUT}>Выход пользователя</SelectItem>
                    <SelectItem value={AuditEventType.USER_CREATED}>Создание пользователя</SelectItem>
                    <SelectItem value={AuditEventType.USER_UPDATED}>Изменение пользователя</SelectItem>
                    <SelectItem value={AuditEventType.USER_DELETED}>Удаление пользователя</SelectItem>
                    <SelectItem value={AuditEventType.USER_ROLE_CHANGED}>Изменение роли</SelectItem>
                    <SelectItem value={AuditEventType.CAR_CREATED}>Создание автомобиля</SelectItem>
                    <SelectItem value={AuditEventType.CAR_UPDATED}>Изменение автомобиля</SelectItem>
                    <SelectItem value={AuditEventType.CAR_DELETED}>Удаление автомобиля</SelectItem>
                    <SelectItem value={AuditEventType.BOOKING_CREATED}>Создание бронирования</SelectItem>
                    <SelectItem value={AuditEventType.BOOKING_UPDATED}>Изменение бронирования</SelectItem>
                    <SelectItem value={AuditEventType.BOOKING_CANCELLED}>Отмена бронирования</SelectItem>
                    <SelectItem value={AuditEventType.SETTINGS_UPDATED}>Изменение настроек</SelectItem>
                    <SelectItem value={AuditEventType.API_ERROR}>Ошибка API</SelectItem>
                    <SelectItem value={AuditEventType.PERMISSION_DENIED}>Доступ запрещен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={dateFrom ? "flex-1 text-left font-normal" : "flex-1 text-left font-normal text-muted-foreground"}
                    >
                      <Icon name="Calendar" className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, 'dd.MM.yyyy') : "От"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={dateTo ? "flex-1 text-left font-normal" : "flex-1 text-left font-normal text-muted-foreground"}
                    >
                      <Icon name="Calendar" className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, 'dd.MM.yyyy') : "До"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Сбросить фильтры
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Загрузка журнала аудита...</span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Дата и время</TableHead>
                        <TableHead>Уровень</TableHead>
                        <TableHead>Пользователь</TableHead>
                        <TableHead className="w-full">Действие</TableHead>
                        <TableHead>IP-адрес</TableHead>
                        <TableHead className="text-right">Детали</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentLogs.length > 0 ? (
                        currentLogs.map((log, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-sm">
                              {formatTimestamp(log.timestamp)}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getLevelColor(log.level)} text-white`}>
                                {log.level === AuditLogLevel.INFO && "Информация"}
                                {log.level === AuditLogLevel.WARNING && "Предупреждение"}
                                {log.level === AuditLogLevel.ERROR && "Ошибка"}
                                {log.level === AuditLogLevel.CRITICAL && "Критическая"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px] truncate">
                                {log.userName}
                                <div className="text-xs text-gray-500">
                                  {log.userRole === 'admin' && "Администратор"}
                                  {log.userRole === 'manager' && "Менеджер"}
                                  {log.userRole === 'user' && "Пользователь"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="mr-2 text-gray-500">
                                  {getEventIcon(log.eventType)}
                                </div>
                                {log.action}
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {log.ip}
                            </TableCell>
                            <TableCell className="text-right">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Icon name="Info" className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[350px]" align="end">
                                  <div className="space-y-2">
                                    <h4 className="font-medium">Подробная информация</h4>
                                    <div className="grid grid-cols-3 gap-1 text-sm">
                                      <div className="font-medium">Тип события:</div>
                                      <div className="col-span-2">{log.eventType}</div>
                                      
                                      <div className="font-medium">Пользователь:</div>
                                      <div className="col-span-2">{log.userName} ({log.userId})</div>
                                      
                                      <div className="font-medium">IP-адрес:</div>
                                      <div className="col-span-2">{log.ip}</div>
                                      
                                      <div className="font-medium">Браузер:</div>
                                      <div className="col-span-2 break-all text-xs">
                                        {log.userAgent}
                                      </div>
                                      
                                      {log.target && (
                                        <>
                                          <div className="font-medium">Объект:</div>
                                          <div className="col-span-2">{log.target}</div>
                                        </>
                                      )}
                                      
                                      {log.details && Object.keys(log.details).length > 0 && (
                                        <>
                                          <div className="font-medium">Детали:</div>
                                          <div className="col-span-2">
                                            <pre className="text-xs overflow-auto max-h-[100px] p-2 bg-gray-100 rounded">
                                              {JSON.stringify(log.details, null, 2)}
                                            </pre>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            {filteredLogs.length === 0 
                              ? "Нет записей, соответствующих заданным критериям" 
                              : "Журнал аудита пуст"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredLogs.length > 0 && (
                  <div className="py-4 px-6 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Показано {indexOfFirstLog + 1}-{Math.min(indexOfLastLog, filteredLogs.length)} из {filteredLogs.length} записей
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Select
                        value={logsPerPage.toString()}
                        onValueChange={(value) => {
                          setLogsPerPage(parseInt(value));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Записей на странице" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 записей</SelectItem>
                          <SelectItem value="20">20 записей</SelectItem>
                          <SelectItem value="50">50 записей</SelectItem>
                          <SelectItem value="100">100 записей</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) setCurrentPage(currentPage - 1);
                              }}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                          
                          {/* Отображаем только несколько страниц для навигации */}
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            // Логика для определения, какие страницы показывать
                            let pageToShow;
                            if (totalPages <= 5) {
                              pageToShow = i + 1;
                            } else if (currentPage <= 3) {
                              pageToShow = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageToShow = totalPages - 4 + i;
                            } else {
                              pageToShow = currentPage - 2 + i;
                            }
                            
                            if (pageToShow <= totalPages) {
                              return (
                                <PaginationItem key={pageToShow}>
                                  <PaginationLink 
                                    href="#" 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setCurrentPage(pageToShow);
                                    }}
                                    isActive={currentPage === pageToShow}
                                  >
                                    {pageToShow}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            }
                            return null;
                          })}
                          
                          {totalPages > 5 && currentPage < totalPages - 2 && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                          
                          <PaginationItem>
                            <PaginationNext 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                              }}
                              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAuditLogPage;
