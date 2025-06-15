export const detectUserLanguage = (): string => {
  // Get primary language from browser
  const browserLanguage = navigator.language || navigator.languages[0] || 'en';
  
  // Extract language code (remove region code)
  const languageCode = browserLanguage.split('-')[0].toLowerCase();
  
  // Map to OpenRouteService supported languages
  const supportedLanguages = {
    'de': 'de',    // German
    'en': 'en',    // English  
    'fr': 'fr',    // French
    'es': 'es',    // Spanish
    'it': 'it',    // Italian
    'nl': 'nl',    // Dutch
    'pt': 'pt',    // Portuguese
    'pl': 'pl',    // Polish
    'ru': 'ru',    // Russian
    'cs': 'cs',    // Czech
    'hu': 'hu'     // Hungarian
  };
  
  // Return detected language or fallback to English
  return supportedLanguages[languageCode as keyof typeof supportedLanguages] || 'en';
};

export const getLanguageDisplayName = (code: string): string => {
  const languageNames = {
    'de': 'Deutsch',
    'en': 'English',
    'fr': 'Français', 
    'es': 'Español',
    'it': 'Italiano',
    'nl': 'Nederlands',
    'pt': 'Português',
    'pl': 'Polski',
    'ru': 'Русский',
    'cs': 'Čeština',
    'hu': 'Magyar'
  };
  
  return languageNames[code as keyof typeof languageNames] || 'English';
};

// Debug function to show detected language
export const logLanguageDetection = (): void => {
  const detectedLang = detectUserLanguage();
  const displayName = getLanguageDisplayName(detectedLang);
  
  console.log('🌐 Language Detection:', {
    browserLanguage: navigator.language,
    detectedCode: detectedLang,
    displayName: displayName,
    allBrowserLanguages: navigator.languages
  });
};