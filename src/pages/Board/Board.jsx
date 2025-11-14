import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 공지사항 게시판 (Grid + 그룹 페이징)
 * - 예쁜 CSS Grid 형태로 표시
 * - 한 화면에 페이지 번호 10개씩 그룹으로 표시
 * - 페이지 클릭 시 POST body에 page 포함하여 API 호출
 * - 초기 진입 시 API 응답에서 총 페이지 수(totalPages)를 읽어 사용
 */

export default function Board() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]); // { id, title, author, createdAt, views }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');

  const [pageSize] = useState(10); // 한 페이지 항목 수
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // 서버에서 받은 총 페이지 수

  const pagesPerGroup = 10; // 한 화면에 보여줄 페이지 수 (요구사항)

  const fetchNotices = useCallback(
    async (opts = {}) => {
      const page = opts.page ?? currentPage ?? 1;
      const body = {
        title: opts.title ?? searchTitle,
        author: opts.author ?? searchAuthor,
        page,
        pageSize,
      };

      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/board/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error(`서버 오류: ${res.status}`);

        const data = await res.json();
        // 서버가 totalPages 를 돌려준다고 가정. (혹은 total -> totalPages 계산)
        const tPages =
          typeof data.totalPages === 'number'
            ? data.totalPages
            : typeof data.total === 'number'
            ? Math.max(1, Math.ceil(data.total / pageSize))
            : 1;

        setItems(Array.isArray(data.items) ? data.items : []);
        setTotalPages(tPages);
        setCurrentPage(page);
      } catch (err) {
        setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
        setItems([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [searchTitle, searchAuthor, currentPage, pageSize]
  );

  // 초기 로드: 첫 페이지 불러오기 (서버에서 총 페이지 수를 받음)
  useEffect(() => {
    fetchNotices({ title: '', author: '', page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onRowClick(item) {
    // 상세페이지로 이동 (예: /board/123)
    navigate(`/board/${item.id}`);
  }

  function onSearchSubmit(e) {
    e.preventDefault();
    fetchNotices({ title: searchTitle, author: searchAuthor, page: 1 });
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    } catch {
      return iso;
    }
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

  return (
    <div style={{ padding: 20, fontFamily: 'Inter, Arial, sans-serif' }}>
      <h2 style={{ marginBottom: 12 }}>공지사항</h2>

      <form
        onSubmit={onSearchSubmit}
        style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          제목
          <input
            type="text"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            placeholder="제목으로 검색"
            style={{ padding: 6 }}
          />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          작성자
          <input
            type="text"
            value={searchAuthor}
            onChange={(e) => setSearchAuthor(e.target.value)}
            placeholder="작성자로 검색"
            style={{ padding: 6 }}
          />
        </label>

        <button type="submit" style={{ padding: '6px 12px' }}>
          검색
        </button>
        <button
          type="button"
          onClick={() => {
            setSearchTitle('');
            setSearchAuthor('');
            fetchNotices({ title: '', author: '', page: 1 });
          }}
          style={{ padding: '6px 12px' }}
        >
          초기화
        </button>
      </form>

      {loading && <div style={{ marginBottom: 12 }}>로딩 중...</div>}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '60px 1fr 140px 180px 80px',
          border: '1px solid #e6e6e6',
          borderRadius: 8,
          overflow: 'hidden',
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
            }}
          >
            {h}
          </div>
        ))}

        {/* rows */}
        {items.length === 0 && !loading ? (
          <div style={{ gridColumn: '1 / -1', padding: 16, textAlign: 'center' }}>게시글이 없습니다.</div>
        ) : (
          items.map((it, idx) => (
            <React.Fragment key={it.id ?? idx}>
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
                {it.number ?? it.id ?? (currentPage - 1) * pageSize + idx + 1}
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
                {it.author}
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
                {formatDate(it.createdAt)}
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
                {it.views ?? 0}
              </div>
            </React.Fragment>
          ))
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