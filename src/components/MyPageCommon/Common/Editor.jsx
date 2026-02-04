export default function Editor({
  value,
  onChange,
  placeholder = '내용을 입력하세요',
  maxLength,
  editorRef,
}) {
  const handleChange = (e) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) return;
    onChange(newValue);
  };

  return (
    <div>
      <textarea
        className="w-full min-h-[200px] border px-3 py-2 resize-none focus:outline-none "
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        ref={editorRef}
      />
      {maxLength && (
        <div className="text-right text-sm text-gray-500 mt-1">
          {value.length} / {maxLength}
        </div>
      )}
    </div>
  );
}
