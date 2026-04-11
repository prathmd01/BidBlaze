
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

export const MobileMenu = ({ isOpen, onClose, onSignOut }: MobileMenuProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getUserDisplayName = () => {
    if (user?.full_name) return user.full_name;
    if (user?.email) return user.email.split('@')[0];
    return "User";
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white dark:bg-gray-900 absolute left-0 right-0 top-full shadow-md animate-fade-in">
      <div className="py-4 px-4 space-y-3">
        <Link 
          to="/" 
          className="block py-2 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
          onClick={onClose}
        >
          Home
        </Link>
        <Link 
          to="/auctions" 
          className="block py-2 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
          onClick={onClose}
        >
          Auctions
        </Link>
        <div className="py-2">
          <button 
            className="flex items-center text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary w-full justify-between"
            onClick={(e) => {
              e.preventDefault();
              const submenu = document.getElementById('categories-submenu');
              if (submenu) {
                submenu.classList.toggle('hidden');
              }
            }}
          >
            <span>Categories</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          <div id="categories-submenu" className="hidden pl-4 mt-2 space-y-2">
            <Link 
              to="/auctions?category=watches" 
              className="block py-1 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
              onClick={onClose}
            >
              Watches
            </Link>
            <Link 
              to="/auctions?category=art" 
              className="block py-1 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
              onClick={onClose}
            >
              Art
            </Link>
            <Link 
              to="/auctions?category=jewelry" 
              className="block py-1 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
              onClick={onClose}
            >
              Jewelry
            </Link>
            <Link 
              to="/auctions?category=cars" 
              className="block py-1 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
              onClick={onClose}
            >
              Cars
            </Link>
            <Link 
              to="/auctions?category=books" 
              className="block py-1 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
              onClick={onClose}
            >
              Books
            </Link>
          </div>
        </div>
        <Link 
          to="/about" 
          className="block py-2 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
          onClick={onClose}
        >
          About
        </Link>
        
        {user ? (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{getUserDisplayName()}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <Link 
              to="/user-profile" 
              className="block py-2 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary"
              onClick={onClose}
            >
              Profile
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start p-2 text-red-600 hover:text-red-700"
              onClick={() => {
                onSignOut();
                onClose();
              }}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => {
                navigate('/auth');
                onClose();
              }}
            >
              Sign In
            </Button>
            <Button 
              className="w-full"
              onClick={() => {
                navigate('/auth');
                onClose();
              }}
            >
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
