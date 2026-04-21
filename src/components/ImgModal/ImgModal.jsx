import { useEffect } from 'react';

export default function ImgModal({
  images, // 이미지 배열 (문자열 배열이거나 {src: '...'} 형태의 객체 배열)
  currentIndex, // 현재 보고 있는 이미지의 인덱스 번호
  onClose, // 닫기 함수
  onChangeIndex, // 이전/다음 버튼을 눌렀을 때 인덱스를 바꿔줄 함수
}) {
  // 방어 코드: 이미지가 없거나 모달이 꺼져있으면 렌더링 안 함
  if (!images || images.length === 0 || currentIndex === null) return null;

  // 배열에 있는 값이 단순 URL 문자열인지, 객체({src: URL})인지 판별해서 꺼냄
  const currentImageUrl =
    typeof images[currentIndex] === 'string'
      ? images[currentIndex]
      : images[currentIndex]?.src;

  // 키보드 방향키 및 ESC 동작 로직
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        onChangeIndex(currentIndex + 1);
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onChangeIndex(currentIndex - 1);
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, onChangeIndex, onClose]);

  return (
    // 배경 클릭 시 닫히도록 onClick={onClose} 추가
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 transition-opacity"
      onClick={onClose}
    >
      {/* 내부 컨텐츠 클릭 시 배경 클릭 이벤트(닫힘) 방지 */}
      <div
        className="relative max-h-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImageUrl}
          alt={`확대된 이미지 ${currentIndex + 1}`}
          className="max-h-[85vh] max-w-full object-contain select-none"
        />

        {/* 닫기 버튼 (우측 상단 밖) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <i className="fa fa-times text-3xl" />
        </button>

        {/* 이전/다음 버튼 */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => onChangeIndex(currentIndex - 1)}
              className="absolute -left-16 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              disabled={currentIndex === 0}
            >
              <i className="fa fa-chevron-left text-4xl" />
            </button>
            <button
              type="button"
              onClick={() => onChangeIndex(currentIndex + 1)}
              className="absolute -right-16 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              disabled={currentIndex === images.length - 1}
            >
              <i className="fa fa-chevron-right text-4xl" />
            </button>
          </>
        )}

        {/* 이미지 카운터 (하단 밖) */}
        {images.length > 1 && (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white font-medium tracking-widest">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
}
