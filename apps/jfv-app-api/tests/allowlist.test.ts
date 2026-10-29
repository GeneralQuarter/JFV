import { describe, expect, it } from 'vitest';
import { isUserAllowed } from '../lib/allowlist';

describe('isUserAllowed', () => {
  it('allows a matching user id', () => {
    expect(isUserAllowed({ id: 'user-1' }, ['user-1'], [])).toBe(true);
  });

  it('allows a matching email case-insensitively', () => {
    expect(
      isUserAllowed(
        { id: 'other', email: 'Person@Example.com' },
        [],
        ['person@example.com'],
      ),
    ).toBe(true);
  });

  it('rejects an unknown user', () => {
    expect(isUserAllowed({ id: 'unknown' }, ['user-1'], [])).toBe(false);
  });
});
