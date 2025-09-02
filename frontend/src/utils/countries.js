// Comprehensive list of countries with phone codes and validation patterns
export const countries = [
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    phoneCode: '+1',
    pattern: /^\+1\s?\(\d{3}\)\s?\d{3}-\d{4}$/,
    format: '+1 (###) ###-####',
    example: '+1 (555) 123-4567'
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    phoneCode: '+1',
    pattern: /^\+1\s?\(\d{3}\)\s?\d{3}-\d{4}$/,
    format: '+1 (###) ###-####',
    example: '+1 (416) 123-4567'
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    phoneCode: '+44',
    pattern: /^\+44\s?\d{4}\s?\d{3}\s?\d{3}$/,
    format: '+44 #### ### ###',
    example: '+44 7700 123456'
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    phoneCode: '+61',
    pattern: /^\+61\s?\d{1}\s?\d{4}\s?\d{4}$/,
    format: '+61 # #### ####',
    example: '+61 4 1234 5678'
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    phoneCode: '+49',
    pattern: /^\+49\s?\d{3}\s?\d{3}\s?\d{4}$/,
    format: '+49 ### ### ####',
    example: '+49 151 1234 5678'
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    phoneCode: '+33',
    pattern: /^\+33\s?\d{1}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/,
    format: '+33 # ## ## ## ##',
    example: '+33 6 12 34 56 78'
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    phoneCode: '+91',
    pattern: /^\+91\s?\d{5}\s?\d{5}$/,
    format: '+91 ##### #####',
    example: '+91 98765 43210'
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    phoneCode: '+81',
    pattern: /^\+81\s?\d{2}\s?\d{4}\s?\d{4}$/,
    format: '+81 ## #### ####',
    example: '+81 90 1234 5678'
  },
  {
    code: 'CN',
    name: 'China',
    flag: '🇨🇳',
    phoneCode: '+86',
    pattern: /^\+86\s?\d{3}\s?\d{4}\s?\d{4}$/,
    format: '+86 ### #### ####',
    example: '+86 138 1234 5678'
  },
  {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    phoneCode: '+55',
    pattern: /^\+55\s?\d{2}\s?\d{5}\s?\d{4}$/,
    format: '+55 ## ##### ####',
    example: '+55 11 99999 1234'
  },
  {
    code: 'MX',
    name: 'Mexico',
    flag: '🇲🇽',
    phoneCode: '+52',
    pattern: /^\+52\s?\d{2}\s?\d{4}\s?\d{4}$/,
    format: '+52 ## #### ####',
    example: '+52 55 1234 5678'
  },
  {
    code: 'ES',
    name: 'Spain',
    flag: '🇪🇸',
    phoneCode: '+34',
    pattern: /^\+34\s?\d{3}\s?\d{3}\s?\d{3}$/,
    format: '+34 ### ### ###',
    example: '+34 612 345 678'
  },
  {
    code: 'IT',
    name: 'Italy',
    flag: '🇮🇹',
    phoneCode: '+39',
    pattern: /^\+39\s?\d{3}\s?\d{3}\s?\d{4}$/,
    format: '+39 ### ### ####',
    example: '+39 333 123 4567'
  },
  {
    code: 'NL',
    name: 'Netherlands',
    flag: '🇳🇱',
    phoneCode: '+31',
    pattern: /^\+31\s?\d{1}\s?\d{4}\s?\d{4}$/,
    format: '+31 # #### ####',
    example: '+31 6 1234 5678'
  },
  {
    code: 'SE',
    name: 'Sweden',
    flag: '🇸🇪',
    phoneCode: '+46',
    pattern: /^\+46\s?\d{2}\s?\d{3}\s?\d{4}$/,
    format: '+46 ## ### ####',
    example: '+46 70 123 4567'
  },
  {
    code: 'NO',
    name: 'Norway',
    flag: '🇳🇴',
    phoneCode: '+47',
    pattern: /^\+47\s?\d{3}\s?\d{2}\s?\d{3}$/,
    format: '+47 ### ## ###',
    example: '+47 412 34 567'
  },
  {
    code: 'FI',
    name: 'Finland',
    flag: '🇫🇮',
    phoneCode: '+358',
    pattern: /^\+358\s?\d{2}\s?\d{3}\s?\d{4}$/,
    format: '+358 ## ### ####',
    example: '+358 50 123 4567'
  },
  {
    code: 'DK',
    name: 'Denmark',
    flag: '🇩🇰',
    phoneCode: '+45',
    pattern: /^\+45\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/,
    format: '+45 ## ## ## ##',
    example: '+45 12 34 56 78'
  },
  {
    code: 'CH',
    name: 'Switzerland',
    flag: '🇨🇭',
    phoneCode: '+41',
    pattern: /^\+41\s?\d{2}\s?\d{3}\s?\d{4}$/,
    format: '+41 ## ### ####',
    example: '+41 79 123 4567'
  },
  {
    code: 'BE',
    name: 'Belgium',
    flag: '🇧🇪',
    phoneCode: '+32',
    pattern: /^\+32\s?\d{3}\s?\d{2}\s?\d{2}\s?\d{2}$/,
    format: '+32 ### ## ## ##',
    example: '+32 456 12 34 56'
  },
  {
    code: 'AT',
    name: 'Austria',
    flag: '🇦🇹',
    phoneCode: '+43',
    pattern: /^\+43\s?\d{3}\s?\d{3}\s?\d{4}$/,
    format: '+43 ### ### ####',
    example: '+43 664 123 4567'
  },
  {
    code: 'PL',
    name: 'Poland',
    flag: '🇵🇱',
    phoneCode: '+48',
    pattern: /^\+48\s?\d{3}\s?\d{3}\s?\d{3}$/,
    format: '+48 ### ### ###',
    example: '+48 601 123 456'
  },
  {
    code: 'CZ',
    name: 'Czech Republic',
    flag: '🇨🇿',
    phoneCode: '+420',
    pattern: /^\+420\s?\d{3}\s?\d{3}\s?\d{3}$/,
    format: '+420 ### ### ###',
    example: '+420 601 123 456'
  },
  {
    code: 'HU',
    name: 'Hungary',
    flag: '🇭🇺',
    phoneCode: '+36',
    pattern: /^\+36\s?\d{2}\s?\d{3}\s?\d{4}$/,
    format: '+36 ## ### ####',
    example: '+36 30 123 4567'
  },
  {
    code: 'RO',
    name: 'Romania',
    flag: '🇷🇴',
    phoneCode: '+40',
    pattern: /^\+40\s?\d{3}\s?\d{3}\s?\d{3}$/,
    format: '+40 ### ### ###',
    example: '+40 721 123 456'
  },
  {
    code: 'BG',
    name: 'Bulgaria',
    flag: '🇧🇬',
    phoneCode: '+359',
    pattern: /^\+359\s?\d{2}\s?\d{3}\s?\d{4}$/,
    format: '+359 ## ### ####',
    example: '+359 88 123 4567'
  },
  {
    code: 'GR',
    name: 'Greece',
    flag: '🇬🇷',
    phoneCode: '+30',
    pattern: /^\+30\s?\d{3}\s?\d{3}\s?\d{4}$/,
    format: '+30 ### ### ####',
    example: '+30 694 123 4567'
  },
  {
    code: 'PT',
    name: 'Portugal',
    flag: '🇵🇹',
    phoneCode: '+351',
    pattern: /^\+351\s?\d{3}\s?\d{3}\s?\d{3}$/,
    format: '+351 ### ### ###',
    example: '+351 912 345 678'
  },
  {
    code: 'IE',
    name: 'Ireland',
    flag: '🇮🇪',
    phoneCode: '+353',
    pattern: /^\+353\s?\d{2}\s?\d{3}\s?\d{4}$/,
    format: '+353 ## ### ####',
    example: '+353 87 123 4567'
  },
  {
    code: 'LU',
    name: 'Luxembourg',
    flag: '🇱🇺',
    phoneCode: '+352',
    pattern: /^\+352\s?\d{3}\s?\d{3}\s?\d{3}$/,
    format: '+352 ### ### ###',
    example: '+352 621 123 456'
  },
  {
    code: 'SK',
    name: 'Slovakia',
    flag: '🇸🇰',
    phoneCode: '+421',
    pattern: /^\+421\s?\d{3}\s?\d{3}\s?\d{3}$/,
    format: '+421 ### ### ###',
    example: '+421 901 123 456'
  },
  {
    code: 'SI',
    name: 'Slovenia',
    flag: '🇸🇮',
    phoneCode: '+386',
    pattern: /^\+386\s?\d{2}\s?\d{3}\s?\d{3}$/,
    format: '+386 ## ### ###',
    example: '+386 31 123 456'
  },
  {
    code: 'HR',
    name: 'Croatia',
    flag: '🇭🇷',
    phoneCode: '+385',
    pattern: /^\+385\s?\d{2}\s?\d{3}\s?\d{3,4}$/,
    format: '+385 ## ### ###',
    example: '+385 98 123 4567'
  },
  {
    code: 'RS',
    name: 'Serbia',
    flag: '🇷🇸',
    phoneCode: '+381',
    pattern: /^\+381\s?\d{2}\s?\d{3}\s?\d{3,4}$/,
    format: '+381 ## ### ###',
    example: '+381 64 123 4567'
  },
  {
    code: 'BA',
    name: 'Bosnia and Herzegovina',
    flag: '🇧🇦',
    phoneCode: '+387',
    pattern: /^\+387\s?\d{2}\s?\d{3}\s?\d{3}$/,
    format: '+387 ## ### ###',
    example: '+387 61 123 456'
  },
  {
    code: 'MK',
    name: 'North Macedonia',
    flag: '🇲🇰',
    phoneCode: '+389',
    pattern: /^\+389\s?\d{2}\s?\d{3}\s?\d{3}$/,
    format: '+389 ## ### ###',
    example: '+389 70 123 456'
  },
  {
    code: 'AL',
    name: 'Albania',
    flag: '🇦🇱',
    phoneCode: '+355',
    pattern: /^\+355\s?\d{2}\s?\d{3}\s?\d{4}$/,
    format: '+355 ## ### ####',
    example: '+355 69 123 4567'
  },
  {
    code: 'ME',
    name: 'Montenegro',
    flag: '🇲🇪',
    phoneCode: '+382',
    pattern: /^\+382\s?\d{2}\s?\d{3}\s?\d{3}$/,
    format: '+382 ## ### ###',
    example: '+382 67 123 456'
  },
  {
    code: 'RU',
    name: 'Russia',
    flag: '🇷🇺',
    phoneCode: '+7',
    pattern: /^\+7\s?\d{3}\s?\d{3}\s?\d{4}$/,
    format: '+7 ### ### ####',
    example: '+7 901 123 4567'
  },
  {
    code: 'UA',
    name: 'Ukraine',
    flag: '🇺🇦',
    phoneCode: '+380',
    pattern: /^\+380\s?\d{2}\s?\d{3}\s?\d{4}$/,
    format: '+380 ## ### ####',
    example: '+380 50 123 4567'
  },
  {
    code: 'BY',
    name: 'Belarus',
    flag: '🇧🇾',
    phoneCode: '+375',
    pattern: /^\+375\s?\d{2}\s?\d{3}\s?\d{4}$/,
    format: '+375 ## ### ####',
    example: '+375 29 123 4567'
  },
  {
    code: 'LT',
    name: 'Lithuania',
    flag: '🇱🇹',
    phoneCode: '+370',
    pattern: /^\+370\s?\d{3}\s?\d{5}$/,
    format: '+370 ### #####',
    example: '+370 612 34567'
  },
  {
    code: 'LV',
    name: 'Latvia',
    flag: '🇱🇻',
    phoneCode: '+371',
    pattern: /^\+371\s?\d{3}\s?\d{5}$/,
    format: '+371 ### #####',
    example: '+371 261 23456'
  },
  {
    code: 'EE',
    name: 'Estonia',
    flag: '🇪🇪',
    phoneCode: '+372',
    pattern: /^\+372\s?\d{3}\s?\d{4}$/,
    format: '+372 ### ####',
    example: '+372 512 3456'
  },
  {
    code: 'TR',
    name: 'Turkey',
    flag: '🇹🇷',
    phoneCode: '+90',
    pattern: /^\+90\s?\d{3}\s?\d{3}\s?\d{4}$/,
    format: '+90 ### ### ####',
    example: '+90 532 123 4567'
  },
  {
    code: 'IL',
    name: 'Israel',
    flag: '🇮🇱',
    phoneCode: '+972',
    pattern: /^\+972\s?\d{1}\s?\d{4}\s?\d{4}$/,
    format: '+972 # #### ####',
    example: '+972 5 1234 5678'
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    phoneCode: '+966',
    pattern: /^\+966\s?\d{1}\s?\d{4}\s?\d{4}$/,
    format: '+966 # #### ####',
    example: '+966 5 1234 5678'
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    phoneCode: '+971',
    pattern: /^\+971\s?\d{1}\s?\d{3}\s?\d{4}$/,
    format: '+971 # ### ####',
    example: '+971 5 012 3456'
  },
  {
    code: 'EG',
    name: 'Egypt',
    flag: '🇪🇬',
    phoneCode: '+20',
    pattern: /^\+20\s?\d{3}\s?\d{3}\s?\d{4}$/,
    format: '+20 ### ### ####',
    example: '+20 100 123 4567'
  },
  {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    phoneCode: '+27',
    pattern: /^\+27\s?\d{2}\s?\d{3}\s?\d{4}$/,
    format: '+27 ## ### ####',
    example: '+27 82 123 4567'
  },
  {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    phoneCode: '+234',
    pattern: /^\+234\s?\d{3}\s?\d{3}\s?\d{4}$/,
    format: '+234 ### ### ####',
    example: '+234 803 123 4567'
  },
  {
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    phoneCode: '+254',
    pattern: /^\+254\s?\d{3}\s?\d{6}$/,
    format: '+254 ### ######',
    example: '+254 722 123456'
  },
  {
    code: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    phoneCode: '+233',
    pattern: /^\+233\s?\d{2}\s?\d{3}\s?\d{4}$/,
    format: '+233 ## ### ####',
    example: '+233 24 123 4567'
  },
  {
    code: 'KR',
    name: 'South Korea',
    flag: '🇰🇷',
    phoneCode: '+82',
    pattern: /^\+82\s?\d{2}\s?\d{4}\s?\d{4}$/,
    format: '+82 ## #### ####',
    example: '+82 10 1234 5678'
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    phoneCode: '+65',
    pattern: /^\+65\s?\d{4}\s?\d{4}$/,
    format: '+65 #### ####',
    example: '+65 9123 4567'
  },
  {
    code: 'MY',
    name: 'Malaysia',
    flag: '🇲🇾',
    phoneCode: '+60',
    pattern: /^\+60\s?\d{2}\s?\d{3}\s?\d{4}$/,
    format: '+60 ## ### ####',
    example: '+60 12 345 6789'
  },
  {
    code: 'TH',
    name: 'Thailand',
    flag: '🇹🇭',
    phoneCode: '+66',
    pattern: /^\+66\s?\d{2}\s?\d{3}\s?\d{4}$/,
    format: '+66 ## ### ####',
    example: '+66 81 234 5678'
  },
  {
    code: 'VN',
    name: 'Vietnam',
    flag: '🇻🇳',
    phoneCode: '+84',
    pattern: /^\+84\s?\d{3}\s?\d{3}\s?\d{3}$/,
    format: '+84 ### ### ###',
    example: '+84 901 234 567'
  },
  {
    code: 'PH',
    name: 'Philippines',
    flag: '🇵🇭',
    phoneCode: '+63',
    pattern: /^\+63\s?\d{3}\s?\d{3}\s?\d{4}$/,
    format: '+63 ### ### ####',
    example: '+63 917 123 4567'
  },
  {
    code: 'ID',
    name: 'Indonesia',
    flag: '🇮🇩',
    phoneCode: '+62',
    pattern: /^\+62\s?\d{3}\s?\d{4}\s?\d{3,4}$/,
    format: '+62 ### #### ###',
    example: '+62 812 3456 7890'
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    flag: '🇳🇿',
    phoneCode: '+64',
    pattern: /^\+64\s?\d{2}\s?\d{3}\s?\d{4}$/,
    format: '+64 ## ### ####',
    example: '+64 21 123 4567'
  },
  {
    code: 'AR',
    name: 'Argentina',
    flag: '🇦🇷',
    phoneCode: '+54',
    pattern: /^\+54\s?\d{2}\s?\d{4}\s?\d{4}$/,
    format: '+54 ## #### ####',
    example: '+54 11 1234 5678'
  },
  {
    code: 'CL',
    name: 'Chile',
    flag: '🇨🇱',
    phoneCode: '+56',
    pattern: /^\+56\s?\d{1}\s?\d{4}\s?\d{4}$/,
    format: '+56 # #### ####',
    example: '+56 9 1234 5678'
  },
  {
    code: 'CO',
    name: 'Colombia',
    flag: '🇨🇴',
    phoneCode: '+57',
    pattern: /^\+57\s?\d{3}\s?\d{3}\s?\d{4}$/,
    format: '+57 ### ### ####',
    example: '+57 300 123 4567'
  },
  {
    code: 'PE',
    name: 'Peru',
    flag: '🇵🇪',
    phoneCode: '+51',
    pattern: /^\+51\s?\d{3}\s?\d{3}\s?\d{3}$/,
    format: '+51 ### ### ###',
    example: '+51 987 654 321'
  },
  {
    code: 'VE',
    name: 'Venezuela',
    flag: '🇻🇪',
    phoneCode: '+58',
    pattern: /^\+58\s?\d{3}\s?\d{3}\s?\d{4}$/,
    format: '+58 ### ### ####',
    example: '+58 412 123 4567'
  },
  {
    code: 'UY',
    name: 'Uruguay',
    flag: '🇺🇾',
    phoneCode: '+598',
    pattern: /^\+598\s?\d{2}\s?\d{3}\s?\d{3}$/,
    format: '+598 ## ### ###',
    example: '+598 91 123 456'
  },
  {
    code: 'PY',
    name: 'Paraguay',
    flag: '🇵🇾',
    phoneCode: '+595',
    pattern: /^\+595\s?\d{3}\s?\d{3}\s?\d{3}$/,
    format: '+595 ### ### ###',
    example: '+595 981 123 456'
  },
  {
    code: 'BO',
    name: 'Bolivia',
    flag: '🇧🇴',
    phoneCode: '+591',
    pattern: /^\+591\s?\d{1}\s?\d{3}\s?\d{4}$/,
    format: '+591 # ### ####',
    example: '+591 7 123 4567'
  },
  {
    code: 'EC',
    name: 'Ecuador',
    flag: '🇪🇨',
    phoneCode: '+593',
    pattern: /^\+593\s?\d{1}\s?\d{3}\s?\d{4}$/,
    format: '+593 # ### ####',
    example: '+593 9 123 4567'
  }
];

// Helper functions
export const getCountryByCode = (code) => {
  return countries.find(country => country.code === code);
};

export const getCountryByPhoneCode = (phoneCode) => {
  return countries.find(country => country.phoneCode === phoneCode);
};

export const formatPhoneNumber = (phoneNumber, countryCode) => {
  const country = getCountryByCode(countryCode);
  if (!country) return phoneNumber;
  
  // Basic formatting - remove all non-digits first
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Add country code if not present
  if (!phoneNumber.startsWith(country.phoneCode)) {
    return `${country.phoneCode} ${phoneNumber}`;
  }
  
  return phoneNumber;
};

export const validatePhoneNumber = (phoneNumber, countryCode) => {
  const country = getCountryByCode(countryCode);
  if (!country) return false;
  
  return country.pattern.test(phoneNumber);
};

export const getPhoneNumberExample = (countryCode) => {
  const country = getCountryByCode(countryCode);
  return country?.example || '';
};

export const getPopularCountries = () => {
  return countries.filter(country => 
    ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IN', 'JP', 'CN', 'BR'].includes(country.code)
  );
};

export default countries;
