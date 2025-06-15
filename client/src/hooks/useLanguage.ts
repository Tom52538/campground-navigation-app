import { useState, useEffect } from 'react';
import { SupportedLanguage, detectBrowserLanguage, getTranslation } from '@/lib/i18n';
import { detectUserLanguage, logLanguageDetection } from '@/lib/languageDetection';

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    // Use enhanced language detection for better smartphone compatibility
    const detectedLanguage = detectUserLanguage() as SupportedLanguage;
    const stored = localStorage.getItem('campground-language') as SupportedLanguage;
    
    // Log detection for debugging
    logLanguageDetection();
    
    // If browser language differs from stored, use browser language (smartphone changed)
    if (stored && stored !== detectedLanguage) {
      console.log(`Language changed from ${stored} to ${detectedLanguage}, updating...`);
      localStorage.setItem('campground-language', detectedLanguage);
      return detectedLanguage;
    }
    
    return detectedLanguage;
  });

  useEffect(() => {
    // Save to localStorage when language changes
    localStorage.setItem('campground-language', currentLanguage);
  }, [currentLanguage]);

  // Force language refresh on component mount to detect smartphone language changes
  useEffect(() => {
    const refreshLanguage = () => {
      const detectedLanguage = detectUserLanguage() as SupportedLanguage;
      if (detectedLanguage !== currentLanguage) {
        console.log(`🌐 Smartphone language detected: ${detectedLanguage}, switching from ${currentLanguage}`);
        setCurrentLanguage(detectedLanguage);
      }
    };

    // Check immediately and on window focus (when returning to app)
    refreshLanguage();
    window.addEventListener('focus', refreshLanguage);
    
    return () => window.removeEventListener('focus', refreshLanguage);
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