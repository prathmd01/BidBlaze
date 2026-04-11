
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Clock, Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

interface OverviewTabProps {
  orders: OrderItem[];
  bids: BidItem[];
  recommendedAuctions: AuctionItem[];
  getStatusColor: (status: string) => string;
  loading?: boolean;
}

const OverviewTab = ({ orders, bids, recommendedAuctions, getStatusColor, loading = false }: OverviewTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5 text-primary" />
            Recent Orders
          </CardTitle>
          <CardDescription>Your latest purchases</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            // Loading skeleton for orders
            Array(2).fill(0).map((_, index) => (
              <div key={`order-loading-${index}`} className="flex items-center gap-4 mb-4 last:mb-0">
                <Skeleton className="w-12 h-12 rounded-md" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))
          ) : orders.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No orders found
            </div>
          ) : (
            orders.slice(0, 2).map((order) => (
              <div key={order.id} className="flex items-center gap-4 mb-4 last:mb-0">
                <img 
                  src={order.image} 
                  alt={order.item} 
                  className="w-12 h-12 rounded-md object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/300x200?text=No+Image";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{order.item}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{order.id} • {order.date}</p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
            ))
          )}
          <Button variant="ghost" size="sm" className="w-full mt-2">
            View all orders
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-primary" />
            Active Bids
          </CardTitle>
          <CardDescription>Your ongoing auction bids</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            // Loading skeleton for bids
            Array(2).fill(0).map((_, index) => (
              <div key={`bid-loading-${index}`} className="flex items-center gap-4 mb-4 last:mb-0">
                <Skeleton className="w-12 h-12 rounded-md" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))
          ) : bids.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No bids found
            </div>
          ) : (
            bids.slice(0, 2).map((bid) => (
              <div key={bid.id} className="flex items-center gap-4 mb-4 last:mb-0">
                <img 
                  src={bid.image} 
                  alt={bid.item} 
                  className="w-12 h-12 rounded-md object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/300x200?text=No+Image";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{bid.item}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Your bid: {bid.bidAmount}</p>
                </div>
                <Badge className={getStatusColor(bid.status)}>
                  {bid.status}
                </Badge>
              </div>
            ))
          )}
          <Button variant="ghost" size="sm" className="w-full mt-2">
            View all bids
          </Button>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="mr-2 h-5 w-5 text-primary" />
            Recommended for You
          </CardTitle>
          <CardDescription>Based on your bidding history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loading ? (
              // Loading skeleton for recommended auctions
              Array(2).fill(0).map((_, index) => (
                <div key={`rec-loading-${index}`} className="border rounded-lg overflow-hidden">
                  <Skeleton className="w-full h-40" />
                  <div className="p-3">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <div className="flex justify-between items-center mt-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </div>
              ))
            ) : recommendedAuctions.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                No recommendations found
              </div>
            ) : (
              recommendedAuctions.slice(0, 2).map((auction) => (
                <div key={auction.id} className="border rounded-lg overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="relative h-40">
                    <img
                      src={auction.image}
                      alt={auction.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/300x200?text=No+Image";
                      }}
                    />
                    <div className="absolute bottom-2 right-2">
                      <Badge className="bg-primary/80 hover:bg-primary text-white">{auction.endsIn}</Badge>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate">{auction.title}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Current bid</p>
                      <p className="font-medium text-sm">{auction.currentBid}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-4">
            View all recommendations
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
