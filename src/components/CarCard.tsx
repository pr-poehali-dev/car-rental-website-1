
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface CarProps {
  id: string;
  name: string;
  image: string;
  price: number;
  type: string;
  seats: number;
  transmission: "Автомат" | "Механика";
}

const CarCard = ({ car }: { car: CarProps }) => {
  return (
    <Card className="w-full overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 w-full overflow-hidden">
        <img 
          src={car.image} 
          alt={car.name} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle>{car.name}</CardTitle>
        <CardDescription>{car.type}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-between text-sm mb-2">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {car.seats} мест
          </span>
          <span>{car.transmission}</span>
        </div>
        <div className="text-xl font-bold text-blue-600">{car.price} ₽/день</div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Забронировать</Button>
      </CardFooter>
    </Card>
  );
};

export default CarCard;
