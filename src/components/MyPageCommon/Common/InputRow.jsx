export default function InputRow({
  label,
  required,
  error,
  inputRef,
  ...props
}) {
  return (
    <div className="flex flex-col md:flex-row border-b last:border-b-0">
      {/* label */}
      <div className="md:w-32 bg-gray-100 px-4 py-4 font-medium flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </div>

      {/* input */}
      <div className="flex-1 px-4 py-3">
        <input
          ref={inputRef}
          className={`w-full border border-black px-3 py-2 rounded-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500${error ? 'border-red-500' : ''}`}
          {...props}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    </div>
  );
}
