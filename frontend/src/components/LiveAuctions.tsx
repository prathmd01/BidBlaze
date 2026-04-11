import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AuctionCard from "./AuctionCard";
import { ArrowRight, ChevronLeft, ChevronRight, Filter, ListFilter, SlidersHorizontal } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

// Categories - Aligned with backend enum values
const CATEGORIES = ["All", "watches", "art", "jewelry", "cars", "books", "electronics", "collectibles", "other"];

// Display names for categories (for UI)
const CATEGORY_DISPLAY_NAMES = {
  "watches": "Watches",
  "art": "Art",
  "jewelry": "Jewelry",
  "cars": "Cars",
  "books": "Books",
  "electronics": "Electronics",
  "collectibles": "Collectibles",
  "other": "Other"
};

const LiveAuctions = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        // Make sure the API endpoint matches the backend server port (8080)
        console.log('Fetching auctions from API...');
        const response = await axios.get('http://localhost:8080/api/auctions', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          // Add withCredentials if your API requires authentication
          // withCredentials: true
        });
        
        console.log('Auction API response:', response.data); // Add logging to debug
        
        if (response.data && response.data.auctions) {
          // Transform backend data to match the format expected by AuctionCard
          const transformedAuctions = response.data.auctions.map(auction => ({
            id: auction._id, // Use MongoDB ObjectID
            title: auction.title,
            currentBid: auction.current_price,
            bids: auction.total_bids || 0,
            timeRemaining: calculateTimeRemaining(auction.end_time),
            imageUrl: auction.images?.[0]?.url || "https://placehold.co/600x400?text=No+Image",
            category: auction.category,
            isExternal: false
          }));
          console.log('Transformed auctions:', transformedAuctions);
          setAuctions(transformedAuctions);
        } else {
          console.warn('No auctions data in response or unexpected response format:', response.data);
          setAuctions([]);
        }
      } catch (error) {
        console.error('Error fetching auctions:', error);
        // Log more detailed error information
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Error request:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', error.message);
        }
        
        toast.error('Failed to load auctions');
        // Fall back to empty array, don't use mock data
        setAuctions([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuctions();
  }, []);
  
  // Helper function to calculate time remaining
  const calculateTimeRemaining = (endTimeStr) => {
    const endTime = new Date(endTimeStr);
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };
  
  const filteredAuctions = activeCategory === "All" 
    ? auctions 
    : auctions.filter(auction => {
        // Convert both to lowercase for case-insensitive comparison
        const auctionCategory = auction.category?.toLowerCase();
        const selectedCategory = activeCategory.toLowerCase();
        return auctionCategory === selectedCategory;
      });
  
  return (
    <section className="py-12 bg-transparent">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2 tracking-tight">Live Auctions</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Discover and bid on amazing items from around the world
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <Button variant="outline" size="sm" className="rounded-full">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="rounded-full">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Sort
            </Button>
            <Button size="sm" className="rounded-full">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      
        {/* Category Filters */}
        <div className="relative mb-8">
          <div className="absolute left-0 top-0 bottom-0 flex items-center">
            <Button variant="ghost" size="icon" className="rounded-full shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 px-12 overflow-x-auto py-2 no-scrollbar">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                className="rounded-full whitespace-nowrap"
                onClick={() => setActiveCategory(category)}
              >
                {category === "All" ? "All" : CATEGORY_DISPLAY_NAMES[category]}
              </Button>
            ))}
          </div>
          
          <div className="absolute right-0 top-0 bottom-0 flex items-center">
            <Button variant="ghost" size="icon" className="rounded-full shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading auctions...</p>
          </div>
        )}
        
        {/* Empty state */}
        {!loading && filteredAuctions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No auctions found. Please check back later.</p>
          </div>
        )}
        
        {/* Grid of auction cards */}
        {!loading && filteredAuctions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions.map((auction) => (
              <AuctionCard key={auction.id} {...auction} />
            ))}
          </div>
        )}
        
        {/* Load more button */}
        {!loading && filteredAuctions.length > 0 && (
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" className="rounded-full">
              Load More Auctions
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default LiveAuctions;