import { useTheme } from '../../context/ThemeContext';

const Input = ({ type = 'text', value, onChange, placeholder = '', className = '', ...rest }) => {
  const { isDark } = useTheme();

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`border p-2 rounded w-full ${isDark ? 'border-slate-600 bg-slate-800 text-slate-200' : 'border-gray-300 bg-white'} ${className}`}
      {...rest}
    />
  );
};

export default Input;