/**
 * How long a public read stays fresh in the browser's query cache.
 *
 * Public content only changes when the owner edits it in the admin, so a
 * visitor reopening the same item does not need a new round trip. Kept in step
 * with the backend's own `app.cache.public-max-age-seconds`, which sets the
 * matching Cache-Control window on these endpoints.
 */
export const PUBLIC_MEDIA_STALE_TIME_MS = 60_000;
