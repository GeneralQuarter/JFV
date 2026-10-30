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
    const stateValid = Boolean(
      state && verifyState(stateCookie, state, env.sessionSecret),
    );

    if (process.env.NODE_ENV !== 'production') {
      console.log('oauth callback received', {
        hasCode: Boolean(code),
        hasState: Boolean(state),
        hasStateCookie: Boolean(stateCookie),
        stateValid,
        hasProviderError: Boolean(oauthError),
      });
    }

    if (oauthError || !code || !state || !stateValid) {
      if (oauthError) {
        console.error('oauth provider returned an error', {
          error: oauthError,
          description: queryValue(req.query.error_description),
        });
      } else if (process.env.NODE_ENV !== 'production') {
        console.error('oauth callback rejected: invalid state');
      }
      res.setHeader('Set-Cookie', clearStateCookie);
      redirectToApp(res, env.appOrigin, 'error');
      return;
    }

    const tokens = await exchangeCode(code);
    const user = await fetchCurrentUser(tokens.accessToken);

    if (!isConfiguredUserAllowed(user)) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('oauth user rejected by allowlist', { userId: user.id });
      }
      res.setHeader('Set-Cookie', clearStateCookie);
      redirectToApp(res, env.appOrigin, 'denied');
      return;
    }

    const sessionId = await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt: tokens.expiresAt,
    });

    res.setHeader('Set-Cookie', [
      serializeCookie(SESSION_COOKIE, sessionId, {
        ...baseCookieOptions(env),
        maxAge: env.sessionTtlSeconds,
      }),
      clearStateCookie,
    ]);

    console.log('oauth callback succeeded', {
      userId: user.id,
      sessionCookieSet: true,
    });

    redirectToApp(res, env.appOrigin, 'success');
  } catch (error) {
    console.error('auth callback failed', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    res.setHeader('Set-Cookie', clearStateCookie);
    redirectToApp(res, env.appOrigin, 'error');
  }
}
