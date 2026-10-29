import { config } from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' });
  config();
}

export type CookieSameSite = 'lax' | 'strict' | 'none';

export type ApiEnv = {
  contentfulClientId: string;
  contentfulClientSecret: string;
  contentfulRedirectUri: string;
  contentfulScope: string;
  contentfulSpaceId: string;
  contentfulEnvironmentId: string;
  allowedUserIds: string[];
  allowedUserEmails: string[];
  appOrigin: string;
  allowedOrigins: string[];
  sessionSecret: string;
  sessionTtlSeconds: number;
  cookieSameSite: CookieSameSite;
  secureCookies: boolean;
  isProduction: boolean;
  redisUrl?: string;
  redisToken?: string;
};

let cachedEnv: ApiEnv | undefined;

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function csv(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseSameSite(value: string | undefined): CookieSameSite {
  switch (value?.toLowerCase()) {
    case 'none':
      return 'none';
    case 'strict':
      return 'strict';
    default:
      return 'lax';
  }
}

function parsePositiveNumber(
  value: string | undefined,
  fallback: number,
): number {
  const parsed = Number(value ?? fallback);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid positive number: ${value}`);
  }

  return parsed;
}

export function getEnv(): ApiEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const appOrigin = required('APP_ORIGIN').replace(/\/+$/, '');
  const cookieSameSite = parseSameSite(process.env.COOKIE_SAME_SITE);
  const allowedUserIds = csv(process.env.CONTENTFUL_ALLOWED_USER_IDS);
  const allowedUserEmails = csv(process.env.CONTENTFUL_ALLOWED_USER_EMAILS).map(
    (email) => email.toLowerCase(),
  );

  if (allowedUserIds.length === 0 && allowedUserEmails.length === 0) {
    throw new Error(
      'At least one of CONTENTFUL_ALLOWED_USER_IDS or CONTENTFUL_ALLOWED_USER_EMAILS must be set',
    );
  }

  cachedEnv = {
    contentfulClientId: required('CONTENTFUL_OAUTH_CLIENT_ID'),
    contentfulClientSecret: required('CONTENTFUL_OAUTH_CLIENT_SECRET'),
    contentfulRedirectUri: required('CONTENTFUL_OAUTH_REDIRECT_URI'),
    contentfulScope:
      process.env.CONTENTFUL_OAUTH_SCOPE ?? 'content_management_manage',
    contentfulSpaceId: required('CONTENTFUL_SPACE_ID'),
    contentfulEnvironmentId: required('CONTENTFUL_ENVIRONMENT_ID'),
    allowedUserIds,
    allowedUserEmails,
    appOrigin,
    allowedOrigins: [
      ...new Set([appOrigin, ...csv(process.env.ALLOWED_ORIGINS)]),
    ],
    sessionSecret: required('SESSION_SECRET'),
    sessionTtlSeconds: parsePositiveNumber(
      process.env.SESSION_TTL_SECONDS,
      604_800,
    ),
    cookieSameSite,
    secureCookies:
      appOrigin.startsWith('https://') || cookieSameSite === 'none',
    isProduction: process.env.NODE_ENV === 'production',
    redisUrl: process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL,
    redisToken:
      process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN,
  };

  return cachedEnv;
}

export function resetEnvCacheForTests(): void {
  cachedEnv = undefined;
}
