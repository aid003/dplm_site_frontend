"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import type { SessionData, SessionStatus, SessionUser } from "./types";

type SessionState = {
  user: SessionUser | null;
  status: SessionStatus;
};

type SessionActions = {
  setSession: (session: SessionData) => void;
  setStatus: (status: SessionStatus) => void;
  clearSession: () => void;
  markUnknown: () => void;
};

const initialState: SessionState = {
  user: null,
  status: "unknown",
};

export type SessionStore = SessionState & SessionActions;

export const useSessionStore = create<SessionStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setSession: (session) =>
          set(
            {
              user: session.user,
              status: "authenticated",
            },
            false,
            "session:setSession"
          ),
        setStatus: (status) => set({ status }, false, "session:setStatus"),
        clearSession: () =>
          set(
            {
              user: null,
              status: "unauthenticated",
            },
            false,
            "session:clearSession"
          ),
        markUnknown: () => set({ ...initialState }, false, "session:markUnknown"),
      }),
      {
        name: "session-storage",
        // Сохраняем только пользователя, статус всегда начинается с "unknown"
        partialize: (state) => ({ user: state.user }),
        // При загрузке из localStorage устанавливаем статус "unknown" для проверки сессии
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.status = "unknown";
          }
        },
      }
    ),
    { name: "session" }
  )
);

export const useSessionSelector = <T>(selector: (store: SessionStore) => T): T =>
  useSessionStore(selector);

export const useSessionActions = () => {
  const { setSession, setStatus, clearSession, markUnknown } = useSessionStore.getState();
  return { setSession, setStatus, clearSession, markUnknown };
};
