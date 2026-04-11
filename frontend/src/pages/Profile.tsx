
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Import the components we created
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import OverviewTab from "@/components/profile/OverviewTab";
import OrdersTab from "@/components/profile/OrdersTab";
import BidsTab from "@/components/profile/BidsTab";
import RecommendedTab from "@/components/profile/RecommendedTab";

// Define interfaces for our data types
interface UserInfo {
  name: string;
  email: string;
  accountType: string;
  memberSince: string;
  avatar: string;
}

interface OrderItem {
  id: string;
  item: string;
  date: string;
  status: string;
  amount: string;
  image: string;
}

interface BidItem {
  id: string;
  item: string;
  date: string;
  status: string;
  bidAmount: string;
  currentBid: string;
  endsIn: string;
  image: string;
}

interface AuctionItem {
  id: string;
  title: string;
  currentBid: string;
  endsIn: string;
  image: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "Shipped":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "Winning":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "Outbid":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "Won":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [myOrders, setMyOrders] = useState<OrderItem[]>([]);
  const [myBids, setMyBids] = useState<BidItem[]>([]);
  const [recommendedAuctions, setRecommendedAuctions] = useState<AuctionItem[]>([]);
  
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  // Fetch user data and bid history
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Set user info from auth context
        setUserInfo({
          name: user.full_name || 'User',
          email: user.email,
          accountType: user.role === 'seller' ? 'Seller' : 'User',
          memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          avatar: user.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        });
        
        // Fetch user bids
        const bidsResponse = await axios.get('/api/bids/my-bids');
        
        if (bidsResponse.data && bidsResponse.data.bids) {
          const formattedBids = bidsResponse.data.bids.map(bid => ({
            id: bid._id,
            item: bid.auction_id?.title || 'Unknown Item',
            date: new Date(bid.bid_time).toLocaleDateString(),
            status: bid.is_winning ? 'Winning' : bid.status.charAt(0).toUpperCase() + bid.status.slice(1),
            bidAmount: `₹${bid.amount.toLocaleString()}`,
            currentBid: `₹${bid.auction_id?.current_price.toLocaleString() || bid.amount.toLocaleString()}`,
            endsIn: bid.auction_id?.status === 'ended' ? 'Ended' : getTimeRemaining(bid.auction_id?.end_time),
            image: bid.auction_id?.images?.[0] || "https://placehold.co/300x200?text=No+Image"
          }));
          
          setMyBids(formattedBids);
        }
        
        // Fetch user orders (transactions)
        const ordersResponse = await axios.get('/api/payments/my-transactions');
        
        if (ordersResponse.data && ordersResponse.data.transactions) {
          const formattedOrders = ordersResponse.data.transactions.map(transaction => ({
            id: transaction._id,
            item: transaction.auction_id?.title || 'Unknown Item',
            date: new Date(transaction.created_at).toLocaleDateString(),
            status: transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1),
            amount: `₹${transaction.amount.toLocaleString()}`,
            image: transaction.auction_id?.images?.[0] || "https://placehold.co/300x200?text=No+Image"
          }));
          
          setMyOrders(formattedOrders);
        }
        
        // Fetch recommended auctions
        const recommendedResponse = await axios.get('/api/auctions/recommended');
        
        if (recommendedResponse.data && recommendedResponse.data.auctions) {
          const formattedRecommended = recommendedResponse.data.auctions.map(auction => ({
            id: auction._id,
            title: auction.title,
            currentBid: `₹${auction.current_price.toLocaleString()}`,
            endsIn: getTimeRemaining(auction.end_time),
            image: auction.images?.[0] || "https://placehold.co/300x200?text=No+Image"
          }));
          
          setRecommendedAuctions(formattedRecommended);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, navigate]);
  
  // Helper function to calculate time remaining
  const getTimeRemaining = (endTime: string | Date | undefined) => {
    if (!endTime) return 'Unknown';
    
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const distance = end - now;
    
    if (distance < 0) return 'Ended';
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("You've been successfully logged out");
      
      // Navigate to home page after logout
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };
  
  // Show loading state
  if (loading || !userInfo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-20 pb-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile Sidebar */}
            <div className="lg:col-span-1">
              <ProfileSidebar 
                userInfo={userInfo} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                onLogout={() => setLogoutDialogOpen(true)}
                onEditProfile={() => navigate('/profile-edit')}
              />
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
                <Button
                  onClick={() => navigate('/profile-edit')}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="orders">My Orders</TabsTrigger>
                  <TabsTrigger value="bids">My Bids</TabsTrigger>
                  <TabsTrigger value="recommended">Recommended</TabsTrigger>
                </TabsList>
                
                {/* Overview Tab */}
                <TabsContent value="overview">
                  <OverviewTab 
                    orders={myOrders}
                    bids={myBids}
                    recommendedAuctions={recommendedAuctions}
                    getStatusColor={getStatusColor}
                    loading={loading}
                  />
                </TabsContent>
                
                {/* Orders Tab */}
                <TabsContent value="orders">
                  <OrdersTab 
                    orders={myOrders}
                    getStatusColor={getStatusColor}
                    loading={loading}
                  />
                </TabsContent>
                
                {/* Bids Tab */}
                <TabsContent value="bids">
                  <BidsTab 
                    bids={myBids}
                    getStatusColor={getStatusColor}
                    loading={loading}
                  />
                </TabsContent>
                
                {/* Recommended Tab */}
                <TabsContent value="recommended">
                  <RecommendedTab 
                    recommendedAuctions={recommendedAuctions}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Logout Confirmation Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be logged out of your BidBlaze account on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-500 hover:bg-red-600">
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
