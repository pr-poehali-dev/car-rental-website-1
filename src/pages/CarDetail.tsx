
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCarById } from "@/lib/api";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { format, addDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import Icon from "@/components/ui/icon";

// Расширенный интерфейс для подробных данных об автомобиле
interface CarDetailProps {
  id: string;
  name: string;
  images: string[];
  price: number;
  oldPrice?: number;
  type: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  seats: number;
  doors: number;
  transmission: "Автомат" | "Механика";
  fuel: "Бензин" | "Дизель" | "Электро" | "Гибрид";
  consumption: number; // л/100км или кВт⋅ч/100км
  engine: string; // объем двигателя или мощность для электромобилей
  features: string[];
  description: string;
  specifications: {
    [key: string]: string | number;
  };
  availability: {
    isAvailable: boolean;
    bookedDates: {
      start: string;
      end: string;
    }[];
  };
  rating: {
    average: number;
    count: number;
  };
  reviews: {
    id: string;
    author: string;
    date: string;
    rating: number;
    text: string;
  }[];
  location: string;
}

// Мок-данные для демонстрации
const mockCarDetail: CarDetailProps = {
  id: "1",
  name: "Toyota Camry",
  images: [
    "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1679778710296-80849ce3c48b?w=800&auto=format&fit=crop&q=80&ixlib=rb-4.0.3"
  ],
  price: 3000,
  oldPrice: 3500,
  type: "Седан",
  brand: "Toyota",
  model: "Camry",
  year: 2022,
  color: "Белый",
  seats: 5,
  doors: 4,
  transmission: "Автомат",
  fuel: "Бензин",
  consumption: 7.2,
  engine: "2.5 л / 200 л.с.",
  features: [
    "Климат-контроль",
    "Кожаный салон",
    "Подогрев сидений",
    "Парктроник",
    "Камера заднего вида",
    "Аудиосистема JBL",
    "Apple CarPlay / Android Auto",
    "Круиз-контроль",
    "Датчик дождя",
    "Система контроля слепых зон"
  ],
  description: "Toyota Camry - комфортный седан бизнес-класса, сочетающий в себе стиль, надежность и экономичность. Идеально подходит для деловых поездок и семейных путешествий. Просторный салон, отличная шумоизоляция и множество современных технологий сделают вашу поездку максимально комфортной.",
  specifications: {
    "Тип привода": "Передний",
    "Объем багажника": "493 л",
    "Разгон до 100 км/ч": "8.9 с",
    "Максимальная скорость": "210 км/ч",
    "Клиренс": "160 мм",
    "Длина": "4879 мм",
    "Ширина": "1839 мм",
    "Высота": "1445 мм",
    "Колесная база": "2825 мм"
  },
  availability: {
    isAvailable: true,
    bookedDates: [
      {
        start: "2023-06-10",
        end: "2023-06-15"
      },
      {
        start: "2023-06-20",
        end: "2023-06-25"
      }
    ]
  },
  rating: {
    average: 4.7,
    count: 47
  },
  reviews: [
    {
      id: "r1",
      author: "Иван Петров",
      date: "2023-05-20",
      rating: 5,
      text: "Отличный автомобиль, очень комфортный и экономичный. Особенно понравилась аудиосистема и удобные сиденья. Расход по городу около 8 литров."
    },
    {
      id: "r2",
      author: "Анна Сидорова",
      date: "2023-05-15",
      rating: 4,
      text: "В целом машина хорошая, но немного жестковата подвеска. Понравилось качество отделки и вместительный багажник."
    },
    {
      id: "r3",
      author: "Дмитрий Иванов",
      date: "2023-05-01",
      rating: 5,
      text: "Брал на неделю для поездки в другой город. Очень доволен, машина ведет себя отлично как в городе, так и на трассе. Определенно буду арендовать снова."
    }
  ],
  location: "Москва, ул. Ленина, 123"
};

const CarDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const { toast } = useToast();

  // В реальном приложении используем React Query для получения данных
  const { data: car, isLoading, isError } = useQuery({
    queryKey: ['car', id],
    queryFn: () => fetchCarById(id || ''),
    enabled: !!id,
    placeholderData: mockCarDetail
  });

  // Обработка выбора дат
  useEffect(() => {
    if (selectedDates.length === 2 && car) {
      const startDate = selectedDates[0];
      const endDate = selectedDates[1];
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      setTotalDays(days);
      setTotalPrice(days * car.price);
    } else {
      setTotalDays(0);
      setTotalPrice(0);
    }
  }, [selectedDates, car]);

  // Функция для проверки, занята ли дата
  const isDateBooked = (date: Date) => {
    if (!car?.availability.bookedDates.length) return false;
    
    const dateToCheck = startOfDay(date);
    return car.availability.bookedDates.some(booking => {
      const bookingStart = startOfDay(new Date(booking.start));
      const bookingEnd = endOfDay(new Date(booking.end));
      return isWithinInterval(dateToCheck, { start: bookingStart, end: bookingEnd });
    });
  };

  // Функция для отправки бронирования
  const handleBooking = () => {
    if (selectedDates.length !== 2) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Пожалуйста, выберите даты начала и окончания аренды"
      });
      return;
    }

    // Здесь будет запрос к API для бронирования
    setTimeout(() => {
      toast({
        title: "Бронирование успешно",
        description: `Вы забронировали ${car?.name} с ${format(selectedDates[0], 'dd.MM.yyyy')} по ${format(selectedDates[1], 'dd.MM.yyyy')}`
      });
      setIsBookingDialogOpen(false);
      setSelectedDates([]);
    }, 1000);
  };

  // Функция для отображения рейтинга звездами
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Icon key={i} name="Star" className="text-amber-500 fill-amber-500 h-4 w-4" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<Icon key={i} name="StarHalf" className="text-amber-500 fill-amber-500 h-4 w-4" />);
      } else {
        stars.push(<Icon key={i} name="Star" className="text-gray-300 h-4 w-4" />);
      }
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6 flex justify-center items-center h-[60vh]">
          <div className="flex flex-col items-center">
            <Icon name="Loader2" className="animate-spin h-12 w-12 text-blue-600 mb-4" />
            <p className="text-lg">Загрузка информации об автомобиле...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !car) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6 flex justify-center items-center h-[60vh]">
          <div className="text-center">
            <Icon name="AlertOctagon" className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Ошибка загрузки</h2>
            <p className="text-gray-600 mb-4">Не удалось загрузить информацию об автомобиле</p>
            <Button asChild>
              <Link to="/catalog">Вернуться в каталог</Link>
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
        {/* Хлебные крошки */}
        <div className="flex items-center mb-4 text-sm">
          <Link to="/" className="text-gray-500 hover:text-gray-700">Главная</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/catalog" className="text-gray-500 hover:text-gray-700">Каталог</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-700">{car.name}</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - галерея и информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Галерея фотографий */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <Carousel className="w-full">
                <CarouselContent>
                  {car.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <div className="overflow-hidden rounded-lg h-[400px]">
                          <img 
                            src={image} 
                            alt={`${car.name} - изображение ${index + 1}`} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            </div>
            
            {/* Информация о автомобиле */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{car.name}</h1>
                  <div className="flex items-center mt-2">
                    <div className="flex">
                      {renderStars(car.rating.average)}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{car.rating.average} ({car.rating.count} отзывов)</span>
                  </div>
                </div>
                <div className="text-right">
                  {car.oldPrice && (
                    <span className="text-gray-400 line-through text-lg">{car.oldPrice} ₽/день</span>
                  )}
                  <div className="text-3xl font-bold text-blue-600">{car.price} ₽/день</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Icon name="Calendar" className="mb-1 text-gray-500" />
                  <span className="text-sm text-gray-700">{car.year} год</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Icon name="Users" className="mb-1 text-gray-500" />
                  <span className="text-sm text-gray-700">{car.seats} мест</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Icon name="Gauge" className="mb-1 text-gray-500" />
                  <span className="text-sm text-gray-700">{car.transmission}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Icon name="Fuel" className="mb-1 text-gray-500" />
                  <span className="text-sm text-gray-700">{car.fuel}</span>
                </div>
              </div>
              
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Описание</TabsTrigger>
                  <TabsTrigger value="features">Характеристики</TabsTrigger>
                  <TabsTrigger value="reviews">Отзывы</TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="pt-4">
                  <div className="space-y-4">
                    <p className="text-gray-700 whitespace-pre-line">{car.description}</p>
                    
                    <h3 className="font-semibold text-lg mt-4">Комплектация</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {car.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <Icon name="Check" className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <h3 className="font-semibold text-lg mt-4">Расположение</h3>
                    <div className="flex items-center">
                      <Icon name="MapPin" className="h-5 w-5 text-red-500 mr-2" />
                      <span>{car.location}</span>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="features" className="pt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Марка</span>
                          <span className="font-medium">{car.brand}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Модель</span>
                          <span className="font-medium">{car.model}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Год выпуска</span>
                          <span className="font-medium">{car.year}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Тип кузова</span>
                          <span className="font-medium">{car.type}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Цвет</span>
                          <span className="font-medium">{car.color}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Количество дверей</span>
                          <span className="font-medium">{car.doors}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Коробка передач</span>
                          <span className="font-medium">{car.transmission}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Тип топлива</span>
                          <span className="font-medium">{car.fuel}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Расход топлива</span>
                          <span className="font-medium">{car.consumption} л/100км</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Двигатель</span>
                          <span className="font-medium">{car.engine}</span>
                        </div>
                        {Object.entries(car.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-2 border-b">
                            <span className="text-gray-600">{key}</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews" className="pt-4">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl font-bold text-amber-500">{car.rating.average}</div>
                      <div>
                        <div className="flex">
                          {renderStars(car.rating.average)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">На основе {car.rating.count} отзывов</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {car.reviews.map((review) => (
                        <Card key={review.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{review.author}</div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {format(new Date(review.date), 'dd MMMM yyyy', { locale: ru })}
                                </div>
                              </div>
                              <div className="flex">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            <p className="mt-3 text-gray-700">{review.text}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="flex justify-center">
                      <Button variant="outline">Показать больше отзывов</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Правая колонка - бронирование */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-4">Забронировать автомобиль</h2>
              
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span>Стоимость в день:</span>
                  <span className="font-bold">{car.price} ₽</span>
                </div>
                {selectedDates.length === 2 && (
                  <>
                    <div className="flex justify-between mb-2">
                      <span>Длительность аренды:</span>
                      <span>{totalDays} {totalDays === 1 ? 'день' : totalDays < 5 ? 'дня' : 'дней'}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Итого:</span>
                      <span>{totalPrice} ₽</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Выберите даты аренды:</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Icon name="Calendar" className="h-4 w-4 mr-2" />
                      {selectedDates.length === 0
                        ? "Выбрать даты"
                        : selectedDates.length === 1
                        ? `Начало: ${format(selectedDates[0], 'dd.MM.yyyy')}`
                        : `${format(selectedDates[0], 'dd.MM.yyyy')} - ${format(selectedDates[1], 'dd.MM.yyyy')}`}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Выберите даты аренды</DialogTitle>
                      <DialogDescription>
                        Выберите дату начала и окончания аренды. Недоступные даты отмечены серым цветом.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Calendar
                        mode="range"
                        selected={{
                          from: selectedDates[0] || undefined,
                          to: selectedDates[1] || undefined
                        }}
                        onSelect={(range) => {
                          if (range?.from) {
                            setSelectedDates([range.from, ...(range.to ? [range.to] : [])]);
                          } else {
                            setSelectedDates([]);
                          }
                        }}
                        disabled={(date) => {
                          // Запрещаем выбор прошедших дат
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (date < today) return true;
                          
                          // Запрещаем выбор занятых дат
                          return isDateBooked(date);
                        }}
                        numberOfMonths={2}
                        fixedWeeks
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={() => {}}>Применить</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-4">
                <Button 
                  className="w-full"
                  disabled={selectedDates.length !== 2}
                  onClick={() => setIsBookingDialogOpen(true)}
                >
                  Забронировать сейчас
                </Button>
                
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Важная информация:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-start">
                      <Icon name="Info" className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      Требуются права категории B и стаж не менее 2 лет
                    </li>
                    <li className="flex items-start">
                      <Icon name="CreditCard" className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      Залог 10 000 ₽ (возвращается при возврате автомобиля)
                    </li>
                    <li className="flex items-start">
                      <Icon name="MapPin" className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                      Доступна доставка автомобиля по городу
                    </li>
                  </ul>
                </div>
                
                <div className="flex items-center border border-green-200 bg-green-50 p-3 rounded-md">
                  <Icon name="ShieldCheck" className="h-6 w-6 mr-3 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-700">Бесплатная отмена</p>
                    <p className="text-xs text-green-600">За 24 часа до начала аренды</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Похожие автомобили */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Похожие автомобили</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Здесь будет компонент с похожими автомобилями */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
                  alt="Похожий автомобиль" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">Hyundai Sonata</h3>
                <p className="text-gray-600 text-sm">Седан • 2021 • Автомат</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="font-bold text-blue-600">2 800 ₽/день</span>
                  <Button size="sm" variant="outline">Подробнее</Button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
                  alt="Похожий автомобиль" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">Kia Optima</h3>
                <p className="text-gray-600 text-sm">Седан • 2022 • Автомат</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="font-bold text-blue-600">2 900 ₽/день</span>
                  <Button size="sm" variant="outline">Подробнее</Button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1597007030739-6d2e392655dc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
                  alt="Похожий автомобиль" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">Mazda 6</h3>
                <p className="text-gray-600 text-sm">Седан • 2021 • Автомат</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="font-bold text-blue-600">3 100 ₽/день</span>
                  <Button size="sm" variant="outline">Подробнее</Button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1567818668259-e66acb7cadd9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
                  alt="Похожий автомобиль" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">Ford Mondeo</h3>
                <p className="text-gray-600 text-sm">Седан • 2020 • Автомат</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="font-bold text-blue-600">2 700 ₽/день</span>
                  <Button size="sm" variant="outline">Подробнее</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Диалог подтверждения бронирования */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение бронирования</DialogTitle>
            <DialogDescription>
              Пожалуйста, проверьте детали бронирования перед подтверждением.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-32 rounded overflow-hidden">
                <img 
                  src={car.images[0]} 
                  alt={car.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold">{car.name}</h3>
                <p className="text-sm text-gray-600">{car.type} • {car.transmission} • {car.fuel}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Период аренды:</span>
                <span className="font-medium">
                  {selectedDates.length === 2 ? (
                    `${format(selectedDates[0], 'dd.MM.yyyy')} - ${format(selectedDates[1], 'dd.MM.yyyy')}`
                  ) : "Не выбран"}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Длительность:</span>
                <span className="font-medium">
                  {totalDays} {totalDays === 1 ? 'день' : totalDays < 5 ? 'дня' : 'дней'}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Стоимость в день:</span>
                <span className="font-medium">{car.price} ₽</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Итого к оплате:</span>
                <span>{totalPrice} ₽</span>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex items-start">
                <Icon name="Info" className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  Для завершения бронирования необходимо внести предоплату в размере 30% от общей стоимости. Остаток суммы вы оплатите при получении автомобиля.
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleBooking}>Подтвердить бронирование</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarDetail;
