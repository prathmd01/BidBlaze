import React from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

const WebSocketStatus: React.FC = () => {
  const { isConnected, socket } = useSocket();

  const getStatusColor = () => {
    if (isConnected) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  const getStatusIcon = () => {
    if (isConnected) return <Wifi className="h-3 w-3" />;
    return <WifiOff className="h-3 w-3" />;
  };

  const getStatusText = () => {
    if (isConnected) return 'WebSocket Connected';
    return 'WebSocket Disconnected';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge className={`${getStatusColor()} flex items-center gap-1 px-2 py-1 text-xs`}>
        {getStatusIcon()}
        {getStatusText()}
      </Badge>
      
      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
          <div>Socket ID: {socket?.id || 'N/A'}</div>
          <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
          <div>Transport: {socket?.io?.engine?.transport?.name || 'N/A'}</div>
        </div>
      )}
    </div>
  );
};

export default WebSocketStatus;
