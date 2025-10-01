import { useTheme } from '../../context/ThemeContext';

const Button = ({ children, onClick, className = '', disabled = false, type = 'button' }) => {
  const { isDark } = useTheme();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center ${isDark ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50 text-white px-4 py-2 rounded ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;