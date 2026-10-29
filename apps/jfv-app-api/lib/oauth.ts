import { getEnv } from './env';

const AUTHORIZE_URL = 'https://be.contentful.com/oauth/authorize';
const TOKEN_URL = 'https://be.contentful.com/oauth/token';
const USERS_ME_URL = 'https://api.contentful.com/users/me';

export type ContentfulUser = {
  id: string;
  email?: string;
  name?: string;
};

export type TokenSet = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scope?: string;
};

export class OAuthError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'OAuthError';
  }
}

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
};

type UserResponse = {
  sys?: { id?: string };
  email?: string;
  firstName?: string;
  lastName?: string;
};

export function buildAuthorizeUrl(state: string): string {
  const env = getEnv();
  const url = new URL(AUTHORIZE_URL);

  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', env.contentfulClientId);
  url.searchParams.set('redirect_uri', env.contentfulRedirectUri);
  url.searchParams.set('scope', env.contentfulScope);
  url.searchParams.set('state', state);

  return url.toString();
}

async function requestToken(params: Record<string, string>): Promise<TokenSet> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  if (params.client_id && params.client_secret) {
    headers.Authorization = `Basic ${Buffer.from(
      `${params.client_id}:${params.client_secret}`,
    ).toString('base64')}`;
  }

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers,
    body: new URLSearchParams(params).toString(),
  });

  if (!response.ok) {
    const raw = await response.text();
    let detail = '';

    try {
      const errorBody = JSON.parse(raw) as {
        error?: string;
        errorMessage?: string;
      };
      detail = [errorBody.error, errorBody.errorMessage]
        .filter(Boolean)
        .join(': ');
    } catch {
      // Keep the generic message if the response is not JSON.
    }

    throw new OAuthError(
      response.status,
      `Contentful token request failed${detail ? ` (${detail})` : ''}`,
    );
  }

  const data = (await response.json()) as TokenResponse;

  if (!data.access_token) {
    throw new OAuthError(500, 'Contentful token response is missing a token');
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in
      ? Date.now() + data.expires_in * 1000
      : undefined,
    scope: data.scope,
  };
}

export function exchangeCode(code: string): Promise<TokenSet> {
  const env = getEnv();

  return requestToken({
    grant_type: 'authorization_code',
    code,
    client_id: env.contentfulClientId,
    client_secret: env.contentfulClientSecret,
    redirect_uri: env.contentfulRedirectUri,
  });
}

export function refreshAccessToken(refreshToken: string): Promise<TokenSet> {
  const env = getEnv();

  return requestToken({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: env.contentfulClientId,
    client_secret: env.contentfulClientSecret,
  });
}

export async function fetchCurrentUser(
  accessToken: string,
): Promise<ContentfulUser> {
  const response = await fetch(USERS_ME_URL, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new OAuthError(response.status, 'Contentful user lookup failed');
  }

  const data = (await response.json()) as UserResponse;
  const id = data.sys?.id;

  if (!id) {
    throw new OAuthError(500, 'Contentful user response is missing an id');
  }

  const name = [data.firstName, data.lastName].filter(Boolean).join(' ');

  return {
    id,
    email: data.email,
    name: name || undefined,
  };
}
