// Holds the current tokens. Kept in sessionStorage so a page refresh keeps you signed in,
// but closing the tab signs you out (the browser equivalent of the mobile app's SecureStore).

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  /** false until MFA has been completed for this session */
  mfaVerified: boolean;
}

const KEY = 'ew_tokens';
let current: Tokens | null = read();

function read(): Tokens | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Tokens) : null;
  } catch {
    return null;
  }
}

export const tokenStore = {
  get: (): Tokens | null => current,
  set(tokens: Tokens | null) {
    current = tokens;
    try {
      if (tokens) sessionStorage.setItem(KEY, JSON.stringify(tokens));
      else sessionStorage.removeItem(KEY);
    } catch {
      // storage unavailable: tokens live in memory only
    }
  },
};
