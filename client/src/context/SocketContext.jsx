import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user && token) {
      const socketIo = io(import.meta.env.VITE_API_URL || 'http://localhost:5000/api', {
        auth: {
          token: `Bearer ${token}`
        }
      });

      socketIo.on('connect', () => {
        console.log('Socket connected:', socketIo.id);
        // Identify user to join room
        socketIo.emit('identify', user._id);
      });

      socketIo.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      setSocket(socketIo);

      return () => {
        socketIo.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user, token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
