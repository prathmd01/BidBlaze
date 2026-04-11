
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  ShoppingBag, 
  Clock, 
  Heart, 
  Settings, 
  LogOut,
  Camera
} from "lucide-react";

interface ProfileSidebarProps {
  userInfo: {
    name: string;
    email: string;
    accountType: string;
    memberSince: string;
    avatar: string;
  };
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onEditProfile?: () => void;
}

const ProfileSidebar = ({ 
  userInfo, 
  activeTab, 
  setActiveTab, 
  onLogout,
  onEditProfile
}: ProfileSidebarProps) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
        <div className="relative inline-block">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
            <AvatarFallback>{userInfo.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <Button
            size="sm"
            variant="outline"
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full p-0 border-2 border-white dark:border-gray-800"
            onClick={() => onEditProfile ? onEditProfile() : navigate('/profile-edit')}
          >
            <Camera className="h-3 w-3" />
          </Button>
        </div>
        <h2 className="text-xl font-bold">{userInfo.name}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{userInfo.email}</p>
        <Badge className="mt-2">{userInfo.accountType}</Badge>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Member since {userInfo.memberSince}
        </p>
      </div>
      
      <div className="p-4">
        <nav className="space-y-2">
          <Button 
            variant={activeTab === "overview" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("overview")}
          >
            <BarChart3 className="mr-2 h-4 w-4" /> Overview
          </Button>
          <Button 
            variant={activeTab === "orders" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("orders")}
          >
            <ShoppingBag className="mr-2 h-4 w-4" /> My Orders
          </Button>
          <Button 
            variant={activeTab === "bids" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("bids")}
          >
            <Clock className="mr-2 h-4 w-4" /> My Bids
          </Button>
          <Button 
            variant={activeTab === "recommended" ? "default" : "ghost"} 
            className="w-full justify-start" 
            onClick={() => setActiveTab("recommended")}
          >
            <Heart className="mr-2 h-4 w-4" /> Recommended
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-500 dark:text-gray-400"
          >
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </nav>
      </div>
    </div>
  );
};

export default ProfileSidebar;
