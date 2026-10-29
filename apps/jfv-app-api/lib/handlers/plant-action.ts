import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createUserClient, getErrorStatus } from '../contentful';
import { applyCors, requireWriteRequest } from '../cors';
import { sendError } from '../http';
import {
  applyPlantAction,
  InvalidPlantEntryError,
  type PlantAction,
} from '../plant-actions';
import { clearSessionCookie, deleteSession } from '../session';
import { getAuthenticatedSession } from '../session-auth';

export async function handlePlantAction(
  req: VercelRequest,
  res: VercelResponse,
  action: PlantAction,
): Promise<void> {
  try {
    if (!applyCors(req, res)) {
      return;
    }

    if (!requireWriteRequest(req, res)) {
      return;
    }
  } catch (error) {
    console.error('request validation failed', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    sendError(res, 500, 'server_error');
    return;
  }

  let authenticated: Awaited<ReturnType<typeof getAuthenticatedSession>>;

  try {
    authenticated = await getAuthenticatedSession(req, res);
  } catch (error) {
    console.error('session lookup failed', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    sendError(res, 503, 'session_unavailable');
    return;
  }

  if (!authenticated) {
    sendError(res, 401, 'unauthenticated');
    return;
  }

  const plantId = req.query.plantId;

  if (typeof plantId !== 'string' || !plantId) {
    sendError(res, 400, 'invalid_plant_id');
    return;
  }

  try {
    const client = createUserClient(authenticated.session.accessToken);
    await applyPlantAction(client, plantId, action);
    res.status(204).end();
  } catch (error) {
    if (error instanceof InvalidPlantEntryError) {
      sendError(res, 400, 'not_a_plant');
      return;
    }

    const status = getErrorStatus(error);

    if (status === 404) {
      sendError(res, 404, 'plant_not_found');
      return;
    }

    if (status === 401) {
      try {
        await deleteSession(authenticated.id);
      } catch {
        // Best effort; the cookie is cleared regardless.
      }
      clearSessionCookie(res);
      sendError(res, 401, 'reauth_required');
      return;
    }

    if (status === 403) {
      sendError(res, 403, 'contentful_permission_denied');
      return;
    }

    console.error('plant action failed', {
      plantId,
      action,
      status,
      message: error instanceof Error ? error.message : 'unknown',
    });
    sendError(res, 502, 'contentful_error');
  }
}
