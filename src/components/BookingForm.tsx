import {useTranslations} from 'next-intl';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function BookingForm() {
  const t = useTranslations('Form');

  const [formData, setFormData] = useState({
    locality: '',
    propertyType: '',
    surfaceArea: '',
    rooms: 1,
    garages: '',
    parkings: '',
    garden: '',
    terrace: '',
    equipment: [] as string[],
    terms: false
  });


  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Hàm submit form cuối cùng
  const handleFinalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setSubmitMessage(null);
  
   
    try {
      const response = await fetch('/api/send-property-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        setSubmitMessage({
          type: 'success',
          message: t('submit_success')
        });
        resetForm();
      } else {
        setSubmitMessage({
          type: 'error',
          message: t('submit_error')
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitMessage({
        type: 'error',
        message: t('submit_error')
      });
    }

    setLoading(false);

  };

  // Hàm reset form
  const resetForm = () => {
    setFormData({
      locality: '',
      propertyType: '',
      surfaceArea: '',
      rooms: 1,
      garages: '',
      parkings: '',
      garden: '',
      terrace: '',
      equipment: [] as string[],
      terms: false
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Nếu là checkbox
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData({
        ...formData,
        [name]: checked,
        });
    } else {
        setFormData({
        ...formData,
        [name]: value,
        });
    }
  };
  
  return (
    <>
      
    <div className="form-wrap relative">
      <div className="container mx-auto pt-32 sm:pt-24 pb-24">
        <form 
          onSubmit={handleFinalSubmit} 
          noValidate 
          className="property-form"
        >
        <div className={`form-step step1 border-1 border-gray-100 max-w-[1200px] rounded-[24px] bg-white relative z-10 pt-10 px-5 sm:px-10 mx-auto`}>
            <div className="form-top-head text-center">
              <h2 className="text-3xl text-black inline-flex flex-col sm:flex-row items-center gap-5 justify-center font-bold mb-5">
                {t('title')}
              </h2>
              <div
                className="text-black text-[18px] leading-[24px]"
                dangerouslySetInnerHTML={{
                  __html: t('desc'),
                }}
              />
            </div>
            <div className="section-form">
            <div className="step-content mx-auto mt-12 pt-12 pb-15 border-t border-gray-200">
              <h3 className="form-sub-title">{t('criteria_title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7.5 mb-12">
                
                <div className="item">
                  <label>{t('surface_label')}</label>
                  <span className="m2"><input
                    type="number"
                    required
                    min={100}
                    max={2000}
                    name="surfaceArea"
                    value={formData.surfaceArea}
                    onChange={handleChange}
                    placeholder=""
                  /></span>
                </div>

                <div className="item">
                  <label>{t('rooms_label')}</label>
                  <select name="rooms" value={formData.rooms} onChange={handleChange}>
                    {Array.from({ length: 15 }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {index + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <h3 className="form-sub-title">{t('exterior_title')}</h3>
              <div className="grid rid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7.5  mb-12">
                <div className="item">
                  <label>{t('garages_label')}</label>
                  <select name="garages" value={formData.garages} onChange={handleChange}>
                    {Array.from({ length: 15 }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {index + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="item">
                  <label>{t('parkings_label')}</label>
                  <select name="parkings" value={formData.parkings} onChange={handleChange}>
                    {Array.from({ length: 15 }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {index + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="item">
                  <label>{t('garden_label')}</label>
                  <span className="m2"><input
                    type="number"
                    min={100}
                    max={2000}
                    name="garden"
                    value={formData.garden}
                    onChange={handleChange}
                  /></span>
                </div>

                <div className="item">
                  <label>{t('terrace_label')}</label>
                  <span className="m2"><input
                    type="number"
                    min={10}
                    max={500}
                    name="terrace"
                    value={formData.terrace}
                    onChange={handleChange}
                  /></span>
                </div>
              </div>

            </div>
            </div>
          </div>

          <div className={`form-step step2 border-1 p-5 md:p-10 border-gray-100 max-w-[1200px] rounded-[24px] bg-white relative z-10 pt-10 mx-auto`}>
            
            <div className="step-content max-w-[1120px] mx-auto mt-12 pt-12 pb-15 border-t border-gray-200">
              
              <div className="text-center mt-12">
                <button disabled={loading} type="submit" className="form-submit bg-black text-[16px] font-semibold inline-flex px-10 py-5 text-white rounded-[50px] mx-auto cursor-pointer">
                  {t('secretimmo_button')}
                </button>
              </div>

              <div className="text-center mt-12">
                {loading && (
                <div className="spinner"></div>
                )}
              </div>


            </div>
          </div>

            
          {submitMessage && (
              <div 
                className={`
                  fixed top-5 left-1/2 transform -translate-x-1/2 
                  px-6 py-4 rounded-lg shadow-lg z-50
                  ${submitMessage.type === 'success' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'}
                `}
              >
                {submitMessage.message}
                <button 
                  onClick={() => setSubmitMessage(null)}
                  className="ml-4 text-white hover:opacity-75"
                >
                  ✕
                </button>
              </div>
            )}

        </form>
      </div>
    </div>
    </>
  );
}
