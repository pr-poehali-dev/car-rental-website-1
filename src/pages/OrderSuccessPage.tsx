
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Icon from "@/components/ui/icon";

const OrderSuccessPage = () => {
  // В реальном приложении здесь будет получение деталей заказа из состояния или из API

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto p-6 flex justify-center">
        <div className="max-w-md w-full text-center mt-12">
          <div className="rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" className="text-green-600 h-10 w-10" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Заказ успешно оформлен!</h1>
          
          <p className="text-gray-600 mb-6">
            Ваш заказ #123456 успешно оформлен. Мы свяжемся с вами в ближайшее время для подтверждения деталей.
          </p>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold mb-4">Детали заказа</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Номер заказа:</span>
                <span className="font-medium">123456</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Дата заказа:</span>
                <span className="font-medium">05.05.2023</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Статус оплаты:</span>
                <span className="font-medium text-green-600">Оплачен</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Метод оплаты:</span>
                <span className="font-medium">Банковская карта</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Сумма заказа:</span>
                <span className="font-medium">17 000 ₽</span>
              </div>
            </div>
            
            <hr className="my-4" />
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-md overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
                    alt="Toyota Camry" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Toyota Camry</div>
                  <div className="text-sm text-gray-500">10.06.2023 - 12.06.2023 (3 дня)</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">9 000 ₽</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-md overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
                    alt="Kia Rio" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Kia Rio</div>
                  <div className="text-sm text-gray-500">15.06.2023 - 19.06.2023 (5 дней)</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">8 000 ₽</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mb-8">
            <h2 className="text-lg font-bold">Что дальше?</h2>
            <p className="text-gray-600">
              Вскоре вы получите электронное письмо с подтверждением заказа. 
              Мы свяжемся с вами для уточнения деталей получения автомобиля.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/profile">
                <Icon name="User" className="h-4 w-4 mr-2" />
                Мои заказы
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link to="/">
                <Icon name="Home" className="h-4 w-4 mr-2" />
                На главную
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
