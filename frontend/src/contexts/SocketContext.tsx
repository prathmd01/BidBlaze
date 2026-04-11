import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinAuction: (auctionId: string) => void;
  leaveAuction: (auctionId: string) => void;
  placeBid: (auctionId: string, amount: number, bidderId: string, bidderName: string) => void;
  sendComment: (auctionId: string, comment: string, userId: string, userName: string) => void;
  emitProductUpdate: (auctionId: string, updates: Record<string, unknown>) => void;
  emitImageUpdate: (auctionId: string, images: { url: string; public_id: string }[]) => void;
  emitAuctionEnd: (auctionId: string, winnerId: string, finalBid: number) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection with authentication
    const newSocket = io('/', {
      auth: {
        token: localStorage.getItem('auth-token') || ''
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket.IO connected successfully');
      console.log('🔗 Socket ID:', newSocket.id);
      console.log('🚀 Transport:', newSocket.io.engine.transport.name);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🚨 Socket.IO connection error:', error);
      console.error('🔍 Error message:', error.message);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket.IO reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('🔄 Socket.IO reconnection error:', error);
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Socket.IO reconnection attempt ${attemptNumber}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const joinAuction = (auctionId: string) => {
    if (socket && isConnected) {
      socket.emit('joinAuction', auctionId);
      console.log(`Joined auction room: ${auctionId}`);
    }
  };

  const leaveAuction = (auctionId: string) => {
    if (socket && isConnected) {
      socket.emit('leaveAuction', auctionId);
      console.log(`Left auction room: ${auctionId}`);
    }
  };

  const placeBid = (auctionId: string, amount: number, bidderId: string, bidderName: string) => {
    if (socket && isConnected) {
      socket.emit('newBid', {
        auctionId,
        bidAmount: amount,
        bidderId,
        bidderName
      });
    }
  };

  const sendComment = (auctionId: string, comment: string, userId: string, userName: string) => {
    if (socket && isConnected) {
      socket.emit('newComment', {
        auctionId,
        comment,
        userId,
        userName,
        timestamp: new Date().toISOString()
      });
    }
  };

  const emitProductUpdate = (auctionId: string, updates: Record<string, unknown>) => {
    if (socket && isConnected) {
      socket.emit('productUpdate', {
        auctionId,
        updates
      });
    }
  };

  const emitImageUpdate = (auctionId: string, images: { url: string; public_id: string }[]) => {
    if (socket && isConnected) {
      socket.emit('imageUpdate', {
        auctionId,
        images
      });
    }
  };

  const emitAuctionEnd = (auctionId: string, winnerId: string, finalBid: number) => {
    if (socket && isConnected) {
      socket.emit('auctionEnd', {
        auctionId,
        winnerId,
        finalBid
      });
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    joinAuction,
    leaveAuction,
    placeBid,
    sendComment,
    emitProductUpdate,
    emitImageUpdate,
    emitAuctionEnd
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
