
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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

interface BidsTabProps {
  bids: BidItem[];
  getStatusColor: (status: string) => string;
  loading?: boolean;
}

const BidsTab = ({ bids, getStatusColor, loading = false }: BidsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Bids</CardTitle>
        <CardDescription>Track your active and past bids</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Item</TableHead>
              <TableHead>Bid ID</TableHead>
              <TableHead>Your Bid</TableHead>
              <TableHead>Current Bid</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ends In</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton
              Array(3).fill(0).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                </TableRow>
              ))
            ) : bids.length > 0 ? (
              // Actual bid data
              bids.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={bid.image}
                        alt={bid.item}
                        className="w-10 h-10 rounded object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=No+Image";
                        }}
                      />
                      <span className="font-medium">{bid.item}</span>
                    </div>
                  </TableCell>
                  <TableCell>{bid.id}</TableCell>
                  <TableCell>{bid.bidAmount}</TableCell>
                  <TableCell>{bid.currentBid}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(bid.status)}>
                      {bid.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{bid.endsIn}</TableCell>
                </TableRow>
              ))
            ) : (
              // No bids message
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  You haven't placed any bids yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BidsTab;
