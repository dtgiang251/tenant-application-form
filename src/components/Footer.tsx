import Link from 'next/link';
import siteMetadata from "../../data/siteMetadata";
import Image from 'next/image';
import {useTranslations} from 'next-intl';

export default function Footer() {
  const t  = useTranslations('Footer');

  return (
    <footer className="footer">
      <div className="container mx-auto">

        <div className="footer-main flex flex-col lg:flex-row gap-15 justify-between items-center pt-20 pb-10 space-x-4 leading-4.5 border-b border-gray-200">
          
          <div className="footer-logo">
            <Link href="/" aria-label={siteMetadata.headerTitle}>
            <Image src={`/static/footer-logo.svg`} alt={'address'} width={362} height={71} />
            </Link>
          </div>

          <div className="footer-contact flex flex-col md:flex-row gap-12">
            
            <div className="flex items-start gap-2">
              <Image src={`/static/icons/address.svg`} alt={'address'} width={20} height={20} />
              <div className="flex flex-col gap-3 max-w-[150px]">
                <h3 className="text-lg font-bold leading-6">{siteMetadata.address_name}</h3>
                <div>{siteMetadata.address}</div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex font-bold items-center gap-1">
                <Image src={`/static/icons/phone.svg`} alt={'phone'} width={18} height={18} />
                <a href={`tel:${siteMetadata.phone}`}>
                  <span>{siteMetadata.phone}</span>
                </a>
              </div>
              <div className="flex font-bold items-center gap-1">
                <Image src={`/static/icons/mail.svg`} alt={'email'} width={18} height={18} />
                <a href={`mailto:${siteMetadata.email}`}>
                  <span>{siteMetadata.email}</span>
                </a>
              </div>
            </div>

            <div className="flex gap-4">
            {siteMetadata.youtube && (
              <a target="_blank" href={`${siteMetadata.youtube}`}>
                <Image src={`/static/icons/youtube.svg`} alt={'email'} width={24} height={24} />
              </a>
            )}
            {siteMetadata.instagram && (
              <a target="_blank" href={`${siteMetadata.instagram}`}>
                <Image src={`/static/icons/instagram.svg`} alt={'instagram'} width={24} height={24} />
              </a>
            )}
            {siteMetadata.tiktok && (
              <a target="_blank" href={`${siteMetadata.tiktok}`}>
                <Image src={`/static/icons/tiktok.svg`} alt={'tiktok'} width={24} height={24} />
              </a>
            )}
            {siteMetadata.linkedin && (
              <a target="_blank" href={`${siteMetadata.linkedin}`}>
                <Image src={`/static/icons/linkedin.svg`} alt={'linkedin'} width={24} height={24} />
              </a>
            )}
            {siteMetadata.facebook && (
              <a target="_blank" href={`${siteMetadata.facebook}`}>
                <Image src={`/static/icons/facebook.svg`} alt={'facebook'} width={24} height={24} />
              </a>
            )}
            {siteMetadata.x && (
              <a target="_blank" href={`${siteMetadata.x}`}>
                <Image src={`/static/icons/x.svg`} alt={'x'} width={24} height={24} />
              </a>
            )}

            </div>

          </div>
        </div>

        <div className="footer-bottom text-center flex justify-between items-center flex-col pt-10 pb-10 space-x-4 leading-4.5x">
          <div className="text-black2">{t('company')}</div>
          <div className="text-black2">{t('copyright')}</div>
          <div className="text-gray-400 mt-5">Designed by <a href="https://www.meta.lu/" target="_blank" rel="noopener">Meta.lu</a><span >&nbsp;&amp; Premium Partner of&nbsp;</span><a  href="https://nextimmo.lu/en" target="_blank" rel="noopener">Nextimmo.lu</a><span >&nbsp;/&nbsp;</span><a  href="https://secretimmo.lu/en" target="_blank" rel="noopener">Secretimmo.lu</a><span >&nbsp;/&nbsp;</span><a  href="https://goodwork.lu/" target="_blank" rel="noopener">Goodwork.lu</a><span ></span></div>
        </div>

      </div>
    </footer>
  )
}
