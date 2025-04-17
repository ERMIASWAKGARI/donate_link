/* eslint-disable react/prop-types */
// SocketContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useUser } from './UserContext';

const SocketContext = createContext();
const API_BASE_URL = import.meta.env.BACKEND_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useUser();

  // Socket event handlers
  const [eventHandlers, setEventHandlers] = useState({});

  // Register event handlers
  const on = (eventName, handler) => {
    setEventHandlers((prev) => ({
      ...prev,
      [eventName]: [...(prev[eventName] || []), handler],
    }));
  };

  // Unregister event handlers
  const off = (eventName, handler) => {
    setEventHandlers((prev) => ({
      ...prev,
      [eventName]: (prev[eventName] || []).filter((h) => h !== handler),
    }));
  };

  // Emit events
  const emit = (eventName, data) => {
    if (socket && isConnected) {
      socket.emit(eventName, data);
    }
  };

  // Initialize socket connection
  useEffect(() => {
    if (!user?._id) return undefined;

    const newSocket = io(API_BASE_URL, {
      query: { userId: user._id },
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('accessToken'),
      },
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      newSocket.emit('userOnline', user._id);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user]);

  // Register/unregister event handlers
  useEffect(() => {
    if (!socket) return;

    Object.entries(eventHandlers).forEach(([eventName, handlers]) => {
      handlers.forEach((handler) => {
        socket.on(eventName, handler);
      });
    });

    return () => {
      Object.entries(eventHandlers).forEach(([eventName, handlers]) => {
        handlers.forEach((handler) => {
          socket.off(eventName, handler);
        });
      });
    };
  }, [socket, eventHandlers]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        on,
        off,
        emit,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
