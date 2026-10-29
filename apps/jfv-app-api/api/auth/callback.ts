import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isConfiguredUserAllowed } from '../../lib/allowlist';
import {
  baseCookieOptions,
  clearCookie,
  OAUTH_STATE_COOKIE,
  parseCookies,
  SESSION_COOKIE,
  serializeCookie,
} from '../../lib/cookies';
import { getEnv } from '../../lib/env';
import { methodNotAllowed } from '../../lib/http';
import { exchangeCode, fetchCurrentUser } from '../../lib/oauth';
import { createSession } from '../../lib/session';
import { verifyState } from '../../lib/state';

function queryValue(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function redirectToApp(
  res: VercelResponse,
  appOrigin: string,
  result: 'success' | 'denied' | 'error',
): void {
  const url = new URL(appOrigin);
  url.searchParams.set('auth', result);
  res.redirect(302, url.toString());
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    methodNotAllowed(res, 'GET');
    return;
  }

  const env = getEnv();
  const clearStateCookie = clearCookie(OAUTH_STATE_COOKIE, env, '/api/auth');

  try {
    const code = queryValue(req.query.code);
    const state = queryValue(req.query.state);
    const stateCookie = parseCookies(req.headers.cookie)[OAUTH_STATE_COOKIE];
    const oauthError = queryValue(req.query.error);

    if (
      oauthError ||
      !code ||
      !state ||
      !verifyState(stateCookie, state, env.sessionSecret)
    ) {
      if (oauthError) {
        console.error('oauth provider returned an error', {
          error: oauthError,
          description: queryValue(req.query.error_description),
        });
      }
      res.setHeader('Set-Cookie', clearStateCookie);
      redirectToApp(res, env.appOrigin, 'error');
      return;
    }

    const tokens = await exchangeCode(code);
    const user = await fetchCurrentUser(tokens.accessToken);

    if (!isConfiguredUserAllowed(user)) {
      res.setHeader('Set-Cookie', clearStateCookie);
      redirectToApp(res, env.appOrigin, 'denied');
      return;
    }

    const sessionId = await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt: tokens.expiresAt,
    });

    res.setHeader('Set-Cookie', [
      clearStateCookie,
      serializeCookie(SESSION_COOKIE, sessionId, {
        ...baseCookieOptions(env),
        maxAge: env.sessionTtlSeconds,
      }),
    ]);

    redirectToApp(res, env.appOrigin, 'success');
  } catch (error) {
    console.error('auth callback failed', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    res.setHeader('Set-Cookie', clearStateCookie);
    redirectToApp(res, env.appOrigin, 'error');
  }
}
