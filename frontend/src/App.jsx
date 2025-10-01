import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AppRoutes from './AppRoutes';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Inner App component that can access theme context
const AppContent = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={`App min-h-screen transition-colors duration-300 ${
      isDark ? 'dark bg-slate-900 text-slate-100' : 'bg-white text-gray-900'
    }`}>
      <AuthProvider>
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: 'var(--bg-primary)',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: 'var(--bg-primary)',
              },
            },
          }}
        />
      </AuthProvider>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;