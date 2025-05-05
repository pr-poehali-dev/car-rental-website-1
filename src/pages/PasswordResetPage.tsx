
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Icon from "@/components/ui/icon";

const PasswordResetPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Пожалуйста, введите email"
      });
      return;
    }
    
    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Ошибка сброса пароля:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md px-4">
        <Card className="w-full shadow-lg">
          {!isSubmitted ? (
            <>
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Восстановление пароля</CardTitle>
                <CardDescription>
                  Введите email для получения инструкций
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Icon name="Mail" size={16} />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@example.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      "Восстановить пароль"
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <div className="flex flex-col items-center space-y-2 text-sm">
                  <span>Вспомнили пароль?</span>
                  <Link to="/login" className="text-primary hover:underline">
                    Вернуться на страницу входа
                  </Link>
                </div>
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader className="space-y-1 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                  <Icon name="Check" className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold">Проверьте почту</CardTitle>
                <CardDescription>
                  Мы отправили инструкции по сбросу пароля на {email}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center text-sm text-gray-500">
                <p>Если вы не получили письмо в течение нескольких минут, проверьте папку спам или повторите попытку.</p>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setIsSubmitted(false)}
                >
                  Попробовать другой email
                </Button>
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/login')}
                >
                  Вернуться на страницу входа
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PasswordResetPage;
