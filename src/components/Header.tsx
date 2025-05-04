
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="w-full py-4 px-6 bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-blue-600">АвтоПрокат</h1>
        </div>
        
        <NavigationMenu>
          <NavigationMenuList className="flex gap-6">
            <NavigationMenuItem>
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Главная
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/catalog" className="text-gray-700 hover:text-blue-600 transition-colors">
                Каталог
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                О нас
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/contacts" className="text-gray-700 hover:text-blue-600 transition-colors">
                Контакты
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link to="/login">Вход</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Регистрация</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
