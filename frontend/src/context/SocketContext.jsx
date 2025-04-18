/* eslint-disable react/prop-types */
// SocketContext.js
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useUser } from './UserContext';

const SocketContext = createContext();
const API_BASE_URL = import.meta.env.BACKEND_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useUser();

  // Replace eventHandlers state with a ref
  const eventHandlersRef = useRef({});

  // Register event handlers
  const on = (eventName, handler) => {
    if (!eventHandlersRef.current[eventName]) {
      eventHandlersRef.current[eventName] = [];
    }
    eventHandlersRef.current[eventName].push(handler);

    if (socket) {
      socket.on(eventName, handler);
    }
  };

  // Unregister event handlers
  const off = (eventName, handler) => {
    const handlers = eventHandlersRef.current[eventName];
    if (!handlers) return;

    eventHandlersRef.current[eventName] = handlers.filter((h) => h !== handler);

    if (socket) {
      socket.off(eventName, handler);
    }
  };

  // Emit events
  const emit = (eventName, data) => {
    if (socket && isConnected) {
      socket.emit(eventName, data);
    }
  };

  // Initialize socket connection
  useEffect(() => {
    if (!user?._id) return;

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
