import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isConfiguredUserAllowed } from './allowlist';
import { refreshAccessToken } from './oauth';
import {
  clearSessionCookie,
  deleteSession,
  getSessionFromRequest,
  getSessionId,
  type Session,
  updateSession,
} from './session';

export type AuthenticatedSession = {
  id: string;
  session: Session;
};

export async function getAuthenticatedSession(
  req: VercelRequest,
  res: VercelResponse,
): Promise<AuthenticatedSession | null> {
  if (process.env.NODE_ENV !== 'production') {
    console.log('auth session lookup', {
      hasSessionCookie: Boolean(getSessionId(req)),
    });
  }

  const found = await getSessionFromRequest(req);

  if (!found) {
    clearSessionCookie(res);
    return null;
  }

  const user = {
    id: found.session.userId,
    email: found.session.email,
  };

  if (!isConfiguredUserAllowed(user)) {
    await deleteSession(found.id);
    clearSessionCookie(res);
    return null;
  }

  let session = found.session;

  if (
    session.accessTokenExpiresAt &&
    session.accessTokenExpiresAt <= Date.now() + 60_000
  ) {
    if (!session.refreshToken) {
      await deleteSession(found.id);
      clearSessionCookie(res);
      return null;
    }

    try {
      const tokens = await refreshAccessToken(session.refreshToken);

      session = {
        ...session,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken ?? session.refreshToken,
        accessTokenExpiresAt: tokens.expiresAt,
      };

      await updateSession(found.id, session);
    } catch {
      await deleteSession(found.id);
      clearSessionCookie(res);
      return null;
    }
  }

  return { id: found.id, session };
}
