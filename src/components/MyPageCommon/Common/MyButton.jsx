export default function MyButton({
  children,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`text-sm border rounded border-gray-300 text-black-600 px-3 py-1.5 transition-colors enabled:hover:bg-green-700 enabled:hover:border-green-700 enabled:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      // className={`text-sm border-2 rounded border-green-600 text-green-600 px-3 py-1 transition-colors hover:bg-green-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}
