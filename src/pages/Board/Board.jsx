import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, SESSION_ALERT } from '../../constants/api';

/**
 * 공지사항 게시판 (Grid + 그룹 페이징)
 * - 고정된 그리드 높이: header + (pageSize rows)
 * - items가 부족하면 빈 행으로 채워 시각적 높이 고정
 * - 한 화면에 페이지 번호 10개씩 그룹으로 표시!
 */

export default function Board() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]); // { id, title, writer, createdAt, views }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTitle, setSearchTitle] = useState('');
  const [searchWriterNm, setSearchWriterNm] = useState('');

  const [pageSize] = useState(10); // 한 페이지 항목 수 (기본 10)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // 서버에서 받은 총 페이지 수

  const pagesPerGroup = 10; // 한 화면에 보여줄 페이지 수 (요구사항)

  // layout constants (높이 고정을 위해)
  const headerHeight = 48; // px (헤더 영역 높이)
  const rowHeight = 56; // px (각 row 높이)

  const fetchNotices = useCallback(
    async (opts = {}) => {
      const page = opts.page ?? currentPage ?? 1;
      const title = opts.title ?? searchTitle ?? '';
      const writer = opts.writer ?? searchWriterNm ?? '';
      const body = {
        pageSize: pageSize,
        currentPage: page,
        searchTitle: title,
        searchWriterNm: writer,
      };

      setLoading(true);
      setError(null);
      try {
        const res = await axios.post(`${API_BASE_URL}/api/board/selectBoard.do`, body, {
          headers: { 'Content-Type': 'application/json' },
        });

        const data = res.data ?? {};

        const tPages =
          typeof data.totalPages === 'number'
            ? data.totalPages
            : typeof data.total === 'number'
            ? Math.max(1, Math.ceil(data.total / pageSize))
            : 1;

        setItems(Array.isArray(data.data) ? data.data : []);
        setTotalPages(tPages);
        setCurrentPage(page);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          '데이터를 불러오는 중 오류가 발생했습니다.';
        setError(msg);
        setItems([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [searchTitle, searchWriterNm, currentPage, pageSize]
  );

  // 초기 로드: 첫 페이지 불러오기 (서버에서 총 페이지 수를 받음)
  useEffect(() => {
    fetchNotices({ title: '', writer: '', page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onRowClick(item) {
    // 상세페이지로 이동 (예: /boarddetail/123)
    navigate('/boarddetail/' + item.boardNo);
  }

  function onSearchSubmit(e) {
    e.preventDefault();
    fetchNotices({ title: searchTitle, writer: searchWriterNm, page: 1 });
  }

  // 페이지 그룹 계산
  const currentGroup = Math.floor((currentPage - 1) / pagesPerGroup);
  const groupStart = currentGroup * pagesPerGroup + 1;
  const groupEnd = Math.min(groupStart + pagesPerGroup - 1, totalPages);
  const prevGroupStart = Math.max(1, groupStart - pagesPerGroup);
  const nextGroupStart = Math.min(totalPages, groupStart + pagesPerGroup);

  function goPage(p) {
    if (p < 1 || p > totalPages || p === currentPage) return;
    fetchNotices({ page: p });
  }

  // 빈 행 채우기 수
  const emptyCount = Math.max(0, pageSize - items.length);

  return (
    <div style={{ padding: 20, fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* 스타일 강화된 타이틀 */}
      <h2
        style={{
          marginBottom: 16,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: '-0.4px',
          color: '#0f172a',
          lineHeight: 1.1,
        }}
      >
        공지사항
      </h2>

      {/* 세련된 서치 바 컨테이너 */}
      <form onSubmit={onSearchSubmit} style={{ marginBottom: 18 }}>
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
            background: '#f8fafc',
            padding: '10px 12px',
            borderRadius: 10,
            boxShadow: '0 2px 8px rgba(15,23,42,0.03)',
            border: '1px solid #e6eef8',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: '#334155' }}>제목</label>
            <input
              type="text"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              placeholder="제목으로 검색"
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #d1dbe8',
                minWidth: 300,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: '#334155' }}>작성자</label>
            <input
              type="text"
              value={searchWriterNm}
              onChange={(e) => setSearchWriterNm(e.target.value)}
              placeholder="작성자로 검색"
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #d1dbe8',
                minWidth: 180,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button
              type="submit"
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: 'none',
                color: '#fff',
                background: 'linear-gradient(180deg,#1976d2,#155db2)',
                boxShadow: '0 8px 20px rgba(25,118,210,0.12)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              검색
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchTitle('');
                setSearchWriterNm('');
                fetchNotices({ title: '', writer: '', page: 1 });
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                background: '#fff',
                color: '#0f172a',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              초기화
            </button>
          </div>
        </div>
      </form>

      {loading && <div style={{ marginBottom: 12 }}>로딩 중...</div>}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

      {/* Grid: 높이 고정 (header + pageSize * rowHeight) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '60px 1fr 140px 180px 80px',
          border: '1px solid #e6e6e6',
          borderRadius: 8,
          overflow: 'hidden',
          // 고정 높이: 헤더 + (페이지당 행수 * 행 높이)
          height: `${headerHeight + pageSize * rowHeight}px`,
          // 각 데이터 행 고정 높이
          gridAutoRows: `${rowHeight}px`,
        }}
      >
        {/* header */}
        {['번호', '제목', '작성자', '작성일', '조회수'].map((h) => (
          <div
            key={h}
            style={{
              padding: 10,
              background: '#fafafa',
              fontWeight: 600,
              borderBottom: '1px solid #f0f0f0',
              // 헤더 높이 고정
              height: `${headerHeight}px`,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {h}
          </div>
        ))}

        {/* rows */}
        {items.length === 0 && !loading ? (
          // 빈 데이터일 때도 pageSize 만큼의 빈행을 렌더하여 높이 유지
          Array.from({ length: pageSize }).map((_, i) => (
            <React.Fragment key={`empty-all-${i}`}>
              <div style={{ padding: 10, borderBottom: '1px solid #fbfbfb', display: 'flex', alignItems: 'center', background: '#fff' }} />
              <div style={{ padding: 10, borderBottom: '1px solid #fbfbfb', display: 'flex', alignItems: 'center' }} />
              <div style={{ padding: 10, borderBottom: '1px solid #fbfbfb', display: 'flex', alignItems: 'center' }} />
              <div style={{ padding: 10, borderBottom: '1px solid #fbfbfb', display: 'flex', alignItems: 'center' }} />
              <div style={{ padding: 10, borderBottom: '1px solid #fbfbfb', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
            </React.Fragment>
          ))
        ) : (
          <>
            {items.map((it, idx) => (
              <React.Fragment key={it.rnum ?? it.id ?? idx}>
                <div
                  onClick={() => onRowClick(it)}
                  style={{
                    padding: 10,
                    borderBottom: '1px solid #fbfbfb',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    background: '#fff',
                  }}
                >
                  {it.rnum ?? it.id ?? (currentPage - 1) * pageSize + idx + 1}
                </div>

                <div
                  onClick={() => onRowClick(it)}
                  style={{
                    padding: 10,
                    borderBottom: '1px solid #fbfbfb',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{it.title}</div>
                </div>

                <div
                  onClick={() => onRowClick(it)}
                  style={{
                    padding: 10,
                    borderBottom: '1px solid #fbfbfb',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {it.writerNm}
                </div>

                <div
                  onClick={() => onRowClick(it)}
                  style={{
                    padding: 10,
                    borderBottom: '1px solid #fbfbfb',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {it.idate}
                </div>

                <div
                  onClick={() => onRowClick(it)}
                  style={{
                    padding: 10,
                    borderBottom: '1px solid #fbfbfb',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {it.viewCnt ?? 0}
                </div>
              </React.Fragment>
            ))}

            {/* 부족한 행을 빈 칸으로 채움 */}
            {Array.from({ length: emptyCount }).map((_, i) => (
              <React.Fragment key={`empty-${i}`}>
                <div style={{ padding: 10, borderBottom: '1px solid #fbfbfb', display: 'flex', alignItems: 'center', background: '#fff' }} />
                <div style={{ padding: 10, borderBottom: '1px solid #fbfbfb', display: 'flex', alignItems: 'center' }} />
                <div style={{ padding: 10, borderBottom: '1px solid #fbfbfb', display: 'flex', alignItems: 'center' }} />
                <div style={{ padding: 10, borderBottom: '1px solid #fbfbfb', display: 'flex', alignItems: 'center' }} />
                <div style={{ padding: 10, borderBottom: '1px solid #fbfbfb', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
              </React.Fragment>
            ))}
          </>
        )}
      </div>

      {/* Pagination (그룹 페이징: 한 화면에 10개 페이지) */}
      <div style={{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => goPage(1)} disabled={currentPage === 1} style={{ padding: '6px 10px' }}>
          처음
        </button>

        <button onClick={() => goPage(prevGroupStart)} disabled={groupStart === 1} style={{ padding: '6px 10px' }}>
          &lt;&lt;
        </button>

        <button onClick={() => goPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} style={{ padding: '6px 10px' }}>
          &lt;
        </button>

        {Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => {
          const p = groupStart + i;
          return (
            <button
              key={p}
              onClick={() => goPage(p)}
              aria-current={p === currentPage ? 'page' : undefined}
              style={{
                padding: '6px 10px',
                background: p === currentPage ? '#1976d2' : undefined,
                color: p === currentPage ? '#fff' : undefined,
                borderRadius: 4,
                border: '1px solid #e0e0e0',
                cursor: p === currentPage ? 'default' : 'pointer',
              }}
            >
              {p}
            </button>
          );
        })}

        <button onClick={() => goPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} style={{ padding: '6px 10px' }}>
          &gt;
        </button>

        <button onClick={() => goPage(nextGroupStart)} disabled={groupEnd === totalPages} style={{ padding: '6px 10px' }}>
          &gt;&gt;
        </button>

        <button onClick={() => goPage(totalPages)} disabled={currentPage === totalPages} style={{ padding: '6px 10px' }}>
          끝
        </button>

        <div style={{ marginLeft: 12, color: '#666' }}>
          {totalPages} 페이지 중 {currentPage} 페이지
        </div>
      </div>
    </div>
  );
}