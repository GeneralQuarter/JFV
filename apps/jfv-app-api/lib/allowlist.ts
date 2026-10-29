import { getEnv } from './env';
import type { ContentfulUser } from './oauth';

export function isUserAllowed(
  user: ContentfulUser,
  allowedUserIds: readonly string[],
  allowedUserEmails: readonly string[],
): boolean {
  if (allowedUserIds.includes(user.id)) {
    return true;
  }

  const email = user.email?.toLowerCase();

  return !!email && allowedUserEmails.includes(email);
}

export function isConfiguredUserAllowed(user: ContentfulUser): boolean {
  const env = getEnv();

  return isUserAllowed(user, env.allowedUserIds, env.allowedUserEmails);
}
