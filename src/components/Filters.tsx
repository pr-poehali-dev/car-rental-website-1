
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface FiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  carClass: string;
  priceRange: [number, number];
  transmission: string;
  hasAC: boolean;
  seats: string;
}

const Filters = ({ onFilterChange }: FiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    carClass: "",
    priceRange: [1000, 10000],
    transmission: "",
    hasAC: false,
    seats: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handlePriceChange = (value: number[]) => {
    setFilters(prev => {
      const newFilters = { ...prev, priceRange: [value[0], value[1]] };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFilters(prev => {
      const newFilters = { ...prev, hasAC: checked };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handleReset = () => {
    const resetFilters = {
      search: "",
      carClass: "",
      priceRange: [1000, 10000],
      transmission: "",
      hasAC: false,
      seats: "",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Фильтры</h2>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="search">Поиск по названию</Label>
          <Input 
            id="search"
            name="search"
            value={filters.search}
            onChange={handleInputChange}
            placeholder="Введите название"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="carClass">Класс автомобиля</Label>
          <Select 
            value={filters.carClass} 
            onValueChange={(value) => handleSelectChange("carClass", value)}
          >
            <SelectTrigger id="carClass" className="mt-1">
              <SelectValue placeholder="Выберите класс" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все классы</SelectItem>
              <SelectItem value="economy">Эконом</SelectItem>
              <SelectItem value="comfort">Комфорт</SelectItem>
              <SelectItem value="business">Бизнес</SelectItem>
              <SelectItem value="premium">Премиум</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex justify-between">
            <Label>Цена в день</Label>
            <span className="text-sm text-gray-500">
              {filters.priceRange[0]} ₽ - {filters.priceRange[1]} ₽
            </span>
          </div>
          <Slider 
            className="mt-2" 
            defaultValue={[1000, 10000]} 
            max={10000} 
            min={1000} 
            step={500}
            value={filters.priceRange}
            onValueChange={handlePriceChange}
          />
        </div>

        <div>
          <Label htmlFor="transmission">Коробка передач</Label>
          <Select 
            value={filters.transmission} 
            onValueChange={(value) => handleSelectChange("transmission", value)}
          >
            <SelectTrigger id="transmission" className="mt-1">
              <SelectValue placeholder="Любая КПП" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Любая</SelectItem>
              <SelectItem value="automatic">Автомат</SelectItem>
              <SelectItem value="manual">Механика</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="seats">Количество мест</Label>
          <Select 
            value={filters.seats} 
            onValueChange={(value) => handleSelectChange("seats", value)}
          >
            <SelectTrigger id="seats" className="mt-1">
              <SelectValue placeholder="Выберите" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Любое</SelectItem>
              <SelectItem value="2">2 места</SelectItem>
              <SelectItem value="4">4 места</SelectItem>
              <SelectItem value="5">5 мест</SelectItem>
              <SelectItem value="7">7 мест</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch 
            id="hasAC" 
            checked={filters.hasAC}
            onCheckedChange={handleSwitchChange}
          />
          <Label htmlFor="hasAC">Кондиционер</Label>
        </div>

        <Separator />

        <Button variant="outline" className="w-full" onClick={handleReset}>
          Сбросить все фильтры
        </Button>
      </div>
    </div>
  );
};

export default Filters;
