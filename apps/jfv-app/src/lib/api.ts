export type AuthUser = {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
};

export type ApiResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

const configuredApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? 'http://localhost:3000' : '');
const apiBaseUrl = configuredApiBaseUrl.replace(/\/+$/, '');

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {
    ...(options.method === 'POST' ? { 'X-Requested-With': 'jfv-app' } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      credentials: 'include',
      headers,
    });

    if (response.status === 204) {
      return { ok: true, data: undefined as T };
    }

    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
    };

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: data.error ?? 'request_failed',
      };
    }

    return { ok: true, data: data as T };
  } catch {
    return { ok: false, status: 0, error: 'network_error' };
  }
}

export async function fetchAuthUser(): Promise<AuthUser | null> {
  const result = await apiFetch<{ user: AuthUser }>('/api/auth/me');

  return result.ok ? result.data.user : null;
}

export function getLoginUrl(): string {
  return `${apiBaseUrl}/api/auth/login`;
}

export function logout(): Promise<ApiResult> {
  return apiFetch('/api/auth/logout', { method: 'POST' });
}

export function markPlant(
  action: 'plant' | 'dead',
  plantId: string,
): Promise<ApiResult> {
  return apiFetch(`/api/plants/${encodeURIComponent(plantId)}/${action}`, {
    method: 'POST',
  });
}
