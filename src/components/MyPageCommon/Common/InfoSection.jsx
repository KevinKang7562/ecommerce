export default function InfoSection({ title, items }) {
  return (
    <section className="mb-10">
      {/* 제목 */}
      <h5 className="text-start font-semibold mb-3">{title}</h5>

      {/* 표영역 */}
      <ul className="border border-gray-300">
        {items.map(({ label, value }, idx) => (
          <li
            key={label}
            className={`flex justify-between px-4 py-2 ${
              idx !== items.length - 1 ? 'border-b border-gray-200' : ''
            }`}
          >
            <span className="">{label}</span>
            <span className="">{value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
