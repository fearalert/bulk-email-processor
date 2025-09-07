/** @format */
import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from '../contexts/Authcontext';

interface SocketEvents {
  emailStatusUpdate: (data: { logId: number; status: string; email: string }) => void;
  bulkEmailProgress: (data: { processed: number; total: number; userId: number }) => void;
}

type EventKeys = keyof SocketEvents;

export const useSocket = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (loading || !isAuthenticated || !user) return;

    const token = localStorage.getItem('authToken') || '';
    const socket: Socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setConnected(true);
      socket.emit('joinRoom', `user_${user.id}`);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [loading, isAuthenticated, user]);

  const on = <K extends EventKeys>(event: K, callback: SocketEvents[K]) => {
    socketRef.current?.on(event as string, callback as (...args: any[]) => void);
  };

  const off = <K extends EventKeys>(event: K, callback?: SocketEvents[K]) => {
    if (!socketRef.current) return;
    if (callback) {
      socketRef.current.off(event as string, callback as (...args: any[]) => void);
    } else {
      socketRef.current.off(event as string);
    }
  };

  const emit = <K extends EventKeys>(event: K, data: Parameters<SocketEvents[K]>[0]) => {
    if (socketRef.current && connected) {
      socketRef.current.emit(event as string, data);
    }
  };

  return {
    connected,
    on,
    off,
    emit,
    socket: socketRef.current,
  };
};
