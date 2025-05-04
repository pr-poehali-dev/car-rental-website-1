
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import CarCard, { CarProps } from "@/components/CarCard";
import Filters, { FilterState } from "@/components/Filters";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchCars, PaginatedResponse } from "@/lib/api";
import { useApiQuery } from "@/hooks/use-api-query";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CatalogPage = () => {
  const [sortOrder, setSortOrder] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    search: "",
    carClass: "",
    priceRange: [1000, 10000],
    transmission: "",
    hasAC: false,
    seats: "",
  });

  // Преобразование фильтров для API
  const getApiFilters = () => {
    const filters: Record<string, any> = {};
    
    if (currentFilters.search) {
      filters.search = currentFilters.search;
    }
    
    if (currentFilters.carClass) {
      filters.carClass = currentFilters.carClass;
    }
    
    if (currentFilters.transmission) {
      filters.transmission = currentFilters.transmission;
    }
    
    if (currentFilters.seats) {
      filters.seats = currentFilters.seats;
    }
    
    if (currentFilters.hasAC) {
      filters.hasAC = currentFilters.hasAC;
    }
    
    filters.minPrice = currentFilters.priceRange[0];
    filters.maxPrice = currentFilters.priceRange[1];
    
    return filters;
  };

  // Используем хук для получения данных с API
  const { 
    data: carsData,
    isLoading,
    error,
    refetch
  } = useApiQuery<PaginatedResponse<CarProps>>({
    queryFn: () => fetchCars(currentPage, 10, getApiFilters()),
  });

  // Применяем локальную сортировку после получения данных
  const sortCars = (cars: CarProps[]): CarProps[] => {
    const sortedCars = [...cars];
    
    if (sortOrder === "price-asc") {
      sortedCars.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "price-desc") {
      sortedCars.sort((a, b) => b.price - a.price);
    } else if (sortOrder === "name-asc") {
      sortedCars.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return sortedCars;
  };

  const cars = carsData ? sortCars(carsData.data) : [];
  const totalCars = carsData?.total || 0;

  // Обновляем данные при изменении фильтров или страницы
  useEffect(() => {
    refetch();
  }, [currentFilters, currentPage]);

  const handleFilterChange = (filters: FilterState) => {
    setCurrentFilters(filters);
    setCurrentPage(1); // Сбрасываем на первую страницу при изменении фильтров
  };

  const handleSortChange = (value: string) => {
    setSortOrder(value);
  };

  const handleResetFilters = () => {
    setCurrentFilters({
      search: "",
      carClass: "",
      priceRange: [1000, 10000],
      transmission: "",
      hasAC: false,
      seats: "",
    });
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
              <p className="text-gray-600">
                {isLoading 
                  ? "Загрузка автомобилей..." 
                  : `Найдено автомобилей: ${totalCars}`
                }
              </p>
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

            {/* Error message */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Ошибка</AlertTitle>
                <AlertDescription>
                  Произошла ошибка при загрузке автомобилей. Пожалуйста, попробуйте позже.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Loading state */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Cars grid */}
            {!isLoading && cars.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map(car => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && cars.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Нет автомобилей, соответствующих фильтрам</h3>
                <p className="text-gray-600 mb-6">Попробуйте изменить параметры поиска</p>
                <Button 
                  variant="outline" 
                  onClick={handleResetFilters}
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
