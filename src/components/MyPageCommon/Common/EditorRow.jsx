import Editor from './Editor';

export default function EditorRow({
  label,
  required,
  error,
  value,
  onChange,
  maxLength,
  editorRef,
}) {
  return (
    <div className="flex flex-col md:flex-row border-b last:border-b-0">
      <div className="md:w-32 bg-gray-100 px-4 py-4 font-medium flex md:items-start">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </div>

      <div className="flex-1 px-4 py-3">
        <Editor
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          editorRef={editorRef}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    </div>
  );
}
