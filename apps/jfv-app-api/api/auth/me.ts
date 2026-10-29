import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from '../../lib/cors';
import { methodNotAllowed, sendError } from '../../lib/http';
import { getAuthenticatedSession } from '../../lib/session-auth';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  try {
    if (!applyCors(req, res)) {
      return;
    }
  } catch (error) {
    console.error('cors validation failed', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    sendError(res, 500, 'server_error');
    return;
  }

  if (req.method !== 'GET') {
    methodNotAllowed(res, 'GET');
    return;
  }

  try {
    const authenticated = await getAuthenticatedSession(req, res);

    if (!authenticated) {
      sendError(res, 401, 'unauthenticated');
      return;
    }

    res.status(200).json({
      user: {
        id: authenticated.session.userId,
        email: authenticated.session.email,
        name: authenticated.session.name,
        avatarUrl: authenticated.session.avatarUrl,
      },
    });
  } catch (error) {
    console.error('session lookup failed', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    sendError(res, 503, 'session_unavailable');
  }
}
