const Spinner = ({ size = 8 }) => (
  <div
    role="status"
    aria-label="Loading"
    className={`animate-spin rounded-full h-${size} w-${size} border-b-2 border-blue-500`}
  />
);

export default Spinner;