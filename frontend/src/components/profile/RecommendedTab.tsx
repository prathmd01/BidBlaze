
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap } from "lucide-react";

interface AuctionItem {
  id: string;
  title: string;
  currentBid: string;
  endsIn: string;
  image: string;
}

interface RecommendedTabProps {
  recommendedAuctions: AuctionItem[];
}

const RecommendedTab = ({ recommendedAuctions }: RecommendedTabProps) => {
  return (
    <Card className="backdrop-blur-sm bg-white/10 dark:bg-gray-900/20 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
          <CardTitle className="text-gradient font-bold">Recommended Auctions</CardTitle>
        </div>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Tailored selections based on your bidding history and interests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {recommendedAuctions.map((auction) => (
            <div 
              key={auction.id} 
              className="backdrop-blur-md bg-white/5 dark:bg-gray-800/10 border border-gray-200/30 dark:border-gray-700/30 rounded-xl overflow-hidden group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10 mix-blend-overlay z-0"></div>
                <img
                  src={auction.image}
                  alt={auction.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-0"
                />
                <div className="absolute top-3 left-3">
                  <div className="flex items-center px-2 py-1 bg-black/40 backdrop-blur-md text-white text-xs font-medium rounded-full">
                    <Zap className="h-3 w-3 mr-1 text-primary" />
                    Recommended
                  </div>
                </div>
                <div className="absolute bottom-3 right-3">
                  <Badge className="bg-black/40 backdrop-blur-md border-none text-white hover:bg-black/60 group-hover:bg-primary/80 transition-colors duration-300">
                    <Clock className="h-3 w-3 mr-1" />
                    {auction.endsIn}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors">{auction.title}</h3>
                <div className="flex justify-between items-center mt-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Current bid</p>
                    <p className="font-bold text-gradient">{auction.currentBid}</p>
                  </div>
                  <Button size="sm" className="rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                    Place Bid
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedTab;
