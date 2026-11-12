async function apiRequest(path, accessToken, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status}).`);
  return body;
}

export const TREND_DAYS = 30;

export function fetchContent(accessToken) {
  return apiRequest("/api/ops/content", accessToken);
}

export async function requestSync(accessToken) {
  const body = await apiRequest("/api/sync", accessToken, { method: "POST" });
  return body?.results || [];
}
