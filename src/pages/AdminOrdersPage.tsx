
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { 
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem, 
  PaginationLink, PaginationNext, PaginationPrevious 
} from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Icon from "@/components/ui/icon";

// Интерфейсы для типов данных
interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface OrderItem {
  id: string;
  carName: string;
  price: number;
  days: number;
  startDate: string;
  endDate: string;
  extras?: {
    id: string;
    name: string;
    price: number;
  }[];
}

interface Order {
  id: string;
  number: string;
  date: string;
  status: 'new' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentMethod: 'card' | 'cash';
  total: number;
  customer: Customer;
  items: OrderItem[];
  deliveryMethod: 'pickup' | 'delivery';
  deliveryAddress?: string;
  comment?: string;
}

// Мок-данные для демонстрации
const mockOrders: Order[] = [
  {
    id: "1",
    number: "ORD-2023-001",
    date: "2023-06-05T14:30:00",
    status: "new",
    paymentStatus: "pending",
    paymentMethod: "card",
    total: 15000,
    customer: {
      id: "c1",
      firstName: "Иван",
      lastName: "Петров",
      email: "ivan@example.com",
      phone: "+7 (999) 123-45-67"
    },
    items: [
      {
        id: "i1",
        carName: "Toyota Camry",
        price: 3000,
        days: 5,
        startDate: "10.06.2023",
        endDate: "14.06.2023"
      }
    ],
    deliveryMethod: "pickup"
  },
  {
    id: "2",
    number: "ORD-2023-002",
    date: "2023-06-02T10:15:00",
    status: "confirmed",
    paymentStatus: "paid",
    paymentMethod: "card",
    total: 10000,
    customer: {
      id: "c2",
      firstName: "Анна",
      lastName: "Сидорова",
      email: "anna@example.com",
      phone: "+7 (999) 987-65-43"
    },
    items: [
      {
        id: "i2",
        carName: "Kia Rio",
        price: 2000,
        days: 5,
        startDate: "15.06.2023",
        endDate: "19.06.2023",
        extras: [
          { id: "gps", name: "GPS-навигатор", price: 200 }
        ]
      }
    ],
    deliveryMethod: "delivery",
    deliveryAddress: "г. Москва, ул. Ленина, д. 10, кв. 5"
  },
  {
    id: "3",
    number: "ORD-2023-003",
    date: "2023-06-01T09:45:00",
    status: "in_progress",
    paymentStatus: "paid",
    paymentMethod: "cash",
    total: 18000,
    customer: {
      id: "c3",
      firstName: "Дмитрий",
      lastName: "Иванов",
      email: "dmitry@example.com",
      phone: "+7 (999) 111-22-33"
    },
    items: [
      {
        id: "i3",
        carName: "Hyundai Solaris",
        price: 1800,
        days: 10,
        startDate: "05.06.2023",
        endDate: "14.06.2023"
      }
    ],
    deliveryMethod: "pickup",
    comment: "Предпочитаю автомобиль белого цвета, если есть возможность"
  },
  {
    id: "4",
    number: "ORD-2023-004",
    date: "2023-05-28T16:20:00",
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "card",
    total: 12500,
    customer: {
      id: "c4",
      firstName: "Елена",
      lastName: "Смирнова",
      email: "elena@example.com",
      phone: "+7 (999) 444-55-66"
    },
    items: [
      {
        id: "i4",
        carName: "Ford Focus",
        price: 2500,
        days: 5,
        startDate: "29.05.2023",
        endDate: "02.06.2023"
      }
    ],
    deliveryMethod: "pickup"
  },
  {
    id: "5",
    number: "ORD-2023-005",
    date: "2023-05-25T11:30:00",
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "card",
    total: 9000,
    customer: {
      id: "c5",
      firstName: "Сергей",
      lastName: "Козлов",
      email: "sergey@example.com",
      phone: "+7 (999) 777-88-99"
    },
    items: [
      {
        id: "i5",
        carName: "Volkswagen Polo",
        price: 2250,
        days: 4,
        startDate: "01.06.2023",
        endDate: "04.06.2023"
      }
    ],
    deliveryMethod: "delivery",
    deliveryAddress: "г. Москва, ул. Пушкина, д. 15, кв. 10",
    comment: "Отменено по просьбе клиента"
  }
];

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Загрузка заказов при монтировании компонента
  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        // В реальном приложении здесь будет запрос к API
        // Имитация задержки загрузки данных
        await new Promise(resolve => setTimeout(resolve, 800));
        setOrders(mockOrders);
      } catch (error) {
        console.error("Ошибка при загрузке заказов:", error);
        toast({
          variant: "destructive",
          title: "Ошибка загрузки",
          description: "Не удалось загрузить список заказов"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrders();
  }, []);

  // Фильтрация заказов
  const filteredOrders = orders.filter(order => {
    const searchMatch = searchTerm === "" || 
      order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.carName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const statusMatch = statusFilter === "" || order.status === statusFilter;
    const paymentStatusMatch = paymentStatusFilter === "" || order.paymentStatus === paymentStatusFilter;
    
    return searchMatch && statusMatch && paymentStatusMatch;
  });

  // Пагинация
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Обработчик изменения статуса заказа
  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus } 
          : order
      )
    );
    
    toast({
      title: "Статус обновлен",
      description: `Статус заказа #${orderId} изменен на "${getStatusLabel(newStatus)}"`
    });
  };

  // Обработчик экспорта заказа в PDF
  const handleExportToPdf = (order: Order) => {
    // В реальном приложении здесь будет логика экспорта в PDF
    toast({
      title: "Экспорт в PDF",
      description: `Заказ #${order.number} экспортируется в PDF`
    });
  };

  // Получение метки статуса заказа
  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'new': return 'Новый';
      case 'confirmed': return 'Подтвержден';
      case 'in_progress': return 'В процессе';
      case 'completed': return 'Завершен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  // Получение цвета для статуса заказа
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'confirmed': return 'bg-purple-500';
      case 'in_progress': return 'bg-amber-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Получение метки статуса оплаты
  const getPaymentStatusLabel = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'pending': return 'Ожидает оплаты';
      case 'paid': return 'Оплачен';
      case 'refunded': return 'Возвращен';
      case 'failed': return 'Ошибка';
      default: return status;
    }
  };

  // Получение цвета для статуса оплаты
  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'pending': return 'bg-amber-500';
      case 'paid': return 'bg-green-500';
      case 'refunded': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Получение метки способа оплаты
  const getPaymentMethodLabel = (method: Order['paymentMethod']) => {
    switch (method) {
      case 'card': return 'Банковская карта';
      case 'cash': return 'Наличные';
      default: return method;
    }
  };

  // Получение метки способа доставки
  const getDeliveryMethodLabel = (method: Order['deliveryMethod']) => {
    switch (method) {
      case 'pickup': return 'Самовывоз';
      case 'delivery': return 'Доставка';
      default: return method;
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: ru });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Управление заказами</h1>
            <p className="text-gray-500 mt-1">
              Просмотр и управление заказами клиентов
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline">
              <Icon name="FileText" className="mr-2 h-4 w-4" />
              Экспорт заказов
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all">Все заказы</TabsTrigger>
            <TabsTrigger value="new">Новые</TabsTrigger>
            <TabsTrigger value="active">Активные</TabsTrigger>
            <TabsTrigger value="completed">Завершенные</TabsTrigger>
            <TabsTrigger value="cancelled">Отмененные</TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Icon name="Search" size={18} />
                </div>
                <Input
                  type="search"
                  placeholder="Поиск заказов..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Фильтр по статусу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все статусы</SelectItem>
                  <SelectItem value="new">Новые</SelectItem>
                  <SelectItem value="confirmed">Подтвержденные</SelectItem>
                  <SelectItem value="in_progress">В процессе</SelectItem>
                  <SelectItem value="completed">Завершенные</SelectItem>
                  <SelectItem value="cancelled">Отмененные</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={paymentStatusFilter}
                onValueChange={setPaymentStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Фильтр по оплате" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все статусы оплаты</SelectItem>
                  <SelectItem value="pending">Ожидает оплаты</SelectItem>
                  <SelectItem value="paid">Оплачен</SelectItem>
                  <SelectItem value="refunded">Возвращен</SelectItem>
                  <SelectItem value="failed">Ошибка</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center p-12">
                    <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Загрузка заказов...</span>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>№ заказа</TableHead>
                          <TableHead>Дата</TableHead>
                          <TableHead>Клиент</TableHead>
                          <TableHead>Статус заказа</TableHead>
                          <TableHead>Статус оплаты</TableHead>
                          <TableHead className="text-right">Сумма</TableHead>
                          <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentOrders.length > 0 ? (
                          currentOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">
                                {order.number}
                              </TableCell>
                              <TableCell>
                                {formatDate(order.date)}
                              </TableCell>
                              <TableCell>
                                <div>
                                  {order.customer.firstName} {order.customer.lastName}
                                  <div className="text-xs text-gray-500">{order.customer.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(order.status)}`}></div>
                                  {getStatusLabel(order.status)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <div className={`w-2 h-2 rounded-full mr-2 ${getPaymentStatusColor(order.paymentStatus)}`}></div>
                                  {getPaymentStatusLabel(order.paymentStatus)}
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {order.total.toLocaleString()} ₽
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setIsDetailsDialogOpen(true);
                                    }}
                                  >
                                    <Icon name="Eye" className="h-4 w-4" />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <Icon name="MoreVertical" className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleExportToPdf(order)}>
                                        <Icon name="FileText" className="h-4 w-4 mr-2" />
                                        Экспорт в PDF
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      {order.status === 'new' && (
                                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'confirmed')}>
                                          <Icon name="CheckCircle" className="h-4 w-4 mr-2 text-green-500" />
                                          Подтвердить заказ
                                        </DropdownMenuItem>
                                      )}
                                      {(order.status === 'new' || order.status === 'confirmed') && (
                                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'in_progress')}>
                                          <Icon name="Clock" className="h-4 w-4 mr-2 text-amber-500" />
                                          В процессе выполнения
                                        </DropdownMenuItem>
                                      )}
                                      {order.status === 'in_progress' && (
                                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'completed')}>
                                          <Icon name="CheckCheck" className="h-4 w-4 mr-2 text-green-500" />
                                          Завершить заказ
                                        </DropdownMenuItem>
                                      )}
                                      {(order.status === 'new' || order.status === 'confirmed') && (
                                        <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'cancelled')}>
                                          <Icon name="X" className="h-4 w-4 mr-2 text-red-500" />
                                          Отменить заказ
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              <div className="flex flex-col items-center justify-center">
                                <Icon name="Search" className="h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-gray-500">Заказы не найдены</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    
                    {filteredOrders.length > ordersPerPage && (
                      <div className="py-4 px-6">
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
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </Tabs>
        
        {/* Диалог с подробной информацией о заказе */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Информация о заказе</DialogTitle>
              <DialogDescription>
                Подробная информация о заказе №{selectedOrder?.number}
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Детали заказа</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Номер заказа:</span>
                        <span className="font-medium">{selectedOrder.number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Дата заказа:</span>
                        <span className="font-medium">{formatDate(selectedOrder.date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Способ получения:</span>
                        <span className="font-medium">{getDeliveryMethodLabel(selectedOrder.deliveryMethod)}</span>
                      </div>
                      {selectedOrder.deliveryMethod === 'delivery' && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Адрес доставки:</span>
                          <span className="font-medium">{selectedOrder.deliveryAddress}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Способ оплаты:</span>
                        <span className="font-medium">{getPaymentMethodLabel(selectedOrder.paymentMethod)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Статус заказа:</span>
                        <Badge className={getStatusColor(selectedOrder.status)}>
                          {getStatusLabel(selectedOrder.status)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Статус оплаты:</span>
                        <Badge className={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                          {getPaymentStatusLabel(selectedOrder.paymentStatus)}
                        </Badge>
                      </div>
                    </div>
                    
                    {selectedOrder.comment && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-700 mb-1">Комментарий к заказу:</h4>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-md text-sm">
                          {selectedOrder.comment}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Информация о клиенте</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Имя:</span>
                        <span className="font-medium">{selectedOrder.customer.firstName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Фамилия:</span>
                        <span className="font-medium">{selectedOrder.customer.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedOrder.customer.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Телефон:</span>
                        <span className="font-medium">{selectedOrder.customer.phone}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex gap-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/admin/users/${selectedOrder.customer.id}`}>
                          <Icon name="User" className="h-4 w-4 mr-2" />
                          Профиль клиента
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Icon name="Mail" className="h-4 w-4 mr-2" />
                        Написать клиенту
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Автомобили</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Автомобиль</TableHead>
                          <TableHead>Период аренды</TableHead>
                          <TableHead>Длительность</TableHead>
                          <TableHead>Цена в день</TableHead>
                          <TableHead className="text-right">Сумма</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.carName}
                            </TableCell>
                            <TableCell>
                              {item.startDate} - {item.endDate}
                            </TableCell>
                            <TableCell>
                              {item.days} {item.days === 1 ? 'день' : item.days < 5 ? 'дня' : 'дней'}
                            </TableCell>
                            <TableCell>
                              {item.price} ₽
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {item.price * item.days} ₽
                            </TableCell>
                          </TableRow>
                        ))}
                        
                        {/* Дополнительные услуги */}
                        {selectedOrder.items.some(item => item.extras && item.extras.length > 0) && (
                          <>
                            {selectedOrder.items.map(item => 
                              item.extras?.map(extra => (
                                <TableRow key={`${item.id}-${extra.id}`}>
                                  <TableCell colSpan={4} className="text-sm text-gray-600">
                                    Доп. услуга: {extra.name} ({item.carName})
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {extra.price} ₽
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </>
                        )}
                        
                        {/* Итоговая строка */}
                        <TableRow>
                          <TableCell colSpan={4} className="font-bold text-right">
                            Итого:
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {selectedOrder.total} ₽
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => handleExportToPdf(selectedOrder)}>
                      <Icon name="FileText" className="h-4 w-4 mr-2" />
                      Экспорт в PDF
                    </Button>
                  </div>
                  
                  <div className="space-x-2">
                    {selectedOrder.status === 'new' && (
                      <Button variant="outline" onClick={() => handleStatusChange(selectedOrder.id, 'confirmed')}>
                        <Icon name="CheckCircle" className="h-4 w-4 mr-2 text-green-500" />
                        Подтвердить
                      </Button>
                    )}
                    {(selectedOrder.status === 'new' || selectedOrder.status === 'confirmed') && (
                      <Button variant="outline" onClick={() => handleStatusChange(selectedOrder.id, 'in_progress')}>
                        <Icon name="Clock" className="h-4 w-4 mr-2 text-amber-500" />
                        В процессе
                      </Button>
                    )}
                    {selectedOrder.status === 'in_progress' && (
                      <Button variant="outline" onClick={() => handleStatusChange(selectedOrder.id, 'completed')}>
                        <Icon name="CheckCheck" className="h-4 w-4 mr-2 text-green-500" />
                        Завершить
                      </Button>
                    )}
                    {(selectedOrder.status === 'new' || selectedOrder.status === 'confirmed') && (
                      <Button variant="destructive" onClick={() => handleStatusChange(selectedOrder.id, 'cancelled')}>
                        <Icon name="X" className="h-4 w-4 mr-2" />
                        Отменить
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
