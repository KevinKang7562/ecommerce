import React, { useEffect, useState, useMemo } from 'react';
import DOMPurify from 'dompurify';
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
        const res = await fetch(`${API_BASE_URL}/api/board/updateBoardViewCount.do`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ boardNo }),
        });
        if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
      } catch {
        // 조회수 업데이트 실패는 상세 로드에 영향 안주도록 무시
      }
    };

    const run = async () => {
      if (!boardNo) return;
      await updateViewCount();
      await fetchNoticeDetail();
    };

    run();
  }, [boardNo]);

  // sanitize HTML content to render safely; allow common tags and data/src URIs
  const rawHtml = notice?.boardContent ?? notice?.content ?? notice?.body ?? '';
  const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(rawHtml, {
      USE_PROFILES: { html: true },
      // 허용 URI 패턴: http(s), data, root-relative
      ALLOWED_URI_REGEXP: /^(?:(?:https?|data):|\/)/i,
    });
  }, [rawHtml]);

  if (loading) return <div style={{ padding: 20 }}>로딩 중...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
  if (!notice) return <div style={{ padding: 20 }}>데이터가 없습니다.</div>;

  return (
    <div
      style={{
        padding: 18,
        fontFamily: 'Inter, Arial, sans-serif',
        width: '100%',
        maxWidth: '100%',
        margin: 0,
        minHeight: '100vh',
        boxSizing: 'border-box',
        background: '#f6f8fb',
      }}
    >
      <div
        style={{
          // 컨텐츠 박스: 화면 거의 꽉채움, 좌우 마진 작게
          maxWidth: '1200px',
          margin: '18px auto',
          width: 'calc(100% - 36px)',
        }}
      >
        <header style={{ marginBottom: 18 }}>
          <h1
            style={{
              margin: 0,
              // 반응형으로 크게 보이게
              fontSize: 'clamp(28px, 6vw, 44px)',
              fontWeight: 900,
              color: '#08203a',
              lineHeight: 1.05,
              letterSpacing: '-0.4px',
            }}
          >
            {notice.title ?? '제목 없음'}
          </h1>

          <div
            style={{
              marginTop: 10,
              display: 'flex',
              gap: 14,
              alignItems: 'center',
              color: '#475569',
              fontSize: 15,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ color: '#08203a', fontWeight: 700 }}>{notice.writerNm ?? notice.writer ?? '작성자'}</strong>
            </div>
            <div style={{ color: '#94a3b8' }}>{notice.idate ?? notice.createdAt ?? ''}</div>
            {typeof notice.viewCnt !== 'undefined' && <div style={{ color: '#94a3b8' }}>· 조회 {notice.viewCnt}</div>}
          </div>
        </header>

        <section
          aria-label="공지사항 내용"
          style={{
            background: '#ffffff',
            border: '1px solid rgba(14,40,72,0.06)',
            borderRadius: 14,
            padding: 28,
            boxShadow: '0 18px 40px rgba(11,30,60,0.06)',
            minHeight: '60vh',
            boxSizing: 'border-box',
          }}
        >
          {/* 전역 스타일 for content images / tables */}
          <style>{`
            .board-content img { max-width: 100%; height: auto; display:block; margin:16px 0; border-radius:8px; }
            .board-content iframe { max-width:100%; }
            .board-content p { margin: 0 0 12px 0; line-height:1.9; color:#0f172a; }
            .board-content pre { background:#0f172a10; padding:12px; border-radius:8px; overflow:auto; }
            .board-content table { width:100%; border-collapse:collapse; margin:12px 0; }
            .board-content table th, .board-content table td { border:1px solid #e6eef8; padding:8px; text-align:left; }
          `}</style>

          {/* sanitized HTML 출력, 글자 크기도 키움 */}
          <div
            className="board-content"
            style={{ fontSize: 'clamp(15px, 2.2vw, 18px)', color: '#0f172a', lineHeight: 1.9, wordBreak: 'break-word' }}
            dangerouslySetInnerHTML={{
              __html: sanitizedHtml || '<div style="color:#94a3b8">내용이 없습니다.</div>',
            }}
          />
        </section>

        {/* 아래에 크게 보이는 파란 뒤로가기 버튼 (우측 정렬 유지) */}
        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 20px',
              borderRadius: 12,
              border: 'none',
              color: '#fff',
              background: 'linear-gradient(180deg,#2b8ef6 0%,#1160d8 100%)',
              boxShadow: '0 14px 28px rgba(17,96,216,0.18), inset 0 -1px 0 rgba(255,255,255,0.06)',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: 16,
              transition: 'transform 120ms ease, box-shadow 120ms ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(1px)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <span style={{ fontSize: 18 }}>←</span>
            뒤로가기
          </button>
        </div>
      </div>
    </div>
  );
}