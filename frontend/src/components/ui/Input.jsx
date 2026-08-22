const Input = ({ label, error, className = "", ...props }) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition ${
          error ? "border-danger-500" : "border-gray-300"
        }`}
        {...props}
      />
      {error && <p className="text-xs text-danger-600 mt-1">{error}</p>}
    </div>
  );
};

export default Input;
