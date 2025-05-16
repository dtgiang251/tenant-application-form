import NotFoundPage from '@/components/NotFoundPage';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';

export default async function LocalizedNotFound() {
  const messages = await getMessages();
  
  return (
    <NextIntlClientProvider messages={messages}>
      <NotFoundPage />
    </NextIntlClientProvider>
  );
}
