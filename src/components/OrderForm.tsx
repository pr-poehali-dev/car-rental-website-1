
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import Icon from "@/components/ui/icon";

// Интерфейс для элемента корзины
export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  days: number; // количество дней аренды
  startDate: string;
  endDate: string;
  extras?: {
    id: string;
    name: string;
    price: number;
  }[];
}

// Интерфейс для формы заказа
interface OrderFormProps {
  cartItems: CartItem[];
  onCheckout: (orderData: OrderData) => void;
  onCancel: () => void;
}

// Данные заказа для отправки
export interface OrderData {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
  };
  deliveryMethod: "pickup" | "delivery";
  deliveryAddress?: string;
  paymentMethod: "card" | "cash";
  comment?: string;
  agreeToTerms: boolean;
  sendReceipt: boolean;
  total: number;
  items: CartItem[];
}

// Доступные способы оплаты
const paymentMethods = [
  {
    id: "card",
    name: "Банковская карта",
    description: "Оплата онлайн картой Visa, MasterCard, МИР",
    icon: "CreditCard"
  },
  {
    id: "cash",
    name: "Наличные",
    description: "Оплата наличными при получении автомобиля",
    icon: "Banknote"
  }
];

// Доступные дополнительные услуги
const availableExtras = [
  { id: "gps", name: "GPS-навигатор", price: 200 },
  { id: "childSeat", name: "Детское кресло", price: 300 },
  { id: "extraDriver", name: "Дополнительный водитель", price: 500 },
  { id: "fullInsurance", name: "Полная страховка", price: 800 },
  { id: "delivery", name: "Доставка автомобиля", price: 1000 }
];

const OrderForm = ({ cartItems, onCheckout, onCancel }: OrderFormProps) => {
  const [activeTab, setActiveTab] = useState("customer");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [sendReceipt, setSendReceipt] = useState(true);
  const { toast } = useToast();

  // Состояния для хранения данных формы
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    deliveryAddress: "",
    comment: ""
  });

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Обработчик переключения вкладок
  const handleTabChange = (value: string) => {
    // Проверка заполнения текущей вкладки перед переходом к следующей
    if (activeTab === "customer" && value === "delivery") {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Пожалуйста, заполните все обязательные поля"
        });
        return;
      }
      
      // Валидация email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Пожалуйста, введите корректный email"
        });
        return;
      }
      
      // Валидация телефона
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Пожалуйста, введите корректный номер телефона"
        });
        return;
      }
    }
    
    // Проверка заполнения адреса доставки, если выбран метод доставки
    if (activeTab === "delivery" && value === "payment" && deliveryMethod === "delivery" && !formData.deliveryAddress) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Пожалуйста, введите адрес доставки"
      });
      return;
    }
    
    setActiveTab(value);
  };

  // Расчет общей стоимости
  const calculateTotal = () => {
    let total = cartItems.reduce((sum, item) => {
      // Базовая стоимость аренды
      let itemTotal = item.price * item.days;
      
      // Добавляем стоимость дополнительных услуг
      if (item.extras) {
        itemTotal += item.extras.reduce((extrasSum, extra) => extrasSum + extra.price, 0);
      }
      
      return sum + itemTotal;
    }, 0);
    
    // Добавляем выбранные дополнительные услуги
    selectedExtras.forEach(extraId => {
      const extra = availableExtras.find(e => e.id === extraId);
      if (extra) {
        total += extra.price * cartItems.length; // Применяем ко всем автомобилям
      }
    });
    
    return total;
  };

  // Обработчик отправки формы заказа
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeToTerms) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Необходимо согласиться с условиями аренды"
      });
      return;
    }
    
    // Подготовка данных заказа
    const orderData: OrderData = {
      customer: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      },
      deliveryMethod,
      deliveryAddress: deliveryMethod === "delivery" ? formData.deliveryAddress : undefined,
      paymentMethod,
      comment: formData.comment,
      agreeToTerms,
      sendReceipt,
      total: calculateTotal(),
      items: cartItems.map(item => ({
        ...item,
        extras: [
          ...(item.extras || []),
          ...selectedExtras.map(extraId => {
            const extra = availableExtras.find(e => e.id === extraId);
            return extra ? { id: extra.id, name: extra.name, price: extra.price } : null;
          }).filter(Boolean) as { id: string; name: string; price: number }[]
        ]
      }))
    };
    
    onCheckout(orderData);
  };

  // Обработчик выбора дополнительных услуг
  const handleExtraToggle = (extraId: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraId)
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="customer">Контактные данные</TabsTrigger>
          <TabsTrigger value="delivery">Способ получения</TabsTrigger>
          <TabsTrigger value="payment">Оплата</TabsTrigger>
        </TabsList>
        
        <form onSubmit={handleSubmit}>
          {/* Вкладка с контактными данными */}
          <TabsContent value="customer" className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя <span className="text-red-500">*</span></Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Иван"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия <span className="text-red-500">*</span></Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Иванов"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ivanov@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон <span className="text-red-500">*</span></Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+7 (XXX) XXX-XX-XX"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Адрес</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="г. Москва, ул. Ленина, д. 1, кв. 1"
                />
              </div>
              
              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Назад к корзине
                </Button>
                <Button type="button" onClick={() => handleTabChange("delivery")}>
                  Продолжить
                  <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Вкладка с выбором способа получения */}
          <TabsContent value="delivery" className="p-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Способ получения</h3>
                
                <RadioGroup
                  value={deliveryMethod}
                  onValueChange={(value: "pickup" | "delivery") => setDeliveryMethod(value)}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="pickup" className="font-medium">
                        Самовывоз
                      </Label>
                      <p className="text-sm text-gray-500">
                        Заберите автомобиль из нашего офиса по адресу: г. Москва, ул. Автомобильная, д. 123
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="delivery" id="delivery" className="mt-1" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="delivery" className="font-medium">
                        Доставка по адресу (+1000 ₽)
                      </Label>
                      <p className="text-sm text-gray-500">
                        Мы доставим автомобиль по указанному адресу в пределах города
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              
              {deliveryMethod === "delivery" && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="deliveryAddress">
                    Адрес доставки <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="deliveryAddress"
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleChange}
                    placeholder="Введите полный адрес доставки"
                    required={deliveryMethod === "delivery"}
                  />
                </div>
              )}
              
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-medium">Дополнительные услуги</h3>
                <div className="space-y-3">
                  {availableExtras.map(extra => (
                    <div key={extra.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center">
                        <Switch
                          id={`extra-${extra.id}`}
                          checked={selectedExtras.includes(extra.id)}
                          onCheckedChange={() => handleExtraToggle(extra.id)}
                        />
                        <Label htmlFor={`extra-${extra.id}`} className="ml-2 cursor-pointer">
                          {extra.name}
                        </Label>
                      </div>
                      <span className="font-medium">+{extra.price} ₽</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <Label htmlFor="comment">Комментарий к заказу</Label>
                <Textarea
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  placeholder="Дополнительная информация по заказу"
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={() => handleTabChange("customer")}>
                  <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                  Назад
                </Button>
                <Button type="button" onClick={() => handleTabChange("payment")}>
                  Продолжить
                  <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Вкладка с выбором способа оплаты */}
          <TabsContent value="payment" className="p-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Способ оплаты</h3>
                
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value: "card" | "cash") => setPaymentMethod(value)}
                  className="space-y-3"
                >
                  {paymentMethods.map(method => (
                    <div key={method.id} className="flex items-start space-x-2">
                      <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                      <div className="grid gap-1.5 w-full">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={method.id} className="font-medium">
                            {method.name}
                          </Label>
                          <Icon name={method.icon as any} className="h-5 w-5 text-gray-500" />
                        </div>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Ваш заказ</CardTitle>
                  <CardDescription>Информация о вашем заказе</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex justify-between border-b pb-3">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-md overflow-hidden mr-3">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">
                              {item.startDate} - {item.endDate} ({item.days} {item.days === 1 ? "день" : "дня"})
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{item.price} ₽/день</div>
                          <div className="text-sm text-gray-500">Итого: {item.price * item.days} ₽</div>
                        </div>
                      </div>
                    ))}
                    
                    {selectedExtras.length > 0 && (
                      <div className="pt-2">
                        <div className="text-sm font-medium mb-2">Дополнительные услуги:</div>
                        {selectedExtras.map(extraId => {
                          const extra = availableExtras.find(e => e.id === extraId);
                          return extra && (
                            <div key={extra.id} className="flex justify-between text-sm py-1">
                              <span>{extra.name}</span>
                              <span>+{extra.price} ₽</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    <div className="pt-2 flex justify-between font-bold text-lg">
                      <span>Итого:</span>
                      <span>{calculateTotal()} ₽</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-3 pt-3">
                <div className="flex items-start space-x-2">
                  <Switch 
                    id="termsAgreement" 
                    checked={agreeToTerms}
                    onCheckedChange={setAgreeToTerms}
                  />
                  <Label htmlFor="termsAgreement" className="text-sm">
                    Я согласен с <a href="#" className="text-blue-600 hover:underline">условиями аренды</a> и <a href="#" className="text-blue-600 hover:underline">политикой конфиденциальности</a>
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Switch 
                    id="receiptEmail" 
                    checked={sendReceipt}
                    onCheckedChange={setSendReceipt}
                  />
                  <Label htmlFor="receiptEmail" className="text-sm">
                    Отправить чек на email
                  </Label>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={() => handleTabChange("delivery")}>
                  <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                  Назад
                </Button>
                <Button type="submit" disabled={!agreeToTerms}>
                  {paymentMethod === "card" ? "Перейти к оплате" : "Оформить заказ"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  );
};

export default OrderForm;
