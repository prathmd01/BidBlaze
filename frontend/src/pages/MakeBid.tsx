import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Users,
  DollarSign,
  Eye,
  Heart,
  Share2,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Shield,
  MapPin,
  Calendar,
  Star
} from "lucide-react";
import { formatRupees } from "@/lib/currency";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/contexts/AuthContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import PaymentModal from "@/components/PaymentModal";

// Form schema
const bidFormSchema = z.object({
  bidAmount: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Bid amount must be a positive number." }
  ),
});

// ... existing code ...

const MakeBid = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const { socket, isConnected, joinAuction, leaveAuction } = useSocket();
  const [showBidForm, setShowBidForm] = useState(false);
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  interface AuctionDetails {
    id: string;
    title: string;
    description: string;
    currentBid: number;
    bids: number;
    timeRemaining: string;
    startingPrice: number;
    incrementAmount: number;
    imageUrl: string;
    category: string;
    seller: string;
    sellerName: string;
    sellerLocation: string;
    sellerRating: number | null;
    sellerCompleted: number | null;
    condition: string;
    startTime: string;
    endTime: string;
    location: string;
    shipping: string;
    returnPolicy: string;
    authenticity: string;
    highestBidderId: string;
    expertVerified: boolean;
    images: string[];
    specifications?: Record<string, string | number>;
  }

  const [currentAuction, setCurrentAuction] = useState<AuctionDetails | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isAuctionEnded, setIsAuctionEnded] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  // Scroll to top when page loads
  useScrollToTop();

  // Fetch auction from backend when an id is provided
  const [apiAuction, setApiAuction] = useState<AuctionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback mock auction if API not available
  const auction = useMemo(() => apiAuction, [apiAuction]);

  const form = useForm<z.infer<typeof bidFormSchema>>({
    resolver: zodResolver(bidFormSchema),
    defaultValues: {
      bidAmount: auction && auction.currentBid !== undefined && auction.incrementAmount !== undefined
        ? (auction.currentBid + auction.incrementAmount).toString()
        : "0",
    },
  });

  // Check if auction has ended and if current user is the winner
  const checkAuctionStatus = useCallback(() => {
    if (!auction || !auction.endTime) return;

    const now = new Date().getTime();
    const endTime = new Date(auction.endTime).getTime();
    const hasEnded = now >= endTime;

    setIsAuctionEnded(hasEnded);

    // If auction has ended and current user has the highest bid, they are the winner
    if (hasEnded && user && currentAuction) {
      // We need to check if the current user is the highest bidder
      // This would typically require a backend call to verify
      // For now, we'll use local state as an approximation
      const isHighestBidder = currentAuction.highestBidderId === user.id;
      setIsWinner(isHighestBidder);

      // If user is the winner, show payment modal
      if (isHighestBidder) {
        setShowPaymentModal(true);
      }
    }
  }, [auction, currentAuction, user]);

  useEffect(() => {
    const fetchAuction = async () => {
      if (!auctionId) {
        setIsLoading(false);
        toast.error("No auction ID provided");
        navigate("/auctions");
        return;
      }

      try {
        setIsLoading(true);
        const res = await axios.get(`http://localhost:8080/api/auctions/${auctionId}`);
        const a = res.data?.auction;
        if (a && a._id) {
          // Normalize to local shape expected by UI
          const normalized = {
            id: a._id,
            title: a.title,
            description: a.description,
            currentBid: a.current_price,
            bids: a.total_bids ?? 0,
            timeRemaining: "",
            startingPrice: a.starting_price,
            incrementAmount: a.bid_increment,
            imageUrl: a.images?.[0]?.url,
            category: a.category,
            seller: (a.seller_id?.full_name || a.seller_id?.business_name || ""),
            sellerName: (a.seller_id?.full_name || a.seller_id?.business_name || ""),
            sellerLocation: (a.seller_id?.location || a.location || ""),
            sellerRating: a.seller_id?.rating ?? null,
            sellerCompleted: a.seller_id?.successful_auctions ?? null,
            condition: a.condition,
            startTime: a.start_time,
            endTime: a.end_time,
            location: (a.seller_id?.location || a.location || ""),
            shipping: a.shipping || "",
            returnPolicy: a.return_policy || "",
            authenticity: a.authenticity || "",
            highestBidderId: a.highest_bidder_id || "", // Add highest bidder ID for winner determination
            expertVerified: a.expert_verified || false,
            images: Array.isArray(a.images) ? a.images.map((img: { url: string }) => img.url) : []
          };
          setApiAuction(normalized);
          setCurrentAuction(normalized);
          // set default bid amount
          form.setValue('bidAmount', String(normalized.currentBid + normalized.incrementAmount));
        } else {
          toast.error("Auction not found");
          navigate("/auctions");
        }
      } catch (e) {
        toast.error("Error loading auction. Please try again.");
        navigate("/auctions");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAuction();
  }, [auctionId, navigate, form]);

  // Join auction room for real-time updates
  useEffect(() => {
    if (isConnected && auction) {
      joinAuction(auction.id);
      setCurrentAuction(auction);
    }

    return () => {
      if (auction) {
        leaveAuction(auction.id);
      }
    };
  }, [isConnected, auction, joinAuction, leaveAuction]);

  // Listen for real-time bid updates
  useEffect(() => {
    if (!socket) return;

    const handleBidUpdate = (data: { auctionId: string; newBid: number; totalBids?: number; bidderId: string; bidderName: string }) => {
      if (auction && data.auctionId === auction.id) {
        setCurrentAuction(prev => {
          if (!prev) return null;
          return {
            ...prev,
            currentBid: data.newBid,
            bids: data.totalBids || (prev.bids || 0) + 1,
            highestBidderId: data.bidderId // Track the highest bidder ID
          } as AuctionDetails;
        });

        // Update form with new minimum bid
        if (auction.incrementAmount !== undefined) {
          form.setValue('bidAmount', (data.newBid + auction.incrementAmount).toString());
        }

        toast.success(`New bid: ${formatRupees(data.newBid)} by ${data.bidderName}`);

        // Check if auction has ended and if current user is the winner
        checkAuctionStatus();
      }
    };

    socket.on('bidUpdate', handleBidUpdate);

    return () => {
      socket.off('bidUpdate', handleBidUpdate);
    };
  }, [socket, auction, form, checkAuctionStatus]);

  // Check auction status periodically
  useEffect(() => {
    checkAuctionStatus();

    const interval = setInterval(() => {
      checkAuctionStatus();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [auction, currentAuction, user, checkAuctionStatus]);

  const handlePreBid = () => {
    if (!isAuthenticated) {
      toast.error("Please login to place a bid");
      navigate('/auth');
      return;
    }
    setShowBidForm(true);
  };

  const onSubmit = async (values: z.infer<typeof bidFormSchema>) => {
    if (!isAuthenticated) {
      toast.error("Please login to place a bid");
      navigate('/auth');
      return;
    }

    setIsPlacingBid(true);

    try {
      const bidAmount = Number(values.bidAmount);

      if (!currentAuction) {
        toast.error("Auction information is not available");
        setIsPlacingBid(false);
        return;
      }

      if (bidAmount <= (currentAuction.currentBid || 0)) {
        toast.error("Your bid must be higher than the current bid.");
        setIsPlacingBid(false);
        return;
      }
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error("Please login again.");
        navigate('/auth');
        setIsPlacingBid(false);
        return;
      }

      if (!auction || !auction.id) {
        toast.error("Auction information is missing");
        setIsPlacingBid(false);
        return;
      }

      const res = await axios.post(
        'http://localhost:8080/api/bids',
        { auction_id: auction.id, amount: bidAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data?.auction;

      setCurrentAuction(prev => ({
        ...prev,
        currentBid: updated?.current_price ?? bidAmount,
        bids: (updated?.total_bids ?? prev.bids + 1),
        highestBidderId: user?.id || '' // Set current user as highest bidder
      }));

      // Check if auction has ended and if current user is the winner
      checkAuctionStatus();

      if (socket && isConnected && auction && auction.id) {
        const bidderId = user?.id || 'user-id';
        socket.emit('newBid', {
          auctionId: auction.id,
          bidAmount,
          bidderId,
          bidderName: user?.full_name || 'Anonymous'
        });
      }

      toast.success("Bid placed successfully!");
      setShowBidForm(false);
      // Payment should only happen after auction ends and user is the winner
      // Removing immed
      // iate payment prompt after bid

    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err?.response?.data?.message || 'Failed to place bid. Please try again.';
      toast.error(msg);
    } finally {
      setIsPlacingBid(false);
    }
  };

  const calculateTimeProgress = () => {
    const end = new Date(auction.endTime).getTime();
    const now = new Date().getTime();
    const total = end - new Date(auction.endTime).getTime() + (2 * 60 * 60 * 1000); // 2 hours total
    const remaining = end - now;
    return Math.max(0, Math.min(100, ((total - remaining) / total) * 100));
  };

  const getQuickBidAmounts = () => {
    const current = displayAuction.currentBid;
    const increment = auction.incrementAmount;
    return [
      current + increment,
      current + (increment * 2),
      current + (increment * 5),
      current + (increment * 10)
    ];
  };

  if (!auction) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-20 pb-12 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Auction Not Found</CardTitle>
              <CardDescription>The auction you're looking for doesn't exist.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate("/auctions")} className="w-full">
                Browse Auctions
              </Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const displayAuction = currentAuction || auction;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-grow pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/auctions")}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Auctions
            </Button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Content - Left Side */}
            <div className="xl:col-span-2 space-y-6">
              {/* Image Gallery */}
              <Card className="overflow-hidden">
                <div className="relative">
                  <img
                    src={displayAuction.images?.[selectedImage] || displayAuction.imageUrl}
                    alt={displayAuction.title}
                    className="w-full object-cover h-[500px]"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/80 hover:bg-white/90 backdrop-blur-sm"
                      onClick={() => setLiked(!liked)}
                    >
                      <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/80 hover:bg-white/90 backdrop-blur-sm"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                  {displayAuction.expertVerified && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Expert Verified
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Thumbnail Navigation */}
                {displayAuction.images && displayAuction.images.length > 1 && (
                  <div className="p-4 border-t">
                    <div className="flex gap-2 overflow-x-auto">
                      {displayAuction.images.map((img: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                            }`}
                        >
                          <img src={img} alt={`${displayAuction.title} ${index + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Seller Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Name</span>
                    <span className="font-medium">{displayAuction.sellerName || displayAuction.seller || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <MapPin className="h-3.5 w-3.5" /> Location
                    </span>
                    <span className="font-medium">{displayAuction.sellerLocation || displayAuction.location || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Calendar className="h-3.5 w-3.5" /> Starts
                    </span>
                    <span className="font-medium">
                      {displayAuction.startTime ? new Date(displayAuction.startTime).toLocaleString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Calendar className="h-3.5 w-3.5" /> Ends
                    </span>
                    <span className="font-medium">
                      {displayAuction.endTime ? new Date(displayAuction.endTime).toLocaleString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Star className="h-3.5 w-3.5" /> Rating
                    </span>
                    <span className="font-medium">
                      {displayAuction.sellerRating != null ? `${displayAuction.sellerRating}/5` : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Successful Auctions</span>
                    <span className="font-medium">
                      {displayAuction.sellerCompleted != null ? displayAuction.sellerCompleted : "N/A"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Auction Details Tabs */}
              <Card>
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="specifications">Specifications</TabsTrigger>
                    <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
                    <TabsTrigger value="seller">Seller Info</TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Description</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {displayAuction.description}
                    </p>
                  </TabsContent>

                  <TabsContent value="specifications" className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                    {displayAuction.specifications ? (
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(displayAuction.specifications).map(([key, value]) => (
                          <div key={key}>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </dt>
                            <dd className="text-sm text-gray-900 dark:text-gray-100">{value as string}</dd>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No specifications available</p>
                    )}
                  </TabsContent>

                  <TabsContent value="shipping" className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Shipping & Returns</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Shipping</h4>
                        <p className="text-gray-700 dark:text-gray-300">{displayAuction.shipping}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Return Policy</h4>
                        <p className="text-gray-700 dark:text-gray-300">{displayAuction.returnPolicy}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Location</h4>
                        <p className="text-gray-700 dark:text-gray-300">{displayAuction.location}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="seller" className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Seller</h4>
                        <p className="text-gray-700 dark:text-gray-300">{displayAuction.seller}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Authenticity</h4>
                        <p className="text-gray-700 dark:text-gray-300">{displayAuction.authenticity}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Condition</h4>
                        <p className="text-gray-700 dark:text-gray-300">{displayAuction.condition}</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>

            {/* Bidding Sidebar - Right Side */}
            <div className="space-y-6">
              {/* Auction Info Card */}
              <Card className="sticky top-24">
                <CardHeader>
                  <div className="space-y-2">
                    <h1 className="text-xl font-bold leading-tight">{displayAuction.title}</h1>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Current Bid */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Bid</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatRupees(displayAuction.currentBid)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {displayAuction.bids} bids • Min. increment: {formatRupees(auction.incrementAmount)}
                    </p>
                  </div>

                  {/* Time Remaining */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Time Remaining</span>
                      <span className="font-medium">{displayAuction.timeRemaining}</span>
                    </div>
                    <Progress value={calculateTimeProgress()} className="h-2" />
                  </div>

                  {/* Quick Bid Buttons */}
                  {!showBidForm && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Quick Bid</p>
                      <div className="grid grid-cols-2 gap-2">
                        {getQuickBidAmounts().map((amount, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              form.setValue('bidAmount', amount.toString());
                              handlePreBid();
                            }}
                            disabled={!isAuthenticated}
                          >
                            {formatRupees(amount)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bid Form */}
                  {showBidForm ? (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="bidAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your Bid Amount (₹)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-3 text-gray-500">₹</span>
                                  <Input
                                    className="pl-8"
                                    type="number"
                                    min={displayAuction.currentBid + auction.incrementAmount}
                                    step={auction.incrementAmount}
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                Minimum bid: {formatRupees(displayAuction.currentBid + auction.incrementAmount)}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            className="flex-1"
                            disabled={isPlacingBid}
                          >
                            {isPlacingBid ? "Placing Bid..." : "Place Bid"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowBidForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  ) : (
                    isAuctionEnded ? (
                      <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-center">
                        <h3 className="text-lg font-semibold mb-2">Auction Ended</h3>
                        {isWinner ? (
                          <div>
                            <p className="text-green-600 dark:text-green-400 font-medium mb-3">
                              Congratulations! You are the winner of this auction.
                            </p>
                            <Button
                              onClick={() => setShowPaymentModal(true)}
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                              size="lg"
                            >
                              Complete Payment
                            </Button>
                          </div>
                        ) : (
                          <p className="text-gray-600 dark:text-gray-400">
                            This auction has ended. {currentAuction?.currentBid > 0 ?
                              "The winner will be notified to complete payment." :
                              "No bids were placed on this item."}
                          </p>
                        )}
                      </div>
                    ) : (
                      <Button
                        onClick={handlePreBid}
                        className="w-full"
                        size="lg"
                        disabled={!isAuthenticated}
                      >
                        {isAuthenticated ? "Place Bid" : "Login to Bid"}
                      </Button>
                    )
                  )}

                  {/* Security Badge */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Shield className="h-4 w-4" />
                    <span>Secure bidding with buyer protection</span>
                  </div>
                </CardContent>
              </Card>



            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Payment Modal */}
      {/* Only show payment modal if auction has ended and user is the winner */}
      {isAuctionEnded && isWinner && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          auctionId={auction.id}
          amount={displayAuction.currentBid}
          auctionTitle={displayAuction.title}
          onSuccess={() => {
            toast.success("Payment completed! You've won the auction!");
            setShowPaymentModal(false);
          }}
        />
      )}
    </div>
  );
};

export default MakeBid;
