export interface Language {
  code: string;
  displayCode: {
    en: string;    // English script
    native: string; // Native script
  };
  name: string;
}

export const languages: Language[] = [
  { 
    code: 'en', 
    displayCode: { en: 'EN', native: 'EN' }, 
    name: 'English' 
  },
  { 
    code: 'hi', 
    displayCode: { en: 'HI', native: 'हि' }, 
    name: 'हिंदी' 
  },
  { 
    code: 'te', 
    displayCode: { en: 'TE', native: 'తె' }, 
    name: 'తెలుగు' 
  },
  { 
    code: 'ta', 
    displayCode: { en: 'TA', native: 'த' }, 
    name: 'தமிழ்' 
  },
  { 
    code: 'mr', 
    displayCode: { en: 'MR', native: 'मरा' }, 
    name: 'मराठी' 
  },
  { 
    code: 'gu', 
    displayCode: { en: 'GU', native: 'ગુ' }, 
    name: 'ગુજરાતી' 
  },
  { 
    code: 'or', 
    displayCode: { en: 'OR', native: 'ଓଡ଼ି' }, 
    name: 'ଓଡ଼ିଆ' 
  },
  { 
    code: 'kn', 
    displayCode: { en: 'KN', native: 'ಕ' }, 
    name: 'ಕನ್ನಡ' 
  },
  { 
    code: 'pa', 
    displayCode: { en: 'PA', native: 'ਪੰ' }, 
    name: 'ਪੰਜਾਬੀ' 
  },
  { 
    code: 'as', 
    displayCode: { en: 'AS', native: 'অ' }, 
    name: 'অসমীয়া' 
  },
  { 
    code: 'ml', 
    displayCode: { en: 'ML', native: 'മ' }, 
    name: 'മലയാളം' 
  },
  { 
    code: 'ur', 
    displayCode: { en: 'UR', native: 'اردو' }, 
    name: 'اردو' 
  },
  { 
    code: 'bn', 
    displayCode: { en: 'BN', native: 'বাং' }, 
    name: 'বাংলা' 
  },
  { 
    code: 'bh', 
    displayCode: { en: 'BH', native: 'भो' }, 
    name: 'भोजपुरी' 
  },
  { 
    code: 'hne', 
    displayCode: { en: 'HNE', native: 'छ' }, 
    name: 'छत्तीसगढ़ी' 
  },
]