
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const upcomingAuctions = [
  {
    id: "1",
    title: "Vintage Rolex Collection",
    time: "Tomorrow, 2:00 PM",
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: "2",
    title: "Rare Art Pieces Auction",
    time: "Today, 8:00 PM",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    id: "3",
    title: "Classic Cars Exhibition",
    time: "Jul 15, 10:00 AM",
    image: "https://images.unsplash.com/photo-1567808291548-fc3ee04dbcf0?auto=format&fit=crop&q=80&w=100&h=100",
  }
];

export const NotificationsDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-200 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center text-[10px] text-white">
            3
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Upcoming Auctions</h3>
            <Button variant="link" size="sm" className="p-0 h-auto">
              Mark all as read
            </Button>
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {upcomingAuctions.map((auction) => (
            <DropdownMenuItem key={auction.id} asChild>
              <Link to={`/auctions/${auction.id}`} className="flex items-start gap-3 py-3 cursor-pointer">
                <img 
                  src={auction.image} 
                  alt={auction.title} 
                  className="h-10 w-10 rounded-md object-cover"
                />
                <div>
                  <p className="font-medium text-sm">{auction.title}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">{auction.time}</p>
                </div>
              </Link>
            </DropdownMenuItem>
          ))}
        </div>
        <div className="p-2 border-t">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to="/notifications">
              View All Notifications
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
