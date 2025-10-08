"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  WebSocketIncomingMessage,
  WebSocketOutgoingMessage,
  ActiveUsersMessage,
} from '../model/types';

interface UseWebSocketOptions {
  projectId: string;
  onMessage?: (message: WebSocketIncomingMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  activeUsers: ActiveUsersMessage['users'];
  sendMessage: (message: WebSocketOutgoingMessage) => void;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const { projectId } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUsersMessage['users']>([]);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Храним коллбеки в ref, чтобы не пересоздавать подключения при каждом рендере
  const onMessageRef = useRef<((message: WebSocketIncomingMessage) => void) | undefined>(options.onMessage);
  const onConnectRef = useRef<(() => void) | undefined>(options.onConnect);
  const onDisconnectRef = useRef<(() => void) | undefined>(options.onDisconnect);
  const onErrorRef = useRef<((error: Event) => void) | undefined>(options.onError);

  useEffect(() => { onMessageRef.current = options.onMessage; }, [options.onMessage]);
  useEffect(() => { onConnectRef.current = options.onConnect; }, [options.onConnect]);
  useEffect(() => { onDisconnectRef.current = options.onDisconnect; }, [options.onDisconnect]);
  useEffect(() => { onErrorRef.current = options.onError; }, [options.onError]);

  const handleMessage = useCallback((message: WebSocketIncomingMessage) => {
    switch (message.type) {
      case 'active_users':
        setActiveUsers(message.users);
        break;

      case 'file_modified':
        // Обновляем активных пользователей
        setActiveUsers(prev =>
          prev.map(user =>
            user.userId === message.userId
              ? { ...user, lastSeen: message.timestamp }
              : user
          )
        );
        break;

      case 'user_joined':
        setActiveUsers(prev => [...prev, {
          userId: message.userId,
          userName: message.userName,
          userEmail: message.userEmail,
          filePath: '',
          lastSeen: message.timestamp,
        }]);
        break;

      case 'user_left':
        setActiveUsers(prev => prev.filter(user => user.userId !== message.userId));
        break;
    }

    // Прокидываем наружу, если передан обработчик
    if (onMessageRef.current) {
      onMessageRef.current(message);
    }
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    // Берём базовый URL из env или используем текущий хост
    const configuredBase = (process.env.NEXT_PUBLIC_WS_URL ?? '').trim();
    let baseUrl = configuredBase;

    // Если URL начинается с http://, заменяем на ws:// для WebSocket
    if (baseUrl && baseUrl.startsWith('http://')) {
      baseUrl = baseUrl.replace('http://', 'ws://');
    }

    if (!baseUrl && typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      baseUrl = `${protocol}://${window.location.host}`;
    }

    try {
      const socket = io(baseUrl, {
        path: '/projects',
        query: { projectId },
        transports: ['websocket'],
        forceNew: true,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Socket.IO connected');
        setIsConnected(true);
        if (onConnectRef.current) {
          onConnectRef.current();
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason);
        setIsConnected(false);
        setActiveUsers([]);
        if (onDisconnectRef.current) {
          onDisconnectRef.current();
        }

        // Автопереподключение через 5 секунд, если не было ручного отключения
        if (reason !== 'io client disconnect') {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        }
      });

      socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        if (onErrorRef.current) {
          onErrorRef.current(error as unknown as Event);
        }
      });

      socket.on('message', (data: WebSocketIncomingMessage) => {
        handleMessage(data);
      });

    } catch (error) {
      console.error('Failed to create Socket.IO connection:', error);
      if (onErrorRef.current) {
        onErrorRef.current(error as Event);
      }
    }
  }, [projectId, handleMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
    setActiveUsers([]);
  }, []);

  const sendMessage = (message: WebSocketOutgoingMessage) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('message', message);
    } else {
      console.warn('Socket.IO not connected, cannot send message');
    }
  };

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [projectId, connect, disconnect]);

  return {
    isConnected,
    activeUsers,
    sendMessage,
    connect,
    disconnect,
  };
}
