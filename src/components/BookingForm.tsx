import {useTranslations} from 'next-intl';
import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import Image from 'next/image';

export default function BookingForm() {
  const t = useTranslations('Form');
  
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error' | 'inform';
    message: string;
  } | null>(null);

  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 10;

  
  const backStep = () => {
    setSubmitMessage(null);
    setCurrentStep( currentStep-1 );
  }

  const jumpToStep = (stepNumber: number) => {
    setSubmitMessage(null);
    // Kiểm tra step hợp lệ
    if (stepNumber >= 1 && stepNumber <= totalSteps) {
      // Tự custom validate cho từng step
      const isCurrentStepValid = validateCurrentStep(currentStep);
      
      if (!isCurrentStepValid) {
        return; // Dừng không cho chuyển step
      }

      // Cập nhật step hiện tại
      setCurrentStep(stepNumber);
     
    }
  };

  const validateCurrentStep = (step: number) => {
    // Tìm div của step
    const stepElement = document.querySelector(`.step-content.step-${step}`);
    
    if (!stepElement) return true;

    // Tìm tất cả input, textarea, select trong step
    const inputs = stepElement.querySelectorAll('input, textarea, select');
    
    let isValid = true;
    const invalidFields: HTMLElement[] = [];

    // Kiểm tra từng trường
    inputs.forEach((input) => {
      if (input instanceof HTMLInputElement || 
          input instanceof HTMLTextAreaElement || 
          input instanceof HTMLSelectElement) {
        
        // Kiểm tra validity
        if (!input.checkValidity()) {
          isValid = false;
          invalidFields.push(input);
        }
      }
    });

    // Nếu có trường không hợp lệ
    if (!isValid) {
      // Cuộn đến trường đầu tiên không hợp lệ
      const firstInvalidField = invalidFields[0];
      firstInvalidField.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      firstInvalidField.focus();

      // Hiển thị thông báo lỗi
      setSubmitMessage({
        type: 'error',
        message: t('form_invalid')
      });
    }

    return isValid;
  };

  
  const [show_co_applicant, setshow_co_applicant] = useState(false);
  const add_co_applicant = (e: React.MouseEvent) => {
    e.preventDefault();
    setshow_co_applicant(true);
  };

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
    reservation_commission: false,
    exit_condition_report: false,
    data_consent: false,
    consent_personal_data: false,
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
    const savedData = localStorage.getItem('bookingFormData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if( parsedData.professionalDetails.length > 0 ) {
        setProfessionalDetails(parsedData.professionalDetails);
      }
      else {
        const newProfessionalDetails = Array.from({ length: adultsCount }, () => ({
          status: '',
          statusOther: '',
          currentProfession: '',
          employerName: '',
          employmentStartDate: '',
          seniorityInPosition: ''
        }));
        
        setProfessionalDetails(newProfessionalDetails);
      }
    }
    else {
      if (adultsCount > 0 ) {
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
    }
  }, [formData.adults_count]);

  // Hàm xử lý thay đổi thông tin nghề nghiệp
  const handleProfessionalDetailsChange = (index: number, field: string, value: string) => {
    const updatedDetails = [...professionalDetails];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value
    };
    //console.log("set default value", updatedDetails);
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


  // Hàm lưu form data vào localStorage
  const saveFormDataToLocalStorage = () => {
    try {
      const dataToSave = {
        formData: formData || {},
        professionalDetails: professionalDetails || [],
        uploadedFiles: uploadedFiles || [],
        currentStep: currentStep || 1,
        show_co_applicant: show_co_applicant || false
      };

      // Kiểm tra xem form có dữ liệu thực sự không
      const hasRealData = Object.values(dataToSave.formData).some(value => {
        // Kiểm tra các trường không rỗng và không phải false
        if (typeof value === 'string' && value.trim() !== '') return true;
        if (typeof value === 'boolean' && value === true) return true;
        return false;
      });
      // Chỉ lưu khi có dữ liệu thực sự
      if (hasRealData) {
        localStorage.setItem('bookingFormData', JSON.stringify(dataToSave));
      }
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  };


  // Hàm load dữ liệu từ localStorage
  const loadFormDataFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem('bookingFormData');
      if (savedData) {
        // Parse an toàn
        const parsedData = JSON.parse(savedData);
        
        // Sử dụng functional update để đảm bảo không bị ghi đè
        setFormData(prevData => ({
          ...prevData,
          ...parsedData.formData
        }));

        // Kiểm tra và load professional details
        
        if( parsedData.professionalDetails ) {
          setProfessionalDetails(parsedData.professionalDetails);
        }
        // Kiểm tra và set các giá trị
        if (parsedData.currentStep) {
          setCurrentStep(parsedData.currentStep);
        }

        // Các state khác tương tự
      }
    } catch (error) {
      console.error('Error loading form data:', error);
      // Xóa localStorage nếu parse thất bại
      localStorage.removeItem('bookingFormData');
    }
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    loadFormDataFromLocalStorage();
  }, []);

  // Sửa nút save trong từng step
  const handleSaveStep = () => {
    saveFormDataToLocalStorage();
    
    setSubmitMessage({
      type: 'inform', 
      message: t('data_saved_successfully')
    });
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

    //saveSignature1();
    //saveSignature2();
    const signature1Data = signatureRef1.current.toDataURL();
    const signature2Data = signatureRef2.current && !signatureRef2.current.isEmpty() 
    ? signatureRef2.current.toDataURL() 
    : null;

    await new Promise(resolve => {
      setSignature1(signature1Data);
      if (signature2Data) {
        setSignature2(signature2Data);
      }
      // Sử dụng setTimeout để đảm bảo state update
      setTimeout(resolve, 0);
    });
    

    // Kiểm tra tính hợp lệ của form
    const formElement = e.target as HTMLFormElement;
    if (!formElement.checkValidity()) {
      // Nếu form không hợp lệ, thông báo lỗi
      setSubmitMessage({
        type: 'error',
        message: t('form_invalid')
      });
      
      // Cuộn đến trường lỗi đầu tiên
      const firstInvalidField = formElement.querySelector(':invalid') as HTMLElement;
      if (firstInvalidField) {
        const currentTabElement = firstInvalidField.closest('.step-content');
        
        if (currentTabElement) {
          const currentTabId = currentTabElement.id; // 'step-1-form', 'step-2-form'
          const currentTabNumber = currentTabId.split('-')[1]; // '1', '2'
          
          // Chuyển sang tab tương ứng
          jumpToStep(parseInt(currentTabNumber));
        }

        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalidField.focus();
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

    //setLoading(true);
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
      if (signature1) {
        formDataToSend.append('signature1', signature1);
      }
      else {
        setTimeout(() => {
          if (signature1) {
            formDataToSend.append('signature1', signature1);
          }
          else {
            setSubmitMessage({
              type: 'error',
              message: t('signature_required_error') // Thêm key dịch cho thông báo lỗi
            });
            return;
          }
        }, 200);
        
      }
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

    // Xóa dữ liệu localStorage
    //localStorage.removeItem('bookingFormData');

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
      reservation_commission: false,
      exit_condition_report: false,
      data_consent: false,
      consent_personal_data: false,
      data_consent_duration: false
      
    });

    // Reset professional details
    setProfessionalDetails([]);
    setUploadedFiles([]);
    setCurrentStep(1);
    setshow_co_applicant(false);
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

      <div className="form-top-head bg-gray-50 border-t border-b border-gray-200 text-center pb-15 pt-15">
        <div className="container">
          <h1 className="text-3xl sm:text-5xl inline-flex flex-col sm:flex-row items-center gap-5 justify-center font-bold mb-5">
            {t('title')}
          </h1>
          <div
            className="text-lg leading-[24px] max-w-[490px] mx-auto"
            dangerouslySetInnerHTML={{
              __html: t('desc'),
            }}
          />
        </div>
      </div>

      <div className="container mx-auto pt-10 pb-10">
        <form 
          onSubmit={handleFinalSubmit} 
          noValidate 
          className="property-form"
        >
          <div 
            className={`
              relative flex lg:flex-row flex-col items-start z-10 gap-5 pt-10 px-0 lg:px-5 
              ${submitMessage && submitMessage.type === 'success' ? 'hidden' : ''}
            `}
          >
            <div className="form-menu relative text-gray-400 text-xs font-semibold leading-4 tracking-[0.3px] uppercase flex flex-row lg:flex-col gap-4 lg:gap-10 lg:w-2/6 w-full pb-3 overflow-x-auto lg:overflow-visible whitespace-nowrap lg:whitespace-normal scroll-smooth">

              <div 
                className={`menu-item shrink-0 pl-4 ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
                onClick={() => jumpToStep(1)}
              >
                {t('menu1_title')}
              </div>
              <div 
                className={`menu-item shrink-0 pl-4 ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
                onClick={() => jumpToStep(2)}
              >
                {t('menu2_title')}
              </div>
              <div 
                className={`menu-item shrink-0 pl-4 ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}
                onClick={() => jumpToStep(3)}
              >
                {t('menu3_title')}
              </div>
              <div 
                className={`menu-item shrink-0 pl-4 ${currentStep === 4 ? 'active' : ''} ${currentStep > 4 ? 'completed' : ''}`}
                onClick={() => jumpToStep(4)}
              >
                {t('menu4_title')}
              </div>
              <div 
                className={`menu-item shrink-0 pl-4 ${currentStep === 5 ? 'active' : ''} ${currentStep > 5 ? 'completed' : ''}`}
                onClick={() => jumpToStep(5)}
              >
                {t('menu5_title')}
              </div>
              <div 
                className={`menu-item shrink-0 pl-4 ${currentStep === 6 ? 'active' : ''} ${currentStep > 6 ? 'completed' : ''}`}
                onClick={() => jumpToStep(6)}
              >
                {t('menu6_title')}
              </div>
              <div 
                className={`menu-item shrink-0 pl-4 ${currentStep === 7 ? 'active' : ''} ${currentStep > 7 ? 'completed' : ''}`}
                onClick={() => jumpToStep(7)}
              >
                {t('menu7_title')}
              </div>
              <div 
                className={`menu-item shrink-0 pl-4 ${currentStep === 8 ? 'active' : ''} ${currentStep > 8 ? 'completed' : ''}`}
                onClick={() => jumpToStep(8)}
              >
                {t('menu8_title')}
              </div>
            </div>
            <div className="section-form w-full lg:w-4/6">

              {/* Section 1: Applicant's Information */}
              <div 
                className={`step-content step-1 ${currentStep === 1 ? '' : 'hidden'}`} 
                id="step-1-form"
              >
                <h3 className="form-sub-title flex items-center gap-2 mb-8">
                  <Image src={`me.svg`} alt={'down'} width={24} height={24} /> 1. {t('step1_title')}
                </h3>
                <h5 className="text-gray-400 font-bold text-sm leading-5 border-b pb-1 mb-[18px] border-gray-200">{t('step1_subtitle_1')}</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-10">
                  
                  <div className="item">
                    <label className="text-gray-900">{t('name_label')}</label>
                    <input
                      type="text"
                      required
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="item">
                    <label className="text-gray-900">{t('birth_day_label')}</label>
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
                    <label className="text-gray-900">{t('country_label')}</label>
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
                    <label className="text-gray-900">{t('address_label')}</label>
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
                    <label className="text-gray-900">{t('address_since_label')}</label>
                    <input
                      type="date"
                      required
                      name="address_since"
                      value={formData.address_since}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="item">
                    <label className="text-gray-900">{t('phone_label')}</label>
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
                    <label className="text-gray-900">{t('email_label')}</label>
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
                
                {!show_co_applicant && (
                <a href="#" onClick={add_co_applicant} className="inline-flex gap-2 px-5 py-2 border border-gray-300 rounded-full"><Image src={`user-add.svg`} alt={t('add_co_applicant')} width={20} height={20} /> {t('add_co_applicant')}</a>
                )}

                {show_co_applicant && (
                <div className="hide">
                  <h5 className="text-gray-400 font-bold text-sm leading-5 border-b pb-1 mb-[18px] border-gray-200">{t('step1_subtitle_2')}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-10">
                    
                    <div className="item">
                      <label className="text-gray-900">{t('name_label')}</label>
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
                      <label className="text-gray-900">{t('birth_day_label')}</label>
                      <input
                        type="date"
                        name="co_applicant_birth_date"
                        value={formData.co_applicant_birth_date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="item">
                      <label className="text-gray-900">{t('country_label')}</label>
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
                      <label className="text-gray-900">{t('phone_label')}</label>
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
                      <label className="text-gray-900">{t('email_label')}</label>
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
                )}

                <div className="step-buttons flex justify-between pt-10 mt-10 border-t border-gray-200">
                  <button type="button" onClick={handleSaveStep} className="inline-flex gap-2 px-5 py-2 border border-gray-300 rounded-full">
                    {t('save_btn')}
                  </button>

                  <button type="button"
                    onClick={() => jumpToStep(currentStep + 1)} className="inline-flex gap-2 px-5 py-2 text-white bg-primary border border-primary rounded-full">
                    {t('next_btn')} <Image src={`arrow-right.svg`} alt={t('next_btn')} width={20} height={20} />
                  </button>
                </div>

              </div>

              {/* Section 2: Current Residential Situation */}
              <div 
                className={`step-content step-2 ${currentStep === 2 ? '' : 'hidden'}`} 
                id="step-2-form"
              >
                <h3 className="form-sub-title flex items-center gap-2 mb-8">
                  <Image src={`addressbook.svg`} alt={'down'} width={24} height={24} /> 2. {t('step2_title')}
                </h3>
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
                            checked={formData.current_housing_situation === option.label}
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

                  {formData.current_housing_situation === t('housing_autre') && (
                    <div className="item">
                      <input
                        required
                        type="text"
                        name="current_housing_other"
                        value={formData.current_housing_other}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={t('housing_autre_placeholder')}
                      />
                    </div>
                  )}

                </div>

                <div className="step-buttons flex justify-between pt-10 mt-10 border-t border-gray-200">
                  <div className="flex gap-5">
                    <button type="button" onClick={() => backStep()} className="inline-flex gap-2 px-5 py-2 border border-gray-300 rounded-full">
                      {t('back_btn')}
                    </button>
                    <button type="button" onClick={handleSaveStep} className="inline-flex gap-2 px-5 py-2 border border-gray-300 rounded-full">
                      {t('save_btn')}
                    </button>
                  </div>

                  <button type="button"
                    onClick={() => jumpToStep(currentStep + 1)} className="inline-flex gap-2 px-5 py-2 text-white bg-primary border border-primary rounded-full">
                    {t('next_btn')} <Image src={`arrow-right.svg`} alt={t('next_btn')} width={20} height={20} />
                  </button>
                </div>

              </div>

              {/* Section 3: Household Composition Expected in the Property */}
              <div 
                className={`step-content step-3 ${currentStep === 3 ? '' : 'hidden'}`} 
                id="step-3-form"
              >
                
                <h3 className="form-sub-title flex items-center gap-2 mb-8">
                  <Image src={`bulletin.svg`} alt={'down'} width={24} height={24} /> 3. {t('step3_title')}
                  </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-7.5 mb-12">
                  
                  <div className="item">
                    <label className="text-gray-900">{t('total_people_label')}</label>
                    <input
                      type="number"
                      required
                      name="total_people"
                      value={formData.total_people}
                      onChange={handleChange}
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="item">
                    <label className="text-gray-900">{t('adults_count_label')}</label>
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
                    <label className="text-gray-900">{t('children_count_label')}</label>
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
                    <label className="text-gray-900">{t('household_details')}</label>
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

                <div className="step-buttons flex justify-between pt-10 mt-10 border-t border-gray-200">
                  <div className="flex gap-5">
                    <button type="button" onClick={() => backStep()} className="inline-flex gap-2 px-5 py-2 border border-gray-300 rounded-full">
                      {t('back_btn')}
                    </button>
                    <button type="button" onClick={handleSaveStep} className="inline-flex gap-2 px-5 py-2 border border-gray-300 rounded-full">
                      {t('save_btn')}
                    </button>
                  </div>

                  <button type="button" 
                    onClick={() => jumpToStep(currentStep + 1)} className="inline-flex gap-2 px-5 py-2 text-white bg-primary border border-primary rounded-full">
                    {t('next_btn')} <Image src={`arrow-right.svg`} alt={t('next_btn')} width={20} height={20} />
                  </button>
                </div>

              </div>

              {/* Section 4: Employment Situation */}
              
                <div 
                  className={`step-content mx-auto mt-3 pt-5 pb-5 step-4 ${currentStep === 4 ? '' : 'hidden'}`} 
                  id="step-4-form"
                >
                  <h3 className="form-sub-title flex items-center gap-2 mb-8">
                    <Image src={`classification.svg`} alt={'down'} width={24} height={24} /> 4. {t('step4_title')}
                  </h3>

                  {professionalDetails.map((detail, index) => (
                    <div key={index} className="mb-10">
                      <h5 className="text-gray-400 font-bold text-sm leading-5 border-b pb-1 mb-[18px] border-gray-200">
                        {t('person_label')} {index + 1}
                      </h5>

                      {/* Statut */}
                      <div className="mb-4">
                        <div className="grid list grid-cols-2 mb-4 md:grid-cols-3 gap-3">
                          {professionalStatusOptions.map((option) => (
                            <div key={option.value} className="flex items-center">
                              <input
                                required
                                type="radio"
                                id={`status_${index}_${option.value}`}
                                name={`status_${index}`}
                                value={option.label}
                                checked={detail.status === option.label}
                                onChange={(e) => handleProfessionalDetailsChange(index, 'status', e.target.value)}
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <label htmlFor={`status_${index}_${option.value}`}>
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                        
                        {detail.status === t('professionalStatus_autre') && (
                          <>
                          <label className="text-gray-900">{t('professionalStatus_autre_label', { num: String(index + 1) })}</label>
                          <input
                            required
                            type="text"
                            value={detail.statusOther}
                            onChange={(e) => handleProfessionalDetailsChange(index, 'statusOther', e.target.value)}
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                          </>
                        )}
                      </div>

                      {/* Autres champs */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-gray-900">
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
                          <label className="text-gray-900">
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
                          <label className="text-gray-900">
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
                          <label className="text-gray-900">
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

                  
                  <div className="step-buttons flex justify-between pt-10 mt-10 border-t border-gray-200">
                    <div className="flex gap-5">
                      <button type="button" onClick={() => backStep()} className="inline-flex gap-2 px-5 py-2 border border-gray-300 rounded-full">
                        {t('back_btn')}
                      </button>
                      <button type="button" onClick={handleSaveStep} className="inline-flex gap-2 px-5 py-2 border border-gray-300 rounded-full">
                        {t('save_btn')}
                      </button>
                    </div>

                    <button type="button"
                      onClick={() => jumpToStep(currentStep + 1)} className="inline-flex gap-2 px-5 py-2 text-white bg-primary border border-primary rounded-full">
                      {t('next_btn')} <Image src={`arrow-right.svg`} alt={t('next_btn')} width={20} height={20} />
                    </button>
                  </div>

                </div>
              


              {/* Section 5: Income and Financial Stability */}
              <div 
                className={`step-content step-5 ${currentStep === 5 ? '' : 'hidden'}`} 
                id="step-5-form"
              >
                <h3 className="form-sub-title flex items-center gap-2 mb-8">
                  <Image src={`coin.svg`} alt={'down'} width={24} height={24} /> 5. {t('step5_title')}
                </h3>
                
                <div className="mb-12">
                  <div className="item list">
                    <label className="text-gray-900">
                      {t('monthly_household_income_label')}
                    </label>
                    <div className="grid grid-cols-2 mb-6 space-y-2 pt-3">
                      {monthlyIncomeOptions.map((option) => (
                        <div key={option.value} className="flex items-center">
                          <input
                            required
                            type="radio"
                            id={option.value}
                            name="monthly_household_income"
                            value={option.label}
                            checked={formData.monthly_household_income === option.label}
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
                    <label className="text-gray-900">
                      {t('income_source_label')}
                    </label>
                    <div className="grid grid-cols-2 space-y-2 pt-3">
                      {incomeSourceOptions.map((option) => (
                        <div key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            required
                            id={`income_source_${option.value}`}
                            name="income_source"
                            value={option.label}
                            checked={formData.income_source === option.label}
                            onChange={handleChange}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor={`income_source_${option.value}`} className="text-sm text-gray-700">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>

                    {formData.income_source === t('autre') && (
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

                  <div className="item list mt-6 md:col-span-2">
                    <label className="text-gray-900">
                      {t('rental_guarantee_label')}
                    </label>
                    <div className="flex justify-between space-x-4 mt-3">
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
                            checked={formData.rental_guarantee === option.label}
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

                <div className="mx-auto mt-3 pt-5">
                  <label className="text-gray-900">{t('justificative_documents_title')}</label>
                  
                  <div className="bg-yellow-50 mt-2.5 p-4 rounded-lg mb-2.5">
                    <p className="text-sm text-[#92400E] mb-0">
                      {t('documents_required_desc')}
                    </p>
                    <ul className="list-disc list-inside text-sm text-[#92400E] mb-0">
                      <li dangerouslySetInnerHTML={{
                        __html: t('document_requirement_1').replace(/\*(.*?)\*/g, (match, p1) => 
                          `${p1}`
                        )
                      }} />
                      <li dangerouslySetInnerHTML={{
                        __html: t('document_requirement_2').replace(/\*(.*?)\*/g, (match, p1) => 
                          `<strong>${p1}</strong>`
                        )
                      }} />
                    </ul>
                    <p className="text-sm text-[#92400E]" dangerouslySetInnerHTML={{
                        __html: t('document_note').replace(/\*(.*?)\*/g, (match, p1) => 
                          `<strong>${p1}</strong>`
                        )
                      }} />
                  </div>

                  <div className="mb-0">
                    
                    <div className="flex items-center justify-center w-full">
                      <label 
                        htmlFor="document-upload" 
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer  hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M28 8H12C10.9391 8 9.92172 8.42143 9.17157 9.17157C8.42143 9.92172 8 10.9391 8 12V32M8 32V36C8 37.0609 8.42143 38.0783 9.17157 38.8284C9.92172 39.5786 10.9391 40 12 40H36C37.0609 40 38.0783 39.5786 38.8284 38.8284C39.5786 38.0783 40 37.0609 40 36V28M8 32L17.172 22.828C17.9221 22.0781 18.9393 21.6569 20 21.6569C21.0607 21.6569 22.0779 22.0781 22.828 22.828L28 28M40 20V28M40 28L36.828 24.828C36.0779 24.0781 35.0607 23.6569 34 23.6569C32.9393 23.6569 31.9221 24.0781 31.172 24.828L28 28M28 28L32 32M36 8H44M40 4V12M28 16H28.02" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>

                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-medium text-gray-900">{t('click_to_upload')}</span> {t('or_drag_and_drop')}
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

                <div className="step-buttons flex justify-between pt-10 mt-10 border-t border-gray-200">
                  <div className="flex gap-5">
                    <button type="button" onClick={() => backStep()} className="inline-flex gap-2 px-5 py-2 border border-gray-300 rounded-full">
                      {t('back_btn')}
                    </button>
                    <button type="button" onClick={handleSaveStep} className="inline-flex gap-2 px-5 py-2 border border-gray-300 rounded-full">
                      {t('save_btn')}
                    </button>
                  </div>

                  <button type="button"
                    onClick={() => jumpToStep(currentStep + 1)} className="inline-flex gap-2 px-5 py-2 text-white bg-primary border border-primary rounded-full">
                    {t('next_btn')} <Image src={`arrow-right.svg`} alt={t('next_btn')} width={20} height={20} />
                  </button>
                </div>

              </div>

              {/* Section 6: Income and Financial Stability */}
              <div 
                className={`step-content step-6 ${currentStep === 6 ? '' : 'hidden'}`} 
                id="step-6-form"
              >
                <h3 className="form-sub-title flex items-center gap-2 mb-8">
                  <Image src={`classification.svg`} alt={'down'} width={24} height={24} /> 6. {t('step6_title')}
                </h3>
                
                <div className="flex gap-4 mb-12">
                  <div className="item w-1/3">
                    <label className="text-gray-900">
                      {t('desired_move_in_date_label')}
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

                  <div className="item w-2/3">
                    <label className="text-gray-900">
                      {t('desired_lease_duration_label')}
                    </label>
                    <div className="flex gap-2">
                      {leaseDurationOptions.map((option) => (
                        <div key={option.value} className="radio-button">
                          <input
                            required
                            type="radio"
                            id={option.value}
                            name="desired_lease_duration"
                            value={option.label}
                            checked={formData.desired_lease_duration === option.label}
                            onChange={handleChange}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor={option.value} className="border cursor-pointer border-gray-300 text-sm text-gray-900 p-2.5 rounded-md">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                
                  <div className="item mb-6 list">
                    <label className="text-gray-900">
                      {t('pets_label')}
                    </label>
                    <div className="flex gap-10 space-x-4 mt-1">
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
                            checked={formData.pets === option.label}
                            onChange={handleChange}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor={`pets_${option.value}`} className="text-sm text-gray-700">
                            {option.label}
                          </label>
                        </div>
                      ))}

                      {formData.pets === t('yes') && (
                        <input
                          required
                          type="text"
                          name="pets_details"
                          value={formData.pets_details}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder={t('pets_details_placeholder')}
                        />
                      )}

                    </div>

                  </div>

                  <div className="item mb-6 list">
                    <label className="text-gray-900">
                      {t('smokers_label')}
                    </label>
                    <div className="flex gap-10 space-x-4 mt-1">
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
                            checked={formData.smokers === option.label}
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
                    <label className="text-gray-900">
                      {t('previous_rental_issues_label')}
                    </label>
                    <div className="flex gap-10 space-x-4 mt-1">
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
                            checked={formData.previous_rental_issues === option.label}
                            onChange={handleChange}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor={`previous_rental_issues_${option.value}`} className="text-sm text-gray-700">
                            {option.label}
                          </label>
                        </div>
                      ))}

                      
                      {formData.previous_rental_issues === t('yes') && (
                        <input
                          required
                          type="text"
                          name="previous_rental_issues_details"
                          value={formData.previous_rental_issues_details}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder={t('previous_rental_issues_details_placeholder')}
                        />
                      )}
                    </div>

                  </div>

                  <div className="step-buttons flex justify-between pt-10 mt-10 border-t border-gray-200">
                    <div className="flex gap-5">
                      <button type="button" onClick={() => backStep()} className="inline-flex gap-2 px-5 py-2 border border-gray-300 rounded-full">
                        {t('back_btn')}
                      </button>
                      <button type="button" onClick={handleSaveStep} className="inline-flex gap-2 px-5 py-2 border border-gray-300 rounded-full">
                        {t('save_btn')}
                      </button>
                    </div>

                    <button type="button"
                      onClick={() => jumpToStep(currentStep + 1)} className="inline-flex gap-2 px-5 py-2 text-white bg-primary border border-primary rounded-full">
                      {t('next_btn')} <Image src={`arrow-right.svg`} alt={t('next_btn')} width={20} height={20} />
                    </button>
                  </div>

              </div>

              {/* Section 7: Rental References */}
              <div 
                className={`step-content step-7 ${currentStep === 7 ? '' : 'hidden'}`} 
                id="step-7-form"
              >
                <h3 className="form-sub-title flex items-center gap-2 mb-8">
                  <Image src={`people.svg`} alt={'people'} width={24} height={24} /> 7. {t('references_locatives_title')} <span className="text-sm font-normal">({t('references_locatives_title_optional')})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                  <div className="item">
                    <label className="text-gray-900">
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
                    <label className="text-gray-900">
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
                    <label className="text-gray-900">
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

                  <div className="item md:col-span-3">
                    <label className="text-gray-900">
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

                <div className="step-buttons flex justify-between pt-10 mt-10 border-t border-gray-200">
                  <div className="flex gap-5">
                    <button type="button" onClick={() => backStep()} className="inline-flex gap-2 px-5 py-2 border border-gray-300 rounded-full">
                      {t('back_btn')}
                    </button>
                    <button type="button" onClick={handleSaveStep} className="inline-flex gap-2 px-5 py-2 border border-gray-300 rounded-full">
                      {t('save_btn')}
                    </button>
                  </div>

                  <button type="button"
                    onClick={() => jumpToStep(currentStep + 1)} className="inline-flex gap-2 px-5 py-2 text-white bg-primary border border-primary rounded-full">
                    {t('next_btn')} <Image src={`arrow-right.svg`} alt={t('next_btn')} width={20} height={20} />
                  </button>
                </div>

              </div>

              {/* Section 8: Emergency Contact */}
              <div 
                className={`step-content step-8 ${currentStep === 8 ? '' : 'hidden'}`} 
                id="step-8-form"
              >
                <h3 className="form-sub-title flex items-center gap-2 mb-8">
                  <Image src={`system-phonebook.svg`} alt={'people'} width={24} height={24} /> 8. {t('step7_title')} <span className="text-sm font-normal">({t('references_locatives_title_optional')})</span>
                  </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                  <div className="item">
                    <label className="text-gray-900">
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
                    <label className="text-gray-900">
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
                    <label className="text-gray-900">
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

                
                <div className="step-buttons flex justify-between pt-10 mt-10 border-t border-gray-200">
                  <div className="flex gap-5">
                    <button type="button" onClick={() => backStep()} className="inline-flex gap-2 px-5 py-2 border border-gray-300 rounded-full">
                      {t('back_btn')}
                    </button>
                    <button type="button" onClick={handleSaveStep} className="inline-flex gap-2 px-5 py-2 border border-gray-300 rounded-full">
                      {t('save_btn')}
                    </button>
                  </div>

                  <button type="button"
                    onClick={() => jumpToStep(currentStep + 1)} className="inline-flex gap-2 px-5 py-2 text-white bg-primary border border-primary rounded-full">
                    {t('next_btn')} <Image src={`arrow-right.svg`} alt={t('next_btn')} width={20} height={20} />
                  </button>
                </div>

              </div>

              <div 
                className={`step-content step-9 ${currentStep === 9 ? '' : 'hidden'}`} 
                id="step-9-form"
              >
                  
                  <h4 className="text-xl font-bold text-gray-900 mb-10">{t('review')}</h4>

                  <div className="review-details">
                      <div className="bg-gray-50 rounded-lg p-6 mb-5">
                          <div className="flex justify-between items-center mb-6">
                              <h2 className="text-lg font-semibold text-gray-900">1. {t('step1_title')}</h2>
                              <button className="text-gray-400 hover:text-primary text-sm font-medium flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                  </svg>
                                  {t('change')}
                              </button>
                          </div>

                          <div className="mb-6">
                              <h3 className="text-gray-400 font-bold text-sm leading-5 border-b pb-1 mb-[18px] border-gray-200">{t('step1_subtitle_1')}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                  <div>
                                      <label className="block font-medium text-sm text-gray-400 mb-1">{t('name_label')}</label>
                                      <p className="text-sm text-gray-900">{formData.full_name}</p>
                                  </div>
                                  <div>
                                      <label className="block font-medium text-sm text-gray-400 mb-1">{t('birth_day_label')}</label>
                                      <p className="text-sm text-gray-900">{formData.birth_date}</p>
                                  </div>
                                  <div>
                                      <label className="block font-medium text-sm text-gray-400 mb-1">{t('country_label')}</label>
                                      <p className="text-sm text-gray-900">{formData.nationality}</p>
                                  </div>
                              </div>
                              <div className="mb-4">
                                  <label className="block font-medium text-sm text-gray-400 mb-1">{t('address_label')}</label>
                                  <p className="text-sm text-gray-900">{formData.current_address}</p>
                                  <p className="text-sm text-gray-900">{formData.address_since}</p>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                      <label className="block font-medium text-sm text-gray-400 mb-1">{t('address_since_label')}</label>
                                      <p className="text-sm text-gray-900">{formData.address_since}</p>
                                  </div>
                                  <div>
                                      <label className="block font-medium text-sm text-gray-400 mb-1">{t('phone_label')}</label>
                                      <p className="text-sm text-gray-900">{formData.mobile_phone}</p>
                                  </div>
                                  <div>
                                      <label className="block font-medium text-sm text-gray-400 mb-1">{t('email_label')}</label>
                                      <p className="text-sm text-gray-900">{formData.email}</p>
                                  </div>
                              </div>
                          </div>

                          {formData.co_applicant_name != '' && (
                          <>
                          <div>
                              <h3 className="text-sm font-medium text-gray-700 mb-4">{t('step1_subtitle_2')}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                  <div>
                                      <label className="block font-medium text-sm text-gray-400 mb-1">{t('name_label')}</label>
                                      <p className="text-sm text-gray-900">{formData.co_applicant_name}</p>
                                  </div>
                                  <div>
                                      <label className="block font-medium text-sm text-gray-400 mb-1">{t('birth_day_label')}</label>
                                      <p className="text-sm text-gray-900">{formData.co_applicant_birth_date}</p>
                                  </div>
                                  <div>
                                      <label className="block font-medium text-sm text-gray-400 mb-1">{t('country_label')}</label>
                                      <p className="text-sm text-gray-900">{formData.co_applicant_nationality}</p>
                                  </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                      <label className="block font-medium text-sm text-gray-400 mb-1">{t('phone_label')}</label>
                                      <p className="text-sm text-gray-900">{formData.co_applicant_mobile}</p>
                                  </div>
                                  <div>
                                      <label className="block font-medium text-sm text-gray-400 mb-1">{t('email_label')}</label>
                                      <p className="text-sm text-gray-900">{formData.co_applicant_email}</p>
                                  </div>
                              </div>
                          </div>
                          </>
                          )}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6 mb-5">
                          <div className="flex justify-between items-center mb-4">
                              <h2 className="text-lg font-semibold text-gray-900">2. {t('step2_title')}</h2>
                              <button className="text-gray-400 hover:text-primary text-sm font-medium flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                  </svg>
                                  {t('change')}
                              </button>
                          </div>
                          <div>
                              <label className="block font-medium text-sm text-gray-400 mb-1">{t('step2_title')}</label>
                              <p className="text-sm text-gray-900">{formData.current_housing_situation}</p>
                              <p className="text-sm text-gray-900">{formData.current_housing_other}</p>
                          </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6 mb-5">
                          <div className="flex justify-between items-center mb-4">
                              <h2 className="text-lg font-semibold text-gray-900">3. {t('step3_title')}</h2>
                              <button className="text-gray-400 hover:text-primary text-sm font-medium flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                  </svg>
                                  {t('change')}
                              </button>
                          </div>
                          <div className="mb-4">
                              <h3 className="text-sm font-medium text-gray-700 mb-4">{t('step1_subtitle_1')}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                  <div>
                                      <label className="block font-medium text-sm text-gray-400 mb-1">{t('total_people_label')}</label>
                                      <p className="text-sm text-gray-900">{formData.total_people}</p>
                                  </div>
                                  <div>
                                      <label className="block font-medium text-sm text-gray-400 mb-1">{t('adults_count_label')}</label>
                                      <p className="text-sm text-gray-900">{formData.adults_count}</p>
                                  </div>
                                  <div>
                                      <label className="block font-medium text-sm text-gray-400 mb-1">{t('children_count_label')}</label>
                                      <p className="text-sm text-gray-900">{formData.children_count}</p>
                                  </div>
                              </div>
                              <div>
                                  <label className="block font-medium text-sm text-gray-400 mb-1">{t('household_details')}</label>
                                  <p className="text-sm text-gray-900">{formData.household_details}</p>
                              </div>
                          </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6 mb-5">
                          <div className="flex justify-between items-center mb-4">
                              <h2 className="text-lg font-semibold text-gray-900">4. {t('step4_title')}</h2>
                              <button className="text-gray-400 hover:text-primary text-sm font-medium flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                  </svg>
                                  {t('change')}
                              </button>
                          </div>
                          
                          {professionalDetails.map((detail, index) => (
                          <>
                          <div className="mb-6">
                              <h3 className="text-sm font-medium text-gray-700 mb-4">{t('person_label')} {index + 1}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                  <div>
                                      <label className="block font-medium text-sm text-gray-400 mb-1">{t('step4_title')}</label>
                                      <p className="text-sm text-gray-900">{detail.status}</p>
                                      <p className="text-sm text-gray-900">{detail.statusOther}</p>
                                  </div>
                                  <div>
                                      <label className="block font-medium text-sm text-gray-400 mb-1">{t('current_profession_label')}</label>
                                      <p className="text-sm text-gray-900">{detail.currentProfession}</p>
                                  </div>
                                  <div>
                                      <label className="block font-medium text-sm text-gray-400 mb-1">{t('employer_name_label')}</label>
                                      <p className="text-sm text-gray-900">{detail.employerName}</p>
                                  </div>
                                  <div>
                                      <label className="block font-medium text-sm text-gray-400 mb-1">{t('employment_start_date_label')}</label>
                                      <p className="text-sm text-gray-900">{detail.employmentStartDate}</p>
                                  </div>
                                  <div>
                                      <label className="block font-medium text-sm text-gray-400 mb-1">{t('seniority_in_position_label')}</label>
                                      <p className="text-sm text-gray-900">{detail.seniorityInPosition}</p>
                                  </div>
                              </div>
                          </div>
                          </>
                          ))}

                      </div>

                      <div className="bg-gray-50 rounded-lg p-6 mb-5">
                          <div className="flex justify-between items-center mb-4">
                              <h2 className="text-lg font-semibold text-gray-900">5. {t('step5_title')}</h2>
                              <button className="text-gray-400 hover:text-primary text-sm font-medium flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                  </svg>
                                  {t('change')}
                              </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div>
                                  <label className="block font-medium text-sm text-gray-400 mb-1">{t('monthly_household_income_label')}</label>
                                  <p className="text-sm text-gray-900">{formData.monthly_household_income}</p>
                              </div>
                              <div>
                                  <label className="block font-medium text-sm text-gray-400 mb-1">{t('income_source_label')}</label>
                                  <p className="text-sm text-gray-900">{formData.income_source}</p>
                                  <p className="text-sm text-gray-900">{formData.income_source_other}</p>
                              </div>
                              <div>
                                  <label className="block font-medium text-sm text-gray-400 mb-1">{t('rental_guarantee_label')}</label>
                                  <p className="text-sm text-gray-900">{formData.rental_guarantee}</p>
                              </div>
                              <div>
                                  <label className="block font-medium text-sm text-gray-400 mb-1">{t('justificative_documents_title')}</label>
                                  {uploadedFiles.length > 0 && (
                                    <>
                                      {uploadedFiles.map((file) => (
                                        <>
                                        <div className="flex items-center text-sm font-medium text-gray-900">
                                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                                          </svg>
                                          {file.name}
                                        </div>
                                        </>
                                      ))}
                                    </>
                                  )}
                              </div>
                          </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6 mb-5">
                          <div className="flex justify-between items-center mb-4">
                              <h2 className="text-lg font-semibold text-gray-900">6. {t('step6_title')}</h2>
                              <button className="text-gray-400 hover:text-primary text-sm font-medium flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                  </svg>
                                  {t('change')}
                              </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                  <label className="block font-medium text-sm text-gray-400 mb-1">{t('desired_move_in_date_label')}</label>
                                  <p className="text-sm text-gray-900">{formData.desired_move_in_date}</p>
                              </div>
                              <div>
                                  <label className="block font-medium text-sm text-gray-400 mb-1">{t('desired_lease_duration_label')}</label>
                                  <p className="text-sm text-gray-900">{formData.desired_lease_duration}</p>
                              </div>
                              <div>
                                  <label className="block font-medium text-sm text-gray-400 mb-1">{t('pets_label')}</label>
                                  <p className="text-sm text-gray-900">{formData.pets}</p>
                                  <p className="text-sm text-gray-900">{formData.pets_details}</p>
                              </div>
                              <div>
                                  <label className="block font-medium text-sm text-gray-400 mb-1">{t('smokers_label')}</label>
                                  <p className="text-sm text-gray-900">{formData.smokers}</p>
                              </div>
                          </div>
                          <div>
                              <label className="block font-medium text-sm text-gray-400 mb-1"> {t('previous_rental_issues_label')}</label>
                              <p className="text-sm text-gray-900">{formData.previous_rental_issues}</p>
                              <p className="text-sm text-gray-900">{formData.previous_rental_issues_details}</p>
                          </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6 mb-5">
                          <div className="flex justify-between items-center mb-4">
                              <h2 className="text-lg font-semibold text-gray-900">7. {t('references_locatives_title')}</h2>
                              <button className="text-gray-400 hover:text-primary text-sm font-medium flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                  </svg>
                                  {t('change')}
                              </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                  <label className="block font-medium text-sm text-gray-400 mb-1">{t('last_landlord_name_label')}</label>
                                  <p className="text-sm text-gray-900">{formData.last_landlord_name}</p>
                              </div>
                              <div>
                                  <label className="block font-medium text-sm text-gray-400 mb-1">{t('last_landlord_contact_label')}</label>
                                  <p className="text-sm text-gray-900">{formData.last_landlord_contact}</p>
                              </div>
                              <div>
                                  <label className="block font-medium text-sm text-gray-400 mb-1">{t('last_lease_duration_label')}</label>
                                  <p className="text-sm text-gray-900">{formData.last_lease_duration}</p>
                              </div>
                          </div>
                          <div>
                              <label className="block font-medium text-sm text-gray-400 mb-1">{t('departure_reason_label')}</label>
                              <p className="text-sm text-gray-700">{formData.departure_reason}</p>
                          </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-6 mb-5">
                          <div className="flex justify-between items-center mb-4">
                              <h2 className="text-lg font-semibold text-gray-900">8. {t('step7_title')}</h2>
                              <button className="text-gray-400 hover:text-primary text-sm font-medium flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                  </svg>
                                  {t('change')}
                              </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                  <label className="block font-medium text-sm text-gray-400 mb-1">{t('name_label')}</label>
                                  <p className="text-sm text-gray-900">{formData.emergency_contact_name}</p>
                              </div>
                              <div>
                                  <label className="block font-medium text-sm text-gray-400 mb-1">{t('emergency_contact_relation_label')}</label>
                                  <p className="text-sm text-gray-900">{formData.emergency_contact_relation}</p>
                              </div>
                              <div>
                                  <label className="block font-medium text-sm text-gray-400 mb-1">{t('emergency_contact_phone_label')}</label>
                                  <p className="text-sm text-gray-900">{formData.emergency_contact_phone}</p>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="step-buttons flex justify-between pt-10 mt-10 border-t border-gray-200">
                    <div className="flex gap-5">
                      <button type="button" onClick={() => backStep()} className="inline-flex gap-2 px-5 py-2 border border-gray-300 rounded-full">
                        {t('back_btn')}
                      </button>
                      <button type="button" onClick={handleSaveStep} className="inline-flex gap-2 px-5 py-2 border border-gray-300 rounded-full">
                        {t('save_btn')}
                      </button>
                    </div>

                    <button type="button"
                      onClick={() => jumpToStep(currentStep + 1)} className="inline-flex gap-2 px-5 py-2 text-white bg-primary border border-primary rounded-full">
                      {t('confirm')} <Image src={`arrow-right.svg`} alt={t('confirm')} width={20} height={20} />
                    </button>
                  </div>

              </div>

              {/* Section Informations importantes – Commission et état des lieux de sortie */}
              <div 
                className={`step-content step-10 ${currentStep === 10 ? '' : 'hidden'}`} 
                id="step-10-form"
              >
                
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="mb-6">
                    <h3 className="font-bold text-xl mb-6">
                      {t('important_information_title')}
                    </h3>

                    <label htmlFor="reservation_commission" className="dflex gap-2 items-center text-base font-semibold mb-4">
                      <div className="checkbox-wrap"><input
                        type="checkbox"
                        id="reservation_commission"
                        name="reservation_commission"
                        checked={formData.reservation_commission}
                        onChange={(e) => setFormData({
                          ...formData,
                          reservation_commission: e.target.checked
                        })}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        required
                      /> <span className="checkbox"></span> </div>
                      {t('reservation_commission_title')}
                    </label>
                    <p className="text-sm mb-1 text-gray-600" dangerouslySetInnerHTML={{
                      __html: t('reservation_commission_description').replace(/\*(.*?)\*/g, (match, p1) => 
                        `<strong>${p1}</strong>`
                      )
                    }} />

                    
                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
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
                      <li dangerouslySetInnerHTML={{
                        __html: t('reservation_commission_note').replace(/\*(.*?)\*/g, (match, p1) => 
                          `<strong>${p1}</strong>`
                        )
                      }} />
                    </ul>
                    
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <label htmlFor="exit_condition_report" className="dflex gap-2 items-center text-base font-semibold mb-4">
                      <div className="checkbox-wrap"><input
                        type="checkbox"
                        id="exit_condition_report"
                        name="exit_condition_report"
                        checked={formData.exit_condition_report}
                        onChange={(e) => setFormData({
                          ...formData,
                          exit_condition_report: e.target.checked
                        })}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-200 rounded"
                        required
                      /> <span className="checkbox"></span> </div>
                      {t('exit_condition_report_title')}
                    </label>
                    <p className="text-sm mb-1 text-gray-600" dangerouslySetInnerHTML={{
                      __html: t('exit_condition_report_description').replace(/\*(.*?)\*/g, (match, p1) => 
                        `<strong>${p1}</strong>`
                      )
                    }} />
                    
                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
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
             
                <div className="bg-gray-50 p-6 rounded-lg mt-10">
                  <div className="mb-6">
                    <h3 className="font-bold text-xl mb-6">{t('step10_title')}</h3>
                    
                    <label htmlFor="consent_personal_data" className="dflex gap-2 items-start text-base font-semibold mb-4">
                      <div className="checkbox-wrap mt-1"><input
                        type="checkbox"
                        id="consent_personal_data"
                        name="consent_personal_data"
                        checked={formData.consent_personal_data}
                        onChange={(e) => setFormData({
                          ...formData,
                          consent_personal_data: e.target.checked
                        })}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-200 rounded"
                        required
                      /> <span className="checkbox"></span> </div>
                      <div className="right text-gray-600">
                        <p className="text-sm font-normal mb-0">
                          {t('data_consent_description')}
                        </p>
                        <p className="text-sm font-normal mb-0">
                          {t('data_consent_description2')}
                        </p>
                        <ul className="list-disc font-normal list-inside text-sm ml-2">
                          <li>{t('data_consent_rgpd')}</li>
                          <li>{t('data_consent_law_1')}</li>
                          <li>{t('data_consent_law_2')}</li>
                        </ul>
                      </div>
                    </label>

                    
                  </div>

                   
                  <p className="text-sm mb-2.5 text-gray-600">
                    {t('data_consent_title')}
                  </p>
                  <div className="flex list items-center gap-2 mb-1">
                    <div className="checkbox-wrap mt-0"><input
                        type="checkbox"
                        id="data_consent"
                        name="data_consent"
                        checked={formData.data_consent}
                        onChange={(e) => setFormData({
                          ...formData,
                          data_consent: e.target.checked
                        })}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-200 rounded"
                        required
                      /> <span className="checkbox"></span> </div>
                    
                    <label htmlFor="data_consent" className="text-ms mb-0 text-gray-600">
                      {t('data_consent_checkbox_label')}
                    </label>
                  </div>

                  <div className="flex list items-center gap-2 mb-1">
                    <div className="checkbox-wrap mt-0"><input
                        type="checkbox"
                        id="data_consent_duration"
                        name="data_consent_duration"
                        checked={formData.data_consent_duration}
                        onChange={(e) => setFormData({
                          ...formData,
                          data_consent_duration: e.target.checked
                        })}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-200 rounded"
                        required
                      /> <span className="checkbox"></span> </div>
                    
                    <label htmlFor="data_consent_duration" className="text-ms mb-0 text-gray-600">
                      {t('data_consent_duration')}
                    </label>
                  </div>

                  
                  <div className="item mt-6 pt-6 border-t border-gray-200">
                    <label className="text-gray-900">{t('date_label')} {new Date().toLocaleDateString()}</label>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="item">
                      <label className="text-gray-900">{t('main_applicant_signature')} *</label>
                      <SignatureCanvas
                        penColor="black"
                        backgroundColor="transparent"
                        canvasProps={{ className: "signature-canvas border border-gray-300 border-dashed", width: 380, height: 150 }}
                        ref={signatureRef1} // Tham chiếu cho "candidat principal"
                      />
                      <button type="button" onClick={clearSignature1} className="mt-2 text-blue-500">{t('clear_signature')}</button>
                    </div>

                    <div className="item">
                      <label className="text-gray-900">{t('co_applicant_signature')}</label>
                      <SignatureCanvas
                        penColor="black"
                        backgroundColor="transparent"
                        canvasProps={{ className: "signature-canvas border border-gray-300 border-dashed", width: 380, height: 150 }}
                        ref={signatureRef2} // Tham chiếu cho "co-demandeur"
                      />
                      <button type="button" onClick={clearSignature2} className="mt-2 text-blue-500">{t('clear_signature')}</button>
                    </div>
                  </div>

                </div>

                
                <div className="step-buttons flex justify-between pt-10 mt-10 border-t border-gray-200">
                  <div className="flex gap-5">
                    <button type="button" onClick={() => backStep()} className="inline-flex gap-2 px-5 py-2 border border-gray-300 rounded-full">
                      {t('back_btn')}
                    </button>
                    <button type="button" onClick={handleSaveStep} className="inline-flex gap-2 px-5 py-2 border border-gray-300 rounded-full">
                      {t('save_btn')}
                    </button>
                  </div>

                  <div className="flex gap-5">
                    {loading && (
                      <div className="spinner border-4 border-gray-200 border-t-4 border-t-blue-500 rounded-full w-8 h-8 animate-spin mx-auto"></div>
                    )}
                    <button 
                      disabled={loading} 
                      type="submit" 
                      className="form-submit bg-primary text-sm font-medium inline-flex px-10 py-2 text-white rounded-[50px] mx-auto cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Envoi en cours...' : t('submit_button')}
                    </button>
                  </div>

                </div>  

                <p className="mt-10 mb-0 font-medium">{t('rgpd_title')}</p>
                
                <ul className="list-disc text-gray-500 list-inside text-sm">
                  <li className="text-sm mb-0" dangerouslySetInnerHTML={{
                    __html: t('rgpd_list_1').replace(/\*(.*?)\*/g, (match, p1) => 
                      `<strong>${p1}</strong>`
                    )
                  }} />
                  <li className="text-sm mb-0" dangerouslySetInnerHTML={{
                    __html: t('rgpd_list_2').replace(/\*(.*?)\*/g, (match, p1) => 
                      `<strong>${p1}</strong>`
                    )
                  }} />
                  <li className="text-sm mb-0" dangerouslySetInnerHTML={{
                    __html: t('rgpd_list_3').replace(/\*(.*?)\*/g, (match, p1) => 
                      `<strong>${p1}</strong>`
                    )
                  }} />
                  <li className="text-sm mb-0" dangerouslySetInnerHTML={{
                    __html: t('rgpd_list_4').replace(/\*(.*?)\*/g, (match, p1) => 
                      `<strong>${p1}</strong>`
                    )
                  }} />
                  <li className="text-sm mb-0" dangerouslySetInnerHTML={{
                    __html: t('rgpd_list_5').replace(/\*(.*?)\*/g, (match, p1) => 
                      `<strong>${p1}</strong>`
                    )
                  }} />
                  <li className="text-sm mb-0" dangerouslySetInnerHTML={{
                    __html: t('rgpd_list_6').replace(/\*(.*?)\*/g, (match, p1) => 
                      `<strong>${p1}</strong>`
                    )
                  }} />
                  <li
                    className="text-sm mb-0"
                    dangerouslySetInnerHTML={{
                      __html: `${t('rgpd_list_7').replace(/\*(.*?)\*/g, (match, p1) =>
                        `<strong>${p1}</strong>`
                      )} <a target="_blank" href="${t('rgpd_list_7_link')}" class="underline ml-1">${t('rgpd_list_7_web')}</a>`
                    }}
                  />
                </ul>

              </div>

            </div>
          </div>

          {submitMessage && submitMessage.type === 'success' && (
            <div className="flex flex-col items-center mt-15">
              <Image src={`success.svg`} alt={'success'} width={150} height={150} />
              <p className="mt-10 text-xl">{t('submit_success')}</p>
              <p className="text-xl">{t('submit_success2')}</p>
            </div>
          )}

          {submitMessage && ( submitMessage.type === 'error' || submitMessage.type === 'inform' ) && (
            <div 
              className={`
                fixed top-20 left-1/2 transform -translate-x-1/2 
                px-6 py-4 rounded-lg shadow-lg z-50
                ${submitMessage.type === 'inform' 
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