'use client';

import {useParams} from 'next/navigation';
import {Locale} from 'next-intl';
import { useTransition} from 'react';
import {usePathname, useRouter} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';

type Props = {
  defaultValue: string;
  label: string;
};

export default function LocaleSwitcherSelect({
  defaultValue
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();

  function changeLanguage(nextLocale: Locale) {
  
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        {pathname, params},
        {locale: nextLocale}
      );
      
    });
  }

  return (
      <div className="flex gap-1.5">
        {routing.locales.filter(lng => lng).map((lng, index, arr) => (
          <button 
            key={lng} 
            onClick={() => changeLanguage(lng)} 
            className={`language-btn cursor-pointer text-sm text-center text-gray-900 font-bold uppercase mb-1 ${lng === defaultValue ? 'opacity-100' : 'opacity-50'}`}
          >
            {lng.toUpperCase()} {index !== arr.length - 1 && <span className="ml-0.5">/</span>}
          </button>
          
        ))}
      </div>
  );
}
