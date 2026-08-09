import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const rawApiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:4000/api`;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || rawApiUrl.replace(/\/api$/, '').replace(/\/$/, '');

export const SOCKET_EVENTS = {
  rideLocation: (rideId) => `ride:location:${rideId}`,
  rideStatus: (rideId) => `ride:status:${rideId}`,
  chatMessage: (rideId) => `chat:message:${rideId}`,
  notificationNew: (userId) => `notification:new:${userId}`,
  ridePublished: (orgId) => `ride:published:${orgId}`,
};

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;
    if (import.meta.env.VITE_USE_MOCKS === 'true') return;

    console.log('[Socket] Connecting to:', SOCKET_URL);
    const socketInstance = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] });
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected successfully!');
      setIsConnected(true);
    });
    
    socketInstance.on('disconnect', () => {
      console.log('[Socket] Disconnected.');
      setIsConnected(false);
    });

    return () => {
      console.log('[Socket] Cleaning up socket connection...');
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user?.id]);

  const joinRideRoom = (rideId) => socket?.emit('join:ride', rideId);
  const leaveRideRoom = (rideId) => socket?.emit('leave:ride', rideId);

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinRideRoom, leaveRideRoom, events: SOCKET_EVENTS }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
