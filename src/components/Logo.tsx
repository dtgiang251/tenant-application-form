'use client'

import Image from 'next/image'
import siteMetadata from "../../data/siteMetadata";
import Link from 'next/link'
import { useLocale } from 'next-intl'
import {routing} from '@/i18n/routing';

export default function LogoClient() {
  const currentLocale = useLocale();

  const getHomeLink = () => {
    if (currentLocale === routing.defaultLocale) {
      return '/';
    }
    
    return `/${currentLocale}`;
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.location.href = getHomeLink()
  }

  return (
    <Link
      href={getHomeLink()} 
      aria-label={siteMetadata.headerTitle} 
      onClick={handleLogoClick}
    >
      <div className="flex items-center justify-center">
        <div className="mr-3">
          <Image 
            src="/nextimmo-logo.svg" 
            alt={'logo'} 
            className="w-[198px] h-[36px]" 
            width={198} 
            height={36} 
            unoptimized 
          />
        </div>
      </div>
    </Link>
  )
}
