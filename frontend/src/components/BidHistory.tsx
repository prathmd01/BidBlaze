import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupees } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";

interface BidHistoryItem {
  id: string;
  auctionTitle: string;
  bidAmount: number;
  bidTime: string;
  status: 'winning' | 'outbid' | 'won' | 'lost' | 'active';
}

interface BidHistoryProps {
  bids: BidHistoryItem[];
  loading?: boolean;
  error?: string;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'winning':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'outbid':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'won':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'lost':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'active':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

const BidHistory: React.FC<BidHistoryProps> = ({ bids, loading = false, error }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bid History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Auction</TableHead>
                <TableHead>Bid Amount</TableHead>
                <TableHead>Bid Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton
                Array(3).fill(0).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                // Error message
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              ) : bids.length === 0 ? (
                // No bids message
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No bid history found
                  </TableCell>
                </TableRow>
              ) : (
                // Actual bid data
                bids.map((bid) => (
                  <TableRow key={bid.id}>
                    <TableCell className="font-medium">
                      {bid.auctionTitle}
                    </TableCell>
                    <TableCell>
                      {formatRupees(bid.bidAmount)}
                    </TableCell>
                    <TableCell>
                      {new Date(bid.bidTime).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(bid.status)}>
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BidHistory;