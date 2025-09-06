import { AuthProvider } from './context/AuthContext';
import AppRoutes from './AppRoutes';
import './App.css';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </div>
  );
}

export default App;