
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ApiErrorType } from "@/lib/api-client";
import Icon from "@/components/ui/icon";

const AdminLoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Пожалуйста, введите логин и пароль"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await adminLogin(username, password);
      
      // Отображаем уведомление об успешном входе
      toast({
        title: "Успешный вход",
        description: `Здравствуйте, ${result.user.name}`,
      });
      
      // Перенаправляем на админ-панель
      navigate("/admin/dashboard");
    } catch (error: any) {
      let errorMessage = "Ошибка авторизации";
      
      // Обработка различных типов ошибок
      if (error.type === ApiErrorType.AUTH) {
        errorMessage = "Неверный логин или пароль";
      } else if (error.type === ApiErrorType.NETWORK) {
        errorMessage = "Ошибка сети. Проверьте соединение с интернетом";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Ошибка входа",
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md px-4">
        <Card className="w-full">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Вход в панель управления</CardTitle>
            <CardDescription>
              Введите данные администратора для входа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Имя пользователя</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Icon name="User" size={16} />
                  </div>
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin"
                    className="pl-10"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Пароль</Label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Icon name="Lock" size={16} />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                    Вход...
                  </>
                ) : (
                  "Войти"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              Доступ ограничен только для администраторов системы
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminLoginPage;
