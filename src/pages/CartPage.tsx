
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import Icon from "@/components/ui/icon";
import OrderForm, { CartItem, OrderData } from "@/components/OrderForm";

const CartPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showOrderForm, setShowOrderForm] = useState(false);
  
  // В реальном приложении данные корзины будут храниться в контексте или Redux
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Toyota Camry",
      image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      price: 3000,
      days: 3,
      startDate: "10.06.2023",
      endDate: "12.06.2023"
    },
    {
      id: "2",
      name: "Kia Rio",
      image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      price: 2000,
      days: 5,
      startDate: "15.06.2023",
      endDate: "19.06.2023",
      extras: [
        { id: "gps", name: "GPS-навигатор", price: 200 }
      ]
    }
  ]);
  
  // Функция расчета общей суммы
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      let itemTotal = item.price * item.days;
      
      // Добавляем стоимость дополнительных услуг
      if (item.extras) {
        itemTotal += item.extras.reduce((sum, extra) => sum + extra.price, 0);
      }
      
      return total + itemTotal;
    }, 0);
  };
  
  // Обработчик удаления элемента из корзины
  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    
    toast({
      title: "Автомобиль удален",
      description: "Автомобиль успешно удален из корзины"
    });
  };
  
  // Обработчик оформления заказа
  const handleCheckout = (orderData: OrderData) => {
    // В реальном приложении здесь будет запрос к API
    console.log("Оформление заказа:", orderData);
    
    // Имитация успешного оформления заказа
    setTimeout(() => {
      toast({
        title: "Заказ оформлен",
        description: "Ваш заказ успешно оформлен. Спасибо за выбор нашего сервиса!"
      });
      
      // Очистка корзины
      setCartItems([]);
      
      // Перенаправление на страницу успешного оформления заказа
      navigate("/order-success");
    }, 1500);
  };
  
  // Если корзина пуста
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <Icon name="ShoppingCart" className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Ваша корзина пуста</h1>
            <p className="text-gray-600 mb-6">
              Выберите автомобили из нашего каталога, чтобы добавить их в корзину
            </p>
            <Button asChild size="lg">
              <Link to="/catalog">Перейти в каталог</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Корзина</h1>
        
        {!showOrderForm ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Список автомобилей в корзине */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-48 h-48 sm:h-auto">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold">{item.name}</h3>
                            <p className="text-gray-600 mt-1">Срок аренды: {item.startDate} - {item.endDate}</p>
                            <p className="text-gray-600">
                              Длительность: {item.days} {item.days === 1 ? "день" : "дня"}
                            </p>
                            
                            {item.extras && item.extras.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium">Дополнительно:</p>
                                <ul className="text-sm text-gray-600">
                                  {item.extras.map(extra => (
                                    <li key={extra.id} className="flex justify-between">
                                      <span>{extra.name}</span>
                                      <span>{extra.price} ₽</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <div className="text-xl font-bold text-blue-600">{item.price} ₽/день</div>
                            <div className="text-gray-600 text-sm">
                              Итого: {item.price * item.days +
                                (item.extras?.reduce((sum, extra) => sum + extra.price, 0) || 0)} ₽
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Icon name="Trash2" className="h-4 w-4 mr-2" />
                            Удалить
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            asChild
                          >
                            <Link to={`/car/${item.id}`}>
                              <Icon name="Eye" className="h-4 w-4 mr-2" />
                              Посмотреть
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  asChild
                  className="mr-4"
                >
                  <Link to="/catalog">
                    <Icon name="ChevronLeft" className="h-4 w-4 mr-2" />
                    Продолжить выбор
                  </Link>
                </Button>
                
                <Button 
                  variant="destructive" 
                  onClick={() => setCartItems([])}
                >
                  <Icon name="Trash2" className="h-4 w-4 mr-2" />
                  Очистить корзину
                </Button>
              </div>
            </div>
            
            {/* Сводка заказа */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Ваш заказ</h2>
                  
                  <div className="space-y-2 mb-4">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span>{item.price * item.days} ₽</span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between font-bold text-lg mb-6">
                    <span>Итого:</span>
                    <span>{calculateTotal()} ₽</span>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => setShowOrderForm(true)}
                  >
                    Оформить заказ
                  </Button>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <div className="flex">
                      <Icon name="Info" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                      <p className="text-sm text-blue-700">
                        При оформлении заказа вы сможете выбрать дополнительные услуги и способ получения автомобиля.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Форма оформления заказа */
          <OrderForm 
            cartItems={cartItems}
            onCheckout={handleCheckout}
            onCancel={() => setShowOrderForm(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CartPage;
