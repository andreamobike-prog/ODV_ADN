const AUTH_ROUTES = new Set(['/login', '/forgot-password', '/update-password']);

export const DEFAULT_AUTHENTICATED_PATH = '/dashboard';

export function resolvePostLoginRedirect(nextPath?: string | null) {
  if (!nextPath || !nextPath.startsWith('/') || nextPath.startsWith('//')) {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  try {
    const url = new URL(nextPath, 'http://localhost');
    const normalizedPath = `${url.pathname}${url.search}${url.hash}`;

    if (AUTH_ROUTES.has(url.pathname)) {
      return DEFAULT_AUTHENTICATED_PATH;
    }

    return normalizedPath;
  } catch {
    return DEFAULT_AUTHENTICATED_PATH;
  }
}
