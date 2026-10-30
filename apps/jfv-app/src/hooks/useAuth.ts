import { useCallback, useEffect, useState } from 'react';
import {
  type AuthUser,
  fetchAuthUser,
  getLoginUrl,
  logout as logoutRequest,
} from '../lib/api';

export type AuthStatus = 'loading' | 'anonymous' | 'authenticated';
export type AuthNotice = 'denied' | 'error';

type AuthState = {
  status: AuthStatus;
  user?: AuthUser;
  notice?: AuthNotice;
};

type UseAuth = AuthState & {
  login: () => void;
  logout: () => Promise<void>;
  handleUnauthorized: () => void;
  clearNotice: () => void;
};

export default function useAuth(): UseAuth {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    const url = new URL(window.location.href);
    const authResult = url.searchParams.get('auth');

    if (authResult) {
      url.searchParams.delete('auth');
      window.history.replaceState(
        {},
        '',
        `${url.pathname}${url.search}${url.hash}`,
      );
    }

    let cancelled = false;

    (async () => {
      const result = await fetchAuthUser();

      if (cancelled) {
        return;
      }

      const user = result.ok ? result.data.user : null;

      if (user) {
        setState({
          status: 'authenticated',
          user,
          notice: authResult === 'denied' ? 'denied' : undefined,
        });
        return;
      }

      const notice: AuthNotice | undefined =
        authResult === 'denied'
          ? 'denied'
          : authResult === 'error' || authResult === 'success'
            ? 'error'
            : undefined;

      setState({ status: 'anonymous', notice });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(() => {
    window.location.assign(getLoginUrl());
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setState({ status: 'anonymous' });
  }, []);

  const handleUnauthorized = useCallback(() => {
    setState({ status: 'anonymous' });
  }, []);

  const clearNotice = useCallback(() => {
    setState((current) => ({ ...current, notice: undefined }));
  }, []);

  return {
    ...state,
    login,
    logout,
    handleUnauthorized,
    clearNotice,
  };
}
