import React, { useState, useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Wifi, WifiOff, Send, Users, DollarSign, Image, Package } from 'lucide-react';

const WebSocketTest: React.FC = () => {
  const { socket, isConnected, joinAuction, leaveAuction, placeBid, emitProductUpdate, emitImageUpdate, emitAuctionEnd } = useSocket();
  const [testAuctionId, setTestAuctionId] = useState('test-auction-123');
  const [bidAmount, setBidAmount] = useState('1000');
  const [bidderName, setBidderName] = useState('Test User');
  const [events, setEvents] = useState<{ timestamp: string; event: string; data: unknown }[]>([]);
  const [isInRoom, setIsInRoom] = useState(false);

  // Listen for all WebSocket events
  useEffect(() => {
    if (!socket) return;

    const handleAnyEvent = (eventName: string, data: unknown) => {
      setEvents(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        event: eventName,
        data: data
      }]);
    };

    // List of events to listen for
    const eventNames = ['bidUpdate', 'productUpdate', 'imageUpdate', 'auctionEnd', 'userJoined', 'userLeft'];

    eventNames.forEach(event => {
      socket.on(event, (data: unknown) => handleAnyEvent(event, data));
    });

    return () => {
      eventNames.forEach(event => {
        socket.off(event);
      });
    };
  }, [socket]);

  const handleJoinRoom = () => {
    joinAuction(testAuctionId);
    setIsInRoom(true);
    toast.success(`Joined auction room: ${testAuctionId}`);
  };

  const handleLeaveRoom = () => {
    leaveAuction(testAuctionId);
    setIsInRoom(false);
    toast.info(`Left auction room: ${testAuctionId}`);
  };

  const handlePlaceBid = () => {
    if (socket && isConnected) {
      placeBid(testAuctionId, parseInt(bidAmount), 'test-user-id', bidderName);
      // Also emit locally for testing UI feedback
      // socket.emit('newBid', { auctionId: testAuctionId, newBid: parseInt(bidAmount), bidderName });
      toast.success(`Test bid sent: ₹${bidAmount}`);
    } else {
      console.error('Socket not connected');
    }
  };

  const handleTestProductUpdate = () => {
    emitProductUpdate(testAuctionId, {
      title: 'Updated Test Auction',
      description: 'This is an updated description',
      current_price: parseInt(bidAmount)
    });
    toast.success('Test product update sent');
  };

  const handleTestImageUpdate = () => {
    emitImageUpdate(testAuctionId, [
      { url: 'https://via.placeholder.com/300x200', public_id: 'test-image-1' },
      { url: 'https://via.placeholder.com/300x200', public_id: 'test-image-2' }
    ]);
    toast.success('Test image update sent');
  };

  const handleTestAuctionEnd = () => {
    emitAuctionEnd(testAuctionId, 'winner-user-id', parseInt(bidAmount));
    toast.success('Test auction end sent');
  };

  const clearEvents = () => {
    setEvents([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">WebSocket Test Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Test real-time WebSocket functionality for BidBlaze
          </p>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isConnected ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Badge className={isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Socket ID: {socket?.id || 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Transport: {socket?.io?.engine?.transport?.name || 'N/A'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Room Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Room Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="auctionId">Auction ID</Label>
                <Input
                  id="auctionId"
                  value={testAuctionId}
                  onChange={(e) => setTestAuctionId(e.target.value)}
                  placeholder="Enter auction ID"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePlaceBid} disabled={!isConnected || !isInRoom}>
                  Place Test Bid
                </Button>
                <Button onClick={handleLeaveRoom} disabled={!isConnected || !isInRoom} variant="outline">
                  Leave Room
                </Button>
              </div>
              <Badge className={isInRoom ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {isInRoom ? 'In Room' : 'Not in Room'}
              </Badge>
            </CardContent>
          </Card>

          {/* Event Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Event Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bidAmount">Bid Amount (₹)</Label>
                <Input
                  id="bidAmount"
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="1000"
                />
              </div>
              <div>
                <Label htmlFor="bidderName">Bidder Name</Label>
                <Input
                  id="bidderName"
                  value={bidderName}
                  onChange={(e) => setBidderName(e.target.value)}
                  placeholder="Test User"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handlePlaceBid} disabled={!isConnected} size="sm">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Test Bid
                </Button>
                <Button onClick={handleTestProductUpdate} disabled={!isConnected} size="sm">
                  <Package className="h-4 w-4 mr-1" />
                  Product Update
                </Button>
                <Button onClick={handleTestImageUpdate} disabled={!isConnected} size="sm">
                  <Image className="h-4 w-4 mr-1" />
                  Image Update
                </Button>
                <Button onClick={handleTestAuctionEnd} disabled={!isConnected} size="sm" variant="destructive">
                  End Auction
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Event Log
              <Button onClick={clearEvents} size="sm" variant="outline">
                Clear
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {events.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No events yet. Try sending some test events!</p>
              ) : (
                events.map((event, index) => (
                  <div key={index} className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-gray-500">{event.timestamp}</span>
                      <Badge variant="outline" className="text-xs">
                        {event.event}
                      </Badge>
                    </div>
                    <pre className="mt-1 text-xs overflow-x-auto">
                      {JSON.stringify(event.data, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WebSocketTest;
