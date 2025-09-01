const Input = ({ type = 'text', value, onChange, placeholder = '', className = '', ...rest }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`border p-2 rounded w-full ${className}`}
    {...rest}
  />
);

export default Input;