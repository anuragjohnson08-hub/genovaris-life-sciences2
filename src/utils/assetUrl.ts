/**
 * Resolves static files in `public/` so they work both at root (`/`) and when
 * deployed under a GitHub Pages repository subpath (e.g. `/genovaris-site/`).
 */

function getDefaultBaseUrl(): string {
  if (typeof import.meta !== 'undefined') {
    const env = (import.meta as { env?: { BASE_URL?: string } }).env;
    if (env && typeof env.BASE_URL === 'string' && env.BASE_URL.length > 0) {
      return env.BASE_URL;
    }
  }
  return '/';
}

export function resolvePublicAssetUrl(
  assetPath: string,
  baseUrl: string = getDefaultBaseUrl(),
): string {
  const trimmed = assetPath.trim();
  if (!trimmed) {
    return trimmed;
  }

  // Leave external URLs and inline data/blob URIs untouched.
  if (/^(?:[a-z]+:)?\/\//i.test(trimmed) || /^(?:data|blob):/i.test(trimmed)) {
    return trimmed;
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const cleanAsset = trimmed.replace(/^\/+/, '');
  return `${normalizedBase}${cleanAsset}`;
}

export function resolveRouterBasename(
  baseUrl: string = getDefaultBaseUrl(),
): string | undefined {
  const trimmed = baseUrl.trim();
  if (!trimmed || trimmed === '/' || trimmed === './') {
    return undefined;
  }
  const withoutTrailing = trimmed.replace(/\/+$/, '');
  return withoutTrailing.startsWith('/') ? withoutTrailing : `/${withoutTrailing}`;
}
