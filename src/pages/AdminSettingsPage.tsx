
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Permission, hasPermission, UserRole } from "@/lib/auth";
import { AuditLogger, AuditEventType } from "@/lib/audit-logger";
import Icon from "@/components/ui/icon";

// Интерфейс для настроек приложения
interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    slack: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    passwordExpiryDays: number;
    ipWhitelist: string[];
    failedLoginLimit: number;
  };
  general: {
    siteTitle: string;
    contactEmail: string;
    logoUrl: string;
    autoBackupEnabled: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
  };
}

// Начальные настройки приложения
const defaultSettings: AppSettings = {
  theme: 'light',
  notifications: {
    email: true,
    push: false,
    sms: false,
    slack: false,
  },
  security: {
    twoFactorAuth: false,
    passwordExpiryDays: 90,
    ipWhitelist: [],
    failedLoginLimit: 5,
  },
  general: {
    siteTitle: "АвтоПрокат",
    contactEmail: "support@autoprok.at",
    logoUrl: "/logo.svg",
    autoBackupEnabled: true,
    backupFrequency: 'daily',
  }
};

const AdminSettingsPage = () => {
  // Состояние для настроек
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [newIpAddress, setNewIpAddress] = useState("");
  const { toast } = useToast();
  
  // Имитация загрузки настроек с сервера
  useEffect(() => {
    // В реальном приложении здесь был бы API-запрос
    const loadSettings = async () => {
      setIsLoading(true);
      
      try {
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // В реальном приложении здесь был бы ответ от API
        // const response = await apiClient.get<AppSettings>('/settings');
        // setSettings(response);
        
        // Используем тестовые данные
        setSettings(defaultSettings);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Ошибка загрузки настроек",
          description: "Не удалось загрузить настройки приложения"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  // Проверка прав доступа
  const canManageSettings = hasPermission(Permission.MANAGE_SETTINGS);
  
  // Обработчик изменения темы
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setSettings(prev => ({
      ...prev,
      theme
    }));
  };

  // Обработчик изменения уведомлений
  const handleNotificationChange = (key: keyof AppSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  // Обработчик изменения настроек безопасности
  const handleSecurityChange = (key: keyof AppSettings['security'], value: any) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value
      }
    }));
  };

  // Обработчик изменения общих настроек
  const handleGeneralChange = (key: keyof AppSettings['general'], value: any) => {
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [key]: value
      }
    }));
  };

  // Добавление IP-адреса в белый список
  const handleAddIpAddress = () => {
    if (!newIpAddress) return;
    
    // Простая валидация IP (можно усложнить с регулярным выражением)
    if (!newIpAddress.includes('.') || newIpAddress.split('.').length !== 4) {
      toast({
        variant: "destructive",
        title: "Некорректный IP-адрес",
        description: "Пожалуйста, введите корректный IP-адрес"
      });
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        ipWhitelist: [...prev.security.ipWhitelist, newIpAddress]
      }
    }));
    
    setNewIpAddress("");
  };

  // Удаление IP из белого списка
  const handleRemoveIpAddress = (ip: string) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        ipWhitelist: prev.security.ipWhitelist.filter(item => item !== ip)
      }
    }));
  };

  // Сохранение настроек
  const handleSaveSettings = async () => {
    if (!canManageSettings) {
      toast({
        variant: "destructive",
        title: "Доступ запрещен",
        description: "У вас нет прав для изменения настроек"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // В реальном приложении здесь был бы API-запрос
      // await apiClient.put('/settings', settings);
      
      // Логирование действия
      AuditLogger.adminAction(
        "Обновление настроек приложения", 
        "settings", 
        { changes: settings }
      );
      
      toast({
        title: "Настройки сохранены",
        description: "Настройки приложения успешно обновлены"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка сохранения",
        description: "Не удалось сохранить настройки приложения"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Запуск резервного копирования данных
  const handleStartBackup = async () => {
    if (!canManageSettings) {
      toast({
        variant: "destructive",
        title: "Доступ запрещен",
        description: "У вас нет прав для управления резервными копиями"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Логирование действия
      AuditLogger.adminAction(
        "Ручное резервное копирование данных", 
        "backup", 
        { timestamp: new Date() }
      );
      
      toast({
        title: "Резервное копирование запущено",
        description: "Создание резервной копии успешно инициировано"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка резервного копирования",
        description: "Не удалось запустить резервное копирование"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">Настройки приложения</h1>
        
        {!canManageSettings && (
          <Alert className="mb-6 border-yellow-500 text-yellow-700 bg-yellow-50">
            <Icon name="AlertTriangle" className="h-4 w-4 mr-2" />
            <AlertDescription>
              У вас нет прав для изменения настроек. Обратитесь к администратору для получения доступа.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="mb-4 grid grid-cols-4 sm:grid-cols-4">
            <TabsTrigger value="general">Общие</TabsTrigger>
            <TabsTrigger value="appearance">Оформление</TabsTrigger>
            <TabsTrigger value="notifications">Уведомления</TabsTrigger>
            <TabsTrigger value="security">Безопасность</TabsTrigger>
          </TabsList>
          
          {/* Общие настройки */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Основные параметры</CardTitle>
                <CardDescription>
                  Настройте основные параметры приложения, включая название и контактные данные
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="siteTitle">Название сайта</Label>
                    <Input 
                      id="siteTitle" 
                      value={settings.general.siteTitle}
                      onChange={(e) => handleGeneralChange('siteTitle', e.target.value)}
                      disabled={!canManageSettings || isLoading}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="contactEmail">Контактный email</Label>
                    <Input 
                      id="contactEmail" 
                      type="email"
                      value={settings.general.contactEmail}
                      onChange={(e) => handleGeneralChange('contactEmail', e.target.value)}
                      disabled={!canManageSettings || isLoading}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="logoUrl">URL логотипа</Label>
                    <Input 
                      id="logoUrl" 
                      value={settings.general.logoUrl}
                      onChange={(e) => handleGeneralChange('logoUrl', e.target.value)}
                      disabled={!canManageSettings || isLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Резервное копирование</CardTitle>
                <CardDescription>
                  Настройте автоматическое резервное копирование данных
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="autoBackup" 
                    checked={settings.general.autoBackupEnabled}
                    onCheckedChange={(checked) => handleGeneralChange('autoBackupEnabled', checked)}
                    disabled={!canManageSettings || isLoading}
                  />
                  <Label htmlFor="autoBackup">Включить автоматическое резервное копирование</Label>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="backupFrequency">Частота резервного копирования</Label>
                  <Select 
                    value={settings.general.backupFrequency}
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                      handleGeneralChange('backupFrequency', value)
                    }
                    disabled={!canManageSettings || isLoading || !settings.general.autoBackupEnabled}
                  >
                    <SelectTrigger id="backupFrequency">
                      <SelectValue placeholder="Выберите частоту" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Ежедневно</SelectItem>
                      <SelectItem value="weekly">Еженедельно</SelectItem>
                      <SelectItem value="monthly">Ежемесячно</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleStartBackup}
                  disabled={!canManageSettings || isLoading}
                  className="mt-2"
                >
                  {isLoading ? (
                    <>
                      <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                      Создание резервной копии...
                    </>
                  ) : (
                    <>
                      <Icon name="Save" className="mr-2 h-4 w-4" />
                      Создать резервную копию сейчас
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Настройки оформления */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Тема оформления</CardTitle>
                <CardDescription>
                  Выберите тему оформления для административной панели
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      settings.theme === 'light' ? 'border-primary' : 'border-gray-200'
                    }`}
                    onClick={() => handleThemeChange('light')}
                  >
                    <div className="h-20 bg-white border rounded mb-2"></div>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${
                        settings.theme === 'light' ? 'bg-primary' : 'bg-gray-200'
                      }`}></div>
                      <span>Светлая</span>
                    </div>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      settings.theme === 'dark' ? 'border-primary' : 'border-gray-200'
                    }`}
                    onClick={() => handleThemeChange('dark')}
                  >
                    <div className="h-20 bg-gray-900 border rounded mb-2"></div>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${
                        settings.theme === 'dark' ? 'bg-primary' : 'bg-gray-200'
                      }`}></div>
                      <span>Темная</span>
                    </div>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      settings.theme === 'system' ? 'border-primary' : 'border-gray-200'
                    }`}
                    onClick={() => handleThemeChange('system')}
                  >
                    <div className="h-20 bg-gradient-to-r from-white to-gray-900 border rounded mb-2"></div>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${
                        settings.theme === 'system' ? 'bg-primary' : 'bg-gray-200'
                      }`}></div>
                      <span>Системная</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Настройки уведомлений */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Каналы уведомлений</CardTitle>
                <CardDescription>
                  Настройте какие каналы связи будут использоваться для отправки уведомлений
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email уведомления</Label>
                      <p className="text-sm text-gray-500">
                        Отправка уведомлений о важных событиях по электронной почте
                      </p>
                    </div>
                    <Switch 
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                      disabled={!canManageSettings || isLoading}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push-уведомления</Label>
                      <p className="text-sm text-gray-500">
                        Отправка мгновенных push-уведомлений через браузер
                      </p>
                    </div>
                    <Switch 
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                      disabled={!canManageSettings || isLoading}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS-уведомления</Label>
                      <p className="text-sm text-gray-500">
                        Отправка текстовых сообщений на мобильный телефон
                      </p>
                    </div>
                    <Switch 
                      checked={settings.notifications.sms}
                      onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                      disabled={!canManageSettings || isLoading}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Интеграция со Slack</Label>
                      <p className="text-sm text-gray-500">
                        Отправка уведомлений в каналы Slack
                      </p>
                    </div>
                    <Switch 
                      checked={settings.notifications.slack}
                      onCheckedChange={(checked) => handleNotificationChange('slack', checked)}
                      disabled={!canManageSettings || isLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Настройки безопасности */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Двухфакторная аутентификация</CardTitle>
                <CardDescription>
                  Включите двухфакторную аутентификацию для повышения безопасности
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="twoFactorAuth" 
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) => handleSecurityChange('twoFactorAuth', checked)}
                    disabled={!canManageSettings || isLoading}
                  />
                  <Label htmlFor="twoFactorAuth">Включить 2FA для всех администраторов</Label>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Политика паролей</CardTitle>
                <CardDescription>
                  Настройте требования к паролям и сроки их действия
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="passwordExpiry">Срок действия пароля (дней)</Label>
                  <Input 
                    id="passwordExpiry" 
                    type="number"
                    min="0"
                    max="365"
                    value={settings.security.passwordExpiryDays}
                    onChange={(e) => handleSecurityChange('passwordExpiryDays', parseInt(e.target.value))}
                    disabled={!canManageSettings || isLoading}
                  />
                  <p className="text-sm text-gray-500">
                    0 - пароль никогда не истекает
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="failedLoginLimit">Максимальное количество неудачных попыток входа</Label>
                  <Input 
                    id="failedLoginLimit" 
                    type="number"
                    min="1"
                    max="10"
                    value={settings.security.failedLoginLimit}
                    onChange={(e) => handleSecurityChange('failedLoginLimit', parseInt(e.target.value))}
                    disabled={!canManageSettings || isLoading}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>IP-адреса с доступом к админ-панели</CardTitle>
                <CardDescription>
                  Белый список IP-адресов, с которых разрешен доступ к административной панели
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Введите IP-адрес"
                      value={newIpAddress}
                      onChange={(e) => setNewIpAddress(e.target.value)}
                      disabled={!canManageSettings || isLoading}
                    />
                    <Button 
                      onClick={handleAddIpAddress}
                      disabled={!canManageSettings || isLoading || !newIpAddress}
                    >
                      Добавить
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Пустой список разрешает доступ со всех IP-адресов
                  </p>
                  
                  <div className="mt-2">
                    {settings.security.ipWhitelist.length === 0 ? (
                      <p className="text-sm text-gray-500">Белый список пуст</p>
                    ) : (
                      <div className="space-y-2">
                        {settings.security.ipWhitelist.map((ip) => (
                          <div key={ip} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                            <span>{ip}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveIpAddress(ip)}
                              disabled={!canManageSettings || isLoading}
                            >
                              <Icon name="Trash2" className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSaveSettings}
            disabled={!canManageSettings || isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Icon name="Save" className="mr-2 h-4 w-4" />
                Сохранить настройки
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
