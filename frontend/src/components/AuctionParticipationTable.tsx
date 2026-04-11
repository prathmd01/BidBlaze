
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

interface AuctionParticipation {
  id: string;
  auctionTitle: string;
  dateParticipated: string;
  amountPaid: number;
  refundStatus: 'pending' | 'refunded';
  auctionStatus: 'ongoing' | 'won' | 'lost';
  auctionId?: string;
}

interface AuctionParticipationTableProps {
  participations: AuctionParticipation[];
  onRowClick?: (participation: AuctionParticipation) => void;
}

const AuctionParticipationTable = ({ participations, onRowClick }: AuctionParticipationTableProps) => {
  const getRefundStatusBadge = (status: string) => {
    switch (status) {
      case 'refunded':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Refunded
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  const getAuctionStatusBadge = (status: string) => {
    switch (status) {
      case 'won':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Won
          </Badge>
        );
      case 'lost':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            Lost
          </Badge>
        );
      case 'ongoing':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Ongoing
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Auction Participation History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Auction Title</TableHead>
                <TableHead>Date Participated</TableHead>
                <TableHead>20% Amount Paid</TableHead>
                <TableHead>Refund Status</TableHead>
                <TableHead>Auction Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No auction participation history found
                  </TableCell>
                </TableRow>
              ) : (
                participations.map((participation) => (
                  <TableRow
                    key={participation.id}
                    onClick={() => onRowClick && onRowClick(participation)}
                    className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                  >
                    <TableCell className="font-medium">
                      {participation.auctionTitle}
                    </TableCell>
                    <TableCell>
                      {new Date(participation.dateParticipated).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      ₹{participation.amountPaid.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {getRefundStatusBadge(participation.refundStatus)}
                    </TableCell>
                    <TableCell>
                      {getAuctionStatusBadge(participation.auctionStatus)}
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

export default AuctionParticipationTable;
