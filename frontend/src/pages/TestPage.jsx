import React from 'react';
import { useTheme } from '../context/ThemeContext';

const TestPage = () => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen p-8 transition-all duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gray-100'
    }`}>
      <div className="max-w-4xl mx-auto">
        <div className={`rounded-lg shadow-lg p-8 transition-all duration-300 ${
          isDark 
            ? 'bg-slate-800/50 border border-slate-700' 
            : 'bg-white'
        }`}>
          <h1 className={`text-4xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            🎉 Frontend Test Page
          </h1>
          <p className={`text-lg mb-6 ${
            isDark ? 'text-slate-300' : 'text-gray-600'
          }`}>
            If you can see this page, React and Tailwind CSS are working correctly!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-lg ${
              isDark 
                ? 'bg-blue-900/20 border border-blue-700/30' 
                : 'bg-blue-50'
            }`}>
              <h2 className={`text-xl font-semibold mb-2 ${
                isDark ? 'text-blue-300' : 'text-blue-900'
              }`}>✅ React Status</h2>
              <p className={`${
                isDark ? 'text-blue-200' : 'text-blue-700'
              }`}>React components are rendering successfully</p>
            </div>
            
            <div className={`p-6 rounded-lg ${
              isDark 
                ? 'bg-green-900/20 border border-green-700/30' 
                : 'bg-green-50'
            }`}>
              <h2 className={`text-xl font-semibold mb-2 ${
                isDark ? 'text-green-300' : 'text-green-900'
              }`}>✅ Tailwind Status</h2>
              <p className={`${
                isDark ? 'text-green-200' : 'text-green-700'
              }`}>CSS styling is working correctly</p>
            </div>
            
            <div className={`p-6 rounded-lg ${
              isDark 
                ? 'bg-purple-900/20 border border-purple-700/30' 
                : 'bg-purple-50'
            }`}>
              <h2 className={`text-xl font-semibold mb-2 ${
                isDark ? 'text-purple-300' : 'text-purple-900'
              }`}>🔧 Build Status</h2>
              <p className={`${
                isDark ? 'text-purple-200' : 'text-purple-700'
              }`}>Vite development server is running</p>
            </div>
            
            <div className={`p-6 rounded-lg ${
              isDark 
                ? 'bg-orange-900/20 border border-orange-700/30' 
                : 'bg-orange-50'
            }`}>
              <h2 className={`text-xl font-semibold mb-2 ${
                isDark ? 'text-orange-300' : 'text-orange-900'
              }`}>🚀 Next Steps</h2>
              <p className={`${
                isDark ? 'text-orange-200' : 'text-orange-700'
              }`}>Ready to navigate to other pages</p>
            </div>
          </div>
          
          <div className={`mt-8 p-4 rounded-lg ${
            isDark 
              ? 'bg-slate-700/50 border border-slate-600' 
              : 'bg-gray-50'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Navigation Test:</h3>
            <div className="space-x-4">
              <button 
                onClick={() => window.location.href = '/login'}
                className={`px-4 py-2 rounded transition-all duration-300 ${
                  isDark 
                    ? 'bg-blue-700 hover:bg-blue-800 text-white' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Go to Login
              </button>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className={`px-4 py-2 rounded transition-all duration-300 ${
                  isDark 
                    ? 'bg-green-700 hover:bg-green-800 text-white' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Go to Dashboard
              </button>
              <button 
                onClick={() => window.location.href = '/register'}
                className={`px-4 py-2 rounded transition-all duration-300 ${
                  isDark 
                    ? 'bg-purple-700 hover:bg-purple-800 text-white' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                Go to Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
