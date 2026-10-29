import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getEnv } from './env';
import { methodNotAllowed, sendError } from './http';

export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin;

  if (origin) {
    const allowedOrigins = getEnv().allowedOrigins;

    if (!allowedOrigins.includes(origin)) {
      sendError(res, 403, 'origin_not_allowed');
      return false;
    }

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, X-Requested-With',
    );
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return false;
  }

  return true;
}

export function requireWriteRequest(
  req: VercelRequest,
  res: VercelResponse,
): boolean {
  if (req.method !== 'POST') {
    methodNotAllowed(res, 'POST');
    return false;
  }

  if (req.headers['x-requested-with'] !== 'jfv-app') {
    sendError(res, 400, 'missing_write_header');
    return false;
  }

  return true;
}
