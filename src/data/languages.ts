export interface Language {
  code: string;
  displayCode: {
    en: string;    // English script
    native: string; // Native script
  };
  name: string; // Deprecated
  names: string[];
}

export const languages: Language[] = [
  { 
    code: 'en', 
    displayCode: { en: 'EN', native: 'EN' }, 
    names: ['English', ''] ,
    name: 'English '
    
  },
  { 
    code: 'hi', 
    displayCode: { en: 'HI', native: 'हि' }, 
    names: ['हिंदी', '/ Hindi'] ,
    name: 'हिंदी ' 
  },
  { 
    code: 'te', 
    displayCode: { en: 'TE', native: 'తె' }, 
    names: ['తెలుగు', '/ Telugu'] ,
    name: 'తెలుగు '
  },
  { 
    code: 'ta', 
    displayCode: { en: 'TA', native: 'த' }, 
    names: ['தமிழ்', '/ Tamil'] ,
    name: 'தமிழ் '
  },
  { 
    code: 'mr', 
    displayCode: { en: 'MR', native: 'मरा' }, 
    names: ['मराठी', '/ Marathi'] ,
    name: 'मराठी '
  },
  { 
    code: 'gu', 
    displayCode: { en: 'GU', native: 'ગુ' }, 
    names: ['ગુજરાતી', '/ Gujarati'] ,
    name: 'ગુજરાતી '
  },
  { 
    code: 'or', 
    displayCode: { en: 'OR', native: 'ଓଡ଼ି' }, 
    names: ['ଓଡ଼ିଆ', '/ Odia'] ,
    name: 'ଓଡ଼ିଆ '
  },
  { 
    code: 'kn', 
    displayCode: { en: 'KN', native: 'ಕ' }, 
    names: ['ಕನ್ನಡ', '/ Kannada'] ,
    name: 'ಕನ್ನಡ '
  },
  { 
    code: 'pa', 
    displayCode: { en: 'PA', native: 'ਪੰ' }, 
    names: ['ਪੰਜਾਬੀ', '/ Punjabi'] ,
    name: 'ਪੰਜਾਬੀ '
  },
  { 
    code: 'as', 
    displayCode: { en: 'AS', native: 'অ' }, 
    names: ['অসমীয়া', '/ Assamese'] ,
    name: 'অসমীয়া '
  },
  { 
    code: 'ml', 
    displayCode: { en: 'ML', native: 'മ' }, 
    names: ['മലയാളം', '/ Malayalam'] ,
    name: 'മലയാളം '
  },
  { 
    code: 'ur', 
    displayCode: { en: 'UR', native: 'اردو' }, 
    names: ['اردو', '/ Urdu'] ,
    name: 'اردو '
  },
  { 
    code: 'bn', 
    displayCode: { en: 'BN', native: 'বাং' }, 
    names: ['বাংলা', '/ Bengali'] ,
    name: 'বাংলা '
  },
  { 
    code: 'bho', 
    displayCode: { en: 'BH', native: 'भो' }, 
    names: ['भोजपुरी', '/ Bhojpuri'] ,
    name: 'भोजपुरी '
  },
  { 
    code: 'hne', 
    displayCode: { en: 'HNE', native: 'छ' }, 
    names: ['छत्तीसगढ़ी', '/ Chhattisgarhi'] ,
    name: 'छत्तीसगढ़ी '
  },
]