'use client'

import Image from 'next/image'
import siteMetadata from "../../data/siteMetadata";
import Link from 'next/link'

export default function LogoClient() {
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.location.href = '/'
  }

  return (
    <Link
      href="/" 
      aria-label={siteMetadata.headerTitle} 
      onClick={handleLogoClick}
    >
      <div className="flex items-center justify-between">
        <div className="mr-3">
          <Image 
            src="/static/logo.svg" 
            alt={'logo'} 
            className="w-[186px] h-[36px] sm:w-auto sm:h-auto" 
            width={186} 
            height={36} 
            unoptimized 
          />
        </div>
      </div>
    </Link>
  )
}