// Authentication state, mirroring the mobile app's phases: unauthenticated → mfa → authenticated.
// Adds a 15-minute idle timeout and refreshes the access token before it expires.
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, unwrap, UNAUTHORIZED_EVENT } from '../api/client';
import { tokenStore } from './tokenStore';

export type AuthPhase = 'unauthenticated' | 'mfa' | 'authenticated';
export type SignOutReason = 'user' | 'idle' | 'expired';

interface AuthContextValue {
  phase: AuthPhase;
  signOutReason: SignOutReason | null;
  login: (email: string, password: string) => Promise<void>;
  verifyMfa: (code: string) => Promise<void>;
  logout: (reason?: SignOutReason) => void;
}

const IDLE_TIMEOUT_MS = 15 * 60_000;
const REFRESH_EVERY_MS = 10 * 60_000; // access tokens last 15 minutes
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const;

const AuthContext = createContext<AuthContextValue | null>(null);

function phaseFromTokens(): AuthPhase {
  const tokens = tokenStore.get();
  if (!tokens) return 'unauthenticated';
  return tokens.mfaVerified ? 'authenticated' : 'mfa';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<AuthPhase>(phaseFromTokens);
  const [signOutReason, setSignOutReason] = useState<SignOutReason | null>(null);

  const logout = useCallback(
    (reason: SignOutReason = 'user') => {
      const tokens = tokenStore.get();
      if (tokens) {
        // Fire and forget: revoke server-side, but sign out locally regardless.
        // The header is passed explicitly because the token store is cleared on the next line.
        void api
          .POST('/api/auth/logout', {
            body: { refreshToken: tokens.refreshToken },
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
          })
          .catch(() => undefined);
      }
      tokenStore.set(null);
      queryClient.clear();
      setSignOutReason(reason);
      setPhase('unauthenticated');
    },
    [queryClient],
  );

  const login = useCallback(async (email: string, password: string) => {
    const tokens = unwrap(
      await api.POST('/api/auth/token', { body: { grantType: 'password', username: email, password } }),
    );
    tokenStore.set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, mfaVerified: false });
    setSignOutReason(null);
    setPhase(tokens.mfaRequired ? 'mfa' : 'authenticated');
  }, []);

  const verifyMfa = useCallback(async (code: string) => {
    const tokens = tokenStore.get();
    if (!tokens) throw new Error('No pending sign-in');
    const result = unwrap(
      await api.POST('/api/auth/mfa/verify', { body: { challengeId: 'web', code, method: 'sms' } }),
    );
    tokenStore.set({ ...tokens, accessToken: result.accessToken, mfaVerified: true });
    setPhase('authenticated');
  }, []);

  // Any 401 from a protected endpoint means the session is gone.
  useEffect(() => {
    const onUnauthorized = () => {
      if (tokenStore.get()?.mfaVerified) logout('expired');
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [logout]);

  // Idle timeout + periodic token refresh while signed in.
  useEffect(() => {
    if (phase !== 'authenticated') return;

    let idleTimer = window.setTimeout(() => logout('idle'), IDLE_TIMEOUT_MS);
    const resetIdle = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => logout('idle'), IDLE_TIMEOUT_MS);
    };
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, resetIdle, { passive: true }));

    const refreshTimer = window.setInterval(async () => {
      const tokens = tokenStore.get();
      if (!tokens) return;
      const { data } = await api.POST('/api/auth/refresh', { body: { refreshToken: tokens.refreshToken } });
      if (data) tokenStore.set({ ...tokens, accessToken: data.accessToken, refreshToken: data.refreshToken });
      else logout('expired');
    }, REFRESH_EVERY_MS);

    return () => {
      window.clearTimeout(idleTimer);
      window.clearInterval(refreshTimer);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, resetIdle));
    };
  }, [phase, logout]);

  const value = useMemo(
    () => ({ phase, signOutReason, login, verifyMfa, logout }),
    [phase, signOutReason, login, verifyMfa, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
