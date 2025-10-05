export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
};

export type SessionData = {
  user: SessionUser;
};

export type SessionStatus = "unknown" | "authenticated" | "unauthenticated";
