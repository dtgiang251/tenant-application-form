import NotFoundPage from '@/components/NotFoundPage';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import {Inter, Poppins} from 'next/font/google';
import './[locale]/styles.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-poppins',
  display: 'swap',
});

export default async function GlobalNotFound() {
  const messages = await getMessages();
  
  return (
    <html className={`${inter.className} ${poppins.className}`}>
      <body className="flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <Navigation />
          <NotFoundPage />
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
