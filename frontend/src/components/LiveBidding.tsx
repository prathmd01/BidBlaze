
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, Activity } from "lucide-react";
import { formatRupees } from "@/lib/currency";
import { useSocket } from "@/contexts/SocketContext";
import { toast } from "sonner";

interface LiveBiddingProps {
  currentBid: number;
  bidCount: number;
  timeRemaining: string;
  endTime: string;
  auctionId: string;
}

const LiveBidding = ({
  currentBid: initialBid,
  bidCount: initialBidCount,
  timeRemaining,
  endTime,
  auctionId
}: LiveBiddingProps) => {
  const [currentBid, setCurrentBid] = useState(initialBid);
  const [bidCount, setBidCount] = useState(initialBidCount);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const { socket, isConnected: socketConnected, joinAuction, leaveAuction } = useSocket();

  // Socket.IO connection and auction room management
  useEffect(() => {
    if (socketConnected && auctionId) {
      joinAuction(auctionId);
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }

    return () => {
      if (auctionId) {
        leaveAuction(auctionId);
      }
    };
  }, [socketConnected, auctionId, joinAuction, leaveAuction]);

  // Listen for real-time bid updates from Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleBidUpdate = (data: { auctionId: string; newBid: number; totalBids: number; bidderName: string }) => {
      if (data.auctionId === auctionId) {
        setCurrentBid(data.newBid);
        setBidCount(data.totalBids || bidCount + 1);
        toast.success(`New bid: ${formatRupees(data.newBid)} by ${data.bidderName}`);
      }
    };

    const handleProductUpdate = (data: { auctionId: string }) => {
      if (data.auctionId === auctionId) {
        toast.info('Product details have been updated');
      }
    };

    const handleComment = (data: { auctionId: string; comment: string; userName: string; timestamp: string }) => {
      if (data.auctionId === auctionId) {
        toast.info('New comment added to this auction');
      }
    };

    const handleImageUpdate = (data: { auctionId: string }) => {
      if (data.auctionId === auctionId) {
        toast.info('New images have been added to this auction');
      }
    };

    const handleUserJoined = (data: { auctionId: string; count: number }) => {
      if (data.auctionId === auctionId) {
        toast.info(`${data.count} users are currently viewing this auction`);
      }
    };

    const handleAuctionEnd = (data: { auctionId: string }) => {
      if (data.auctionId === auctionId) {
        toast.warning('This auction has ended!');
      }
    };

    socket.on('bidUpdate', handleBidUpdate);
    socket.on('productUpdate', handleProductUpdate);
    socket.on('imageUpdate', handleImageUpdate);
    socket.on('auctionEnd', handleAuctionEnd);

    return () => {
      socket.off('bidUpdate', handleBidUpdate);
      socket.off('productUpdate', handleProductUpdate);
      socket.off('imageUpdate', handleImageUpdate);
      socket.off('auctionEnd', handleAuctionEnd);
    };
  }, [socket, auctionId, bidCount]);

  // Time countdown effect
  useEffect(() => {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const totalTime = end - now;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const remaining = end - now;

      if (remaining <= 0) {
        clearInterval(timer);
        setElapsedTime(100);
      } else {
        // Calculate percentage of time elapsed
        setElapsedTime(((totalTime - remaining) / totalTime) * 100);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl font-bold text-green-600">
            {formatRupees(currentBid)}
          </span>
          {isConnected &&
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
              Live
            </Badge>
          }
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Current highest bid
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1 text-orange-500" />
            <span className="text-xs font-medium">Time Remaining</span>
          </div>
          <span className="text-xs font-medium">{timeRemaining}</span>
        </div>
        <Progress value={elapsedTime} className="h-1" />
      </div>

      <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
        <div className="flex items-center justify-center flex-col">
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1 text-blue-500" />
            <span className="text-xs font-medium">{bidCount}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Bids</p>
        </div>

        <div className="flex items-center justify-center flex-col">
          <div className="flex items-center">
            <Activity className="h-3 w-3 mr-1 text-green-500" />
            <span className="text-xs font-medium">
              {bidCount > 15 ? "High" : bidCount > 8 ? "Medium" : "Low"}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Activity</p>
        </div>
      </div>

      {!isConnected && (
        <div className="text-center animate-pulse">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Connecting to live bidding...
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveBidding;
