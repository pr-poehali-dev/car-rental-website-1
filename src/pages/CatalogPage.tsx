
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import CarCard, { CarProps } from "@/components/CarCard";
import Filters, { FilterState } from "@/components/Filters";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CatalogPage = () => {
  // Demo data (в реальном проекте это будет приходить с сервера)
  const allCars: CarProps[] = [
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
    },
    {
      id: "4",
      name: "BMW X5",
      image: "https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      price: 8000,
      type: "Внедорожник",
      seats: 5,
      transmission: "Автомат"
    },
    {
      id: "5",
      name: "Mercedes E-Class",
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      price: 7000,
      type: "Седан",
      seats: 5,
      transmission: "Автомат"
    },
    {
      id: "6",
      name: "Volkswagen Polo",
      image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      price: 1500,
      type: "Хэтчбек",
      seats: 5,
      transmission: "Механика"
    }
  ];

  const [cars, setCars] = useState<CarProps[]>(allCars);
  const [sortOrder, setSortOrder] = useState("default");
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    search: "",
    carClass: "",
    priceRange: [1000, 10000],
    transmission: "",
    hasAC: false,
    seats: "",
  });

  // Применить фильтры и сортировку к списку машин
  useEffect(() => {
    let filteredCars = [...allCars];
    
    // Фильтрация по поиску
    if (currentFilters.search) {
      filteredCars = filteredCars.filter(car => 
        car.name.toLowerCase().includes(currentFilters.search.toLowerCase())
      );
    }
    
    // Фильтрация по цене
    filteredCars = filteredCars.filter(car => 
      car.price >= currentFilters.priceRange[0] && car.price <= currentFilters.priceRange[1]
    );
    
    // Фильтрация по трансмиссии
    if (currentFilters.transmission) {
      const transmissionMap = {
        "automatic": "Автомат",
        "manual": "Механика"
      };
      filteredCars = filteredCars.filter(car => 
        car.transmission === transmissionMap[currentFilters.transmission as keyof typeof transmissionMap]
      );
    }
    
    // Фильтрация по количеству мест
    if (currentFilters.seats) {
      filteredCars = filteredCars.filter(car => 
        car.seats === parseInt(currentFilters.seats)
      );
    }
    
    // Сортировка
    if (sortOrder === "price-asc") {
      filteredCars.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "price-desc") {
      filteredCars.sort((a, b) => b.price - a.price);
    } else if (sortOrder === "name-asc") {
      filteredCars.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    setCars(filteredCars);
  }, [currentFilters, sortOrder]);

  const handleFilterChange = (filters: FilterState) => {
    setCurrentFilters(filters);
  };

  const handleSortChange = (value: string) => {
    setSortOrder(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page title */}
      <div className="bg-blue-600 py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold text-white">Каталог автомобилей</h1>
          <p className="text-xl text-white/90 mt-2">Выберите подходящий автомобиль для вашей поездки</p>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters sidebar */}
          <div className="w-full md:w-1/4">
            <Filters onFilterChange={handleFilterChange} />
          </div>
          
          {/* Cars grid */}
          <div className="w-full md:w-3/4">
            {/* Sort controls */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">Найдено автомобилей: {cars.length}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Сортировать по:</span>
                <Select value={sortOrder} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="По умолчанию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">По умолчанию</SelectItem>
                    <SelectItem value="price-asc">Сначала дешевле</SelectItem>
                    <SelectItem value="price-desc">Сначала дороже</SelectItem>
                    <SelectItem value="name-asc">По названию</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Cars grid */}
            {cars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map(car => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Нет автомобилей, соответствующих фильтрам</h3>
                <p className="text-gray-600 mb-6">Попробуйте изменить параметры поиска</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCurrentFilters({
                      search: "",
                      carClass: "",
                      priceRange: [1000, 10000],
                      transmission: "",
                      hasAC: false,
                      seats: "",
                    });
                  }}
                >
                  Сбросить фильтры
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer CTA section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Не нашли подходящий автомобиль?</h2>
          <p className="text-xl mb-6 max-w-2xl mx-auto">Свяжитесь с нами, и мы подберем для вас оптимальный вариант</p>
          <Button size="lg">Связаться с нами</Button>
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;
