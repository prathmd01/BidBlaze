import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, Mail, ArrowRight } from 'lucide-react';
import { formatRupees } from '@/lib/currency';

interface PaymentSuccessProps {
  transactionId: string;
  amount: number;
  auctionTitle: string;
  onViewAuction?: () => void;
  onDownloadReceipt?: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  transactionId,
  amount,
  auctionTitle,
  onViewAuction,
  onDownloadReceipt
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Payment Successful!
          </CardTitle>
          <CardDescription>
            Your payment has been processed successfully
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Success Message */}
          <div className="text-center space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              Thank you for your payment. You will receive a confirmation email shortly.
            </p>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Transaction Complete
            </Badge>
          </div>

          {/* Transaction Details */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Transaction Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">
                  {transactionId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="font-semibold text-green-600">
                  {formatRupees(amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Auction:</span>
                <span className="text-gray-900 dark:text-gray-100 truncate ml-2">
                  {auctionTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Completed
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={onDownloadReceipt} 
              variant="outline" 
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            
            <Button 
              onClick={onViewAuction} 
              className="w-full"
            >
              View Auction
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-2">
            <p>
              A confirmation email has been sent to your registered email address.
            </p>
            <p>
              For any queries, please contact our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
