import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  baseCookieOptions,
  OAUTH_STATE_COOKIE,
  serializeCookie,
} from '../../lib/cookies';
import { getEnv } from '../../lib/env';
import { methodNotAllowed } from '../../lib/http';
import { buildAuthorizeUrl } from '../../lib/oauth';
import { createStateValue } from '../../lib/state';

export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (req.method !== 'GET') {
    methodNotAllowed(res, 'GET');
    return;
  }

  try {
    const env = getEnv();
    const { state, cookieValue } = createStateValue(env.sessionSecret);

    res.setHeader(
      'Set-Cookie',
      serializeCookie(OAUTH_STATE_COOKIE, cookieValue, {
        ...baseCookieOptions(env, '/api/auth'),
        maxAge: 600,
      }),
    );
    res.redirect(302, buildAuthorizeUrl(state));
  } catch (error) {
    console.error('auth login failed', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    res.status(500).json({ error: 'server_error' });
  }
}
