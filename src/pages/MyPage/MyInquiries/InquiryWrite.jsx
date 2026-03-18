import { useLocation, useNavigate, useParams } from 'react-router-dom';
import InquiryForm from '../../../components/MyPageCommon/MyOrder/InquiryForm';
import MyButton from '../../../components/MyPageCommon/Common/MyButton';
import { useRef } from 'react';

//1:1문의하기 작성화면
export default function InquiryWrite() {
  const location = useLocation();
  const { inquiryNo } = useParams(); // URL에서 inquiryNo 가져오기 (수정 모드용)
  const mode = location.state?.mode ?? 'CREATE';

  //useRef: 랜더링과 무관한 값 저장, .current에 값을 넣고 빼도 리렌더링 안 됨, DOM 요소나 함수, 인스턴스 참조용으로 사용
  //useRef로 자식 컴포넌트의 함수 호출
  const inquiryFormRef = useRef(null);
  const navigate = useNavigate();

  //1:1문의 목록 화면 이동
  const moveMyPersonalInquiry = () => {
    navigate(`/mypage/myPersonalInquiry`);
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 border-b pb-5">
        {mode === 'CREATE' ? '1:1 문의 하기' : '1:1 문의 수정하기'}
      </h1>

      <div className="mx-auto px-4">
        {/* mode와 inquiryNo를 자식에게 전달 */}
        <InquiryForm
          ref={inquiryFormRef}
          onSuccess={moveMyPersonalInquiry}
          mode={mode}
          inquiryNo={inquiryNo}
        />

        <div className="flex items-center py-4">
          <div className="flex-1 flex justify-start">
            <MyButton className="text-xl" onClick={moveMyPersonalInquiry}>
              목록
            </MyButton>
          </div>

          <div className="flex-1 flex justify-end gap-2">
            <MyButton className="text-xl" onClick={() => navigate(-1)}>
              취소
            </MyButton>

            <MyButton
              className="text-xl"
              onClick={() => inquiryFormRef.current?.handleSubmitMyInquiry()}
            >
              {mode === 'CREATE' ? '등록' : '수정'}
            </MyButton>
          </div>
        </div>
      </div>
    </div>
  );
}
