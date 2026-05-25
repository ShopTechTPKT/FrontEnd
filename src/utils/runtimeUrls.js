/**
 * Centralized runtime URLs.
 *
 * In DEV we rely on Vite proxy:
 * - API: /api
 * - WS:  /ws
 *
 * In PROD we allow overriding via env, otherwise same-origin.
 */
export function getApiBaseUrl() {
  return import.meta.env.DEV ? "/api" : (import.meta.env.VITE_API_URL || "/api");
}

export function getWsBaseUrl() {
  // SockJS expects base like "/ws" (it will call `${base}/info` etc.)
  const configured = import.meta.env.VITE_WS_URL;
  if (import.meta.env.DEV) return "/ws";
  return configured || "/ws";
}

