
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const NavigationMenu = () => {
  return (
    <nav className="hidden md:flex items-center space-x-8">
      <Link 
        to="/" 
        className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors link-underline"
      >
        Home
      </Link>
      <Link 
        to="/auctions" 
        className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors link-underline"
      >
        Auctions
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors link-underline">
            Categories
            <ChevronDown className="h-4 w-4 ml-1" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          <DropdownMenuItem asChild>
            <Link to="/auctions?category=watches" className="cursor-pointer">Watches</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/auctions?category=art" className="cursor-pointer">Art</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/auctions?category=jewelry" className="cursor-pointer">Jewelry</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/auctions?category=cars" className="cursor-pointer">Cars</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/auctions?category=books" className="cursor-pointer">Books</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Link 
        to="/about" 
        className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors link-underline"
      >
        About
      </Link>
    </nav>
  );
};
