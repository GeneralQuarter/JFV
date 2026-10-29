import { describe, expect, it } from 'vitest';
import { createStateValue, signState, verifyState } from '../lib/state';

const secret = 'test-secret';

describe('OAuth state', () => {
  it('verifies a state cookie created by createStateValue', () => {
    const { state, cookieValue } = createStateValue(secret);

    expect(verifyState(cookieValue, state, secret)).toBe(true);
  });

  it('rejects a different state', () => {
    const { cookieValue } = createStateValue(secret);

    expect(verifyState(cookieValue, 'different-state', secret)).toBe(false);
  });

  it('rejects a tampered signature', () => {
    const { state, cookieValue } = createStateValue(secret);
    const tampered = `${cookieValue}tampered`;

    expect(verifyState(tampered, state, secret)).toBe(false);
  });

  it('rejects a missing cookie', () => {
    expect(verifyState(undefined, 'state', secret)).toBe(false);
  });

  it('produces a deterministic signature for the same state', () => {
    expect(signState('abc', secret)).toBe(signState('abc', secret));
    expect(signState('abc', secret)).not.toBe(signState('abd', secret));
  });
});
