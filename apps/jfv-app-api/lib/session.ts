import { randomBytes } from 'node:crypto';
import { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  baseCookieOptions,
  clearCookie,
  parseCookies,
  SESSION_COOKIE,
  serializeCookie,
} from './cookies';
import { getEnv } from './env';

export type Session = {
  userId: string;
  email?: string;
  name?: string;
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt?: number;
  createdAt: number;
};

type SessionStore = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  delete(key: string): Promise<void>;
};

const SESSION_PREFIX = 'jfv:session:';

class MemorySessionStore implements SessionStore {
  private readonly values = new Map<
    string,
    { value: string; expiresAt: number }
  >();

  async get(key: string): Promise<string | null> {
    const entry = this.values.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      this.values.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.values.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async delete(key: string): Promise<void> {
    this.values.delete(key);
  }
}

class RedisSessionStore implements SessionStore {
  private readonly client: Redis;

  constructor(url: string, token: string) {
    this.client = new Redis({ url, token });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get<string>(key);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.client.set(key, value, { ex: ttlSeconds });
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
}

let store: SessionStore | undefined;

function getStore(): SessionStore {
  if (store) {
    return store;
  }

  const env = getEnv();

  if (env.redisUrl && env.redisToken) {
    store = new RedisSessionStore(env.redisUrl, env.redisToken);
    return store;
  }

  if (!env.isProduction) {
    store = new MemorySessionStore();
    return store;
  }

  throw new Error(
    'Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.',
  );
}

function sessionKey(id: string): string {
  return `${SESSION_PREFIX}${id}`;
}

export async function createSession(
  data: Omit<Session, 'createdAt'>,
): Promise<string> {
  const id = randomBytes(32).toString('hex');
  const session: Session = { ...data, createdAt: Date.now() };

  await getStore().set(
    sessionKey(id),
    JSON.stringify(session),
    getEnv().sessionTtlSeconds,
  );

  return id;
}

export async function readSession(id: string): Promise<Session | null> {
  const raw = await getStore().get(sessionKey(id));

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function updateSession(
  id: string,
  session: Session,
): Promise<void> {
  await getStore().set(
    sessionKey(id),
    JSON.stringify(session),
    getEnv().sessionTtlSeconds,
  );
}

export async function deleteSession(id: string): Promise<void> {
  await getStore().delete(sessionKey(id));
}

export function getSessionId(req: VercelRequest): string | undefined {
  return parseCookies(req.headers.cookie)[SESSION_COOKIE];
}

export async function getSessionFromRequest(
  req: VercelRequest,
): Promise<{ id: string; session: Session } | null> {
  const id = getSessionId(req);

  if (!id) {
    return null;
  }

  const session = await readSession(id);

  return session ? { id, session } : null;
}

export function setSessionCookie(res: VercelResponse, sessionId: string): void {
  const env = getEnv();

  res.setHeader(
    'Set-Cookie',
    serializeCookie(SESSION_COOKIE, sessionId, {
      ...baseCookieOptions(env),
      maxAge: env.sessionTtlSeconds,
    }),
  );
}

export function clearSessionCookie(res: VercelResponse): void {
  const env = getEnv();

  res.setHeader('Set-Cookie', clearCookie(SESSION_COOKIE, env));
}

export function resetSessionStoreForTests(): void {
  store = undefined;
}
