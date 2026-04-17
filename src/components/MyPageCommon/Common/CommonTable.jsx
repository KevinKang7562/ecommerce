import React from 'react';
export default function CommonTable({
  columns,
  data,
  expandedId,
  renderExpansion,
  keyName = 'id',
}) {
  return (
    <table className="w-full border-collapse table-fixed">
      <thead>
        <tr className="bg-gray-100">
          {columns.map((col) => (
            <th
              key={col.key}
              className={`border px-3 py-2 text-sm text-center bg-green-950 text-white ${col.className ?? ''}`}
              style={col.width ? { width: col.width } : undefined}
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
          // React Fragment를 사용하여 한 쌍의 <tr>을 묶어줍니다.
          <React.Fragment key={`${String(row?.[keyName] ?? 'row')}-${idx}`}>
            <tr>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`border px-3 py-2 text-center ${col.className ?? ''}`}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
            {/* 확장 기능: 현재 행의 ID가 expandedId와 일치하면 상세 내용 행을 렌더링 */}
            {expandedId === row[keyName] && renderExpansion && (
              <tr>
                <td colSpan={columns.length} className="border bg-gray-50 p-0">
                  {renderExpansion(row)}
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}
