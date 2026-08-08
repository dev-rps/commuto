import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export const SOCKET_EVENTS = {
  rideLocation: (rideId) => `ride:location:${rideId}`,
  rideStatus: (rideId) => `ride:status:${rideId}`,
  chatMessage: (rideId) => `chat:message:${rideId}`,
  notificationNew: (userId) => `notification:new:${userId}`,
  ridePublished: (orgId) => `ride:published:${orgId}`,
};

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    // In mock mode we don't actually connect — wiring the real backend
    // is just removing this guard.
    if (import.meta.env.VITE_USE_MOCKS === 'true') return;

    const socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] });
    socketRef.current = socket;
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    return () => { socket.disconnect(); socketRef.current = null; };
  }, []);

  const joinRideRoom = (rideId) => socketRef.current?.emit('join:ride', rideId);
  const leaveRideRoom = (rideId) => socketRef.current?.emit('leave:ride', rideId);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, joinRideRoom, leaveRideRoom, events: SOCKET_EVENTS }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
