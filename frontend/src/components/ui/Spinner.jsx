import { useTheme } from '../../context/ThemeContext';

const Spinner = ({ size = 8 }) => {
  const { isDark } = useTheme();

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-spin rounded-full h-${size} w-${size} ${isDark ? 'border-b-2 border-blue-400' : 'border-b-2 border-blue-500'}`}
    />
  );
};

export default Spinner;