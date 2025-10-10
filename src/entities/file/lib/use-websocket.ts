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
  sendMessage: (message: any) => void;
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

  const handleMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'active_users':
        setActiveUsers(message.users);
        break;

      case 'file_modified':
        // Обновляем активных пользователей
        setActiveUsers(prev =>
          prev.map((user: any) =>
            String(user.userId) === String(message.userId)
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
        setActiveUsers(prev => prev.filter((user: any) => String(user.userId) !== String(message.userId)));
        break;
    }

    // Прокидываем наружу, если передан обработчик
    if (onMessageRef.current) {
      onMessageRef.current(message);
    }
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    // Берём базовый URL из env или используем бэкенд напрямую
    const configuredBase = (process.env.NEXT_PUBLIC_WS_URL ?? '').trim();
    let baseUrl = '';

    // Логируем для диагностики
    console.log('🔍 WebSocket Debug:', {
      configuredBase,
      windowLocation: typeof window !== 'undefined' ? window.location.host : 'SSR',
      willUseBaseUrl: baseUrl || 'direct to backend'
    });

    // Если переменная окружения задана, используем прямое подключение к бэкенду
    if (configuredBase) {
      // Преобразуем HTTP URL в WebSocket URL
      if (configuredBase.startsWith('http://')) {
        baseUrl = configuredBase.replace('http://', 'ws://');
      } else if (configuredBase.startsWith('https://')) {
        baseUrl = configuredBase.replace('https://', 'wss://');
      } else {
        baseUrl = configuredBase;
      }
      console.log('📡 Using direct backend connection:', baseUrl);
    } else if (typeof window !== 'undefined') {
      // Fallback: используем текущий хост с WebSocket протоколом
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      baseUrl = `${protocol}://${window.location.host}`;
      console.log('📡 Using direct mode:', baseUrl);
    }

    try {
      console.log('🚀 Attempting WebSocket connection to:', baseUrl || 'relative path');

      const socket = io(`${baseUrl}/projects`, {
        query: { projectId },
        transports: ['websocket'],
        forceNew: true,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('✅ Socket.IO connected successfully!');
        setIsConnected(true);
        if (onConnectRef.current) {
          onConnectRef.current();
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ Socket.IO disconnected:', reason);
        setIsConnected(false);
        setActiveUsers([]);
        if (onDisconnectRef.current) {
          onDisconnectRef.current();
        }

        // Автопереподключение через 5 секунд, если не было ручного отключения
        if (reason !== 'io client disconnect') {
          console.log('🔄 Attempting reconnection in 5 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Reconnecting...');
            connect();
          }, 5000);
        }
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          description: (error as any).description,
          context: (error as any).context,
          type: (error as any).type
        });
        if (onErrorRef.current) {
          onErrorRef.current(error as unknown as Event);
        }
      });

      socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 Reconnection attempt #' + attemptNumber);
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('✅ Socket.IO reconnected after ' + attemptNumber + ' attempts');
      });

      socket.on('reconnect_error', (error) => {
        console.error('❌ Socket.IO reconnection failed:', error);
      });

      // Подписываемся на все события от сервера
      socket.on('active_users', (data) => {
        const message: WebSocketIncomingMessage = {
          type: 'active_users',
          users: data.users || data,
          timestamp: new Date().toISOString(),
        };
        handleMessage(message);
      });

      socket.on('user_joined', (data) => {
        const message: WebSocketIncomingMessage = {
          type: 'user_joined',
          userId: data.userId,
          userName: data.userName,
          userEmail: data.userEmail,
          timestamp: data.timestamp || new Date().toISOString(),
        };
        handleMessage(message);
      });

      socket.on('user_left', (data) => {
        const message: WebSocketIncomingMessage = {
          type: 'user_left',
          userId: data.userId,
          timestamp: data.timestamp || new Date().toISOString(),
        };
        handleMessage(message);
      });

      socket.on('file_opened', (data) => {
        const message: any = {
          type: 'file_opened',
          userId: data.userId,
          userName: data.userName,
          filePath: data.filePath,
          timestamp: data.timestamp || new Date().toISOString(),
        };
        handleMessage(message);
      });

      socket.on('file_closed', (data) => {
        const message: any = {
          type: 'file_closed',
          userId: data.userId,
          userName: data.userName,
          filePath: data.filePath,
          timestamp: data.timestamp || new Date().toISOString(),
        };
        handleMessage(message);
      });

      socket.on('cursor_moved', (data) => {
        const message: any = {
          type: 'cursor_moved',
          userId: data.userId,
          userName: data.userName,
          filePath: data.filePath,
          cursor: data.cursor,
          timestamp: data.timestamp || new Date().toISOString(),
        };
        handleMessage(message);
      });

      socket.on('content_changed', (data) => {
        const message: any = {
          type: 'content_changed',
          userId: data.userId,
          userName: data.userName,
          filePath: data.filePath,
          content: data.content,
          timestamp: data.timestamp || new Date().toISOString(),
        };
        handleMessage(message);
      });

      socket.on('file_modified', (data) => {
        const message: any = {
          type: 'file_modified',
          filePath: data.filePath,
          userId: data.userId,
          timestamp: data.timestamp || new Date().toISOString(),
        };
        handleMessage(message);
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
      socketRef.current.emit(message.type, message);
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
