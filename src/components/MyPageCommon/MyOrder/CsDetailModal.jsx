import MyButton from '../Common/MyButton';
import InfoSection from '../Common/InfoSection';
import { useEffect } from 'react';
export default function CsDetailModal({ item, onClose }) {
  if (!item) return null;

  console.log('취소반품 상세 : ', item, onClose);
  const csInfoItems = [
    { label: '상품주문번호', value: item.itemOrderNo },
    { label: '처리유형', value: item.csTypeNm },
    { label: '처리상태', value: item.csStatusNm },
    { label: '요청일', value: item.requestDate },
    { label: '사유', value: item.csReasonNm },
    {
      label: '환불금액',
      value: item.refundAmt ? `${item.refundAmt.toLocaleString()}원` : '-',
    },
    // { label: '환불수단', value: item.refundMethod },
    { label: '처리완료일', value: item.completeDate },
  ];

  //ESC 키 입력 시 팝업창 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown); //팝업 열릴 때만 ESC감지
    return () => document.removeEventListener('keydown', handleKeyDown); //팝업 닫히면 이벤트 제거
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-5"
      onClick={onClose} //배경 클릭 시 닫기
    >
      <div
        className="bg-white w-full max-w-lg rounded-lg p-6"
        onClick={(e) => e.stopPropagation()} //내부 클릭 제한(클릭 시 닫히지 않도록)
      >
        <h2 className="text-xl font-bold mb-4">{item.csTypeNm} 상세내역</h2>

        <InfoSection title="" items={csInfoItems} />

        <div className="flex justify-end mt-6">
          <MyButton onClick={onClose}>닫기</MyButton>
        </div>
      </div>
    </div>
  );
}
