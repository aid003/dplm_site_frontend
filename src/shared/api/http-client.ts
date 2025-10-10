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

// Используем локальный прокси для API вместо прямого обращения к серверу
const API_BASE_URL = "/api";

export async function httpRequest<TResponse>(
  path: string,
  { headers, ...init }: HttpRequestOptions = {}
): Promise<TResponse> {
  // Определяем, является ли тело запроса FormData
  const isFormData = init.body instanceof FormData;
  
  const requestHeaders: HeadersInit = {
    // Не устанавливаем Content-Type для FormData - браузер сам установит multipart/form-data с boundary
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...headers,
  };

  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  console.log('HTTP Request:', {
    method: init.method || 'GET',
    url,
    headers: requestHeaders,
    body: init.body,
    cookies: document.cookie
  });

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

  console.log('HTTP Response:', {
    status: response.status,
    statusText: response.statusText,
    contentType,
    payload: payload,
    payloadType: typeof payload,
    payloadKeys: payload && typeof payload === 'object' ? Object.keys(payload) : 'not object'
  });

  if (!response.ok) {
    const errorMessage = isJson && payload && typeof payload === "object" && "message" in payload
      ? String((payload as { message?: string }).message ?? "Request failed")
      : response.statusText || "Request failed";
    
    console.error('HTTP Error:', errorMessage, response.status, payload);
    throw new HttpError(errorMessage, response.status, payload);
  }

  return (payload as TResponse) ?? (undefined as TResponse);
}

export const httpClient = {
  get: <T>(path: string, options?: HttpRequestOptions) =>
    httpRequest<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, options?: HttpRequestOptions) =>
    httpRequest<T>(path, { method: 'POST', ...options }),

  put: <T>(path: string, options?: HttpRequestOptions) =>
    httpRequest<T>(path, { method: 'PUT', ...options }),

  patch: <T>(path: string, options?: HttpRequestOptions) =>
    httpRequest<T>(path, { method: 'PATCH', ...options }),

  delete: <T>(path: string, options?: HttpRequestOptions) =>
    httpRequest<T>(path, { method: 'DELETE', ...options }),
};
