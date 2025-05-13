'use client'; // Thêm dòng này để chuyển thành Client Component

import {useTranslations} from 'next-intl';
import {ReactNode} from 'react';
import Image from 'next/image';
import siteMetadata from "../../data/siteMetadata";
import BookingForm from './BookingForm';

type Props = {
  children?: ReactNode;
  title: ReactNode;
};

export default function PageLayout({children, title}: Props) {
  const t = useTranslations('Home');

  const handleScrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getAdvantages = () => {
    const advantages = [];
    const advantageCount = 6; // Số lượng advantages trong JSON

    for (let i = 0; i < advantageCount; i++) {
      const fullText = t(`advantages.${i}` as any);
      const [title, content] = fullText.split('|');
      advantages.push({ title, content });
    }

    return advantages;
  };

  const advantages = getAdvantages();

  return (
    <>
      {t('banner_title') === 'hi' && (
      <div className="hidden">{children}{title}</div>
      )}
      <div className="banner relative z-20 bg-[url('/static/banner.jpg')] h-[462px] md:h-[754px] lg:h-[772px] bg-cover bg-center">
        <div className="container flex items-center h-full relative z-10 mx-auto pt-5 pb-5">
          <div className="max-w-[760px] relative z-50 mx-auto flex flex-col justify-between items-center gap-10 text-center">
            <h1 className="leading-none text-white font-bold">
              {t('banner_title')}
            </h1>
            <button 
              onClick={() => handleScrollToSection('booking_form')} 
              className="scroll-link bg-white flex gap-5 items-center block px-7 sm:px-10 py-5 text-base leading-6 rounded-full font-semibold cursor-pointer"
            >
              {t('banner_button')} 
              <Image src={`static/icons/down.svg`} alt={'down'} width={20} height={20} />
            </button>
          </div>

          <Image 
            className="absolute bottom-0 right-[20px] w-[281px] h-[423px] md:w-[390px] md:h-[587px]" 
            src="/static/banner-people.png" 
            alt={'people'} 
            width={390} 
            height={587} 
          />

          <div className="flex flex-row items-center justify-between p-[24px] px-6 sm:px-[34px] gap-6 sm:gap-[40px] absolute w-auto md:w-[536px] -bottom-1/4 sm:-bottom-9 right-5 md:right-auto left-5 md:left-1/2 md:transform md:-translate-x-1/2 bg-white bg-opacity-90 shadow-[0px_40px_40px_rgba(0,_0,_0,_0.08)] backdrop-blur-[50px] rounded-[7px]">
            <Image src="/static/icons/call.svg" alt={'call'} width={32} height={32} className="min-w-8" />
            <div className="flex flex-col gap-2.5">
              <h3 className="font-bold text-[22px] leading-6.5 text-[#02073E]">{t('banner_support_title')}</h3>
              <div className="text-[#343D48] leading-5.5">
                {t('banner_support_desc')} 
                <a className="text-black font-bold block" href={`mailto:${siteMetadata.email}`}>
                  {siteMetadata.email}
                </a>
              </div>
            </div>
            <a href={`mailto:${siteMetadata.email}`}>
              <Image src="/static/icons/arrow-right.svg" alt={'right'} width={22} height={16} className="min-w-5.5" />
            </a>
          </div>
        </div>
      </div>
      <div id="booking_form" className="relative z-10 booking-form">
        <BookingForm />
      </div>
      <div className="advantages bg-black secretimmo">
        <div className="container mx-auto pt-20 pb-32">
          <h2 className="max-w-[850px] mx-auto text-center text-white text-3xl font-bold mb-20">
            {t('advantages_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-10 md:gap-y-20 text-center md:text-left">
            {advantages.map((advantage, index) => (
              <div key={index} className="advantage-item">
                <div className="flex items-center justify-center mx-auto md:mx-0 text-[20px] text-black text-center bg-[#BAFF00] w-[40px] h-[40px] rounded-full">{index+1}</div>
                <h4 className="text-[18px] text-[#BAFF00] mb-3 mt-3 font-bold">{advantage.title}</h4>
                <div
                className="text-white"
                dangerouslySetInnerHTML={{
                  __html: advantage.content,
                }}
              />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
