
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, User, LogOut, Settings, Package, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

export const UserDropdown = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getUserDisplayName = () => {
    if (user?.full_name) return user.full_name;
    if (user?.email) return user.email.split('@')[0];
    return "User";
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 p-2 h-auto">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-200">
            {getUserDisplayName()}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2 border-b">
          <p className="text-sm font-medium">{getUserDisplayName()}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <DropdownMenuItem asChild>
          <Link to="/user-profile" className="cursor-pointer">
            <User className="h-4 w-4 mr-2" />
            View Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile-edit" className="cursor-pointer">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Link>
        </DropdownMenuItem>
        {user.role === 'seller' && (
          <DropdownMenuItem asChild>
            <Link to="/seller-dashboard" className="cursor-pointer">
              <Package className="h-4 w-4 mr-2" />
              Seller Dashboard
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
