import { useState, useEffect } from 'react';
import { SupportedLanguage, detectBrowserLanguage, getTranslation } from '@/lib/i18n';

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    // Try to get from localStorage first, then detect from browser
    const stored = localStorage.getItem('campground-language') as SupportedLanguage;
    return stored || detectBrowserLanguage();
  });

  useEffect(() => {
    // Save to localStorage when language changes
    localStorage.setItem('campground-language', currentLanguage);
  }, [currentLanguage]);

  const t = (key: string): string => {
    return getTranslation(currentLanguage, key);
  };

  const changeLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
  };

  return {
    currentLanguage,
    changeLanguage,
    t
  };
};