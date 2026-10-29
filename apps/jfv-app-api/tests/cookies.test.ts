import { describe, expect, it } from 'vitest';
import { parseCookies, serializeCookie } from '../lib/cookies';

describe('cookies', () => {
  it('parses and decodes multiple cookies', () => {
    expect(parseCookies('one=hello%20world; two=value; malformed')).toEqual({
      one: 'hello world',
      two: 'value',
    });
  });

  it('serializes security attributes', () => {
    expect(
      serializeCookie('session', 'abc', {
        httpOnly: true,
        maxAge: 60,
        path: '/',
        sameSite: 'lax',
        secure: true,
      }),
    ).toBe('session=abc; Max-Age=60; Path=/; HttpOnly; Secure; SameSite=Lax');
  });
});
