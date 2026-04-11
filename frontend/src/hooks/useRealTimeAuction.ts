import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { toast } from 'sonner';

interface AuctionData {
  id: string;
  currentBid: number;
  totalBids: number;
  status: string;
  images?: { url: string; public_id: string }[];
  title?: string;
  description?: string;
}

export const useRealTimeAuction = (auctionId: string, initialData: AuctionData) => {
  const [auctionData, setAuctionData] = useState<AuctionData>(initialData);
  const { socket, isConnected, joinAuction, leaveAuction } = useSocket();

  useEffect(() => {
    if (isConnected && auctionId) {
      joinAuction(auctionId);
    }

    return () => {
      if (auctionId) {
        leaveAuction(auctionId);
      }
    };
  }, [isConnected, auctionId, joinAuction, leaveAuction]);

  useEffect(() => {
    if (!socket) return;

    const handleBidUpdate = (data: { auctionId: string; newBid: number; totalBids?: number; bidderName: string }) => {
      if (data.auctionId === auctionId) {
        setAuctionData(prev => ({
          ...prev,
          currentBid: data.newBid,
          totalBids: data.totalBids || prev.totalBids + 1
        }));
        toast.success(`New bid: ₹${data.newBid.toLocaleString()} by ${data.bidderName}`);
      }
    };

    const handleProductUpdate = (data: { auctionId: string; updates: Partial<AuctionData> }) => {
      if (data.auctionId === auctionId) {
        setAuctionData(prev => ({
          ...prev,
          ...data.updates
        }));
        toast.info('Product details have been updated');
      }
    };

    const handleImageUpdate = (data: { auctionId: string; images: { url: string; public_id: string }[] }) => {
      if (data.auctionId === auctionId) {
        setAuctionData(prev => ({
          ...prev,
          images: data.images
        }));
        toast.info('New images have been added to this auction');
      }
    };

    const handleAuctionEnd = (data: { auctionId: string }) => {
      if (data.auctionId === auctionId) {
        setAuctionData(prev => ({
          ...prev,
          status: 'ended'
        }));
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
  }, [socket, auctionId]);

  return {
    auctionData,
    isConnected
  };
};
