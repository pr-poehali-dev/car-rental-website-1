
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import AdminSidebar from "@/components/AdminSidebar";
import { fetchCars, createCar, deleteCar, CarProps, CarCreateData } from "@/lib/api";

const AdminCarsPage = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState<CarProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddCarDialogOpen, setIsAddCarDialogOpen] = useState(false);
  const [newCar, setNewCar] = useState<CarCreateData>({
    name: "",
    image: "",
    price: 0,
    type: "",
    seats: 5,
    transmission: "Автомат"
  });
  
  // Загрузка автомобилей при монтировании компонента
  useEffect(() => {
    loadCars();
  }, []);
  
  // Функция загрузки автомобилей
  const loadCars = async () => {
    setIsLoading(true);
    try {
      const response = await fetchCars(1, 100);
      setCars(response.data);
    } catch (error) {
      console.error("Ошибка при загрузке автомобилей:", error);
      // Здесь можно добавить отображение ошибки
    } finally {
      setIsLoading(false);
    }
  };
  
  // Фильтрация автомобилей по поисковому запросу
  const filteredCars = cars.filter(car => 
    car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Обработчик изменения полей формы добавления автомобиля
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCar(prev => ({
      ...prev,
      [name]: name === "price" || name === "seats" ? Number(value) : value
    }));
  };
  
  // Функция добавления нового автомобиля
  const handleAddCar = async () => {
    try {
      const createdCar = await createCar(newCar);
      setCars(prev => [...prev, createdCar]);
      setIsAddCarDialogOpen(false);
      setNewCar({
        name: "",
        image: "",
        price: 0,
        type: "",
        seats: 5,
        transmission: "Автомат"
      });
    } catch (error) {
      console.error("Ошибка при добавлении автомобиля:", error);
      // Здесь можно добавить отображение ошибки
    }
  };
  
  // Функция удаления автомобиля
  const handleDeleteCar = async (id: string) => {
    if (window.confirm("Вы действительно хотите удалить этот автомобиль?")) {
      try {
        await deleteCar(id);
        setCars(prev => prev.filter(car => car.id !== id));
      } catch (error) {
        console.error("Ошибка при удалении автомобиля:", error);
        // Здесь можно добавить отображение ошибки
      }
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Управление автомобилями</h1>
            <p className="text-gray-600">Просматривайте, добавляйте и редактируйте автомобили в вашем автопарке</p>
          </div>
          
          <Button onClick={() => setIsAddCarDialogOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Добавить автомобиль
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <Input
              placeholder="Поиск автомобилей..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Фото</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Мест</TableHead>
                  <TableHead>КПП</TableHead>
                  <TableHead className="text-right">Цена/день</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      Загрузка автомобилей...
                    </TableCell>
                  </TableRow>
                ) : filteredCars.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      Автомобили не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCars.map((car) => (
                    <TableRow key={car.id}>
                      <TableCell className="font-medium">{car.id}</TableCell>
                      <TableCell>
                        <img 
                          src={car.image} 
                          alt={car.name} 
                          className="h-10 w-16 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell>{car.name}</TableCell>
                      <TableCell>{car.type}</TableCell>
                      <TableCell>{car.seats}</TableCell>
                      <TableCell>{car.transmission}</TableCell>
                      <TableCell className="text-right">{car.price} ₽</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/cars/${car.id}/edit`)}>
                            Изменить
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteCar(car.id)}>
                            Удалить
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      {/* Диалог добавления автомобиля */}
      <Dialog open={isAddCarDialogOpen} onOpenChange={setIsAddCarDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Добавить новый автомобиль</DialogTitle>
            <DialogDescription>
              Заполните необходимую информацию для добавления нового автомобиля в автопарк.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Название</Label>
              <Input
                id="name"
                name="name"
                value={newCar.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">URL фото</Label>
              <Input
                id="image"
                name="image"
                value={newCar.image}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Цена/день</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={newCar.price.toString()}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Тип</Label>
              <Input
                id="type"
                name="type"
                value={newCar.type}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="seats" className="text-right">Мест</Label>
              <Input
                id="seats"
                name="seats"
                type="number"
                value={newCar.seats.toString()}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transmission" className="text-right">КПП</Label>
              <Select 
                value={newCar.transmission}
                onValueChange={(value) => setNewCar(prev => ({ ...prev, transmission: value as "Автомат" | "Механика" }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Автомат">Автомат</SelectItem>
                  <SelectItem value="Механика">Механика</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCarDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleAddCar}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCarsPage;
