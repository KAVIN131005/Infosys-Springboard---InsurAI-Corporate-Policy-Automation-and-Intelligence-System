import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './AppRoutes';
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  return (
    <div className="App">
      <ThemeProvider>
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
      </ThemeProvider>
    </div>
  );
}

export default App;