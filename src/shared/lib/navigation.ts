export function safeRedirect(next: string | null | undefined, fallback: string): string {
  if (!next || typeof next !== "string") {
    return fallback;
  }

  if (!next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }

  if (next.startsWith("/auth/")) {
    return fallback;
  }

  return next;
}
