import { httpRequest } from "@/shared/api/http-client";
import type { SessionData } from "../model/types";

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  email: string;
  password: string;
  name?: string;
};

export const authApi = {
  signIn: (payload: SignInPayload) =>
    httpRequest<SessionData>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  signUp: (payload: SignUpPayload) =>
    httpRequest<SessionData>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  session: () => httpRequest<SessionData>("/auth/session"),

  signOut: () =>
    httpRequest<void>("/auth/logout", {
      method: "POST",
    }),
};
