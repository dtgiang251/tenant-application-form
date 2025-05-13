'use client';

import {useParams} from 'next/navigation';
import {Locale} from 'next-intl';
import {useState, useTransition} from 'react';
import {usePathname, useRouter} from '@/i18n/navigation';
import {routing} from '@/i18n/routing';
import {useLocale} from 'next-intl';

type Props = {
  defaultValue: string;
  label: string;
};

export default function LocaleSwitcherSelect({
  defaultValue
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const currentLocale = useLocale(); 

  function changeLanguage(nextLocale: Locale) {
  
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        {pathname, params},
        {locale: nextLocale}
      );
      setIsOpen(false);
    });
  }

  return (
    <div className="relative">
      <button 
        className="language-btn cursor-pointer w-8 h-8 rounded-full text-sm text-center text-white uppercase"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
      >
        {currentLocale.toUpperCase()}
      </button>
      
      {isOpen && (
        <div className="absolute left-0 mt-2 w-8">
          {routing.locales.filter(lng => lng !== defaultValue).map((lng) => (
            <button 
              key={lng} 
              onClick={() => changeLanguage(lng)} 
              className="language-btn cursor-pointer w-8 h-8 rounded-full text-sm text-center text-white uppercase mb-1"
            >
              {lng.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
