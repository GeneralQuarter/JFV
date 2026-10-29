import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors, requireWriteRequest } from '../../lib/cors';
import { sendError } from '../../lib/http';
import {
  clearSessionCookie,
  deleteSession,
  getSessionId,
} from '../../lib/session';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  try {
    if (!applyCors(req, res)) {
      return;
    }

    if (!requireWriteRequest(req, res)) {
      return;
    }
  } catch (error) {
    console.error('logout validation failed', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    sendError(res, 500, 'server_error');
    return;
  }

  const sessionId = getSessionId(req);

  if (sessionId) {
    try {
      await deleteSession(sessionId);
    } catch (error) {
      console.error('session deletion failed', {
        message: error instanceof Error ? error.message : 'unknown',
      });
    }
  }

  try {
    clearSessionCookie(res);
    res.status(204).end();
  } catch (error) {
    console.error('cookie clear failed', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    sendError(res, 500, 'server_error');
  }
}
