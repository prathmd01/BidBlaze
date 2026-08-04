import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuctionCard from "@/components/AuctionCard";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

interface AuctionItem {
  id: string;
  title: string;
  currentBid: number;
  bids: number;
  timeRemaining: string;
  imageUrl: string;
  category: string;
}

function calculateTimeRemaining(endTime: string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h left`;
  const mins = Math.floor(diff / (1000 * 60));
  return `${mins}m left`;
}

const RecommendedForYou = () => {
  const { user, loading: authLoading } = useAuth();
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [algorithm, setAlgorithm] = useState<string>("");

  useEffect(() => {
    if (authLoading || !user?.id) {
      setAuctions([]);
      return;
    }

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/recommendations/${user.id}`, {
          params: { limit: 8 },
        });

        const list = res.data?.auctions || [];
        setAlgorithm(res.data?.algorithm || "");

        const formatted: AuctionItem[] = list.map(
          (a: {
            _id: string;
            title: string;
            current_price: number;
            total_bids?: number;
            end_time: string;
            images?: { url: string }[];
            category: string;
          }) => ({
            id: a._id,
            title: a.title,
            currentBid: a.current_price,
            bids: a.total_bids || 0,
            timeRemaining: calculateTimeRemaining(a.end_time),
            imageUrl: a.images?.[0]?.url || "https://placehold.co/600x400?text=Auction",
            category: a.category,
          })
        );

        setAuctions(formatted);
      } catch {
        setAuctions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user?.id, authLoading]);

  if (!user) return null;

  return (
    <section className="py-16 px-4 md:px-8 bg-gradient-to-b from-primary/5 to-transparent">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wide">AI Powered</span>
            </div>
            <h2 className="text-3xl font-bold">Recommended For You</h2>
            <p className="text-muted-foreground mt-1">
              Based on your bids, views, and similar collectors
              {algorithm && (
                <span className="text-xs ml-2 opacity-60">({algorithm})</span>
              )}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/auctions">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-72 rounded-xl bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        ) : auctions.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            Place a few bids or browse auctions — we&apos;ll personalize recommendations for you.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {auctions.map((auction) => (
              <AuctionCard key={auction.id} {...auction} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendedForYou;
