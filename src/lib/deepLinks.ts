// The API returns mobile-style deep links (electricwealth://documents/d1).
// This maps the ones the web app supports to web routes. Others return undefined
// (the feature exists only in the mobile app for now).

const SCHEME = 'electricwealth://';

export function deepLinkToRoute(deepLink: string | undefined): string | undefined {
  if (!deepLink?.startsWith(SCHEME)) return undefined;
  const [section, id] = deepLink.slice(SCHEME.length).split('/');

  switch (section) {
    case 'documents':
      return id ? `/documents?highlight=${encodeURIComponent(id)}` : '/documents';
    case 'accounts':
      if (!id) return '/accounts';
      if (id === 'new') return '/accounts/new';
      return `/accounts/${encodeURIComponent(id)}`;
    case 'notifications':
      return '/notifications';
    case 'profile':
      return '/profile';
    case 'settings':
      return '/settings';
    default:
      return undefined; // advisor, market, learn: not on web yet
  }
}
