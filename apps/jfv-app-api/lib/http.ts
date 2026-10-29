import type { VercelResponse } from '@vercel/node';

export function sendError(
  res: VercelResponse,
  status: number,
  error: string,
): void {
  res.status(status).json({ error });
}

export function methodNotAllowed(res: VercelResponse, allow = 'GET'): void {
  res.setHeader('Allow', allow);
  sendError(res, 405, 'method_not_allowed');
}

export function noContent(res: VercelResponse): void {
  res.status(204).end();
}
