
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Heart, ExternalLink, Activity, Users } from "lucide-react";
import { getRupeeSymbol } from "@/lib/currency";
import { formatRupees } from "@/lib/currency";

interface AuctionCardProps {
  id: string;
  title: string;
  currentBid: number;
  bids: number;
  timeRemaining: string;
  imageUrl: string;
  isExternal?: boolean;
  externalUrl?: string;
  category: string;
}

const AuctionCard = ({
  id,
  title,
  currentBid,
  bids,
  timeRemaining,
  imageUrl,
  isExternal = false,
  externalUrl = "",
  category,
}: AuctionCardProps) => {
  const [liked, setLiked] = useState(false);
  
  return (
    <div className="rounded-xl overflow-hidden backdrop-blur-md bg-white/10 dark:bg-gray-800/30 border border-gray-200/30 dark:border-gray-700/30 shadow-sm hover-card group transition-all duration-300">
      {/* Card Header - Image */}
      <div className="h-48 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10 mix-blend-overlay z-0"></div>
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 z-0" 
        />
        
        {isExternal && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-orange-500/20 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400 rounded-full backdrop-blur-md text-xs font-medium">
            External
          </div>
        )}
        
        <div className="absolute top-3 right-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-white/20 dark:bg-gray-900/20 backdrop-blur-md hover:bg-white/30 dark:hover:bg-gray-900/30 text-gray-700 dark:text-gray-200 rounded-full"
            onClick={() => setLiked(!liked)}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""} transition-colors`} />
          </Button>
        </div>
        
        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/30 text-white backdrop-blur-md rounded-full text-xs font-medium">
          {category}
        </div>
        
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/30 text-white backdrop-blur-md rounded-full text-xs font-medium flex items-center group-hover:bg-primary/70 transition-colors">
          <Clock className="h-3 w-3 mr-1" />
          {timeRemaining}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* Card Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Bid</p>
            <p className="text-lg font-bold text-gradient">{formatRupees(currentBid)}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bids</p>
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
                <p className="font-medium">{bids}</p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Activity</p>
              <div className="flex items-center">
                <Activity className="h-3 w-3 mr-1 text-green-500" />
                <p className="font-medium text-green-500">High</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Card Actions */}
        <div className="flex gap-2">
          {isExternal ? (
            <Button className="w-full rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" onClick={() => window.open(externalUrl, "_blank")}>
              Visit Site
              <ExternalLink className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="w-1/2 rounded-lg backdrop-blur-sm bg-white/10 dark:bg-gray-800/10 border-gray-200/50 dark:border-gray-700/50 hover:bg-primary/10 hover:text-primary"
              >
                <Link to={`/bid/${id}`} className="flex items-center w-full justify-center">
                  <span className="h-4 w-4 mr-1 text-lg font-bold">{getRupeeSymbol()}</span>
                  Bid Now
                </Link>
              </Button>
              <Button className="w-1/2 rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                <Link to={`/bid/${id}`} className="w-full">
                  View Details
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;
