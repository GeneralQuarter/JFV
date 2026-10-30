import { randomBytes } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
  avatarUrl?: string;
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

class FileSessionStore implements SessionStore {
  private readonly directory: string;

  constructor(directory = join(tmpdir(), 'jfv-app-api-sessions')) {
    this.directory = directory;
  }

  private filePath(key: string): string {
    return join(this.directory, `${encodeURIComponent(key)}.json`);
  }

  private async ensureDirectory(): Promise<void> {
    await mkdir(this.directory, { recursive: true });
  }

  async get(key: string): Promise<string | null> {
    try {
      const raw = await readFile(this.filePath(key), 'utf8');
      const entry = JSON.parse(raw) as {
        value?: string;
        expiresAt?: number;
      };

      if (
        typeof entry.value !== 'string' ||
        typeof entry.expiresAt !== 'number' ||
        entry.expiresAt <= Date.now()
      ) {
        await this.delete(key);
        return null;
      }

      return entry.value;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }

      if (error instanceof SyntaxError) {
        await this.delete(key);
        return null;
      }

      throw error;
    }
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.ensureDirectory();
    await writeFile(
      this.filePath(key),
      JSON.stringify({
        value,
        expiresAt: Date.now() + ttlSeconds * 1000,
      }),
      'utf8',
    );
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(this.filePath(key));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

class RedisSessionStore implements SessionStore {
  private readonly client: Redis;

  constructor(url: string, token: string) {
    // Sessions are stored as JSON strings and parsed by readSession. Upstash
    // deserializes JSON values by default, which would return an object and
    // make JSON.parse throw, so keep the raw string.
    this.client = new Redis({ url, token, automaticDeserialization: false });
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
    store = new FileSessionStore(process.env.SESSION_STORE_DIR);
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
