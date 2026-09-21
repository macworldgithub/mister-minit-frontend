/**
 * API Client configuration
 *
 * To connect to the live NestJS backend:
 * 1. Set `USE_MOCK = false` (or specify VITE_USE_MOCK=false in .env)
 * 2. Ensure `API_BASE_URL` points to your NestJS server (e.g. http://localhost:3000)
 */
export const API_CONFIG = {
  baseURL:
    (import.meta as { env?: Record<string, string> }).env?.VITE_API_URL ||
    "https://www.mister-minit.omnisuiteai.com",
  // Allow toggling via VITE_USE_MOCK in env or window.localStorage('USE_MOCK')
  useMock:
    typeof window !== "undefined" &&
    window.localStorage?.getItem("USE_MOCK") !== null
      ? window.localStorage.getItem("USE_MOCK") === "true"
      : (import.meta as { env?: Record<string, string> }).env?.VITE_USE_MOCK ===
          "true"
        ? true
        : false,
};

export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API Error [${response.status}]: ${errorText || response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}
