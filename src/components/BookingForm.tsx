import {useTranslations} from 'next-intl';
import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export default function BookingForm() {
  const t = useTranslations('Form');

  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [signature1, setSignature1] = useState<string | null>(null);
  const [signature2, setSignature2] = useState<string | null>(null);

  const signatureRef1 = useRef<SignatureCanvas & { isEmpty: () => boolean }>(null);
  const signatureRef2 = useRef<any>(null);

  const clearSignature1 = () => {
    if (signatureRef1.current) {
      signatureRef1.current.clear(); // Xóa chữ ký của "candidat principal"
    }
  };

  const clearSignature2 = () => {
    if (signatureRef2.current) {
      signatureRef2.current.clear(); // Xóa chữ ký của "co-demandeur"
    }
  };

  const saveSignature1 = () => {
    if (signatureRef1.current) {
      const signatureData = signatureRef1.current.toDataURL();
      setSignature1(signatureData); // Lưu chữ ký của "candidat principal"
    }
  };

  const saveSignature2 = () => {
    if (signatureRef2.current) {
      const signatureData = signatureRef2.current.toDataURL();
      setSignature2(signatureData); // Lưu chữ ký của "co-demandeur"
    }
  };

  const [formData, setFormData] = useState({
    // Candidat principal
    full_name: '',
    birth_date: '',
    nationality: '',
    current_address: '',
    address_since: '',
    mobile_phone: '',
    email: '',
    
    // Co-demandeur
    co_applicant_name: '',
    co_applicant_birth_date: '',
    co_applicant_nationality: '',
    co_applicant_mobile: '',
    co_applicant_email: '',
    
    // Situation résidentielle
    current_housing_situation: '',
    current_housing_other: '',
    
    // Composition du ménage
    total_people: '',
    adults_count: '',
    children_count: '',
    household_details: '',

    // Section 6: Revenus et stabilité financière
    monthly_household_income: '',
    income_source: '',
    income_source_other: '',
    rental_guarantee: '',
    
    // Section 7: Informations pratiques supplémentaires
    desired_move_in_date: '',
    desired_lease_duration: '',
    pets: '',
    pets_details: '',
    smokers: '',
    previous_rental_issues: '',
    previous_rental_issues_details: '',
    
    // Section 8: Références locatives
    last_landlord_name: '',
    last_landlord_contact: '',
    last_lease_duration: '',
    departure_reason: '',
    
    // Section 9: Personne de contact en cas d'urgence
    emergency_contact_name: '',
    emergency_contact_relation: '',
    emergency_contact_phone: '',
    
    // Section 10: Consentement au traitement des données personnelles
    data_consent: false,
    data_consent_duration: false

  });

  // Liste des pays pour le select
  const countries = t('countries').split('|');

  // Options pour situation résidentielle
  const housingOptions = [
    { value: 'locataire', label: t('housing_locataire') },
    { value: 'proprietaire', label: t('housing_proprietaire') },
    { value: 'heberge', label: t('housing_heberge') },
    { value: 'temporaire', label: t('housing_temporaire') },
    { value: 'autre', label: t('housing_autre') }
  ];

  // Thêm state mới cho thông tin nghề nghiệp
  const [professionalDetails, setProfessionalDetails] = useState<Array<{
    status: string;
    statusOther: string;
    currentProfession: string;
    employerName: string;
    employmentStartDate: string;
    seniorityInPosition: string;
  }>>([]);

  // Các option cho trạng thái nghề nghiệp
  const professionalStatusOptions = [
    { value: 'cdi', label: t('professionalStatus_cdi') },
    { value: 'cdd', label: t('professionalStatus_cdd') },
    { value: 'interim', label: t('professionalStatus_interim') },
    { value: 'independant', label: t('professionalStatus_independant') },
    { value: 'etudiant', label: t('professionalStatus_etudiant') },
    { value: 'retraite', label: t('professionalStatus_retraite') },
    { value: 'sans_emploi', label: t('professionalStatus_sans_emploi') },
    { value: 'autre', label: t('professionalStatus_autre') }
  ];

  

  // Theo dõi thay đổi của adults_count để cập nhật professional details
  useEffect(() => {
    const adultsCount = parseInt(formData.adults_count || '0');
    
    // Nếu số lượng adults thay đổi, cập nhật mảng professional details
    if (adultsCount > 0) {
      const newProfessionalDetails = Array.from({ length: adultsCount }, () => ({
        status: '',
        statusOther: '',
        currentProfession: '',
        employerName: '',
        employmentStartDate: '',
        seniorityInPosition: ''
      }));
      
      setProfessionalDetails(newProfessionalDetails);
    } else {
      setProfessionalDetails([]);
    }
  }, [formData.adults_count]);

  // Hàm xử lý thay đổi thông tin nghề nghiệp
  const handleProfessionalDetailsChange = (index: number, field: string, value: string) => {
    const updatedDetails = [...professionalDetails];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value
    };
    setProfessionalDetails(updatedDetails);
  };

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles(prevFiles => [...prevFiles, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };


  // Hàm submit form cuối cùng
  const handleFinalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!signatureRef1.current || signatureRef1.current.isEmpty()) {
      setSubmitMessage({
        type: 'error',
        message: t('signature_required_error') // Thêm key dịch cho thông báo lỗi
      });
      return;
    }

    saveSignature1();
    saveSignature2();

    // Kiểm tra tính hợp lệ của form
    const formElement = e.target as HTMLFormElement;
    if (!formElement.checkValidity()) {
      // Nếu form không hợp lệ, thông báo lỗi hoặc làm gì đó
      setSubmitMessage({
        type: 'error',
        message: t('form_invalid')
      });
      
      // Cuộn đến trường lỗi đầu tiên
      const firstInvalidField = formElement.querySelector(':invalid') as HTMLElement;
      if (firstInvalidField) {
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalidField.focus(); // Focus vào trường lỗi
      }

      return;  // Dừng lại không gửi form
    }

    if (!formData.data_consent || !formData.data_consent_duration) {
      setSubmitMessage({
        type: 'error',
        message: t('data_consent_required_error')
      });
      return;
    }

    setLoading(true);
    setSubmitMessage(null);
  
    try {
      // Tạo FormData để upload files
      const formDataToSend = new FormData();

      // Thêm các trường text vào FormData
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof typeof formData];
        
        // Chuyển đổi giá trị boolean thành string
        if (typeof value === 'boolean') {
          formDataToSend.append(key, value ? 'true' : 'false');
        } else if (value !== null && value !== undefined) {
          // Chuyển đổi các giá trị khác thành string
          formDataToSend.append(key, String(value));
        }
      });

      // Thêm chữ ký vào FormData (nếu có)
      if (signature1) formDataToSend.append('signature1', signature1);
      if (signature2) formDataToSend.append('signature2', signature2);

      // Thêm professional details
      professionalDetails.forEach((detail, index) => {
        Object.keys(detail).forEach(key => {
          formDataToSend.append(`professionalDetails[${index}][${key}]`, detail[key as keyof typeof detail]);
        });
      });

      // Thêm files
      uploadedFiles.forEach((file, index) => {
        formDataToSend.append(`documents[${index}]`, file);
      });

      const response = await fetch('/api/send-request', {
        method: 'POST',
        body: formDataToSend,
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
      // Candidat principal
      full_name: '',
      birth_date: '',
      nationality: '',
      current_address: '',
      address_since: '',
      mobile_phone: '',
      email: '',
      
      // Co-demandeur
      co_applicant_name: '',
      co_applicant_birth_date: '',
      co_applicant_nationality: '',
      co_applicant_mobile: '',
      co_applicant_email: '',
      
      // Situation résidentielle
      current_housing_situation: '',
      current_housing_other: '',
      
      // Composition du ménage
      total_people: '',
      adults_count: '',
      children_count: '',
      household_details: '',

      // Section 6: Revenus et stabilité financière
      monthly_household_income: '',
      income_source: '',
      income_source_other: '',
      rental_guarantee: '',
      
      // Section 7: Informations pratiques supplémentaires
      desired_move_in_date: '',
      desired_lease_duration: '',
      pets: '',
      pets_details: '',
      smokers: '',
      previous_rental_issues: '',
      previous_rental_issues_details: '',

      
      // Section 8: Références locatives
      last_landlord_name: '',
      last_landlord_contact: '',
      last_lease_duration: '',
      departure_reason: '',
      
      // Section 9: Personne de contact en cas d'urgence
      emergency_contact_name: '',
      emergency_contact_relation: '',
      emergency_contact_phone: '',
      
      // Section 10: Consentement au traitement des données personnelles
      data_consent: false,
      data_consent_duration: false
      
    });

    // Reset professional details
    setProfessionalDetails([]);
    setUploadedFiles([]);
  };

  
  // Thêm các options cho các trường mới
  const monthlyIncomeOptions = [
    { value: 'moins_2000', label: t('moins_2000') },
    { value: '2000_3000', label: t('2000_3000') },
    { value: '3000_4000', label: t('3000_4000') },
    { value: '4000_5000', label: t('4000_5000') },
    { value: 'plus_5000', label: t('plus_5000') }
  ];

  const incomeSourceOptions = [
    { value: 'salaire', label: t('salaire') },
    { value: 'independant', label: t('independant') },
    { value: 'pension', label: t('pension') },
    { value: 'allocation_chomage', label: t('allocation_chomage') },
    { value: 'garantie_parents', label: t('garantie_parents') },
    { value: 'autre', label: t('autre') }
  ];

  const leaseDurationOptions = [
    { value: 'moins_12_mois', label: t('moins_12_mois') },
    { value: '1_2_ans', label: t('1_2_ans') },
    { value: 'plus_2_ans', label: t('plus_2_ans') }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      <div className="container mx-auto pt-10 pb-10">
        <form 
          onSubmit={handleFinalSubmit} 
          noValidate 
          className="property-form"
        >
        <div className={`form-step step1 border-1 border-gray-100 max-w-[1200px] rounded-[24px] bg-white relative z-10 pt-10 px-5 sm:px-10 mx-auto`}>
            <div className="form-top-head pb-15">
              <h1 className="text-5xl text-black inline-flex flex-col sm:flex-row items-center gap-5 justify-center font-bold mb-5">
                {t('title')}
              </h1>
              <div
                className="text-black italic text-[18px] leading-[24px]"
                dangerouslySetInnerHTML={{
                  __html: t('desc'),
                }}
              />
            </div>

            <div className="form-second-head border-t pt-15 pb-15 border-gray-200">
              <h2 className="text-2xl text-black inline-flex flex-col sm:flex-row items-center gap-5 justify-center font-bold mb-5">
                {t('second_title')}
              </h2>
              <p
                className="text-black mb-6 text-[16px] leading-[24px]"
                dangerouslySetInnerHTML={{
                  __html: t('second_desc_1'),
                }}
              />
              <p
                className="text-black font-bold mb-6 text-[16px] leading-[24px]"
                dangerouslySetInnerHTML={{
                  __html: t('second_desc_2'),
                }}
              />
              <p
                className="text-black mb-6 text-[16px] leading-[24px]"
                dangerouslySetInnerHTML={{
                  __html: t('second_desc_3'),
                }}
              />
              <ul className="text-black flex flex-col gap-6 mb-6 text-[16px] leading-[24px] pl-5 list-disc list-inside">
                <li dangerouslySetInnerHTML={{
                  __html: t('conformite_legale_1').replace(/\*(.*?)\*/g, (match, p1) => 
                    `<strong>${p1}</strong>`
                  )
                }} />
                <li dangerouslySetInnerHTML={{
                  __html: t('conformite_legale_2').replace(/\*(.*?)\*/g, (match, p1) => 
                    `<strong>${p1}</strong>`
                  )
                }} />
                <li dangerouslySetInnerHTML={{
                  __html: t('conformite_legale_3').replace(/\*(.*?)\*/g, (match, p1) => 
                    `<strong>${p1}</strong>`
                  )
                }} />
              </ul>
            </div>

            <div className="section-form">
              {/* Section 1: Identité du candidat principal */}
              <div className="step-content mx-auto mt-3 pt-5 pb-5">
                <h3 className="form-sub-title text-xl font-bold mb-8">{t('step1_title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7.5 mb-12">
                  
                  <div className="item">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('name_label')}*</label>
                    <input
                      type="text"
                      required
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="item">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('birth_day_label')} *</label>
                    <input
                      type="date"
                      required
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="item">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('country_label')}</label>
                    <select
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t('country_select_label')}</option>
                      {countries.map((country, index) => (
                        <option key={index} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>

                  </div>

                  <div className="item md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('address_label')} *</label>
                    <input
                      type="text"
                      required
                      name="current_address"
                      value={formData.current_address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder=""
                    />
                  </div>

                  <div className="item">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('address_since_label')} *</label>
                    <input
                      type="month"
                      required
                      name="address_since"
                      value={formData.address_since}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="item">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('phone_label')} *</label>
                    <input
                      type="tel"
                      required
                      name="mobile_phone"
                      value={formData.mobile_phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+352 XX XX XX XX"
                    />
                  </div>

                  <div className="item">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('email_label')} *</label>
                    <input
                      type="email"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="exemple@email.com"
                    />
                  </div>

                </div>
              </div>

              {/* Section 2: Identité du co-demandeur */}
              <div className="step-content mx-auto mt-3 pt-5 pb-5">
                <h3 className="form-sub-title text-xl font-bold mb-8">{t('step2_title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7.5 mb-12">
                  
                  <div className="item">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('name_label')}</label>
                    <input
                      type="text"
                      name="co_applicant_name"
                      value={formData.co_applicant_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder=""
                    />
                  </div>

                  <div className="item">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('birth_day_label')}</label>
                    <input
                      type="date"
                      name="co_applicant_birth_date"
                      value={formData.co_applicant_birth_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="item">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('country_label')}</label>
                    <select
                      name="co_applicant_nationality"
                      value={formData.co_applicant_nationality}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t('country_select_label')}</option>
                      {countries.map((country, index) => (
                        <option key={index} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="item">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('phone_label')}</label>
                    <input
                      type="tel"
                      name="co_applicant_mobile"
                      value={formData.co_applicant_mobile}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+352 XX XX XX XX"
                    />
                  </div>

                  <div className="item">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('email_label')}</label>
                    <input
                      type="email"
                      name="co_applicant_email"
                      value={formData.co_applicant_email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="exemple@email.com"
                    />
                  </div>

                </div>
              </div>

              {/* Section 3: Situation résidentielle actuelle */}
              <div className="step-content mx-auto mt-3 pt-5 pb-5">
                <h3 className="form-sub-title text-xl font-bold mb-8">{t('step3_title')}</h3>
                <div className="grid grid-cols-1 gap-3 mb-12">
                  
                  <div className="item">
                    <div className="list space-y-3">
                      {housingOptions.map((option) => (
                        <div key={option.value} className="flex items-center">
                          <input
                            required
                            type="radio"
                            id={option.value}
                            name="current_housing_situation"
                            value={option.label}
                            checked={formData.current_housing_situation === option.value}
                            onChange={handleChange}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor={option.value} className="text-sm text-gray-700">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {formData.current_housing_situation === 'autre' && (
                    <div className="item">
                      <input
                        required
                        type="text"
                        name="current_housing_other"
                        value={formData.current_housing_other}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder=""
                      />
                    </div>
                  )}

                </div>
              </div>

              {/* Section 4: Composition du ménage */}
              <div className="step-content mx-auto mt-3 pt-5 pb-5">
                <h3 className="form-sub-title text-xl font-bold mb-8">{t('step4_title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-7.5 mb-12">
                  
                  <div className="item">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('total_people_label')} *</label>
                    <input
                      type="number"
                      required
                      name="total_people"
                      value={formData.total_people}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="item">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('adults_count_label')} *</label>
                    <input
                      type="number"
                      required
                      name="adults_count"
                      value={formData.adults_count}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="item">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('children_count_label')} *</label>
                    <input
                      required
                      type="number"
                      name="children_count"
                      value={formData.children_count}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="item md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('household_details')}</label>
                    <textarea
                      required
                      name="household_details"
                      value={formData.household_details}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('household_placeholder')}
                    />
                  </div>

                </div>
              </div>

              {/* Section 5: Situation professionnelle */}
              {professionalDetails.length > 0 && (
                <div className="step-content mx-auto mt-3 pt-5 pb-5">
                  <h3 className="form-sub-title text-xl font-bold mb-8">
                    {t('step5_title')}
                  </h3>
                  <p className="mb-6">{t('professional_situation_desc')}</p>

                  {professionalDetails.map((detail, index) => (
                    <div key={index} className="mb-10 p-6 border border-gray-100 rounded-lg">
                      <h4 className="text-lg font-semibold mb-4">
                        {t('person_label')} {index + 1}
                      </h4>

                      {/* Statut */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('professional_status_label')}
                        </label>
                        <div className="grid list grid-cols-2 md:grid-cols-4 gap-3">
                          {professionalStatusOptions.map((option) => (
                            <div key={option.value} className="flex items-center">
                              <input
                                required
                                type="radio"
                                id={`status_${index}_${option.value}`}
                                name={`status_${index}`}
                                value={option.label}
                                checked={detail.status === option.value}
                                onChange={(e) => handleProfessionalDetailsChange(index, 'status', e.target.value)}
                                className="mr-2"
                              />
                              <label htmlFor={`status_${index}_${option.value}`}>
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                        
                        {detail.status === 'autre' && (
                          <input
                            required
                            type="text"
                            value={detail.statusOther}
                            onChange={(e) => handleProfessionalDetailsChange(index, 'statusOther', e.target.value)}
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        )}
                      </div>

                      {/* Autres champs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('current_profession_label')}
                          </label>
                          <input
                            required
                            type="text"
                            value={detail.currentProfession}
                            onChange={(e) => handleProfessionalDetailsChange(index, 'currentProfession', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('employer_name_label')}
                          </label>
                          <input
                            required
                            type="text"
                            value={detail.employerName}
                            onChange={(e) => handleProfessionalDetailsChange(index, 'employerName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('employment_start_date_label')}
                          </label>
                          <input
                            required
                            type="date"
                            value={detail.employmentStartDate}
                            onChange={(e) => handleProfessionalDetailsChange(index, 'employmentStartDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('seniority_in_position_label')}
                          </label>
                          <input
                            required
                            type="text"
                            value={detail.seniorityInPosition}
                            onChange={(e) => handleProfessionalDetailsChange(index, 'seniorityInPosition', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}


              {/* Section 6: Revenus et stabilité financière */}
              <div className="step-content mx-auto mt-3 pt-5 pb-5">
                <h3 className="form-sub-title text-xl font-bold mb-8">{t('step6_title')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7.5 mb-12">
                  <div className="item list">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('monthly_household_income_label')} *
                    </label>
                    <div className="space-y-2 pt-3">
                      {monthlyIncomeOptions.map((option) => (
                        <div key={option.value} className="flex items-center">
                          <input
                            required
                            type="radio"
                            id={option.value}
                            name="monthly_household_income"
                            value={option.label}
                            checked={formData.monthly_household_income === option.value}
                            onChange={handleChange}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor={option.value} className="text-sm text-gray-700">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="item list">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('income_source_label')} *
                    </label>
                    <div className="space-y-2 pt-3">
                      {incomeSourceOptions.map((option) => (
                        <div key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            required
                            id={`income_source_${option.value}`}
                            name="income_source"
                            value={option.label}
                            checked={formData.income_source === option.value}
                            onChange={handleChange}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor={`income_source_${option.value}`} className="text-sm text-gray-700">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>

                    {formData.income_source === 'autre' && (
                      <input
                        required
                        type="text"
                        name="income_source_other"
                        value={formData.income_source_other}
                        onChange={handleChange}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    )}
                  </div>

                  <div className="item list md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('rental_guarantee_label')} *
                    </label>
                    <div className="flex space-x-4 mt-3">
                      {[
                        { value: 'oui', label: t('yes') },
                        { value: 'non', label: t('no') },
                        { value: 'a_discuter', label: t('to_discuss') }
                      ].map((option) => (
                        <div key={option.value} className="flex items-center">
                          <input
                            required
                            type="radio"
                            id={`rental_guarantee_${option.value}`}
                            name="rental_guarantee"
                            value={option.label}
                            checked={formData.rental_guarantee === option.value}
                            onChange={handleChange}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor={`rental_guarantee_${option.value}`} className="text-sm text-gray-700">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="step-content mx-auto mt-3 pt-5 pb-5">
                  <h3 className="form-sub-title text-xl font-bold mb-8">{t('justificative_documents_title')}</h3>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-yellow-800 mb-2">
                      {t('documents_required_desc')}
                    </p>
                    <ul className="list-disc list-inside text-sm text-yellow-800 mb-3">
                      <li dangerouslySetInnerHTML={{
                        __html: t('document_requirement_1').replace(/\*(.*?)\*/g, (match, p1) => 
                          `<strong>${p1}</strong>`
                        )
                      }} />
                      <li dangerouslySetInnerHTML={{
                        __html: t('document_requirement_2').replace(/\*(.*?)\*/g, (match, p1) => 
                          `<strong>${p1}</strong>`
                        )
                      }} />
                    </ul>
                    <p className="text-sm text-yellow-800" dangerouslySetInnerHTML={{
                        __html: t('document_note').replace(/\*(.*?)\*/g, (match, p1) => 
                          `<strong>${p1}</strong>`
                        )
                      }} />
                  </div>

                  <div className="mb-4">
                    <label 
                      htmlFor="document-upload" 
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t('upload_documents_label')} *
                    </label>
                    
                    <div className="flex items-center justify-center w-full">
                      <label 
                        htmlFor="document-upload" 
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg 
                            className="w-8 h-8 mb-4 text-gray-500" 
                            aria-hidden="true" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 20 16"
                          >
                            <path 
                              stroke="currentColor" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                            />
                          </svg>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">{t('click_to_upload')}</span> {t('or_drag_and_drop')}
                          </p>
                          <p className="text-xs text-gray-500">{t('file_types_allowed')}</p>
                        </div>
                        <input 
                          required
                          id="document-upload" 
                          type="file" 
                          className="hidden" 
                          multiple 
                          accept=".pdf,.jpg,.jpeg,.png" 
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          {t('uploaded_files')}
                        </h4>
                        <ul className="space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <li 
                              key={index} 
                              className="flex items-center justify-between bg-gray-100 p-2 rounded"
                            >
                              <span className="text-sm">{file.name}</span>
                              <button 
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>


              </div>

              {/* Section 7: Informations pratiques supplémentaires */}
              <div className="step-content mx-auto mt-3 pt-5 pb-5">
                <h3 className="form-sub-title text-xl font-bold mb-8">{t('step7_title')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7.5 mb-12">
                  <div className="item">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('desired_move_in_date_label')} *
                    </label>
                    <input
                      required
                      type="date"
                      name="desired_move_in_date"
                      value={formData.desired_move_in_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="item list">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('desired_lease_duration_label')} *
                    </label>
                    <div className="space-y-2 pt-3">
                      {leaseDurationOptions.map((option) => (
                        <div key={option.value} className="flex items-center">
                          <input
                            required
                            type="radio"
                            id={option.value}
                            name="desired_lease_duration"
                            value={option.label}
                            checked={formData.desired_lease_duration === option.value}
                            onChange={handleChange}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor={option.value} className="text-sm text-gray-700">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="item list">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('pets_label')} *
                    </label>
                    <div className="flex space-x-4 mt-3">
                      {[
                        { value: 'non', label: t('no') },
                        { value: 'oui', label: t('yes') }
                      ].map((option) => (
                        <div key={option.value} className="flex items-center">
                          <input
                            required
                            type="radio"
                            id={`pets_${option.value}`}
                            name="pets"
                            value={option.label}
                            checked={formData.pets === option.value}
                            onChange={handleChange}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor={`pets_${option.value}`} className="text-sm text-gray-700">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>

                    {formData.pets === 'oui' && (
                      <input
                        required
                        type="text"
                        name="pets_details"
                        value={formData.pets_details}
                        onChange={handleChange}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder={t('pets_details_placeholder')}
                      />
                    )}
                  </div>

                  <div className="item list">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('smokers_label')} *
                    </label>
                    <div className="flex space-x-4 mt-3">
                      {[
                        { value: 'non', label: t('no') },
                        { value: 'oui', label: t('yes') }
                      ].map((option) => (
                        <div key={option.value} className="flex items-center">
                          <input
                            required
                            type="radio"
                            id={`smokers_${option.value}`}
                            name="smokers"
                            value={option.label}
                            checked={formData.smokers === option.value}
                            onChange={handleChange}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor={`smokers_${option.value}`} className="text-sm text-gray-700">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="item list md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('previous_rental_issues_label')} *
                    </label>
                    <div className="flex space-x-4 mt-3 mb-2">
                      {[
                        { value: 'non', label: t('no') },
                        { value: 'oui', label: t('yes') }
                      ].map((option) => (
                        <div key={option.value} className="flex items-center">
                          <input
                            required
                            type="radio"
                            id={`previous_rental_issues_${option.value}`}
                            name="previous_rental_issues"
                            value={option.label}
                            checked={formData.previous_rental_issues === option.value}
                            onChange={handleChange}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor={`previous_rental_issues_${option.value}`} className="text-sm text-gray-700">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>

                    {formData.previous_rental_issues === 'oui' && (
                      <textarea
                        name="previous_rental_issues_details"
                        value={formData.previous_rental_issues_details}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder={t('previous_rental_issues_details_placeholder')}
                        required 
                      />
                    )}
                  </div>


                </div>
              </div>

              {/* Section 8: Références locatives */}
              <div className="step-content mx-auto mt-3 pt-5 pb-5">
                <h3 className="form-sub-title text-xl font-bold mb-8">{t('references_locatives_title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7.5 mb-12">
                  <div className="item">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('last_landlord_name_label')}
                    </label>
                    <input
                      type="text"
                      name="last_landlord_name"
                      value={formData.last_landlord_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('last_landlord_name_placeholder')}
                    />
                  </div>

                  <div className="item">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('last_landlord_contact_label')}
                    </label>
                    <input
                      type="text"
                      name="last_landlord_contact"
                      value={formData.last_landlord_contact}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('last_landlord_contact_placeholder')}
                    />
                  </div>

                  <div className="item">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('last_lease_duration_label')}
                    </label>
                    <input
                      type="text"
                      name="last_lease_duration"
                      value={formData.last_lease_duration}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('last_lease_duration_placeholder')}
                    />
                  </div>

                  <div className="item md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('departure_reason_label')}
                    </label>
                    <textarea
                      name="departure_reason"
                      value={formData.departure_reason}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('departure_reason_placeholder')}
                    />
                  </div>
                </div>
              </div>

              {/* Section 9: Personne de contact en cas d'urgence */}
              <div className="step-content mx-auto mt-3 pt-5 pb-5">
                <h3 className="form-sub-title text-xl font-bold mb-8">{t('emergency_contact_title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7.5 mb-12">
                  <div className="item">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('name_label')}
                    </label>
                    <input
                      type="text"
                      name="emergency_contact_name"
                      value={formData.emergency_contact_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('emergency_contact_name_placeholder')}
                    />
                  </div>

                  <div className="item">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('emergency_contact_relation_label')}
                    </label>
                    <input
                      type="text"
                      name="emergency_contact_relation"
                      value={formData.emergency_contact_relation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('emergency_contact_relation_placeholder')}
                    />
                  </div>

                  <div className="item">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('emergency_contact_phone_label')}
                    </label>
                    <input
                      type="tel"
                      name="emergency_contact_phone"
                      value={formData.emergency_contact_phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+352 XX XX XX XX"
                    />
                  </div>
                </div>
              </div>

              {/* Section Informations importantes – Commission et état des lieux de sortie */}
              <div className="step-content mx-auto mt-3 pt-5 pb-5 ">
                <h3 className="form-sub-title text-xl font-bold mb-8">
                  {t('important_information_title')}
                </h3>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-4">
                      {t('reservation_commission_title')}
                    </h4>
                    <p className="text-sm mb-4" dangerouslySetInnerHTML={{
                      __html: t('reservation_commission_description').replace(/\*(.*?)\*/g, (match, p1) => 
                        `<strong>${p1}</strong>`
                      )
                    }} />

                    
                    <ul className="list-disc list-inside text-sm space-y-2">
                      <li dangerouslySetInnerHTML={{
                        __html: t('reservation_commission_point1').replace(/\*(.*?)\*/g, (match, p1) => 
                          `<strong>${p1}</strong>`
                        )
                      }} />
                      <li dangerouslySetInnerHTML={{
                        __html: t('reservation_commission_point2').replace(/\*(.*?)\*/g, (match, p1) => 
                          `<strong>${p1}</strong>`
                        )
                      }} />
                      <li dangerouslySetInnerHTML={{
                        __html: t('reservation_commission_point3').replace(/\*(.*?)\*/g, (match, p1) => 
                          `<strong>${p1}</strong>`
                        )
                      }} />
                    </ul>
                    
                    <p className="text-sm mt-4" dangerouslySetInnerHTML={{
                      __html: t('reservation_commission_note').replace(/\*(.*?)\*/g, (match, p1) => 
                        `<strong>${p1}</strong>`
                      )
                    }} />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-lg font-semibold mb-4">
                      {t('exit_condition_report_title')}
                    </h4>
                    <p className="text-sm mb-4" dangerouslySetInnerHTML={{
                      __html: t('exit_condition_report_description').replace(/\*(.*?)\*/g, (match, p1) => 
                        `<strong>${p1}</strong>`
                      )
                    }} />
                    
                    <ul className="list-disc list-inside text-sm space-y-2">
                      <li dangerouslySetInnerHTML={{
                        __html: t('exit_condition_report_point1').replace(/\*(.*?)\*/g, (match, p1) => 
                          `<strong>${p1}</strong>`
                        )
                      }} />
                      <li dangerouslySetInnerHTML={{
                        __html: t('exit_condition_report_point2').replace(/\*(.*?)\*/g, (match, p1) => 
                          `<strong>${p1}</strong>`
                        )
                      }} />
                    </ul>
                  </div>
                </div>
              </div>


              {/* Section 10: Consentement au traitement des données personnelles */}
              <div className="step-content mx-auto mt-3 pt-5 pb-5">
                <h3 className="form-sub-title text-xl font-bold mb-8">{t('step10_title')}</h3>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="mb-6">
                    <p className="text-sm mb-4">
                      {t('data_consent_description')}
                    </p>
                    <p className="text-sm mb-4">
                      {t('data_consent_description2')}
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-2">
                      <li>{t('data_consent_rgpd')}</li>
                      <li>{t('data_consent_law_1')}</li>
                      <li>{t('data_consent_law_2')}</li>
                    </ul>
                  </div>

                   
                  <p className="text-sm mb-4">
                    {t('data_consent_title')}
                  </p>
                  <div className="flex list items-center mb-1">
                    <input
                      type="checkbox"
                      id="data_consent"
                      name="data_consent"
                      checked={formData.data_consent}
                      onChange={(e) => setFormData({
                        ...formData,
                        data_consent: e.target.checked
                      })}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="data_consent" className="text-ms mb-0">
                      {t('data_consent_checkbox_label')}
                    </label>
                  </div>

                  <div className="flex list items-center">
                    <input
                      type="checkbox"
                      id="data_consent_duration"
                      name="data_consent_duration"
                      checked={formData.data_consent_duration}
                      onChange={(e) => setFormData({
                        ...formData,
                        data_consent_duration: e.target.checked
                      })}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="data_consent_duration" className="text-ms mb-0">
                      {t('data_consent_duration')}
                    </label>
                  </div>

                </div>
              </div>

              <div className="item">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('date_label')} {new Date().toLocaleDateString()}</label>
              </div>
              <div className="grid grid-cols-2">
                <div className="item">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('main_applicant_signature')} *</label>
                  <SignatureCanvas
                    penColor="black"
                    backgroundColor="transparent"
                    canvasProps={{ className: "signature-canvas border border-gray-300 border-dashed", width: 400, height: 150 }}
                    ref={signatureRef1} // Tham chiếu cho "candidat principal"
                  />
                  <button type="button" onClick={clearSignature1} className="mt-2 text-blue-500">Clear Signature</button>
                </div>

                <div className="item">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('co_applicant_signature')}</label>
                  <SignatureCanvas
                    penColor="black"
                    backgroundColor="transparent"
                    canvasProps={{ className: "signature-canvas border border-gray-300 border-dashed", width: 400, height: 150 }}
                    ref={signatureRef2} // Tham chiếu cho "co-demandeur"
                  />
                  <button type="button" onClick={clearSignature2} className="mt-2 text-blue-500">Clear Signature</button>
                </div>
              </div>


              {/* Section 10: Consentement au traitement des données personnelles */}
              <div className="step-content mx-auto mt-3 pt-5 pb-5">
                <h3 className="form-sub-title text-xl font-bold mb-8">{t('rgpd_title')}</h3>
                <p className="text-sm mb-4" dangerouslySetInnerHTML={{
                    __html: t('rgpd_desc').replace(/\*(.*?)\*/g, (match, p1) => 
                      `<strong>${p1}</strong>`
                    )
                  }} />

                <ul className="list-disc list-inside text-sm space-y-2">
                  <li className="text-sm mb-4" dangerouslySetInnerHTML={{
                    __html: t('rgpd_list_1').replace(/\*(.*?)\*/g, (match, p1) => 
                      `<strong>${p1}</strong>`
                    )
                  }} />
                  <li className="text-sm mb-4" dangerouslySetInnerHTML={{
                    __html: t('rgpd_list_2').replace(/\*(.*?)\*/g, (match, p1) => 
                      `<strong>${p1}</strong>`
                    )
                  }} />
                  <li className="text-sm mb-4" dangerouslySetInnerHTML={{
                    __html: t('rgpd_list_3').replace(/\*(.*?)\*/g, (match, p1) => 
                      `<strong>${p1}</strong>`
                    )
                  }} />
                  <li className="text-sm mb-4" dangerouslySetInnerHTML={{
                    __html: t('rgpd_list_4').replace(/\*(.*?)\*/g, (match, p1) => 
                      `<strong>${p1}</strong>`
                    )
                  }} />
                  <li className="text-sm mb-4" dangerouslySetInnerHTML={{
                    __html: t('rgpd_list_5').replace(/\*(.*?)\*/g, (match, p1) => 
                      `<strong>${p1}</strong>`
                    )
                  }} />
                  <li className="text-sm mb-4" dangerouslySetInnerHTML={{
                    __html: t('rgpd_list_6').replace(/\*(.*?)\*/g, (match, p1) => 
                      `<strong>${p1}</strong>`
                    )
                  }} />
                  <li className="text-sm mb-4" dangerouslySetInnerHTML={{
                    __html: t('rgpd_list_7').replace(/\*(.*?)\*/g, (match, p1) => 
                      `<strong>${p1}</strong>`
                    )
                  }} />
                </ul>
                <a className="text-blue-600" target='_blank' href="https://www.cnpd.lu/">www.cnpd.lu</a>
              </div>


              
              <div className="text-center mt-12">
                <button 
                  disabled={loading} 
                  type="submit" 
                  className="form-submit bg-black text-[16px] font-semibold inline-flex px-10 py-5 text-white rounded-[50px] mx-auto cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Envoi en cours...' : t('submit_button')}
                </button>
              </div>

              <div className="text-center mt-12">
                {loading && (
                  <div className="spinner border-4 border-gray-200 border-t-4 border-t-blue-500 rounded-full w-8 h-8 animate-spin mx-auto"></div>
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