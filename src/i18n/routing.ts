import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'de', 'fr'],
  defaultLocale: 'fr', // French is set as the default locale
  pathnames: {
    '/': '/', // Home page without locale in the URL
    '/pathnames': {
      de: '/pfadnamen', // German route
      fr: '/pathnames', // French route (not including /fr)
    }
  }
});
