type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class HttpError<T = unknown> extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: T
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export type HttpRequestOptions = RequestInit & {
  method?: HttpMethod;
};

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "");

export async function httpRequest<TResponse>(
  path: string,
  { headers, ...init }: HttpRequestOptions = {}
): Promise<TResponse> {
  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...init,
    headers: requestHeaders,
    credentials: "include",
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const payload = isJson ? await response.json().catch(() => undefined) : await response
    .text()
    .catch(() => undefined);

  if (!response.ok) {
    throw new HttpError(
      isJson && payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: string }).message ?? "Request failed")
        : response.statusText || "Request failed",
      response.status,
      payload
    );
  }

  return (payload as TResponse) ?? (undefined as TResponse);
}
