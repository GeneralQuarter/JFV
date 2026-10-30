import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getEnv } from '../lib/env';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const env = getEnv();
    const sessionStore =
      env.redisUrl && env.redisToken
        ? 'redis'
        : env.isProduction
          ? 'missing'
          : 'file';

    res.status(200).json({ status: 'ok', sessionStore });
  } catch {
    res.status(500).json({ status: 'error' });
  }
}
