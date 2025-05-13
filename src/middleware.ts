import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware({
  locales: routing.locales,
  defaultLocale: 'fr', // Đặt ngôn ngữ mặc định là tiếng Pháp
  localePrefix: 'as-needed', // Loại bỏ tiền tố locale cho ngôn ngữ mặc định
});

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
