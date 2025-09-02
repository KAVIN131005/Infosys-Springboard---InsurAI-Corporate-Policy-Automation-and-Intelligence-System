import React from 'react';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Frontend Test Page
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            If you can see this page, React and Tailwind CSS are working correctly!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">✅ React Status</h2>
              <p className="text-blue-700">React components are rendering successfully</p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-green-900 mb-2">✅ Tailwind Status</h2>
              <p className="text-green-700">CSS styling is working correctly</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-purple-900 mb-2">🔧 Build Status</h2>
              <p className="text-purple-700">Vite development server is running</p>
            </div>
            
            <div className="bg-orange-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-orange-900 mb-2">🚀 Next Steps</h2>
              <p className="text-orange-700">Ready to navigate to other pages</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Navigation Test:</h3>
            <div className="space-x-4">
              <button 
                onClick={() => window.location.href = '/login'}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go to Login
              </button>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Go to Dashboard
              </button>
              <button 
                onClick={() => window.location.href = '/register'}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
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
