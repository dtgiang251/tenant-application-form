import {useTranslations} from 'next-intl';
import PageLayout from './PageLayout';
import Link from 'next/link';

export default function NotFoundPage() {
  const t = useTranslations('NotFoundPage');

  return (
    <PageLayout title={t('title')} isNotFoundPage={true}>
      <div className="text-center">
        <p className="max-w-[460px] mx-auto text-lg text-gray-600">
          {t('description')}
        </p>
        <Link 
          href="/" 
          className="bg-black text-[16px] font-semibold inline-flex px-10 py-5  mt-5 text-white rounded-[50px] mx-auto cursor-pointer"
        >
          {t('backToHome')}
        </Link>
      </div>
    </PageLayout>
  );
}
