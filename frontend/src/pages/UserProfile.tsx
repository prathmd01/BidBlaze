
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Edit } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UserProfileCard from "@/components/UserProfileCard";
import AuctionParticipationTable from "@/components/AuctionParticipationTable";
import BidHistory from "../components/BidHistory";
import UserProfileSkeleton from "@/components/UserProfileSkeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Import the AuctionParticipation interface
interface AuctionParticipation {
  id: string;
  auctionId?: string;
  auctionTitle: string;
  dateParticipated: string;
  amountPaid: number;
  refundStatus: 'pending' | 'refunded';
  auctionStatus: 'ongoing' | 'won' | 'lost';
  highestBidder?: string;
}

type UserBid = {
  _id: string;
  auction_id: {
    _id: string;
    title: string;
    winner_id?: { full_name: string } | null;
  };
  bid_time: string;
  amount: number;
  status?: 'active' | 'outbid' | 'won' | 'lost';
};

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [auctionParticipations, setAuctionParticipations] = useState<AuctionParticipation[]>([]);
  type RawBid = {
    _id: string;
    auction_id?: { title?: string } | null;
    amount: number;
    bid_time: string;
    status: 'winning' | 'outbid' | 'won' | 'lost' | 'active';
  };
  const [bidHistory, setBidHistory] = useState<RawBid[]>([]);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);

  // Redirect if not logged in and fetch user's bids
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchUserBids = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth-token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [bidsResponse, winningBidsResponse] = await Promise.all([
          axios.get('/api/bids/my-bids', { headers }),
          axios.get('/api/bids/winning', { headers })
        ]);

        const participations: AuctionParticipation[] = [];

        if (bidsResponse.data && bidsResponse.data.bids) {
          const validBids = (bidsResponse.data.bids as UserBid[]).filter((bid) => {
            return (
              bid.auction_id &&
              typeof bid.auction_id === 'object' &&
              bid.auction_id._id &&
              bid.bid_time
            );
          });

          validBids.forEach((bid) => {
            let auctionStatus: 'ongoing' | 'won' | 'lost' = 'ongoing';
            if (bid.status === 'won') auctionStatus = 'won';
            else if (bid.status === 'lost' || bid.status === 'outbid') auctionStatus = 'lost';

            participations.push({
              id: bid._id,
              auctionId: bid.auction_id._id,
              auctionTitle: bid.auction_id.title,
              dateParticipated: bid.bid_time,
              amountPaid: bid.amount * 0.2,
              refundStatus: bid.status === 'outbid' ? 'refunded' : 'pending',
              auctionStatus
            });
          });
        }

        if (winningBidsResponse.data && winningBidsResponse.data.winning_bids) {
          const validWinningBids = (winningBidsResponse.data.winning_bids as UserBid[]).filter((bid) => {
            return (
              bid.auction_id &&
              typeof bid.auction_id === 'object' &&
              bid.auction_id._id &&
              bid.bid_time
            );
          });

          validWinningBids.forEach((bid) => {
            if (!participations.some((p) => p.id === bid._id)) {
              participations.push({
                id: bid._id,
                auctionId: bid.auction_id._id,
                auctionTitle: bid.auction_id.title,
                dateParticipated: bid.bid_time,
                amountPaid: bid.amount * 0.2,
                refundStatus: 'pending',
                auctionStatus: 'won',
                highestBidder: bid.auction_id.winner_id ? bid.auction_id.winner_id.full_name : 'N/A'
              });
            }
          });
        }

        participations.sort((a, b) => {
          return new Date(b.dateParticipated).getTime() - new Date(a.dateParticipated).getTime();
        });

        setAuctionParticipations(participations);
      } catch (error) {
        console.error('Error fetching user bids:', error);
        toast.error('Failed to load auction history');
      } finally {
        setLoading(false);
      }
    };

    fetchUserBids();
  }, [user, navigate]);

  // Create user info from auth context
  const userInfo = user ? {
    name: user.full_name || 'User',
    email: user.email,
    avatar: user.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    kycStatus: 'verified' as const,
    isVerified: true,
  } : null;

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate('/');
  };

  const handleEditProfile = () => {
    navigate('/profile-edit');
  };

  if (loading || !userInfo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-20 pb-12">
          <div className="container mx-auto px-4 max-w-6xl">
            <UserProfileSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Function to fetch bid history for a specific auction
  const fetchBidHistory = async (auctionId: string) => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const auctionResponse = await axios.get(
        `/api/auctions/${auctionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const auction = auctionResponse.data.auction;
      const isOrganizer = auction && auction.seller_id && auction.seller_id._id === user.id;

      if (!isOrganizer) {
        toast.error('Only auction organizers can view complete bid history');
        return;
      }

      const response = await axios.get(
        `/api/bids/auction/${auctionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBidHistory(response.data.bids);
      setSelectedAuctionId(auctionId);
    } catch (error) {
      console.error('Error fetching bid history:', error);
      toast.error('Failed to load bid history');
    }
  };

  // Handle click on auction participation row to show bid history
  const handleShowBidHistory = (auctionId?: string) => {
    if (!auctionId) {
      toast.error("Invalid auction ID");
      return;
    }
    fetchBidHistory(auctionId);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">User Profile</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your account and view your auction history
              </p>
            </div>

            {/* User Profile Card */}
            <UserProfileCard userInfo={userInfo} onEditPhoto={handleEditProfile} />

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={handleEditProfile} variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button onClick={handleLogout} variant="destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Auction Participation Table */}
            <div className="space-y-6">
              <AuctionParticipationTable
                participations={auctionParticipations}
                onRowClick={(p) => p.auctionId && handleShowBidHistory(p.auctionId)}
              />

              {/* Bid History */}
              {selectedAuctionId && (
                <BidHistory
                  bids={bidHistory.map(bid => ({
                    id: bid._id,
                    auctionTitle: bid.auction_id?.title || 'Unknown Auction',
                    bidAmount: bid.amount,
                    bidTime: bid.bid_time,
                    status: bid.status
                  }))}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
