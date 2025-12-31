import React from 'react';

export default function Pagination({ currentPage, totalPages, onChange }) {
  const groupSize = 5; //페이지 번호 개수
  const currentGroup = Math.floor((currentPage - 1) / groupSize); //현재 페이지가 속한 그룹
  const start = currentGroup * groupSize + 1; //현재 그룹의 시작 페이지 번호
  const end = Math.min(start + groupSize - 1, totalPages); //현재 그룹의 마지막 페이지 번호

  const showPrev = start > 1; //이전번호 버튼 표시
  const showNext = end < totalPages; //다음 번호 버튼 표시

  return (
    <div className="flex justify-center gap-2 mt-4">
      {/* 이전번호 */}
      {showPrev && (
        <button
          onClick={() => onChange(start - groupSize)}
          className="px-3 py-1 border rounded"
        >
          &lt;
        </button>
      )}
      {/* 페이지 번호 */}
      {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(
        (page) => (
          <button
            key={page}
            onClick={() => onChange(page)}
            className={`px-3 py-1 border rounded ${
              page === currentPage
                ? 'bg-green-700 text-white'
                : 'bg-white hover:bg-green-500 hover:text-white'
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* 다음 번호 */}
      {showNext && (
        <button
          onClick={() => onChange(end + 1)}
          className="px-3 py-1 border rounded"
        >
          &gt;
        </button>
      )}
    </div>
  );
}
