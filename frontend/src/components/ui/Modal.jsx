import { useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const Modal = ({ isOpen, onClose, children }) => {
  const { isDark } = useTheme();
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className={`relative p-6 rounded shadow-lg max-w-xl w-full ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        {children}
        <div className="mt-4 text-right">
          <button onClick={onClose} className={`px-4 py-2 rounded ${isDark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;