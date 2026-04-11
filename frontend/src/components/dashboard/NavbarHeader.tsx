import { Search, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/navbar/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarHeaderProps {
  userName?: string;
  onLogout?: () => void;
}

export default function NavbarHeader({ userName, onLogout }: NavbarHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-blue-500/20 bg-gradient-to-b from-gray-900/90 to-gray-900/70 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Logo />
          </div>

          <div className="flex items-center gap-3 w-full max-w-xl mx-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400/70" />
              <input
                type="text"
                placeholder="Search listings, categories, bidders…"
                className="w-full rounded-2xl pl-10 pr-4 py-2 bg-white/5 border border-blue-500/30 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <button className="relative p-2 rounded-full bg-white/5 border border-blue-500/30 hover:bg-white/10 transition-all">
              <Bell className="h-5 w-5 text-blue-300" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-pink-500 text-[10px] grid place-items-center text-white">3</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-2xl px-3 py-2 bg-white/5 border border-blue-500/30 hover:bg-white/10 transition">

                  <div className="text-sm text-left">
                    <div className="font-medium text-gray-100">{userName || 'Seller'}</div>
                    <div className="text-gray-400">Pro Account</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium text-gray-100">{userName || 'Seller'}</p>
                  <p className="text-xs text-gray-400">Pro Account</p>
                </div>
                <DropdownMenuItem onClick={() => navigate('/')}>Home</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/seller-dashboard?tab=my-auctions')}>Listings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/seller-dashboard?tab=analytics')}>Analytics</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/seller-dashboard?tab=messages')}>Messages</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/seller-dashboard?tab=settings')}>
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => (onLogout ? onLogout() : navigate('/'))} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}