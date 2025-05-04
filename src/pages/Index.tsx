
import Header from "@/components/Header";
import CarCard, { CarProps } from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Index = () => {
  // Демо-данные для автомобилей
  const cars: CarProps[] = [
    {
      id: "1",
      name: "Toyota Camry",
      image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      price: 3000,
      type: "Седан",
      seats: 5,
      transmission: "Автомат"
    },
    {
      id: "2",
      name: "Kia Rio",
      image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      price: 2000,
      type: "Седан",
      seats: 5,
      transmission: "Механика"
    },
    {
      id: "3",
      name: "Hyundai Creta",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      price: 2500,
      type: "Кроссовер",
      seats: 5,
      transmission: "Автомат"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[500px]">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
          alt="Автопарк" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 container mx-auto flex flex-col justify-center items-start px-6">
          <h1 className="text-5xl font-bold text-white mb-4">Аренда автомобилей в вашем городе</h1>
          <p className="text-xl text-white/90 mb-6 max-w-2xl">Широкий выбор автомобилей разных классов по доступным ценам. Быстрое оформление и выдача.</p>
          <Button size="lg" className="text-lg px-8">Забронировать сейчас</Button>
        </div>
      </section>
      
      {/* Search Section */}
      <section className="py-8 bg-white shadow-md relative -mt-12 z-30 container mx-auto rounded-lg px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Модель</label>
            <Input type="text" placeholder="Любая модель" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Класс</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Выберите класс" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economy">Эконом</SelectItem>
                <SelectItem value="comfort">Комфорт</SelectItem>
                <SelectItem value="business">Бизнес</SelectItem>
                <SelectItem value="premium">Премиум</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Даты аренды</label>
            <Input type="text" placeholder="Выберите даты" />
          </div>
          <div className="flex items-end">
            <Button className="w-full">Найти</Button>
          </div>
        </div>
      </section>
      
      {/* Popular Cars Section */}
      <section className="py-16 container mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8">Популярные автомобили</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map(car => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button variant="outline" size="lg">Смотреть все автомобили</Button>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Почему выбирают нас</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Быстрое оформление</h3>
              <p className="text-gray-600">Оформление договора занимает не более 15 минут. Минимум документов и формальностей.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path d="m15.5 3.5-2.5 1.5L10.5 3 8 4.5 5 3v13.5L8 18l2.5-1.5L13 18l2.5-1.5 2.5 1.5V5l-2.5-1.5Z" />
                  <path d="m5 3 2.5 1.5L10 3l2.5 1.5L15 3l2.5 1.5L20 3" />
                  <path d="M5 9h15" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Страховка включена</h3>
              <p className="text-gray-600">Все наши автомобили застрахованы по КАСКО и ОСАГО. Вы в полной безопасности.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Техническая поддержка</h3>
              <p className="text-gray-600">Круглосуточная поддержка на дороге. Мы всегда на связи и готовы помочь.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Готовы к поездке?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Забронируйте автомобиль прямо сейчас и получите скидку 10% на первую поездку</p>
          <Button size="lg" variant="secondary" className="text-lg px-8">Забронировать автомобиль</Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">АвтоПрокат</h3>
              <p className="text-gray-400">Аренда автомобилей в вашем городе с 2010 года. Качество и надежность - наш приоритет.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Информация</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">О компании</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Условия аренды</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Часто задаваемые вопросы</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Блог</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">г. Москва, ул. Примерная, 123</li>
                <li className="text-gray-400">+7 (999) 123-45-67</li>
                <li className="text-gray-400">info@autopro.ru</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Мы в социальных сетях</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-blue-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-red-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                    <path d="m10 15 5-3-5-3z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 АвтоПрокат. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
