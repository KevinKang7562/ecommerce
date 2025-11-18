import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/api';

export default function BoardDetail() {
  const { boardNo } = useParams();
  const navigate = useNavigate();

  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNoticeDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/api/board/selectBoardDetail.do`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardNo }),
      });

      if (!res.ok) throw new Error(`서버 오류: ${res.status}`);

      const data = await res.json();
      const payload = data?.data?.[0] ?? data?.data ?? data;
      setNotice(payload || null);
    } catch (err) {
      setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
      setNotice(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const updateViewCount = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/api/board/updateBoardViewCount.do`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ boardNo }),
        });

        if (!res.ok) throw new Error(`서버 오류: ${res.status}`);

      } catch (err) {
        setError(err.message || '조회수 업데이트중 오류 발생!!');
      } finally {
      }
    };
    
    const run = async () => {
      if (!boardNo) return;

      await updateViewCount();
      await fetchNoticeDetail();
    }

    run();
  }, [boardNo]);

  if (loading) return <div style={{ padding: 20 }}>로딩 중...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
  if (!notice) return <div style={{ padding: 20 }}>데이터가 없습니다.</div>;

  return (
    <div style={{ padding: 28, fontFamily: 'Inter, Arial, sans-serif', maxWidth: 900, margin: '0 auto' }}>
      <header style={{ marginBottom: 18 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.1,
            letterSpacing: '-0.3px',
          }}
        >
          {notice.title ?? '제목 없음'}
        </h1>

        <div style={{ marginTop: 10, display: 'flex', gap: 12, alignItems: 'center', color: '#475569', fontSize: 14 }}>
          <div>
            <strong style={{ color: '#0f172a', fontWeight: 700, marginRight: 6 }}>{notice.writerNm ?? notice.writer ?? '작성자'}</strong>
          </div>
          <div style={{ color: '#94a3b8' }}>{notice.idate ?? notice.createdAt ?? ''}</div>
          {typeof notice.viewCnt !== 'undefined' && (
            <div style={{ color: '#94a3b8' }}>· 조회 {notice.viewCnt}</div>
          )}
        </div>
      </header>

      <section
        aria-label="공지사항 내용"
        style={{
          background: '#ffffff',
          border: '1px solid #e6eef8',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 8px 30px rgba(2,6,23,0.04)',
          minHeight: 280,
        }}
      >
        <div style={{ color: '#0f172a', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: 15 }}>
          {notice.boardContent ?? notice.content ?? notice.body ?? '내용이 없습니다.'}
        </div>
      </section>

      {/* 아래로 이동된 예쁜 파란색 뒤로가기 버튼 */}
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 16px',
            borderRadius: 10,
            border: 'none',
            color: '#fff',
            background: 'linear-gradient(180deg,#2b8ef6 0%,#1160d8 100%)',
            boxShadow: '0 8px 20px rgba(17,96,216,0.18), inset 0 -1px 0 rgba(255,255,255,0.08)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 14,
            transition: 'transform 120ms ease, box-shadow 120ms ease, opacity 120ms',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(1px)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <span style={{ display: 'inline-block', transform: 'translateX(-1px)', fontSize: 16 }}>←</span>
          뒤로가기
        </button>
      </div>
    </div>
  );
}