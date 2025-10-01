import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeTestPage = () => {
  const { isDark, toggleTheme, theme } = useTheme();

  return (
    <div className={`min-h-screen p-8 transition-colors duration-300 ${
      isDark ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'
    }`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Theme Test Page</h1>
        
        <div className="mb-8">
          <p className="text-lg mb-4">
            Current theme: <strong>{theme}</strong>
          </p>
          <button
            onClick={toggleTheme}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Toggle to {isDark ? 'Light' : 'Dark'} Mode
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className={`p-6 rounded-lg border shadow-lg ${
            isDark 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h2 className="text-2xl font-semibold mb-4">Sample Card</h2>
            <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              This is a sample card to test the theming. It should change colors 
              when you toggle between light and dark modes.
            </p>
            <button className={`px-4 py-2 rounded ${
              isDark 
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}>
              Sample Button
            </button>
          </div>

          {/* Card 2 */}
          <div className={`p-6 rounded-lg border shadow-lg ${
            isDark 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h2 className="text-2xl font-semibold mb-4">Theme Variables</h2>
            <div className="space-y-2 text-sm">
              <div className={`p-2 rounded ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                isDark: {isDark.toString()}
              </div>
              <div className={`p-2 rounded ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                theme: {theme}
              </div>
              <div className={`p-2 rounded ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                HTML classes: {document.documentElement.className}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">CSS Variables Test</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded border" style={{ 
              backgroundColor: 'var(--bg-primary)', 
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)'
            }}>
              Primary BG
            </div>
            <div className="p-4 rounded border" style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)'
            }}>
              Secondary BG
            </div>
            <div className="p-4 rounded border" style={{ 
              backgroundColor: 'var(--bg-tertiary)', 
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)'
            }}>
              Tertiary BG
            </div>
            <div className="p-4 rounded border" style={{ 
              backgroundColor: 'var(--blue-primary)', 
              color: 'white',
              borderColor: 'var(--border-color)'
            }}>
              Blue Primary
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeTestPage;