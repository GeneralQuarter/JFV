import type { ApiEnv, CookieSameSite } from './env';

export const SESSION_COOKIE = 'jfv_session';
export const OAUTH_STATE_COOKIE = 'jfv_oauth_state';

export type CookieOptions = {
  maxAge?: number;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: CookieSameSite;
};

export function parseCookies(header?: string): Record<string, string> {
  if (!header) {
    return {};
  }

  return header.split(';').reduce<Record<string, string>>((cookies, part) => {
    const separatorIndex = part.indexOf('=');

    if (separatorIndex === -1) {
      return cookies;
    }

    const name = part.slice(0, separatorIndex).trim();
    const rawValue = part.slice(separatorIndex + 1).trim();

    if (!name) {
      return cookies;
    }

    try {
      cookies[name] = decodeURIComponent(rawValue);
    } catch {
      cookies[name] = rawValue;
    }

    return cookies;
  }, {});
}

function serializeSameSite(sameSite: CookieSameSite): string {
  return `${sameSite.charAt(0).toUpperCase()}${sameSite.slice(1)}`;
}

export function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  }

  if (options.path) {
    parts.push(`Path=${options.path}`);
  }

  if (options.httpOnly) {
    parts.push('HttpOnly');
  }

  if (options.secure) {
    parts.push('Secure');
  }

  if (options.sameSite) {
    parts.push(`SameSite=${serializeSameSite(options.sameSite)}`);
  }

  return parts.join('; ');
}

export function baseCookieOptions(env: ApiEnv, path = '/'): CookieOptions {
  return {
    httpOnly: true,
    secure: env.secureCookies,
    sameSite: env.cookieSameSite,
    path,
  };
}

export function clearCookie(name: string, env: ApiEnv, path = '/'): string {
  return serializeCookie(name, '', {
    ...baseCookieOptions(env, path),
    maxAge: 0,
  });
}
