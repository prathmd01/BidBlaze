
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Clock, Building, Car, Home, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Sample data for external auctions
const EXTERNAL_PLATFORMS = [
  {
    id: "eauction",
    name: "eAuction",
    description: "Government e-Auctions Platform",
    logo: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=100&h=100",
    url: "https://eauction.gov.in/eauction/#/",
    auctions: [
      {
        id: "e1",
        title: "Government Land Parcel - Delhi NCR",
        category: "Real Estate",
        currentBid: "₹1,20,00,000",
        timeRemaining: "3 days",
        image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=600&h=400",
        location: "Delhi, India",
        description: "Prime government land parcel in Delhi NCR region, measuring 2500 sq meters with commercial usage rights.",
        directBidSupported: false
      },
      {
        id: "e2",
        title: "Vintage Government Vehicles",
        category: "Vehicles",
        currentBid: "₹3,25,000",
        timeRemaining: "5 days",
        image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600&h=400",
        location: "Mumbai, India",
        description: "Collection of 10 vintage government vehicles including Ambassador cars in working condition.",
        directBidSupported: false
      }
    ]
  },
  {
    id: "salasar",
    name: "Salasar Auction",
    description: "Private Property Auctions",
    logo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100&h=100",
    url: "https://salasarauction.com/",
    auctions: [
      {
        id: "s1",
        title: "Commercial Complex - Bangalore",
        category: "Commercial",
        currentBid: "₹4,50,00,000",
        timeRemaining: "7 days",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600&h=400",
        location: "Bangalore, India",
        description: "3-story commercial complex in prime Bangalore location with 15,000 sq ft built-up area and 25 parking spaces.",
        directBidSupported: true
      },
      {
        id: "s2",
        title: "Industrial Equipment Package",
        category: "Industrial",
        currentBid: "₹78,50,000",
        timeRemaining: "2 days",
        image: "https://images.unsplash.com/photo-1581093806997-124204d4f475?auto=format&fit=crop&q=80&w=600&h=400",
        location: "Chennai, India",
        description: "Complete industrial equipment package including CNC machines, generators, and compressors from a closed factory.",
        directBidSupported: true
      }
    ]
  },
  {
    id: "ibapi",
    name: "IBAPI",
    description: "Bank-Seized Properties & Vehicles",
    logo: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=100&h=100",
    url: "https://ibapi.in/",
    auctions: [
      {
        id: "i1",
        title: "Luxury Apartment - Mumbai",
        category: "Residential",
        currentBid: "₹2,80,00,000",
        timeRemaining: "10 days",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600&h=400",
        location: "Mumbai, India",
        description: "Bank-seized 3BHK luxury apartment in South Mumbai with sea view, spanning 1800 sq ft with premium amenities.",
        directBidSupported: false
      },
      {
        id: "i2",
        title: "Premium Sedan Collection",
        category: "Vehicles",
        currentBid: "₹42,00,000",
        timeRemaining: "4 days",
        image: "https://images.unsplash.com/photo-1549925862-990918861ba9?auto=format&fit=crop&q=80&w=600&h=400",
        location: "New Delhi, India",
        description: "Collection of bank-seized luxury sedans including BMW 5 Series and Mercedes E-Class in excellent condition.",
        directBidSupported: false
      },
      {
        id: "i3",
        title: "Agricultural Land - Punjab",
        category: "Land",
        currentBid: "₹98,00,000",
        timeRemaining: "8 days",
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600&h=400",
        location: "Punjab, India",
        description: "Fertile agricultural land spanning 15 acres with irrigation facilities and farm equipment included.",
        directBidSupported: false
      }
    ]
  }
];

// Categories
const CATEGORIES = [
  { id: "all", name: "All Categories", icon: Search },
  { id: "residential", name: "Residential", icon: Home },
  { id: "commercial", name: "Commercial", icon: Building },
  { id: "vehicles", name: "Vehicles", icon: Car },
  { id: "land", name: "Land", icon: MapPin },
];

const ExternalAuctions = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter auctions based on search query and category
  const filterAuctions = (auctions) => {
    return auctions.filter(auction => {
      // First filter by category
      const categoryMatch = selectedCategory === "all" || 
                          auction.category.toLowerCase().includes(selectedCategory.toLowerCase());
      
      // Then filter by search query
      const searchMatch = searchQuery === "" || 
                        auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        auction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        auction.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      return categoryMatch && searchMatch;
    });
  };
  
  // Get all auctions from all platforms
  const getAllAuctions = () => {
    return EXTERNAL_PLATFORMS.flatMap(platform => 
      platform.auctions.map(auction => ({
        ...auction,
        platform: platform.name,
        platformUrl: platform.url,
        platformLogo: platform.logo
      }))
    );
  };
  
  const renderAuctionCard = (auction, platform = null) => {
    const auctionPlatform = platform || { 
      name: auction.platform, 
      url: auction.platformUrl, 
      logo: auction.platformLogo 
    };
    
    return (
      <Card key={auction.id} className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative h-48">
          <img
            src={auction.image}
            alt={auction.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400?text=No+Image"; }}
          />
          <div className="absolute top-2 left-2">
            <Badge className="bg-white text-primary hover:bg-gray-100">
              {auction.category}
            </Badge>
          </div>
          {platform && (
            <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-md px-2 py-1">
            <img 
              src={platform.logo} 
              alt={platform.name} 
              className="w-5 h-5 rounded-full"
              onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100?text=Logo"; }}
            />
              <span className="text-xs font-medium">{platform.name}</span>
            </div>
          )}
        </div>
        
        <CardHeader className="pb-2">
          <CardTitle className="text-lg line-clamp-1">{auction.title}</CardTitle>
          <CardDescription className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {auction.location}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
            {auction.description}
          </p>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Current bid</p>
              <p className="font-semibold">{auction.currentBid}</p>
            </div>
            
            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
              <Clock className="h-3 w-3" />
              <span className="text-xs font-medium">{auction.timeRemaining}</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-gray-50 dark:bg-gray-800/50 pt-3 pb-3">
          {auction.directBidSupported ? (
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button variant="outline" size="sm" className="w-full">
                Bid Now
              </Button>
              <Button 
                size="sm" 
                className="w-full" 
                onClick={() => window.open(platform ? platform.url : auction.platformUrl, "_blank")}
              >
                Visit Site
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button 
              className="w-full" 
              onClick={() => window.open(platform ? platform.url : auction.platformUrl, "_blank")}
            >
              View on {platform ? platform.name : auction.platform}
              <ExternalLink className="ml-1 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">External Auctions</h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
              Browse and bid on auctions from various external platforms. Some auctions allow bidding directly from BidBlaze, while others may redirect you to the respective platform.
            </p>
          </div>
          
          {/* Search and filter */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input 
                  placeholder="Search auctions by title, description, or location..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                {CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="whitespace-nowrap"
                  >
                    <category.icon className="mr-1 h-4 w-4" />
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Auction listings */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto no-scrollbar mb-6">
              <TabsTrigger value="all">All Platforms</TabsTrigger>
              {EXTERNAL_PLATFORMS.map(platform => (
                <TabsTrigger key={platform.id} value={platform.id} className="flex items-center gap-2">
                  <img 
                    src={platform.logo} 
                    alt={platform.name} 
                    className="w-5 h-5 rounded-full"
                  />
                  {platform.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {/* All platforms tab */}
            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterAuctions(getAllAuctions()).map(auction => (
                  renderAuctionCard(auction)
                ))}
              </div>
              
              {filterAuctions(getAllAuctions()).length === 0 && (
                <div className="text-center p-10">
                  <h3 className="text-lg font-medium">No auctions found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </TabsContent>
            
            {/* Individual platform tabs */}
            {EXTERNAL_PLATFORMS.map(platform => (
              <TabsContent key={platform.id} value={platform.id}>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                  <img 
                    src={platform.logo} 
                    alt={platform.name} 
                    className="w-8 h-8 rounded-full"
                    onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100?text=Logo"; }}
                  />
                    <div>
                      <h2 className="text-xl font-bold">{platform.name}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{platform.description}</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(platform.url, "_blank")}
                    className="mt-2"
                  >
                    Visit Official Website
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterAuctions(platform.auctions).map(auction => (
                    renderAuctionCard(auction, platform)
                  ))}
                </div>
                
                {filterAuctions(platform.auctions).length === 0 && (
                  <div className="text-center p-10">
                    <h3 className="text-lg font-medium">No auctions found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExternalAuctions;
