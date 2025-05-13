import {useTranslations} from 'next-intl';
import LocaleSwitcher from './LocaleSwitcher';
import siteMetadata from "../../data/siteMetadata";
import Image from 'next/image';
import LogoClient from './Logo';

export default function Navigation() {
  const t = useTranslations('Header');

  return (
    <header className="flex items-center w-full bg-white justify-between relative z-30">
      <div className="container mx-auto pt-5 pb-5 flex justify-between items-center">
        <LogoClient />
        <div className="flex items-center space-x-4 leading-4.5">

          <div className="header-contact header-border-right flex items-center gap-6 pt-3.5 pb-3.5 pr-6">
            <a className="flex font-bold items-center gap-1" href={`tel:${siteMetadata.phone}`}>
              <Image src={`/static/icons/phone.svg`} alt={'phone'} width={18} height={18} />
              <span className="hidden xl:block">{siteMetadata.phone}</span>
            </a>
            <a className="flex font-bold items-center gap-1" href={`mailto:${siteMetadata.email}`}>
              <Image src={`/static/icons/mail.svg`} alt={'email'} width={18} height={18} />
              <span className="hidden xl:block">{siteMetadata.email}</span>
            </a>
          </div>

          <div className="header-support text-right header-border-right hidden md:flex flex-col items-end pt-1.5 pb-1.5 pr-6 max-w-[250px] xl:max-w-full">
            <span className="text-xs">{t('header_1')}</span>
            <strong className="text-sm leading-4.5">{t('header_2')}</strong>
          </div>

          <LocaleSwitcher />
        

        </div>
      </div>
    </header>
  );
}
