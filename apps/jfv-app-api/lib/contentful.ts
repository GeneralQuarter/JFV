import { createClient, type PlainClientAPI } from 'contentful-management';
import { getEnv } from './env';

export function createUserClient(accessToken: string): PlainClientAPI {
  const env = getEnv();

  return createClient(
    {
      accessToken,
    },
    {
      type: 'plain',
      defaults: {
        spaceId: env.contentfulSpaceId,
        environmentId: env.contentfulEnvironmentId,
      },
    },
  );
}

export function getErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const candidate = error as {
    status?: number;
    response?: { status?: number };
  };

  return candidate.status ?? candidate.response?.status;
}
