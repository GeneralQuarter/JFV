import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export function signState(state: string, secret: string): string {
  return createHmac('sha256', secret).update(state).digest('hex');
}

export function verifyState(
  cookieValue: string | undefined,
  state: string,
  secret: string,
): boolean {
  if (!cookieValue) {
    return false;
  }

  const [cookieState, signature] = cookieValue.split('.');

  if (!cookieState || !signature || cookieState !== state) {
    return false;
  }

  const expected = Buffer.from(signState(cookieState, secret));
  const received = Buffer.from(signature);

  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

export function createStateValue(secret: string): {
  state: string;
  cookieValue: string;
} {
  const state = randomBytes(24).toString('hex');

  return {
    state,
    cookieValue: `${state}.${signState(state, secret)}`,
  };
}
