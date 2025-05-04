
import { CarProps } from "@/components/CarCard";
import { apiClient } from "./api-client";

// Типы данных для API
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CarCreateData {
  name: string;
  image: string;
  price: number;
  type: string;
  seats: number;
  transmission: "Автомат" | "Механика";
  isAvailable?: boolean;
  description?: string;
}

// Получение списка автомобилей
export const fetchCars = async (
  page = 1, 
  limit = 10, 
  filters?: Record<string, any>
): Promise<PaginatedResponse<CarProps>> => {
  // В реальном проекте здесь будет вызов API через apiClient
  console.log("API call: fetchCars", { page, limit, filters });
  
  // Имитация запроса через apiClient
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }
  
  // В реальном проекте:
  // return apiClient.get<PaginatedResponse<CarProps>>(`/cars?${queryParams.toString()}`);
  
  // Имитация запроса
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Заглушка данных
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
  
  return {
    data: cars,
    total: 6,
    page,
    limit
  };
};

// Получение автомобиля по ID
export const fetchCarById = async (id: string): Promise<CarProps> => {
  console.log("API call: fetchCarById", { id });
  
  // В реальном проекте:
  // return apiClient.get<CarProps>(`/cars/${id}`);
  
  // Имитация запроса
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Заглушка данных
  const car: CarProps = {
    id,
    name: "Toyota Camry",
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    price: 3000,
    type: "Седан",
    seats: 5,
    transmission: "Автомат"
  };
  
  return car;
};

// Создание нового автомобиля
export const createCar = async (data: CarCreateData): Promise<CarProps> => {
  console.log("API call: createCar", { data });
  
  // В реальном проекте:
  // return apiClient.post<CarProps>('/cars', data);
  
  // Имитация запроса
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Заглушка ответа
  const newCar: CarProps = {
    id: Math.random().toString(36).substr(2, 9),
    ...data
  };
  
  return newCar;
};

// Обновление автомобиля
export const updateCar = async (id: string, data: Partial<CarCreateData>): Promise<CarProps> => {
  console.log("API call: updateCar", { id, data });
  
  // В реальном проекте:
  // return apiClient.patch<CarProps>(`/cars/${id}`, data);
  
  // Имитация запроса
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Заглушка ответа
  const updatedCar: CarProps = {
    id,
    name: data.name || "Toyota Camry",
    image: data.image || "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    price: data.price || 3000,
    type: data.type || "Седан",
    seats: data.seats || 5,
    transmission: data.transmission || "Автомат"
  };
  
  return updatedCar;
};

// Удаление автомобиля
export const deleteCar = async (id: string): Promise<boolean> => {
  console.log("API call: deleteCar", { id });
  
  // В реальном проекте:
  // await apiClient.delete(`/cars/${id}`);
  // return true;
  
  // Имитация запроса
  await new Promise(resolve => setTimeout(resolve, 700));
  
  return true;
};

// Аутентификация администратора
export const adminLogin = async (username: string, password: string) => {
  console.log("API call: adminLogin", { username });
  
  // В реальном проекте используем apiClient
  // return apiClient.login(username, password);
  
  // Имитация запроса - в реальном приложении будет использоваться apiClient.login
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (username === "admin" && password === "admin") {
    return {
      tokens: {
        accessToken: "mock-jwt-token-for-admin",
        refreshToken: "mock-refresh-token",
        expiresAt: Date.now() + 3600 * 1000 // истекает через час
      },
      user: {
        id: "1",
        name: "Администратор",
        role: "admin"
      }
    };
  }
  
  throw new Error("Неверный логин или пароль");
};
