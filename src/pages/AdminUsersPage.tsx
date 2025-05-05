
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Icon from "@/components/ui/icon";
import { UserRole, Permission, hasPermission } from "@/lib/auth";
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";
import AdminSidebar from "@/components/AdminSidebar";

// Типы для пользователей
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastActive: string;
  status: 'active' | 'inactive' | 'blocked';
  avatar?: string;
}

// Мок-данные пользователей
const mockUsers: User[] = [
  {
    id: "1",
    name: "Иван Смирнов",
    email: "ivan@example.com",
    role: UserRole.ADMIN,
    lastActive: "2023-05-01T14:30:00",
    status: "active",
    avatar: "https://ui-avatars.com/api/?name=Иван+Смирнов"
  },
  {
    id: "2",
    name: "Анна Петрова",
    email: "anna@example.com",
    role: UserRole.MANAGER,
    lastActive: "2023-05-02T10:15:00",
    status: "active",
    avatar: "https://ui-avatars.com/api/?name=Анна+Петрова"
  },
  {
    id: "3",
    name: "Сергей Козлов",
    email: "sergey@example.com",
    role: UserRole.USER,
    lastActive: "2023-04-28T16:40:00",
    status: "inactive",
    avatar: "https://ui-avatars.com/api/?name=Сергей+Козлов"
  },
  {
    id: "4",
    name: "Елена Соколова",
    email: "elena@example.com",
    role: UserRole.USER,
    lastActive: "2023-05-03T09:22:00",
    status: "blocked",
    avatar: "https://ui-avatars.com/api/?name=Елена+Соколова"
  }
];

// Роли для выбора в форме
const roleOptions = [
  { label: 'Пользователь', value: UserRole.USER },
  { label: 'Менеджер', value: UserRole.MANAGER },
  { label: 'Администратор', value: UserRole.ADMIN }
];

// Статусы для выбора в форме
const statusOptions = [
  { label: 'Активен', value: 'active' },
  { label: 'Неактивен', value: 'inactive' },
  { label: 'Заблокирован', value: 'blocked' }
];

// Компонент страницы управления пользователями
const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { isAdmin, checkPermission } = useAuth();
  const { toast } = useToast();
  
  // Форматирование даты последней активности
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Получение цвета для статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-yellow-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Получение цвета для роли
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Badge className="bg-purple-600">Администратор</Badge>;
      case UserRole.MANAGER:
        return <Badge className="bg-blue-600">Менеджер</Badge>;
      case UserRole.USER:
        return <Badge className="bg-gray-600">Пользователь</Badge>;
      default:
        return <Badge>Неизвестно</Badge>;
    }
  };
  
  // Фильтрация пользователей по поисковому запросу
  const filteredUsers = searchQuery
    ? users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;
  
  // Оптимистичная мутация для обновления пользователя
  const updateUserMutation = useOptimisticMutation<User, User>({
    url: `/users/${editingUser?.id}`,
    method: 'PATCH',
    onOptimisticUpdate: (updatedUser) => {
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user
        )
      );
    },
    cachePrefix: 'users',
    onSuccess: (data) => {
      toast({
        title: "Пользователь обновлен",
        description: `Данные пользователя ${data.name} успешно обновлены`,
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Ошибка обновления",
        description: error.message || "Не удалось обновить пользователя",
      });
    }
  });
  
  // Обработчик изменения статуса пользователя
  const handleStatusChange = (user: User, newStatus: 'active' | 'inactive' | 'blocked') => {
    if (!checkPermission(Permission.UPDATE_USERS)) {
      toast({
        variant: "destructive",
        title: "Доступ запрещен",
        description: "У вас нет прав для изменения статуса пользователей",
      });
      return;
    }
    
    // Оптимистичное обновление статуса
    const updatedUser = { ...user, status: newStatus };
    updateUserMutation.mutate(updatedUser);
  };
  
  // Обработчик изменения роли пользователя
  const handleRoleChange = (user: User, newRole: UserRole) => {
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Доступ запрещен",
        description: "Только администраторы могут изменять роли пользователей",
      });
      return;
    }
    
    // Оптимистичное обновление роли
    const updatedUser = { ...user, role: newRole };
    updateUserMutation.mutate(updatedUser);
  };
  
  // Обработчик сохранения изменений пользователя в диалоге
  const handleSaveUserChanges = () => {
    if (!editingUser) return;
    updateUserMutation.mutate(editingUser);
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-6 overflow-auto">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">Управление пользователями</CardTitle>
              <Button
                disabled={!checkPermission(Permission.CREATE_USERS)} 
                className="flex items-center gap-1"
              >
                <Icon name="Plus" size={16} />
                Добавить пользователя
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Icon name="Search" size={18} />
              </div>
              <Input
                type="search"
                placeholder="Поиск пользователей..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Последняя активность</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(user.role)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(user.status)}`}></div>
                            <span className="capitalize">
                              {user.status === 'active' ? 'Активен' : 
                               user.status === 'inactive' ? 'Неактивен' : 'Заблокирован'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(user.lastActive)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => {
                                setEditingUser(user);
                                setIsEditDialogOpen(true);
                              }}
                              disabled={!checkPermission(Permission.UPDATE_USERS)}
                            >
                              <Icon name="Pencil" size={16} />
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <Icon name="MoreVertical" size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(user, 'active')}
                                  disabled={!checkPermission(Permission.UPDATE_USERS) || user.status === 'active'}
                                >
                                  <Icon name="CheckCircle" className="mr-2 h-4 w-4 text-green-500" />
                                  Активировать
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(user, 'inactive')}
                                  disabled={!checkPermission(Permission.UPDATE_USERS) || user.status === 'inactive'}
                                >
                                  <Icon name="Clock" className="mr-2 h-4 w-4 text-yellow-500" />
                                  Деактивировать
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(user, 'blocked')}
                                  disabled={!checkPermission(Permission.UPDATE_USERS) || user.status === 'blocked'}
                                >
                                  <Icon name="Ban" className="mr-2 h-4 w-4 text-red-500" />
                                  Заблокировать
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        {searchQuery ? "Нет результатов поиска" : "Нет пользователей"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Диалог редактирования пользователя */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование пользователя</DialogTitle>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="flex flex-col space-y-1.5">
                <Input
                  id="name"
                  placeholder="Имя пользователя"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Input
                  id="email"
                  placeholder="Email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                />
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Select
                  disabled={!isAdmin}
                  value={editingUser.role}
                  onValueChange={(value: UserRole) => setEditingUser({...editingUser, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Select
                  value={editingUser.status}
                  onValueChange={(value: 'active' | 'inactive' | 'blocked') => 
                    setEditingUser({...editingUser, status: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleSaveUserChanges}
              disabled={updateUserMutation.isLoading}
            >
              {updateUserMutation.isLoading ? (
                <>
                  <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersPage;
