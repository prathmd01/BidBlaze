import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2, CreditCard, Shield, AlertCircle } from 'lucide-react';
import { formatRupees } from '@/lib/currency';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  auctionId: string;
  amount: number;
  auctionTitle: string;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  auctionId,
  amount,
  auctionTitle,
  onSuccess
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | 'disabled'>('pending');
  const [isPaymentEnabled, setIsPaymentEnabled] = useState(true);

  const handlePayment = async () => {
    if (!isOpen) return;

    // Check if Razorpay is enabled
    if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
      setPaymentStatus('disabled');
      toast.error('Payment gateway is not configured. Please contact support.');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('pending');

    try {
      // Create order on backend
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

      const response = await fetch(`${apiUrl}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          auction_id: auctionId,
          amount: amount,
          type: 'winning_payment'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment order');
      }

      const orderData = await response.json();

      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'BidBlaze',
        description: `Payment for ${auctionTitle}`,
        order_id: orderData.order_id,
        handler: async function (response: RazorpayResponse) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch(`${apiUrl}/api/payments/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                transaction_id: orderData.transaction_id
              })
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const verifyData = await verifyResponse.json();

            setPaymentStatus('success');
            toast.success('Payment successful!');

            // Call success callback
            if (onSuccess) {
              onSuccess();
            }

            // Close modal after 3 seconds
            setTimeout(() => {
              onClose();
              setPaymentStatus('pending');
            }, 3000);

          } catch (error) {
            console.error('Payment verification error:', error);
            setPaymentStatus('failed');
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: 'BidBlaze User',
          email: 'user@bidblaze.com',
          contact: '+919999999999'
        },
        theme: {
          color: '#10b981'
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setPaymentStatus('pending');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      toast.error('Failed to initiate payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () => {
        toast.error('Failed to load payment gateway');
        setIsPaymentEnabled(false);
        resolve(null);
      };
      document.body.appendChild(script);
    });
  };

  React.useEffect(() => {
    if (isOpen) {
      // Check if Razorpay is enabled
      if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
        setIsPaymentEnabled(false);
        setPaymentStatus('disabled');
      } else {
        loadRazorpayScript();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </CardTitle>
          <CardDescription>
            Complete your payment to secure your winning bid
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Disabled Status */}
          {paymentStatus === 'disabled' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <AlertCircle className="h-16 w-16 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-600 mb-2">Payment Gateway Unavailable</h3>
                <p className="text-gray-600 mb-4">
                  Payment processing is currently not available. This feature will be enabled once the platform is fully deployed.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Demo Mode:</strong> Your bid has been recorded successfully. In a production environment, you would complete the payment here.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  if (onSuccess) onSuccess();
                  onClose();
                }}
                className="w-full"
              >
                Continue (Demo Mode)
              </Button>
            </div>
          )}

          {/* Payment Status */}
          {paymentStatus === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-600 mb-2">Payment Successful!</h3>
                <p className="text-gray-600">
                  Your payment has been processed successfully. You will receive a confirmation email shortly.
                </p>
              </div>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-600 mb-2">Payment Failed</h3>
                <p className="text-gray-600">
                  There was an issue processing your payment. Please try again.
                </p>
              </div>
            </div>
          )}

          {paymentStatus === 'pending' && isPaymentEnabled && (
            <>
              {/* Auction Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Auction:</span>
                  <span className="font-medium">{auctionTitle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-xl font-bold text-green-600">{formatRupees(amount)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <Shield className="h-4 w-4" />
                <span>Secure payment powered by Razorpay</span>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Accepted Payment Methods:</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">Credit Card</Badge>
                  <Badge variant="outline">Debit Card</Badge>
                  <Badge variant="outline">UPI</Badge>
                  <Badge variant="outline">Net Banking</Badge>
                  <Badge variant="outline">Wallets</Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handlePayment}
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ${formatRupees(amount)}`
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentModal;
