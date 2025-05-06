
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Icon from "@/components/ui/icon";
import { UserRole, Permission, hasPermission } from "@/lib/auth";
import { AuditLogger, AuditEventType } from "@/lib/audit-logger";

// Типы для интерфейса
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  usersCount: number;
  isSystem?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Мок данные для ролей
const initialRoles: Role[] = [
  {
    id: "admin",
    name: "Администратор",
    description: "Полный доступ ко всем функциям системы",
    permissions: Object.values(Permission),
    usersCount: 2,
    isSystem: true
  },
  {
    id: "manager",
    name: "Менеджер",
    description: "Управление автомобилями и бронированиями",
    permissions: [
      Permission.READ_CARS,
      Permission.CREATE_CARS,
      Permission.UPDATE_CARS,
      Permission.MANAGE_ORDERS,
      Permission.READ_ANALYTICS
    ],
    usersCount: 3,
    isSystem: true
  },
  {
    id: "user",
    name: "Пользователь",
    description: "Базовый доступ к просмотру автомобилей",
    permissions: [Permission.READ_CARS],
    usersCount: 120,
    isSystem: true
  },
  {
    id: "support",
    name: "Поддержка",
    description: "Поддержка клиентов и управление бронированиями",
    permissions: [
      Permission.READ_CARS,
      Permission.MANAGE_ORDERS,
      Permission.READ_USERS
    ],
    usersCount: 5
  }
];

// Моковые данные пользователей
const mockUsers: User[] = [
  {
    id: "1",
    name: "Иван Смирнов",
    email: "ivan@example.com",
    role: UserRole.ADMIN,
    avatar: "https://ui-avatars.com/api/?name=Иван+Смирнов"
  },
  {
    id: "2",
    name: "Анна Петрова",
    email: "anna@example.com",
    role: UserRole.MANAGER,
    avatar: "https://ui-avatars.com/api/?name=Анна+Петрова"
  },
  {
    id: "3",
    name: "Сергей Козлов",
    email: "sergey@example.com",
    role: UserRole.USER,
    avatar: "https://ui-avatars.com/api/?name=Сергей+Козлов"
  }
];

// Группы разрешений для более удобного отображения
const permissionGroups = [
  {
    name: "Автомобили",
    permissions: [
      { id: Permission.READ_CARS, label: "Просмотр автомобилей" },
      { id: Permission.CREATE_CARS, label: "Создание автомобилей" },
      { id: Permission.UPDATE_CARS, label: "Редактирование автомобилей" },
      { id: Permission.DELETE_CARS, label: "Удаление автомобилей" }
    ]
  },
  {
    name: "Пользователи",
    permissions: [
      { id: Permission.READ_USERS, label: "Просмотр пользователей" },
      { id: Permission.CREATE_USERS, label: "Создание пользователей" },
      { id: Permission.UPDATE_USERS, label: "Редактирование пользователей" },
      { id: Permission.DELETE_USERS, label: "Удаление пользователей" }
    ]
  },
  {
    name: "Бронирования",
    permissions: [
      { id: Permission.MANAGE_ORDERS, label: "Управление бронированиями" }
    ]
  },
  {
    name: "Система",
    permissions: [
      { id: Permission.READ_ANALYTICS, label: "Просмотр аналитики" },
      { id: Permission.MANAGE_SETTINGS, label: "Управление настройками" }
    ]
  }
];

const AdminRolesPage = () => {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchRoleQuery, setSearchRoleQuery] = useState("");
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [isAssignRoleDialogOpen, setIsAssignRoleDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserRoleId, setSelectedUserRoleId] = useState<string>("");
  const [newRole, setNewRole] = useState<Omit<Role, "id" | "usersCount">>({
    name: "",
    description: "",
    permissions: []
  });
  
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  
  // Фильтрация ролей по поисковому запросу
  const filteredRoles = searchRoleQuery
    ? roles.filter(role => 
        role.name.toLowerCase().includes(searchRoleQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchRoleQuery.toLowerCase())
      )
    : roles;
    
  // Фильтрация пользователей по поисковому запросу
  const filteredUsers = searchUserQuery
    ? users.filter(user => 
        user.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchUserQuery.toLowerCase())
      )
    : users;
  
  // Функция создания новой роли
  const handleCreateRole = () => {
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Доступ запрещен",
        description: "Только администраторы могут создавать роли"
      });
      return;
    }
    
    if (!newRole.name.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Название роли не может быть пустым"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Имитация запроса к API
    setTimeout(() => {
      const roleId = `role_${Date.now()}`;
      const createdRole: Role = {
        ...newRole,
        id: roleId,
        usersCount: 0
      };
      
      setRoles(prev => [...prev, createdRole]);
      
      AuditLogger.adminAction(
        "Создание новой роли", 
        "roles", 
        { roleName: newRole.name, permissions: newRole.permissions }
      );
      
      toast({
        title: "Роль создана",
        description: `Роль "${newRole.name}" успешно создана`
      });
      
      // Сбрасываем форму
      setNewRole({
        name: "",
        description: "",
        permissions: []
      });
      
      setIsCreateRoleDialogOpen(false);
      setIsLoading(false);
    }, 1000);
  };
  
  // Функция обновления роли
  const handleUpdateRole = () => {
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Доступ запрещен",
        description: "Только администраторы могут редактировать роли"
      });
      return;
    }
    
    if (!currentRole) return;
    
    setIsLoading(true);
    
    // Имитация запроса к API
    setTimeout(() => {
      setRoles(prev => 
        prev.map(role => role.id === currentRole.id ? currentRole : role)
      );
      
      AuditLogger.adminAction(
        "Обновление роли", 
        "roles", 
        { roleId: currentRole.id, roleName: currentRole.name, permissions: currentRole.permissions }
      );
      
      toast({
        title: "Роль обновлена",
        description: `Роль "${currentRole.name}" успешно обновлена`
      });
      
      setIsEditRoleDialogOpen(false);
      setIsLoading(false);
    }, 1000);
  };
  
  // Функция удаления роли
  const handleDeleteRole = (roleId: string) => {
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Доступ запрещен",
        description: "Только администраторы могут удалять роли"
      });
      return;
    }
    
    const role = roles.find(r => r.id === roleId);
    
    if (role?.isSystem) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Системные роли не могут быть удалены"
      });
      return;
    }
    
    // Проверяем, есть ли пользователи с этой ролью
    if (role?.usersCount && role.usersCount > 0) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: `Невозможно удалить роль, так как она назначена ${role.usersCount} пользователям`
      });
      return;
    }
    
    if (window.confirm(`Вы уверены, что хотите удалить роль "${role?.name}"?`)) {
      setIsLoading(true);
      
      // Имитация запроса к API
      setTimeout(() => {
        setRoles(prev => prev.filter(role => role.id !== roleId));
        
        AuditLogger.adminAction(
          "Удаление роли", 
          "roles", 
          { roleId, roleName: role?.name }
        );
        
        toast({
          title: "Роль удалена",
          description: `Роль "${role?.name}" успешно удалена`
        });
        
        setIsLoading(false);
      }, 1000);
    }
  };
  
  // Функция переключения разрешения
  const togglePermission = (permission: Permission) => {
    if (currentRole) {
      // Для редактирования существующей роли
      const updatedPermissions = currentRole.permissions.includes(permission)
        ? currentRole.permissions.filter(p => p !== permission)
        : [...currentRole.permissions, permission];
        
      setCurrentRole({
        ...currentRole,
        permissions: updatedPermissions
      });
    } else {
      // Для создания новой роли
      const updatedPermissions = newRole.permissions.includes(permission)
        ? newRole.permissions.filter(p => p !== permission)
        : [...newRole.permissions, permission];
        
      setNewRole({
        ...newRole,
        permissions: updatedPermissions
      });
    }
  };
  
  // Функция назначения роли пользователю
  const handleAssignRole = () => {
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Доступ запрещен",
        description: "Только администраторы могут назначать роли"
      });
      return;
    }
    
    if (!selectedUser || !selectedUserRoleId) return;
    
    setIsLoading(true);
    
    // Находим роль по ID
    const role = roles.find(r => r.id === selectedUserRoleId);
    
    // Имитация запроса к API
    setTimeout(() => {
      // Обновляем список пользователей
      setUsers(prev => 
        prev.map(user => {
          if (user.id === selectedUser.id) {
            // Преобразуем ID роли в UserRole
            let userRole = UserRole.USER;
            if (selectedUserRoleId === "admin") userRole = UserRole.ADMIN;
            if (selectedUserRoleId === "manager") userRole = UserRole.MANAGER;
            
            return { ...user, role: userRole };
          }
          return user;
        })
      );
      
      // Обновляем счетчик пользователей для ролей
      setRoles(prev => 
        prev.map(r => {
          // Уменьшаем счетчик для предыдущей роли
          if (r.id === getRoleIdFromUserRole(selectedUser.role)) {
            return { ...r, usersCount: Math.max(0, r.usersCount - 1) };
          }
          // Увеличиваем счетчик для новой роли
          if (r.id === selectedUserRoleId) {
            return { ...r, usersCount: r.usersCount + 1 };
          }
          return r;
        })
      );
      
      AuditLogger.adminAction(
        "Назначение роли пользователю", 
        "users", 
        { userId: selectedUser.id, userName: selectedUser.name, roleId: selectedUserRoleId, roleName: role?.name }
      );
      
      toast({
        title: "Роль назначена",
        description: `Пользователю "${selectedUser.name}" назначена роль "${role?.name}"`
      });
      
      setIsAssignRoleDialogOpen(false);
      setSelectedUser(null);
      setSelectedUserRoleId("");
      setIsLoading(false);
    }, 1000);
  };
  
  // Вспомогательная функция для получения ID роли из UserRole
  const getRoleIdFromUserRole = (userRole: UserRole): string => {
    switch (userRole) {
      case UserRole.ADMIN: return "admin";
      case UserRole.MANAGER: return "manager";
      case UserRole.USER: return "user";
      default: return "";
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">Управление ролями и разрешениями</h1>
        
        {!isAdmin && (
          <Alert className="mb-6 border-yellow-500 text-yellow-700 bg-yellow-50">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              У вас ограниченный доступ к управлению ролями. Некоторые действия могут быть недоступны.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="roles" className="space-y-6">
          <TabsList className="mb-4 w-full grid grid-cols-2 sm:w-auto">
            <TabsTrigger value="roles">Роли</TabsTrigger>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
          </TabsList>
          
          {/* Вкладка с ролями */}
          <TabsContent value="roles" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Icon name="Search" size={18} />
                </div>
                <Input
                  type="search"
                  placeholder="Поиск ролей..."
                  className="pl-10"
                  value={searchRoleQuery}
                  onChange={(e) => setSearchRoleQuery(e.target.value)}
                />
              </div>
              
              <Button
                onClick={() => setIsCreateRoleDialogOpen(true)}
                disabled={!isAdmin || isLoading}
              >
                <Icon name="Plus" className="mr-2 h-4 w-4" />
                Создать роль
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRoles.map((role) => (
                <Card key={role.id} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{role.name}</CardTitle>
                      {role.isSystem && (
                        <Badge variant="secondary">Системная</Badge>
                      )}
                    </div>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1 mb-4 flex-wrap">
                      <div className="flex items-center text-xs text-gray-500">
                        <Icon name="Users" className="h-3.5 w-3.5 mr-1" />
                        {role.usersCount} пользователей
                      </div>
                      <div className="flex items-center text-xs text-gray-500 ml-3">
                        <Icon name="Shield" className="h-3.5 w-3.5 mr-1" />
                        {role.permissions.length} разрешений
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {permissionGroups.map((group) => {
                        // Проверяем, есть ли у роли хотя бы одно разрешение из группы
                        const hasPermissionFromGroup = group.permissions.some(
                          p => role.permissions.includes(p.id)
                        );
                        
                        if (!hasPermissionFromGroup) return null;
                        
                        return (
                          <div key={group.name}>
                            <h4 className="text-xs font-semibold text-gray-500">{group.name}</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {group.permissions
                                .filter(p => role.permissions.includes(p.id))
                                .map(permission => (
                                  <Badge key={permission.id} variant="outline" className="text-xs">
                                    {permission.label}
                                  </Badge>
                                ))
                              }
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex justify-end mt-4 space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentRole(role);
                          setIsEditRoleDialogOpen(true);
                        }}
                        disabled={!isAdmin || isLoading}
                      >
                        Редактировать
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                        disabled={!isAdmin || isLoading || role.isSystem}
                      >
                        Удалить
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredRoles.length === 0 && (
                <div className="col-span-full text-center p-8 bg-white rounded-lg border">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                    <Icon name="FolderSearch" className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold">Роли не найдены</h3>
                  <p className="text-gray-500 mt-2">Попробуйте изменить поисковый запрос или создайте новую роль.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Вкладка с пользователями */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Icon name="Search" size={18} />
                </div>
                <Input
                  type="search"
                  placeholder="Поиск пользователей..."
                  className="pl-10"
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full overflow-hidden">
                                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                              </div>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.role === UserRole.ADMIN && <Badge className="bg-purple-600">Администратор</Badge>}
                            {user.role === UserRole.MANAGER && <Badge className="bg-blue-600">Менеджер</Badge>}
                            {user.role === UserRole.USER && <Badge className="bg-gray-600">Пользователь</Badge>}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setSelectedUserRoleId(getRoleIdFromUserRole(user.role));
                                setIsAssignRoleDialogOpen(true);
                              }}
                              disabled={!isAdmin || isLoading}
                            >
                              Изменить роль
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                          {searchUserQuery ? "Нет результатов поиска" : "Нет пользователей"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Диалог создания роли */}
      <Dialog open={isCreateRoleDialogOpen} onOpenChange={setIsCreateRoleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Создание новой роли</DialogTitle>
            <DialogDescription>
              Укажите название роли и выберите разрешения, которые будут доступны пользователям с этой ролью.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Название роли</Label>
              <Input
                id="name"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                placeholder="Например: Контент-менеджер"
                className="col-span-3"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Описание</Label>
              <Input
                id="description"
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                placeholder="Кратко опишите назначение роли"
                className="col-span-3"
              />
            </div>
            
            <Separator className="my-2" />
            
            <div className="grid gap-2">
              <Label>Разрешения</Label>
              <div className="grid gap-6 mt-2">
                {permissionGroups.map((group) => (
                  <div key={group.name} className="space-y-2">
                    <h4 className="font-medium">{group.name}</h4>
                    <div className="grid gap-2">
                      {group.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`permission-${permission.id}`}
                            checked={newRole.permissions.includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                          />
                          <Label
                            htmlFor={`permission-${permission.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {permission.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateRoleDialogOpen(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleCreateRole}
              disabled={isLoading || !newRole.name}
            >
              {isLoading ? (
                <>
                  <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                  Создание...
                </>
              ) : (
                "Создать роль"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Диалог редактирования роли */}
      <Dialog open={isEditRoleDialogOpen} onOpenChange={setIsEditRoleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактирование роли</DialogTitle>
            <DialogDescription>
              Измените параметры роли и разрешения, которые будут доступны пользователям.
            </DialogDescription>
          </DialogHeader>
          
          {currentRole && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Название роли</Label>
                <Input
                  id="edit-name"
                  value={currentRole.name}
                  onChange={(e) => setCurrentRole({ ...currentRole, name: e.target.value })}
                  disabled={currentRole.isSystem}
                  className="col-span-3"
                />
                {currentRole.isSystem && (
                  <p className="text-xs text-gray-500">Название системной роли нельзя изменить</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Описание</Label>
                <Input
                  id="edit-description"
                  value={currentRole.description}
                  onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              
              <Separator className="my-2" />
              
              <div className="grid gap-2">
                <Label>Разрешения</Label>
                <div className="grid gap-6 mt-2">
                  {permissionGroups.map((group) => (
                    <div key={group.name} className="space-y-2">
                      <h4 className="font-medium">{group.name}</h4>
                      <div className="grid gap-2">
                        {group.permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-permission-${permission.id}`}
                              checked={currentRole.permissions.includes(permission.id)}
                              onCheckedChange={() => togglePermission(permission.id)}
                            />
                            <Label
                              htmlFor={`edit-permission-${permission.id}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {permission.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditRoleDialogOpen(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleUpdateRole}
              disabled={isLoading || !currentRole?.name}
            >
              {isLoading ? (
                <>
                  <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                "Сохранить изменения"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Диалог назначения роли пользователю */}
      <Dialog open={isAssignRoleDialogOpen} onOpenChange={setIsAssignRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Назначение роли</DialogTitle>
            <DialogDescription>
              Выберите роль для пользователя {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="py-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full overflow-hidden">
                  <img src={selectedUser.avatar} alt={selectedUser.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h4 className="font-medium">{selectedUser.name}</h4>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {roles
                  .filter(role => role.id === "admin" || role.id === "manager" || role.id === "user" || role.id === "support")
                  .map((role) => (
                    <div
                      key={role.id}
                      className={`flex items-start p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedUserRoleId === role.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedUserRoleId(role.id)}
                    >
                      <div className={`w-5 h-5 rounded-full mr-3 mt-0.5 border-2 flex-shrink-0 ${
                        selectedUserRoleId === role.id
                          ? "bg-primary border-primary"
                          : "border-gray-300"
                      }`}>
                        {selectedUserRoleId === role.id && (
                          <Icon name="Check" className="h-full w-full text-white p-0.5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{role.name}</h3>
                        <p className="text-sm text-gray-500">{role.description}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignRoleDialogOpen(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleAssignRole}
              disabled={isLoading || !selectedUserRoleId}
            >
              {isLoading ? (
                <>
                  <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                "Назначить роль"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRolesPage;
