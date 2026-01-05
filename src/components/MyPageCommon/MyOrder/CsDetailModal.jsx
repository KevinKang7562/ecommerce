import MyButton from '../Common/MyButton';
import InfoSection from '../Common/InfoSection';
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
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">{item.csTypeNm} 상세내역</h2>

        <InfoSection title="" items={csInfoItems} />

        <div className="flex justify-end mt-6">
          <MyButton onClick={onClose}>닫기</MyButton>
        </div>
      </div>
    </div>
  );
}
