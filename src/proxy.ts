import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // `icon` has no file extension (it's Next's dynamic icon.tsx route), so the
  // `.*\..*` exclusion below doesn't catch it — without this it gets swept up
  // and redirected to a locale-prefixed path that doesn't exist, breaking the
  // favicon (a 307 to /en/icon, then a 404).
  matcher: '/((?!api|trpc|_next|_vercel|icon|.*\\..*).*)'
};