import {useTranslations} from 'next-intl';
import React, { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';

interface City {
id: number;
city_name: string;
}

export default function BookingForm() {
  const t = useTranslations('Home');

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

  const [cities, setCities] = useState<City[]>([]);

  // Xử lý khi người dùng nhập vào input locality
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      locality: value,
    });

    if (value) {
      try {
        // Sử dụng route API nội bộ
        const response = await axios.get(`/api/locations`, {
          params: { q: value },
        });
        
        // Giả sử API trả về cấu trúc tương tự
        setCities(response.data.match.cities);  
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {

      }
    } else {
      setCities([]);  // Clear results when input is empty
    }
  };

  

  // Xử lý khi người dùng chọn thành phố từ danh sách
  const handleCitySelect = (city: City) => {
    setFormData({
      ...formData,
      locality: city.city_name, // Cập nhật ô input với tên thành phố đã chọn
    });
    setCities([]); // Clear cities list after selection
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

  const propertyTypes = {
    home: t('form.propertyTypes.home').split('|'),
    appartement: t('form.propertyTypes.appartement').split('|')
  };

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [selectedType, setSelectedType] = useState('');

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const toggleCategory = (category: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Ngăn sự kiện lan đến phần tử cha
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };

  // Đơn giản hóa hàm handleTypeSelect để chỉ chọn type mới
  const handleTypeSelect = (type: string, event?: React.MouseEvent | React.ChangeEvent) => {
    if (event) {
        // Kiểm tra và ngăn lan sự kiện nếu là MouseEvent
        if ('stopPropagation' in event) {
          event.stopPropagation();
        }
      }
    
    // Luôn đặt type mới
    setSelectedType(type);
    
    // Cập nhật formData
    setFormData(prev => ({
      ...prev,
      propertyType: type
    }));
    
    // Tùy chọn: đóng dropdown sau khi chọn
    setDropdownVisible(false);
  };


    // Thêm state để quản lý current step
  const [currentStep, setCurrentStep] = useState(1);
  
  interface ZoneConditions {
    codes: number[];
    apartment: {
      minSurface: number;
      minTerrace: number;
      minBedrooms: number;
    };
    house: {
      minSurface: number;
      minGarden: number;
    };
  }
  

  const zoneConditions: { [key: string]: ZoneConditions } = {
    zone1: {
      codes: [317, 333, 332, 330, 322, 327, 320, 319],
      apartment: {
        minSurface: 95,  // with 5% tolerance
        minTerrace: 15,
        minBedrooms: 2
      },
      house: {
        minSurface: 142.5,  // with tolerance
        minGarden: 50
      }
    },
    zone2: {
      codes: [360, 359, 136],
      apartment: {
        minSurface: 142.5,
        minTerrace: 25,
        minBedrooms: 2
      },
      house: {
        minSurface: 190,
        minGarden: 100
      }
    },
    zone3: {
      codes: [342, 347, 310, 356, 138, 200],
      apartment: {
        minSurface: 142.5,
        minTerrace: 25,
        minBedrooms: 2
      },
      house: {
        minSurface: 237.5,
        minGarden: 200
      }
    },
    zone4: {
      codes: [],  // Mặc định cho các mã khác
      apartment: {
        minSurface: 332.5,
        minTerrace: 50,
        minBedrooms: 2
      },
      house: {
        minSurface: 332.5,
        minGarden: 400
      }
    }
  };

  function determinePropertyType(
    propertyType: string, 
    propertyTypesMap: {
      home: string[];
      appartement: string[];
    }
  ): 'house' | 'apartment' {
    // Thêm type assertion hoặc type guard
    const homeTypes = propertyTypesMap.home || [];
    const appartementTypes = propertyTypesMap.appartement || [];
  
    console.log('Input propertyType:', propertyType);
    console.log('Home Types:', homeTypes);
    console.log('Appartement Types:', appartementTypes);
  
    // Chuyển đổi propertyType về dạng không dấu và viết thường để so sánh
    const normalizedPropertyType = propertyType
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  
    // Chuyển đổi các giá trị trong propertyTypesMap về dạng không dấu và viết thường
    const normalizedHomeTypes = homeTypes.map(type => 
      type
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
    );
  
    const normalizedAppartementTypes = appartementTypes.map(type => 
      type
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
    );
  
    console.log('Normalized Home Types:', normalizedHomeTypes);
    console.log('Normalized Appartement Types:', normalizedAppartementTypes);
    console.log('Normalized Property Type:', normalizedPropertyType);
  
    // Kiểm tra xem propertyType có nằm trong danh sách home không
    if (normalizedHomeTypes.includes(normalizedPropertyType)) {
      return 'house';
    }
  
    // Kiểm tra xem propertyType có nằm trong danh sách appartement không
    if (normalizedAppartementTypes.includes(normalizedPropertyType)) {
      return 'apartment';
    }
  
    // Mặc định trả về apartment nếu không xác định được
    console.warn(`Could not determine property type for: ${propertyType}`);
    return 'apartment';
  }
  
  

  function checkSecretImmoEligibility(
    cityCode: number, 
    propertyType: 'apartment' | 'house', 
    formData: {
      surfaceArea: string;
      terrace?: string;
      bedrooms?: string;
      garden?: string;
    }
  ): boolean {
    // Chuyển đổi dữ liệu sang số
    const surfaceArea = parseFloat(formData.surfaceArea);
    const terrace = parseFloat(formData.terrace || '0');
    const bedrooms = parseInt(formData.bedrooms || '0');
    const garden = parseFloat(formData.garden || '0');
  
    // Tìm zone phù hợp
    let matchedZone: ZoneConditions | undefined;
    
    for (const [, zoneData] of Object.entries(zoneConditions)) {
        if (zoneData.codes.includes(cityCode)) {
          matchedZone = zoneData;
          break;
        }
      }
      
      
  
    // Nếu không tìm thấy zone, sử dụng zone4 (other regions)
    if (!matchedZone) {
      matchedZone = zoneConditions.zone4;
    }

    // Object để lưu trạng thái điều kiện
    const conditionStatus = {
      cityCode: cityCode !== 0,
      surfaceArea: false,
      terrace: propertyType === 'house',
      bedrooms: propertyType === 'house',
      garden: propertyType === 'apartment'
    };
  
    // Log thông tin chi tiết để kiểm tra
    console.log('Checking Secret Immo Eligibility:', {
      cityCode,
      propertyType,
      formData,
      matchedZone
    });

    console.log(`Zone: ${matchedZone.codes}`);
  
    // Kiểm tra điều kiện cho từng loại bất động sản
    if (propertyType === 'apartment') {
      // Kiểm tra diện tích
      conditionStatus.surfaceArea = surfaceArea >= matchedZone.apartment.minSurface;
      console.log(`Surface Area: ${surfaceArea} >= ${matchedZone.apartment.minSurface} is ${conditionStatus.surfaceArea}`);

      // Kiểm tra sân hiên
      conditionStatus.terrace = terrace >= matchedZone.apartment.minTerrace;
      console.log(`Terrace: ${terrace} >= ${matchedZone.apartment.minTerrace} is ${conditionStatus.terrace}`);

      // Kiểm tra số phòng ngủ
      conditionStatus.bedrooms = bedrooms >= matchedZone.apartment.minBedrooms;
      console.log(`Bedrooms: ${bedrooms} >= ${matchedZone.apartment.minBedrooms} is ${conditionStatus.bedrooms}`);

      // Log trạng thái chi tiết
      console.log('Apartment Condition Status:', conditionStatus);

      // Kiểm tra tất cả điều kiện
      return Object.values(conditionStatus).every(condition => condition === true);

    } else if (propertyType === 'house') {
      // Kiểm tra diện tích
      conditionStatus.surfaceArea = surfaceArea >= matchedZone.house.minSurface;
      console.log(`Surface Area: ${surfaceArea} >= ${matchedZone.house.minSurface} is ${conditionStatus.surfaceArea}`);

      // Kiểm tra sân vườn
      conditionStatus.garden = garden >= matchedZone.house.minGarden;
      console.log(`Garden: ${garden} >= ${matchedZone.house.minGarden} is ${conditionStatus.garden}`);

      // Log trạng thái chi tiết
      console.log('House Condition Status:', conditionStatus);

      // Kiểm tra tất cả điều kiện
      return Object.values(conditionStatus).every(condition => condition === true);
    }
  
    return false;
  }
  
  const handleNextStep = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const propertyTypeButton = document.querySelector('.SelectTypeButton');
    
    if (!selectedType) {
        if( propertyTypeButton ) {
          propertyTypeButton.classList.add('border-red-500');
          propertyTypeButton.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
       
        return;
    }
    else {
        if( propertyTypeButton ) propertyTypeButton.classList.remove('border-red-500');
    }
  
    const form = (e.target as HTMLElement).closest('form');
    if (!form) {
        return;
    }

    // Chọn các trường required và non-required ở step 1
    const step1RequiredFields = form.querySelectorAll('.step1 [required]');
    const step1NonRequiredFields = form.querySelectorAll('.step1 input:not([required])');
    
    // Kiểm tra tính hợp lệ của các trường required
    const areStep1RequiredFieldsValid = Array.from(step1RequiredFields).every(field => {
        if (field instanceof HTMLInputElement) {
            field.setCustomValidity('');
            return field.validity.valid;
        }
        return true;
    });
  
    // Kiểm tra tính hợp lệ của các trường non-required
    // Kiểm tra tính hợp lệ của các trường non-required 
    const areStep1NonRequiredFieldsValid = Array.from(step1NonRequiredFields).every(field => {
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
            // Reset custom validity
            field.setCustomValidity('');
        
            // Nếu là input number và có giá trị
            if (field.type === 'number' && field.value.trim() !== '') {
                const value = Number(field.value);
                
                // Kiểm tra min
                const minAttr = field.getAttribute('min');
                if (minAttr !== null) {
                    const min = Number(minAttr);
                    if (!isNaN(min) && value < min) {
                        // Sử dụng template string để truyền giá trị
                        field.setCustomValidity(`${t('form.min_error')} ${min}`);
                        return false;
                    }
                }
                
                // Kiểm tra max
                const maxAttr = field.getAttribute('max');
                if (maxAttr !== null) {
                    const max = Number(maxAttr);
                    if (!isNaN(max) && value > max) {
                        // Sử dụng template string để truyền giá trị
                        field.setCustomValidity(`${t('form.max_error')} ${max}`);
                        return false;
                    }
                }
            }
        
            // Kiểm tra tính hợp lệ của trường
            return field.validity.valid;
        }
        
        // Nếu không phải input, coi như hợp lệ
        return true;
    });
    
  
  
    // Kiểm tra điều khoản
    const termsCheckbox = document.querySelector('input[name="terms"]') as HTMLInputElement;
    
    if (!termsCheckbox) {
    console.error('Terms checkbox not found');
    return;
    }
    
    if (!formData.terms) {
      termsCheckbox.setCustomValidity(t('form.terms_error'));
      termsCheckbox.reportValidity();
      return;
    } else {
      termsCheckbox.setCustomValidity('');
    }
  
    // Kiểm tra tất cả các trường
    const areAllFieldsValid = areStep1RequiredFieldsValid && areStep1NonRequiredFieldsValid;
  
    if (areAllFieldsValid) {
      try {
        const propertyTypeForCheck = determinePropertyType(selectedType, propertyTypes);
  
        // Fetch city data to get city code
        const cityResponse = await axios.get(`/api/locations`, {
          params: { q: formData.locality },
        });
        
        // Lấy city code từ response
        const cityCode = cityResponse.data.match.cities[0]?.id;
  
        // Kiểm tra điều kiện SecretImmo
        const isSecretImmo = checkSecretImmoEligibility(
          cityCode, 
          propertyTypeForCheck,
          {
            surfaceArea: formData.surfaceArea,
            terrace: formData.terrace,
            bedrooms: formData.rooms.toString(),
            garden: formData.garden
          }
        );
  
        // Hiển thị section phù hợp
        if (isSecretImmo) {
          document.querySelectorAll('.secretimmo').forEach(el => {
            (el as HTMLElement).style.display = 'block';
          });
          document.querySelectorAll('.nextimmo').forEach(el => {
            (el as HTMLElement).style.display = 'none';
          });
        } else {
          document.querySelectorAll('.secretimmo').forEach(el => {
            (el as HTMLElement).style.display = 'none';
          });
          document.querySelectorAll('.nextimmo').forEach(el => {
            (el as HTMLElement).style.display = 'block';
          });
        }
  
        // Chuyển sang step 2
        setCurrentStep(2);
        setTimeout(() => {
          const visibleStep2Section = document.querySelector('.step2:not([style*="display: none"])');
          
          if (visibleStep2Section) {
            visibleStep2Section.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 100);


      } catch (error) {
        console.log(error);
      }
    } else {
        // Tìm và hiển thị validation cho trường đầu tiên không hợp lệ
        const firstInvalidRequiredField = Array.from(step1RequiredFields).find(field => {
            return (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) && !field.validity.valid;
        });
        
        const firstInvalidNonRequiredField = Array.from(step1NonRequiredFields).find(field => {
            return (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) && !field.validity.valid;
        });
        
        if (firstInvalidRequiredField) {
            (firstInvalidRequiredField as HTMLInputElement).reportValidity(); // Ép kiểu thành HTMLInputElement
        } else if (firstInvalidNonRequiredField) {
            (firstInvalidNonRequiredField as HTMLInputElement).reportValidity(); // Ép kiểu thành HTMLInputElement
        }
    }
  };
  
  
  // Thêm state để quản lý thông tin step 2
  const [step2Data, setStep2Data] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: ''
  });
  
  // Hàm xử lý thay đổi dữ liệu ở step 2
  const handleStep2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Thêm validation cho từng trường
    switch(name) {
      case 'first_name':
      case 'last_name':
        // Chỉ cho phép chữ cái và khoảng trắng
        const nameRegex = /^[A-Za-zÀ-ỹ\s]*$/;
        if (nameRegex.test(value)) {
          setStep2Data(prev => ({
            ...prev,
            [name]: value
          }));
        }
        break;
      
      case 'phone':
        // Chỉ cho phép số và ký tự '+' ở đầu
        const phoneRegex = /^[+]?[0-9]*$/;
        if (phoneRegex.test(value)) {
          setStep2Data(prev => ({
            ...prev,
            [name]: value
          }));
        }
        break;
      
      case 'email':
        // Không giới hạn email
        setStep2Data(prev => ({
          ...prev,
          [name]: value
        }));
        break;
      
      default:
        setStep2Data(prev => ({
          ...prev,
          [name]: value
        }));
    }
  };

  interface Step2Data {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  }
  
  
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
  
    // Kiểu cho validation
    const validations: Record<keyof Step2Data, RegExp> = {
        first_name: /^[A-Za-zÀ-ỹ\s]{2,50}$/,
        last_name: /^[A-Za-zÀ-ỹ\s]{2,50}$/,
        phone: /^[+]?[0-9]{8,15}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      };
  
    let isValid = true;
    const errors: Record<keyof Step2Data, string> = {
        first_name: '',
        last_name: '',
        phone: '',
        email: ''
      };
  
      (Object.keys(validations) as Array<keyof Step2Data>).forEach(field => {
        const value = step2Data[field];
        if (!validations[field].test(value)) {
          isValid = false;
          errors[field] = `Invalid ${field}`;
    
          const fieldElement = document.querySelector(`[name="${field}"]`) as HTMLInputElement;
          if (fieldElement) {
            fieldElement.setCustomValidity(t(`form.${field}_error`)); 
            fieldElement.reportValidity();
          }
        }
      });
  
    if (!isValid) {
        setLoading(false);
        return;
    }
  
    // Kết hợp dữ liệu từ cả 2 form
    const finalFormData = {
        ...formData,
        ...step2Data,
        emailType: document.querySelector('.secretimmo:not([style*="display: none"])') 
                   ? 'secretimmo' 
                   : 'nextimmo'
      };
      
  
    try {
      const response = await fetch('/api/send-property-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalFormData),
      });
  
      if (response.ok) {
        setSubmitMessage({
          type: 'success',
          message: t('form.submit_success')
        });
        resetForm();
      } else {
        setSubmitMessage({
          type: 'error',
          message: t('form.submit_error')
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitMessage({
        type: 'error',
        message: t('form.submit_error')
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
    setStep2Data({
      first_name: '',
      last_name: '',
      phone: '',
      email: ''
    });
    setCurrentStep(1);
    setSelectedType('');
  };

  return (
    <>
      
    <div className="form-wrap relative">
      <div className="container mx-auto pt-32 sm:pt-24 pb-24">
        <form 
          onSubmit={currentStep === 1 ? handleNextStep : handleFinalSubmit} 
          noValidate 
          className="property-form"
        >
        <div className={`form-step step1 border-1 border-gray-100 max-w-[1200px] rounded-[24px] bg-white relative z-10 pt-10 px-5 sm:px-10 mx-auto ${currentStep === 1 ? 'block' : 'hidden'}`}>
            <div className="form-top-head text-center">
              <h2 className="text-3xl text-black inline-flex flex-col sm:flex-row items-center gap-5 justify-center font-bold mb-5">
                <Image src={`static/icons/logo-icon.svg`} alt={'logo'} width={40} height={40} />
                {t('form.title')}
              </h2>
              <div
                className="text-black text-[18px] leading-[24px]"
                dangerouslySetInnerHTML={{
                  __html: t('form.desc'),
                }}
              />
            </div>
            <div className="section-form">
            <div className="step-content mx-auto mt-12 pt-12 pb-15 border-t border-gray-200">
              <h3 className="form-sub-title">{t('form.criteria_title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7.5 mb-12">
                <div className="item relative">
                  <label>{t('form.locality_label')}</label>
                  <input
                    className="capitalize"
                    type="text"
                    required
                    name="locality"
                    value={formData.locality}
                    onChange={handleInputChange}
                    placeholder={t('form.locality_placeholder')}
                  />
                  {cities.length > 0 && (
                    <ul className="cities-list">
                      {cities.map((city) => (
                        <li
                          key={city.id}
                          onClick={() => handleCitySelect(city)}
                          className="city-item"
                        >
                          {city.city_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="item">
        <label>{t('form.type_label')}</label>
        <div className="relative">
          <button
            type="button"
            className="w-full SelectTypeButton p-3 bg-white border-1 border-gray-100 px-3 py-4 text-black leading-5.5 rounded-[4px] flex justify-between items-center cursor-pointer"
            onClick={toggleDropdown}
          >
            {selectedType || t('form.select_type')}
            <span className="ml-2">
            <Image src={`static/icons/down.svg`} alt={'down'} width={24} height={24} />
            </span>
          </button>

          {dropdownVisible && (
            <div className="absolute w-full mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-md z-10 max-h-64 overflow-y-auto">
              {Object.keys(propertyTypes).map((category) => (
                <div key={category} className="border-b border-[#E5E7EB] last:border-b-0">
                    <div
                    className="px-4 py-4 hover:bg-gray-100 cursor-pointer flex justify-between items-center font-medium"
                    onClick={(e) => toggleCategory(category, e)}
                    >
                    <span>{(propertyTypes[category as keyof typeof propertyTypes] || [])[0]}</span> {/* Sử dụng giá trị đầu tiên của mảng */}
                    <span>
                        {expandedCategories[category] ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                        </svg>
                        ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                        )}
                    </span>
                    </div>

                    {expandedCategories[category] && (
                    <div className="bg-gray-50">
                        {propertyTypes[category as keyof typeof propertyTypes].map((type) => {
                        const isSelected = selectedType === type;
                        return (
                            <div 
                            key={type}
                            className={`pl-4 pr-4 py-2 hover:bg-gray-200 cursor-pointer ${isSelected ? 'bg-blue-100' : ''}`}
                            onClick={() => handleTypeSelect(type)}
                            >
                            <div className="flex items-center w-full">
                                <input
                                type="checkbox"
                                className="mr-2 h-4 w-4"
                                checked={isSelected}
                                onChange={(e) => {
                                    e.stopPropagation(); 
                                    handleTypeSelect(type);
                                }}
                                onClick={(e) => e.stopPropagation()} 
                                />
                                <span className="flex-grow">{type}</span>
                            </div>
                            </div>
                        );
                        })}
                    </div>
                    )}
                </div>
                ))}
            </div>
          )}
        </div>
      </div>

                <div className="item">
                  <label>{t('form.surface_label')}</label>
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
                  <label>{t('form.rooms_label')}</label>
                  <select name="rooms" value={formData.rooms} onChange={handleChange}>
                    {Array.from({ length: 15 }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {index + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <h3 className="form-sub-title">{t('form.exterior_title')}</h3>
              <div className="grid rid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7.5  mb-12">
                <div className="item">
                  <label>{t('form.garages_label')}</label>
                  <select name="garages" value={formData.garages} onChange={handleChange}>
                    {Array.from({ length: 15 }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {index + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="item">
                  <label>{t('form.parkings_label')}</label>
                  <select name="parkings" value={formData.parkings} onChange={handleChange}>
                    {Array.from({ length: 15 }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {index + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="item">
                  <label>{t('form.garden_label')}</label>
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
                  <label>{t('form.terrace_label')}</label>
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

              <h3 className="form-sub-title">{t('form.equipment_title')}</h3>
              <div className="form-radios flex flex-row flex-wrap gap-10 justify-center">
              <label>
                <input
                  type="checkbox"
                  name="equipment"
                  value="piscine"
                  checked={formData.equipment.includes('piscine')}
                  onChange={(e) => {
                    const value = 'piscine';
                    setFormData(prev => ({
                      ...prev,
                      equipment: e.target.checked 
                        ? [...(prev.equipment || []), value].filter(Boolean)
                        : (prev.equipment || []).filter(item => item !== value)
                    }));
                  }}
                />
                <span>{t('form.piscine_label')}</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  name="equipment"
                  value="sportsArea"
                  checked={formData.equipment.includes('sportsArea')}
                  onChange={(e) => {
                    const value = 'sportsArea';
                    setFormData(prev => ({
                      ...prev,
                      equipment: e.target.checked 
                        ? [...(prev.equipment || []), value].filter(Boolean)
                        : (prev.equipment || []).filter(item => item !== value)
                    }));
                  }}
                />
                <span>{t('form.sports_area_label')}</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  name="equipment"
                  value="smartHome"
                  checked={formData.equipment.includes('smartHome')}
                  onChange={(e) => {
                    const value = 'smartHome';
                    setFormData(prev => ({
                      ...prev,
                      equipment: e.target.checked 
                        ? [...(prev.equipment || []), value].filter(Boolean)
                        : (prev.equipment || []).filter(item => item !== value)
                    }));
                  }}
                />
                <span>{t('form.smart_home_label')}</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  name="equipment"
                  value="alarm"
                  checked={formData.equipment.includes('alarm')}
                  onChange={(e) => {
                    const value = 'alarm';
                    setFormData(prev => ({
                      ...prev,
                      equipment: e.target.checked 
                        ? [...(prev.equipment || []), value].filter(Boolean)
                        : (prev.equipment || []).filter(item => item !== value)
                    }));
                  }}
                />
                <span>{t('form.alarm_label')}</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  name="equipment"
                  value="spa"
                  checked={formData.equipment.includes('spa')}
                  onChange={(e) => {
                    const value = 'spa';
                    setFormData(prev => ({
                      ...prev,
                      equipment: e.target.checked 
                        ? [...(prev.equipment || []), value].filter(Boolean)
                        : (prev.equipment || []).filter(item => item !== value)
                    }));
                  }}
                />
                <span>{t('form.spa_label')}</span>
              </label>
              </div>

              <div className="text-center mt-12">

                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      required
                      name="terms"
                      checked={formData.terms}
                      onChange={handleChange}
                    />
                    <span>
                    {t.rich('form.terms_label', {
                    privacyLink: (chunks) => (
                      <a 
                        href={t('form.privacyLinkUrl')} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        {chunks}
                      </a>
                    )
                  })}
                  </span>
                  </label>
                </div>

                <button type="button" onClick={(e) => handleNextStep(e as unknown as React.FormEvent<HTMLFormElement>)} className="next-step bg-black text-[16px] font-semibold inline-flex px-10 py-5  mt-5 text-white rounded-[50px] mx-auto cursor-pointer">{t('form.submit_button')}</button>

              </div>
            </div>
            </div>
          </div>

          <div className={`form-step step2 border-1 p-5 md:p-10 border-gray-100 max-w-[1200px] rounded-[24px] bg-white relative z-10 pt-10 mx-auto ${currentStep === 2 ? 'block' : 'hidden'}`}>
            <div className="form-top-head mx-auto text-center secretimmo">
              <h2 className="text-3xl text-black inline-flex items-center gap-5 justify-center font-bold mb-5">
                {t('form.secretimmo_title')}
              </h2>
              <div
                className="text-black"
                dangerouslySetInnerHTML={{
                  __html: t('form.secretimmo_desc'),
                }}
              />
            </div>

            <div className="form-top-head mx-auto text-center nextimmo">
              <h3 className="text-[22px] text-gray-400 inline-flex items-center gap-5 justify-center font-bold mb-5 leading-22">
                {t('form.nextimmo_subtitle')}
              </h3>
              <h2 className="text-3xl text-black inline-flex items-center gap-5 justify-center font-bold mb-5">
                {t('form.nextimmo_title')}
              </h2>
              <div
                className="text-black"
                dangerouslySetInnerHTML={{
                  __html: t('form.nextimmo_desc'),
                }}
              />
            </div>

            <div className="step-content max-w-[1120px] mx-auto mt-12 pt-12 pb-15 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7.5 mb-12">
                <div className="item">
                  <label>{t('form.first_name_label')}</label>
                  <input
                    type="text"
                    required
                    name="first_name"
                    value={step2Data.first_name}
                    onChange={handleStep2Change}
                    placeholder=""
                  />
                </div>

                <div className="item">
                  <label>{t('form.last_name_label')}</label>
                  <input
                    type="text"
                    required
                    name="last_name"
                    value={step2Data.last_name}
                    onChange={handleStep2Change}
                    placeholder=""
                  />
                </div>

                <div className="item">
                  <label>{t('form.phone_label')}</label>
                  <input
                    type="text"
                    required
                    name="phone"
                    value={step2Data.phone}
                    onChange={handleStep2Change}
                    placeholder=""
                  />
                </div>

                <div className="item">
                  <label>{t('form.email_label')}</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={step2Data.email}
                    onChange={handleStep2Change}
                    placeholder=""
                  />
                </div>
              </div>

              <div className="text-center mt-12 secretimmo">
                <button disabled={loading} type="submit" className="form-submit bg-black text-[16px] font-semibold inline-flex px-10 py-5 text-white rounded-[50px] mx-auto cursor-pointer">
                  {t('form.secretimmo_button')}
                </button>
              </div>
              <div className="text-center mt-12 nextimmo">
                <button disabled={loading} type="submit" className="form-submit bg-[#B91C1C] text-[16px] font-semibold inline-flex px-10 py-5 text-white rounded-[50px] mx-auto cursor-pointer">
                  {t('form.nextimmo_button')}
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
