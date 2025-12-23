import React from 'react';

function Pagination({ currentPage, totalPages, onChange }) {
  const groupSize = 5; //페이지 번호 개수
  const currentGroup = Math.floor((currentPage - 1) / groupSize); //현재 페이지가 속한 그룹
  const start = currentGroup * groupSize + 1; //현재 그룹의 시작 페이지 번호
  const end = Math.min(start + groupSize - 1, totalPages); //현재 그룹의 마지막 페이지 번호

  return (
    <div className="flex justify-center gap-2 mt-4">
      {/* 이전번호 */}
      <button
        disabled={start === 1}
        onClick={() => onChange(start - groupSize)}
        className="px-3 py-1 border rounded disabled:opacity-40"
      >
        &lt;
      </button>

      {/* 페이지 번호 */}
      {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(
        (page) => (
          <button
            key={page}
            onClick={() => onChange(page)}
            className={`px-3 py-1 border rounded ${
              page === currentPage ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* 다음 번호 */}
      <button
        disabled={end === totalPages}
        onClick={() => onChange(end + 1)}
        className="px-3 py-1 border rounded disabled:opacity-40"
      >
        &gt;
      </button>
    </div>
  );
}

export default Pagination;
