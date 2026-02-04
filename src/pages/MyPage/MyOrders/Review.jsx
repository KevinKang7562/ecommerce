import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CommonTable from '../../../components/MyPageCommon/Common/CommonTable';
import { useContext, useEffect, useState } from 'react';
import MyButton from '../../../components/MyPageCommon/Common/MyButton';
import { ReviewContext } from '../../../context/Review/Review';
import { IMAGE_BASE_URL } from '../../../constants/api';

export default function Review() {
  //상품주문번호 파라미터
  const { itemOrderNo } = useParams();

  //api 호출은 context 이용

  const { selectOrderItemReview, saveReview, updateReview } =
    useContext(ReviewContext);

  //상태
  const [loading, setLoading] = useState(false); //로딩표시
  const [error, setError] = useState(false); //에러표시
  const [errorMessage, setErrorMessage] = useState(''); //인라인 에러 메세지 표시

  const [orderItemData, setOrderItemData] = useState(null); //주문상세내역

  const navigate = useNavigate();
  const location = useLocation(); //현재 url, state 등 위치 정보 조회 훅(렌더링/조건 판단)
  const reviewYn = location.state?.reviewYn;

  const [existingImages, setExistingImages] = useState([]); // 이미 등록된 이미지
  const [images, setImages] = useState([]); // 새로 추가한 파일
  const [previews, setPreviews] = useState([]); // 새 파일 미리보기
  const [deletedImages, setDeletedImages] = useState([]); // 서버에 삭제 요청할 이미지 목록

  // 주문목록으로 이동
  const goToOrderList = () => {
    if (location.state?.from === 'orderList') {
      navigate(-1); //주문 목록에서 이동한 경우 뒤로가기로 이동
    } else {
      navigate('/mypage/myAllOrders'); //url로 직접 접근, 새로고침 등인 경우 목록화면으로 바로 이동
    }
  };

  const [rating, setRating] = useState(0); //별점
  const [reviewContent, setReviewContent] = useState(''); //내용

  //이미지 등록 핸들러
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length + existingImages.length > 3) {
      alert('이미지는 최대 3장까지 등록할 수 있습니다.');
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  //기존 이미지 삭제
  const handleRemoveExistingImage = (url) => {
    // 화면에서 제거
    setExistingImages((prev) => prev.filter((img) => img !== url));

    // 삭제 대상 목록에 추가
    setDeletedImages((prev) => [...prev, url]);
  };

  //새로 추가한 이미지 삭제
  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  //리뷰 등록
  const handleSubmitReview = async () => {
    if (!rating || !reviewContent) {
      alert('별점과 리뷰 내용을 입력해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('itemOrderNo', orderItemData.itemOrderNo);
    formData.append('prodNo', orderItemData.prodNo);
    formData.append('rating', rating);
    formData.append('reviewContent', reviewContent);

    images.forEach((file) => {
      formData.append('images', file); // 동일 key로 여러 장
    });
    console.log('리뷰등록', formData);
    try {
      await saveReview(formData);
      alert('리뷰가 등록되었습니다.');
      goToOrderList(); //목록이동
    } catch (error) {
      // alert('리뷰 등록 실패');
    }
  };

  //리뷰 수정
  const handleReviewUpdate = async () => {
    const formData = new FormData();
    formData.append('itemOrderNo', orderItemData.itemOrderNo);
    formData.append('prodNo', orderItemData.prodNo);
    formData.append('reviewNo', orderItemData.reviewNo);
    formData.append('rating', rating);
    formData.append('reviewContent', reviewContent);

    // 새로 추가한 이미지
    images.forEach((file) => {
      formData.append('images', file);
    });

    // 삭제할 기존 이미지
    deletedImages.forEach((url) => {
      formData.append('deletedImages', url);
    });

    console.log('리뷰수정', formData);

    try {
      await updateReview(formData);
      alert('리뷰가 수정되었습니다.');
      goToOrderList(); //목록이동
    } catch (error) {}
  };

  const handleReviewDelete = async () => {
    alert('리뷰 삭제 API 아직 미구현');
  };
  // =====================================================================
  //주문상세 데이터 조회
  // =====================================================================
  const fetchOrderItem = async (itemOrderNo) => {
    setLoading(true);
    setError(false);
    setErrorMessage(null);
    console.log('번호', itemOrderNo);
    try {
      const resData = await selectOrderItemReview(itemOrderNo);

      console.log('주문상세 : ', resData);

      setOrderItemData(resData);
    } catch (error) {
      console.error('주문상세 및 리뷰 조회 실패 : ', error);
      setError(true);
      const serverMessage =
        error.response?.data?.message ??
        '주문 내역 및 리뷰 조회 중 오류가 발생했습니다.'; // ← 서버에서 보낸 메시지
      setErrorMessage(serverMessage); //INLINE으로 표시
      setOrderItemData(null);
    } finally {
      setLoading(false); //로딩완료
    }
  };

  // 데이터 조회 (서버 사이드 이펙트)
  useEffect(() => {
    fetchOrderItem(itemOrderNo);
  }, [itemOrderNo]);

  // 조회 결과 → 화면 상태 반영
  useEffect(() => {
    if (!orderItemData) return;

    //기존 등록된 별점/내용 세팅
    setRating(orderItemData.rating ?? 0);
    setReviewContent(orderItemData.reviewContent ?? '');

    //기존 등록된 이미지 세팅
    if (orderItemData.imgUrls) {
      setExistingImages(orderItemData.imgUrls.split(','));
    } else {
      setExistingImages([]);
    }
  }, [orderItemData]);

  // =====================================================================
  //테이블: 주문상품목록 컬럼
  // =====================================================================
  const orderProductColumns = [
    // { key: 'itemOrderNo', header: '상품주문번호' },
    {
      key: 'imgUrl',
      header: '상품이미지',
      render: (v) => <img src={v} className="w-24 h-24 object-cover-16" />,
    },
    {
      key: 'productInfo',
      header: '상품정보',
      render: (_, row) => (
        <div className="text-start flex flex-col gap-1 min-w-[200px]">
          <div className="text-sm text-gray-600">
            상품주문번호 : {row.itemOrderNo}
          </div>
          <div className="font-medium">{row.prodNm}</div>
          <div className="text-sm text-gray-600">
            수량/옵션 : {row.optionInfo}
          </div>
          <div className="text-sm font-semibold">
            {/* 상품별 총금액 ()(구매단가-할인금액+옵션추가금)*수량)*/}
            {row.csAppliedAmt?.toLocaleString()}원
          </div>
        </div>
      ),
    },
  ];

  // =====================================================================
  //조건부 랜더링(데이터 조회 전 orderItemData 구조분해 실행으로 인한 에러발생 방지하기 위해 초기 랜더링 시 구조분해 전에 return으로 함수 조기 종료)
  // =====================================================================
  if (loading) {
    return <div className="py-20 text-center">로딩중...</div>;
  }
  if (error) {
    return <div className="py-20 text-center text-red-500">{errorMessage}</div>;
  }
  if (!orderItemData) {
    return <div className="py-20 text-center">주문 정보 없음</div>;
  }

  return (
    <div className="w-full  ">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 border-b pb-5">
        {reviewYn === 'Y' ? '리뷰보기' : '리뷰쓰기'}
      </h1>

      <div className="flex flex-col lg:flex-row gap-10 ">
        {/* 주문정보 */}

        <div className="w-full lg:w-2/5">
          <CommonTable columns={orderProductColumns} data={[orderItemData]} />
        </div>
        <div className="w-full lg:w-3/5">
          <div className="flex-1 border rounded-lg p-6 bg-white">
            {/* 별점 */}
            <div className="mb-6">
              <div className="font-semibold text-red-600 mb-2">별점</div>
              <div className="flex gap-1 text-2xl cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    className={
                      star <= rating ? 'text-red-500' : 'text-gray-300'
                    }
                  >
                    ★
                  </span>
                ))}
                <span className="ml-2 text-sm text-gray-600">{rating}</span>
              </div>
            </div>

            {/* 리뷰 내용 */}
            <div className="mb-6">
              <div className="font-semibold text-red-600 mb-2">리뷰 내용</div>
              <textarea
                className="w-full h-40 border rounded-md p-3 resize-none focus:outline-none focus:ring-1 focus:ring-red-400"
                placeholder="리뷰를 작성해 주세요!"
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
              />
            </div>

            {/* 이미지 업로드 */}
            <div className="mb-6">
              <div className="font-semibold text-red-600 mb-2">
                이미지 첨부 (최대 3장)
              </div>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="mb-3"
              />

              {/* 이미지 미리보기 영역 */}
              <div className="mb-6">
                {/* 기존 리뷰 이미지 */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <div className="font-semibold text-red-600 mb-2">
                      등록된 이미지
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {existingImages.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={`${IMAGE_BASE_URL}${url}`}
                            className="w-24 h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(url)}
                            className="absolute top-0 right-0 bg-black bg-opacity-60 text-white text-xs px-1 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 새로 추가한 이미지 미리보기 */}
                {previews.length > 0 && (
                  <div>
                    <div className="font-semibold text-red-600 mb-2">
                      추가 이미지
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {previews.map((src, index) => (
                        <div key={index} className="relative">
                          <img
                            src={src}
                            alt={`preview-${index}`}
                            className="w-24 h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-0 right-0 bg-black bg-opacity-60 text-white text-xs px-1 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-10 mt-20">
              {reviewYn === 'Y' ? (
                <>
                  <MyButton onClick={handleReviewUpdate}>리뷰 수정</MyButton>
                  <MyButton onClick={handleReviewDelete}>리뷰 삭제</MyButton>
                </>
              ) : (
                <MyButton onClick={handleSubmitReview}>리뷰 등록</MyButton>
              )}

              <MyButton onClick={goToOrderList}>주문목록</MyButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
