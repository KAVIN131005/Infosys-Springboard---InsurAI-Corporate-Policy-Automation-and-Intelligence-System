import React, { useState, useEffect } from 'react';
import { countries, formatPhoneNumber, validatePhoneNumber, getPhoneNumberExample } from '../../utils/countries';
import { useTheme } from '../../context/ThemeContext';

const PhoneInput = ({ 
  value = '', 
  onChange, 
  error, 
  disabled = false, 
  className = '', 
  name = 'phoneNumber',
  selectedCountry = 'US'
}) => {
  const { isDark } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCountry, setCurrentCountry] = useState(
    countries.find(c => c.code === selectedCountry) || countries[0]
  );

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.phoneCode.includes(searchQuery) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCountrySelect = (country) => {
    setCurrentCountry(country);
    setIsDropdownOpen(false);
    setSearchQuery('');
    
    // Format the current phone number with new country code
    const formattedNumber = formatPhoneNumber(value, country.code);
    onChange({ target: { name, value: formattedNumber } });
  };

  const handlePhoneChange = (e) => {
    let phoneValue = e.target.value;
    
    // Auto-format with country code if user starts typing without it
    if (phoneValue && !phoneValue.startsWith('+')) {
      phoneValue = `${currentCountry.phoneCode} ${phoneValue}`;
    }
    
    onChange({ target: { name, value: phoneValue } });
  };

  const isValid = value ? validatePhoneNumber(value, currentCountry.code) : true;

  return (
    <div className="relative">
      <label htmlFor={name} className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
        Phone Number
      </label>
      
      <div className="relative flex">
        {/* Country Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className={`flex items-center px-3 py-3 border border-r-0 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-500' : isDark ? 'border-slate-600' : 'border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-gray-100'} ${disabled ? '' : 'cursor-pointer'}`}
          >
            <span className="text-lg mr-2">{currentCountry.flag}</span>
            <span className={`text-sm font-medium mr-1 ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
              {currentCountry.phoneCode}
            </span>
            <svg 
              className={`w-4 h-4 transition-transform ${isDark ? 'text-slate-400' : 'text-gray-400'} ${isDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className={`absolute z-50 top-full left-0 mt-1 w-80 border rounded-lg shadow-lg max-h-64 overflow-hidden ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-300'}`}>
              {/* Search */}
              <div className={`p-3 border-b ${isDark ? 'border-slate-600' : 'border-gray-200'}`}>
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400' : 'border-gray-300'}`}
                />
              </div>
              
              {/* Countries List */}
              <div className="max-h-48 overflow-y-auto">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center px-3 py-2 focus:outline-none text-left ${isDark ? 'hover:bg-slate-700 focus:bg-slate-700' : 'hover:bg-blue-50 focus:bg-blue-50'}`}
                  >
                    <span className="text-lg mr-3">{country.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>
                        {country.name}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {country.phoneCode}
                      </div>
                    </div>
                  </button>
                ))}
                
                {filteredCountries.length === 0 && (
                  <div className={`px-3 py-4 text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    No countries found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          id={name}
          name={name}
          value={value}
          onChange={handlePhoneChange}
          disabled={disabled}
          placeholder={getPhoneNumberExample(currentCountry.code)}
          className={`flex-1 px-4 py-3 border rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-500' : isValid ? `${isDark ? 'border-slate-600' : 'border-gray-300'}` : 'border-yellow-400'
          } ${disabled ? `${isDark ? 'bg-slate-700 opacity-50 cursor-not-allowed' : 'bg-gray-50 opacity-50 cursor-not-allowed'}` : `${isDark ? 'bg-slate-800 text-slate-200' : 'bg-white'}`} ${className}`}
        />
      </div>

      {/* Validation Messages */}
      {error && (
        <p className={`mt-1 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>⚠️ {error}</p>
      )}
      
      {value && !isValid && !error && (
        <p className={`mt-1 text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
          📱 Please enter a valid phone number for {currentCountry.name}
        </p>
      )}
      
      {!value && (
        <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          Format: {currentCountry.format}
        </p>
      )}

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default PhoneInput;
