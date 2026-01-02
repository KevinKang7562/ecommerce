export default function CommonTable({ columns, data }) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100">
          {columns.map((col) => (
            <th
              key={col.key}
              className="border px-3 py-2 text-sm text-center bg-green-950 text-white rounded"
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.length === 0 && (
          <tr>
            <td colSpan={columns.length} className="border py-5 text-center">
              데이터가 없습니다.
            </td>
          </tr>
        )}

        {data.map((row, idx) => (
          <tr key={idx}>
            {columns.map((col) => (
              <td key={col.key} className="border px-3 py-2 text-center">
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
