"use client";

import { useState, type ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from "@tanstack/react-query";

const defaultConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      // Кэшируем данные на 5 минут
      staleTime: 5 * 60 * 1000,
      // Храним данные в кэше до 10 минут
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      retry: 0,
    },
  },
};

type QueryProviderProps = {
  children: ReactNode;
  config?: QueryClientConfig;
};

export function QueryProvider({ children, config }: QueryProviderProps) {
  const [client] = useState(() => new QueryClient(config ?? defaultConfig));

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
