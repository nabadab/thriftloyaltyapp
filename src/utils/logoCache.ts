/**
 * Cache-busting for store logos.
 *
 * Store logos are served from a stable URL, so when a store updates its logo the
 * image loader (and any CDN) will happily keep serving the old cached copy. To
 * avoid stale logos we append a nonce query param to the logo URL and refresh
 * that nonce on the events where a fresh pull is wanted:
 *   - app launch (module load — a cold "open")
 *   - warm resume (app returns to foreground)
 *   - switching the active store
 *   - pull-to-refresh
 *
 * Between those events the nonce is stable, so ordinary re-renders reuse the
 * cached image (no flicker / no needless network hits).
 */
let logoNonce = String(Date.now());

/** Bump the nonce so subsequent logo loads fetch a fresh copy. */
export function refreshLogoCache(): void {
  logoNonce = String(Date.now());
}

/** Append the current cache-busting nonce to a logo URL. */
export function bustLogoCache(url: string): string {
  if (!url) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${logoNonce}`;
}
