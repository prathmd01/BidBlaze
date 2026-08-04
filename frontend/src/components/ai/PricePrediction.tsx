import { useEffect, useState } from "react";
import { TrendingUp, Loader2, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupees } from "@/lib/currency";
import api from "@/lib/api";

interface PricePredictionProps {
  auctionId: string;
  currentBid: number;
  refreshKey?: number;
}

interface PredictionResult {
  predicted_final_price: number;
  confidence?: string;
  model?: string;
  source?: string;
}

const PricePrediction = ({ auctionId, currentBid, refreshKey = 0 }: PricePredictionProps) => {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auctionId) return;

    const fetchPrediction = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.post(`/predictions/${auctionId}`);
        setPrediction({
          predicted_final_price: res.data.predicted_final_price,
          confidence: res.data.confidence,
          model: res.data.model,
          source: res.data.source,
        });
      } catch {
        setError("Prediction unavailable");
        setPrediction(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [auctionId, refreshKey]);

  const uplift =
    prediction && currentBid > 0
      ? Math.round(
          ((prediction.predicted_final_price - currentBid) / currentBid) * 100
        )
      : 0;

  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-muted-foreground">AI Price Forecast</p>
              {prediction?.confidence && (
                <Badge variant="secondary" className="text-[10px] capitalize">
                  {prediction.confidence} confidence
                </Badge>
              )}
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing bid patterns...
              </div>
            ) : error ? (
              <p className="text-sm text-muted-foreground">{error}</p>
            ) : prediction ? (
              <>
                <p className="text-xl font-bold text-primary flex items-center gap-1">
                  <TrendingUp className="h-5 w-5" />
                  Predicted Final Price: {formatRupees(prediction.predicted_final_price)}
                </p>
                {uplift > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ~{uplift}% above current bid
                    {prediction.source === "heuristic-fallback" && " (estimate)"}
                  </p>
                )}
              </>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricePrediction;
