// Typed API client. `paths` and `components` are generated from electric-wealth-api-spring's openapi.json
// by `npm run gen:api`, so every URL, parameter and response below is checked by TypeScript.
import createClient, { type Middleware } from 'openapi-fetch';
import { tokenStore } from '../auth/tokenStore';
import { getAppLocale } from '../i18n';
import type { components, paths } from './schema';

export type Schemas = components['schemas'];
export type ErrorEnvelope = Schemas['ErrorEnvelope'];

/** Thrown for any non-2xx API response. Carries the API's error code and trace id. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly traceId?: string,
  ) {
    super(message);
  }
}

/** Fired when a protected call returns 401, so the auth layer can sign the user out. */
export const UNAUTHORIZED_EVENT = 'ew:unauthorized';

const headersMiddleware: Middleware = {
  onRequest({ request }) {
    const token = tokenStore.get()?.accessToken;
    if (token && !request.headers.has('Authorization')) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
    request.headers.set('Accept-Language', getAppLocale());
    return request;
  },
  onResponse({ request, response }) {
    if (response.status === 401 && !new URL(request.url).pathname.startsWith('/api/auth/')) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return response;
  },
};

export const api = createClient<paths>({ baseUrl: window.location.origin });
api.use(headersMiddleware);

/** Unwraps an openapi-fetch result: returns data, or throws ApiError. */
export function unwrap<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (result.error !== undefined || result.data === undefined) {
    const envelope = result.error as Partial<ErrorEnvelope> | undefined;
    throw new ApiError(
      result.response.status,
      envelope?.error?.code ?? 'UNKNOWN',
      envelope?.error?.message ?? result.response.statusText,
      envelope?.error?.traceId,
    );
  }
  return result.data;
}
