import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MyInquiryContext } from '../../../context/Inquiry/MyInquiry';
import MyButton from '../../../components/MyPageCommon/Common/MyButton';
import Spinner from '../../../components/Spinner/Spinner';
import { useModal } from '../../../context/ModalContext/ModalContext';

export default function MyInquiryDetail() {
  const { showAlert, showConfirm } = useModal();

  const { selectMyInquiryDetail, deleteMyInquiry } =
    useContext(MyInquiryContext);
  const { inquiryNo } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); //로딩표시
  //   const [error, setError] = useState(false); //에러표시
  const [errorMessage, setErrorMessage] = useState(''); //인라인 에러 메세지 표시
  const [inquiryDetail, setInquiryDetail] = useState(null);

  //1:1문의 목록 화면 이동
  const moveMyPersonalInquiry = () => {
    navigate(`/mypage/myPersonalInquiry`);
  };

  //문의 삭제하기
  const handleInquiryDelete = async () => {
    // 1. 사용자에게 한 번 더 확인
    const confirmed = await showConfirm('정말 이 문의글을 삭제하시겠습니까?');
    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      //삭제 API 호출
      await deleteMyInquiry(inquiryNo);

      //성공 알림 및 페이지 이동
      showAlert('문의글이 삭제되었습니다.');
      navigate('/mypage/myPersonalInquiry'); // 삭제 후 목록으로 이동
    } catch (error) {
      console.error('삭제 실패:', error);
      // 에러 처리는 axios interceptor나 context의 errorType에서 처리되겠지만
      // 추가적인 핸들링이 필요하다면 여기서 수행
    } finally {
      setLoading(false);
    }
  };
  const moveMyInquiryForm = () => {
    navigate(`/mypage/inquiryWrite/${inquiryNo}`, {
      state: {
        from: 'myInquiryList',
        mode: 'UPDATE',
      },
    });
  };

  const fetchMyInquiryDetail = async (inquiryNo) => {
    setLoading(true);
    // setError(false);

    try {
      const restData = await selectMyInquiryDetail(inquiryNo);
      console.log(restData);
      setInquiryDetail(restData);
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ??
        '문의 내역 조회 중 오류가 발생했습니다.'; // ← 서버에서 보낸 메시지
      setErrorMessage(serverMessage); //INLINE으로 표시
      setInquiryDetail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyInquiryDetail(inquiryNo);
  }, [inquiryNo]);
  // [수정] UX 개선: 로딩 중일 때 빈 화면 대신 로딩 상태 표시
  if (loading && !inquiryDetail) {
    return <Spinner />;
  }

  // [수정] UX 개선: 데이터가 없고 에러 메시지만 있을 때 (잘못된 접근 등)
  if (!inquiryDetail && errorMessage) {
    return (
      <div className="w-full py-20 text-center">
        <p className="text-red-500 font-bold text-lg mb-6">{errorMessage}</p>
        <MyButton onClick={moveMyPersonalInquiry}>목록으로 이동</MyButton>
      </div>
    );
  }

  // [수정] 데이터가 아직 없을 때(초기 상태) 렌더링 방지
  if (!inquiryDetail) return null;

  return (
    <div className="w-full">
      {/* 기존과 동일한 제목 스타일 */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 border-b pb-5">
        나의 문의 상세
      </h1>

      <div className="mx-auto px-4">
        {/* 상단 정보 영역: 그리드 정렬 개선 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-6 mb-6 text-sm text-gray-600">
          {/* 에러 메시지가 있을 때만 표시하고, 한 줄을 다 차지하도록 설정 */}
          {errorMessage && (
            <div className="col-span-1 md:col-span-2 text-red-600 font-bold text-lg text-center py-2">
              {errorMessage}
            </div>
          )}
          <div className="flex gap-4">
            <span className="font-bold text-gray-900 w-20">제목</span>
            <span>{inquiryDetail?.inquiryTitle}</span>
          </div>
          <div className="flex gap-4">
            <span className="font-bold text-gray-900 w-20">답변상태</span>
            <span
              className={`font-semibold ${inquiryDetail?.answerYn === 'Y' ? 'text-blue-600' : 'text-gray-400'}`}
            >
              {inquiryDetail?.inquiryStatusNm}
            </span>
          </div>
          <div className="flex gap-4">
            <span className="font-bold text-gray-900 w-20">작성자</span>
            <span>{inquiryDetail?.inquiryUserNm}</span>
          </div>
          <div className="flex gap-4">
            <span className="font-bold text-gray-900 w-20">문의유형</span>
            <span>{inquiryDetail?.inquiryCategoryNm}</span>
          </div>
          <div className="flex gap-4">
            <span className="font-bold text-gray-900 w-20">문의일자</span>
            <span>{inquiryDetail?.inquiryDate}</span>
          </div>
          <div className="flex gap-4">
            <span className="font-bold text-gray-900 w-20">글번호</span>
            <span>{inquiryDetail?.inquiryNo}</span>
          </div>
        </div>

        {/* 본문 내용 */}
        <div className="py-6 min-h-[200px] text-gray-800 leading-relaxed whitespace-pre-line">
          {inquiryDetail?.inquiryContent}
        </div>

        {/* 답변 영역: 시각적으로 구분되는 배경 사용 */}
        <div className="mt-10 bg-gray-50 rounded-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4 border-b pb-3 border-gray-200">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                RE
              </span>
              <span className="font-bold text-gray-900">관리자 답변</span>
            </div>
            <span className="text-xs text-gray-400">
              {inquiryDetail?.answerYn === 'Y'
                ? inquiryDetail?.answerDate
                : '-'}
            </span>
          </div>
          <div className="text-sm text-gray-700 leading-relaxed">
            {inquiryDetail?.answerYn === 'Y'
              ? inquiryDetail?.answerContent
              : '답변을 준비 중입니다.'}
          </div>
        </div>

        {/* 하단 버튼: 기존 MyButton 컴포넌트나 기본 스타일 활용 */}
        <div className="flex justify-between mt-10 border-t pt-6">
          <MyButton onClick={moveMyPersonalInquiry}>목록</MyButton>
          <div className="flex gap-2">
            <MyButton onClick={handleInquiryDelete}>삭제</MyButton>

            <MyButton
              onClick={moveMyInquiryForm}
              disabled={inquiryDetail?.answerYn === 'Y'}
            >
              수정
            </MyButton>
          </div>
        </div>
      </div>
    </div>
  );
}
