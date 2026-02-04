export default function SelectRow({
  label,
  options,
  value,
  onChange,
  error,
  required,
  selectRef,
}) {
  return (
    <div className="flex flex-col md:flex-row border-b last:border-b-0">
      <div className="md:w-32 bg-gray-100 px-4 py-4 font-medium flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </div>

      <div className="flex-1 px-4 py-3">
        <select
          className={`w-full border px-3 py-2 ${error ? 'border-red-500' : ''}`}
          value={value}
          onChange={onChange}
          ref={selectRef}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    </div>
  );
}
