import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSocket } from './SocketContext';

const UnreadContext = createContext({ unreadCount: 0, resetUnread: () => {} });

export function UnreadProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(1); // Default 1 unread message notification demo
  const location = useLocation();
  const { socket, events } = useSocket();

  useEffect(() => {
    if (location.pathname.startsWith('/chat')) {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!socket) return;

    // Listen to generic socket events if available
    const handleMessage = () => {
      if (!window.location.pathname.startsWith('/chat')) {
        setUnreadCount((c) => c + 1);
      }
    };

    socket.on('chat:message', handleMessage);
    return () => {
      socket.off('chat:message', handleMessage);
    };
  }, [socket]);

  const resetUnread = () => setUnreadCount(0);

  return (
    <UnreadContext.Provider value={{ unreadCount, resetUnread }}>
      {children}
    </UnreadContext.Provider>
  );
}

export function useUnread() {
  return useContext(UnreadContext);
}
