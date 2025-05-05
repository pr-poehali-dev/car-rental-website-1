
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminSidebar from "@/components/AdminSidebar";
import Icon from "@/components/ui/icon";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";

// Моковые данные для аналитики
const revenueData = [
  { date: "Январь", доход: 220000, расходы: 160000 },
  { date: "Февраль", доход: 270000, расходы: 180000 },
  { date: "Март", доход: 250000, расходы: 170000 },
  { date: "Апрель", доход: 300000, расходы: 190000 },
  { date: "Май", доход: 350000, расходы: 200000 },
  { date: "Июнь", доход: 380000, расходы: 220000 },
];

const bookingsData = [
  { дата: "Пн", количество: 15 },
  { дата: "Вт", количество: 20 },
  { дата: "Ср", количество: 25 },
  { дата: "Чт", количество: 18 },
  { дата: "Пт", количество: 32 },
  { дата: "Сб", количество: 40 },
  { дата: "Вс", количество: 35 },
];

const carUsageData = [
  { name: "Эконом", value: 40 },
  { name: "Комфорт", value: 30 },
  { name: "Бизнес", value: 20 },
  { name: "Премиум", value: 10 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, user: "Иван Смирнов", action: "Изменил статус пользователя", date: "2023-05-04T10:15:00", ip: "192.168.1.1" },
    { id: 2, user: "Анна Петрова", action: "Добавила новый автомобиль", date: "2023-05-04T11:30:00", ip: "192.168.1.2" },
    { id: 3, user: "Иван Смирнов", action: "Удалил бронирование #1234", date: "2023-05-04T13:45:00", ip: "192.168.1.1" },
    { id: 4, user: "Администратор", action: "Изменил настройки системы", date: "2023-05-04T15:20:00", ip: "192.168.1.3" },
  ]);

  // Статистические карточки с основными метриками
  const statCards = [
    {
      title: "Всего автомобилей",
      value: "28",
      change: "+2",
      icon: "Car",
      color: "bg-blue-500",
    },
    {
      title: "Активные бронирования",
      value: "142",
      change: "+12%",
      icon: "Calendar",
      color: "bg-green-500",
    },
    {
      title: "Доход за месяц",
      value: "380 000 ₽",
      change: "+5%",
      icon: "TrendingUp",
      color: "bg-purple-500",
    },
    {
      title: "Всего клиентов",
      value: "845",
      change: "+23",
      icon: "Users",
      color: "bg-amber-500",
    },
  ];

  // Функция форматирования даты для логов
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

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Аналитическая панель</h1>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Выберите период" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Неделя</SelectItem>
                <SelectItem value="month">Месяц</SelectItem>
                <SelectItem value="quarter">Квартал</SelectItem>
                <SelectItem value="year">Год</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Статистические карточки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {statCards.map((card, index) => (
            <Card key={index} className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                    <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
                    <p className={`text-sm mt-1 ${card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {card.change} {timeRange === "week" ? "за неделю" : timeRange === "month" ? "за месяц" : "за год"}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${card.color}`}>
                    <Icon name={card.icon} size={24} className="text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Tabs defaultValue="revenue" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="revenue">Доходы и расходы</TabsTrigger>
            <TabsTrigger value="bookings">Бронирования</TabsTrigger>
            <TabsTrigger value="cars">Использование автомобилей</TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenue" className="mt-0">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Динамика доходов и расходов</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value.toLocaleString()} ₽`} />
                    <Legend />
                    <Line type="monotone" dataKey="доход" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="расходы" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bookings" className="mt-0">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Статистика бронирований</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="дата" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="количество" fill="#8884d8" name="Количество бронирований" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cars" className="mt-0">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Распределение автомобилей по классам</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={carUsageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {carUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Журнал аудита */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Журнал действий администраторов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Пользователь</th>
                    <th className="text-left py-3 px-4">Действие</th>
                    <th className="text-left py-3 px-4">Дата и время</th>
                    <th className="text-left py-3 px-4">IP-адрес</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{log.user}</td>
                      <td className="py-3 px-4">{log.action}</td>
                      <td className="py-3 px-4">{formatDate(log.date)}</td>
                      <td className="py-3 px-4">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
