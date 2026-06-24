import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Exclude API/internal paths, anything with a file extension, and the
  // extensionless metadata routes (icon, apple-icon, opengraph/twitter image,
  // sitemap, robots, manifest). Without this, the locale middleware redirects
  // `/icon` to `/<locale>/icon` (404), so the favicon never loads and browsers
  // fall back to the framework default icon.
  matcher:
    '/((?!api|trpc|_next|_vercel|icon|apple-icon|opengraph-image|twitter-image|sitemap|robots|manifest|.*\\..*).*)'
};