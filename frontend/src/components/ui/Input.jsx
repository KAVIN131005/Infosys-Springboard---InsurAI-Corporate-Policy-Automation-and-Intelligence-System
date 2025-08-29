const Input = ({ type, value, onChange, className = '' }) => (
  <input type={type} value={value} onChange={onChange} className={`border p-2 rounded ${className}`} />
);

export default Input;