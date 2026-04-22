import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import CommonTable from '../../../components/MyPageCommon/Common/CommonTable';
import { useContext, useEffect, useState } from 'react';
import MyButton from '../../../components/MyPageCommon/Common/MyButton';
import { ReviewContext } from '../../../context/Review/Review';
import { DEFAULT_PRODUCT_IMAGE, IMAGE_BASE_URL } from '../../../constants/api';
import ProductImg from '../../../components/ProductImg/ProductImg';
import ImgModal from '../../../components/ImgModal/ImgModal';
import Spinner from '../../../components/Spinner/Spinner';
import { useModal } from '../../../context/ModalContext/ModalContext';

export default function Review() {
  const { showAlert, showConfirm } = useModal();
  //상품주문번호 파라미터
  const { itemOrderNo } = useParams();

  //api 호출은 context 이용

  const { selectOrderItemReview, saveReview, updateReview, deleteReview } =
    useContext(ReviewContext);

  const navigate = useNavigate();
  const location = useLocation(); //현재 url, state 등 위치 정보 조회 훅(렌더링/조건 판단)
  const reviewYn = location.state?.reviewYn;

  //상태
  const [loading, setLoading] = useState(false); //로딩표시
  const [error, setError] = useState(false); //에러표시
  const [errorMessage, setErrorMessage] = useState(''); //인라인 에러 메세지 표시

  const [orderItemData, setOrderItemData] = useState(null); //주문상세내역

  const [rating, setRating] = useState(0); //별점
  const [reviewContent, setReviewContent] = useState(''); //내용

  const [existingImages, setExistingImages] = useState([]); // 이미 등록된 이미지
  const [images, setImages] = useState([]); // 새로 추가한 파일
  const [previews, setPreviews] = useState([]); // 새 파일 미리보기
  const [deletedImages, setDeletedImages] = useState([]); // 서버에 삭제 요청할 이미지 목록

  // [수정] 별점 호버 효과를 위한 상태 추가
  const [hoverRating, setHoverRating] = useState(0);

  // 주문목록으로 이동
  const goToOrderList = () => {
    if (location.state?.from === 'orderList') {
      navigate(-1); //주문 목록에서 이동한 경우 뒤로가기로 이동
    } else {
      navigate('/mypage/myAllOrders'); //url로 직접 접근, 새로고침 등인 경우 목록화면으로 바로 이동
    }
  };

  //이미지 등록
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // [수정] 파일 타입 검증 추가 (이미지 전용)
    const invalidFiles = files.filter(
      (file) => !file.type.startsWith('image/'),
    );
    if (invalidFiles.length > 0) {
      showAlert('이미지 파일만 등록 가능합니다.');
      return;
    }

    if (files.length + images.length + existingImages.length > 3) {
      showAlert('이미지는 최대 3장까지 등록할 수 있습니다.');
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);

    // [수정] 동일 파일 재선택 가능하도록 input 초기화
    e.target.value = '';
  };

  // [수정] 기존 이미지 삭제
  const handleRemoveExistingImage = (img) => {
    if (window.confirm('기존 이미지를 삭제하시겠습니까?')) {
      // 1. 화면에서 제거 (imgNo 기준)
      setExistingImages((prev) =>
        prev.filter((item) => item.imgNo !== img.imgNo),
      );

      // 2. 삭제 대상 목록에 객체 추가 (No와 URL 둘 다 필요함)
      setDeletedImages((prev) => [...prev, img]);
    }
  };

  //새로 추가한 이미지 삭제
  const handleRemoveImage = (index) => {
    // [수정] URL 객체 메모리 누수 방지
    URL.revokeObjectURL(previews[index]);

    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  //리뷰 등록
  const handleSubmitReview = async () => {
    if (!rating) return showAlert('별점을 선택해주세요.');
    if (reviewContent.trim().length < 10)
      return showAlert('리뷰를 10자 이상 작성해주세요.');

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
      showAlert('리뷰가 등록되었습니다.');
      goToOrderList(); //목록이동
    } catch (error) {
      // alert('리뷰 등록 실패');
    }
  };

  // [수정] 리뷰 수정
  const handleReviewUpdate = async () => {
    const formData = new FormData();
    formData.append('itemOrderNo', orderItemData.itemOrderNo);
    formData.append('prodNo', orderItemData.prodNo);
    formData.append('reviewNo', orderItemData.reviewNo);
    formData.append('rating', rating);
    formData.append('reviewContent', reviewContent);

    // 새로 추가한 파일 이미지
    images.forEach((file) => {
      formData.append('images', file);
    });

    // [핵심 수정] 삭제할 기존 이미지의 No와 URL을 각각 분리해서 전송
    deletedImages.forEach((img) => {
      formData.append('deletedImgNos', img.imgNo); // DB 논리 삭제용 (Integer)
      formData.append('deletedImgUrls', img.imgUrl); // FTP 물리 삭제용 (String)
    });
    console.log('리뷰수정', formData);
    try {
      await updateReview(formData);
      showAlert('리뷰가 수정되었습니다.');
      goToOrderList();
    } catch (error) {
      console.error('수정 실패:', error);
    }
  };

  const handleReviewDelete = async () => {
    const confirmed = await showConfirm(
      '정말 리뷰를 삭제하시겠습니까? \n삭제후에는 복구할 수 없습니다',
    );
    if (!confirmed) {
      return;
    }

    const params = {
      reviewNo: orderItemData.reviewNo,
      itemOrderNo: orderItemData.itemOrderNo,
    };
    try {
      setLoading(true);
      //삭제 API 호출
      await deleteReview(params);

      showAlert('리뷰글이 삭제되었습니다.');
      goToOrderList(); // 삭제 후 목록으로 이동
    } catch (error) {
      console.error('삭제 실패:', error);
    } finally {
      setLoading(false);
    }
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

    // [수정] 번호:URL 형태의 문자열을 객체 배열로 파싱
    console.log('원래 이미지', orderItemData.imgUrls);
    if (orderItemData.imgUrls) {
      const parsedImages = orderItemData.imgUrls.split(',').map((item) => {
        const [imgNo, imgUrl] = item.split(':'); // ':'를 기준으로 번호와 경로 분리
        return {
          imgNo: parseInt(imgNo, 10),
          imgUrl: imgUrl,
        };
      });
      setExistingImages(parsedImages);
      console.log('이미지', existingImages);
    } else {
      setExistingImages([]);
    }
  }, [orderItemData]);

  // [추가] 이미지 확대 팝업 상태
  // const [selectedImage, setSelectedImage] = useState(null); // 선택된 이미지
  const [imageIndex, setImageIndex] = useState(0); // 현재 보는 이미지 인덱스
  const [allImages, setAllImages] = useState([]); // 모든 이미지 배열 (기존 + 새로)
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 On/Off 상태

  // [추가] 모든 이미지 배열 업데이트 (기존 이미지 + 새 이미지)
  useEffect(() => {
    const combined = [
      ...existingImages.map((img) => ({
        type: 'existing',
        imgNo: img.imgNo,
        src: `${IMAGE_BASE_URL}${img.imgUrl}`,
      })),
      ...previews.map((preview) => ({
        type: 'new',
        src: preview,
      })),
    ];
    setAllImages(combined);
  }, [existingImages, previews]);

  // [추가] 이미지 팝업 열기

  const openImageModal = (index) => {
    setImageIndex(index);
    setIsModalOpen(true); // selectedImage 대신 isModalOpen을 true로 바꿈
  };

  // =====================================================================
  //테이블: 주문상품목록 컬럼
  // =====================================================================
  const orderProductColumns = [
    // { key: 'itemOrderNo', header: '상품주문번호' },
    {
      key: 'imgUrl',
      header: '상품이미지',
      render: (v, row) => (
        <Link to={`/product/${row.prodNo}`} className="block">
          <div className="flex justify-center w-full">
            <ProductImg src={v} className="w-28 h-28 rounded-lg" />
          </div>
        </Link>
      ),
    },
    {
      key: 'productInfo',
      header: '상품정보',
      render: (_, row) => (
        <div className="text-start flex flex-col gap-1 min-w-[200px]">
          <div className="text-xs text-gray-400">
            상품주문번호: {row.itemOrderNo}
          </div>
          <Link
            to={`/product/${row.prodNo}`}
            className="font-bold text-gray-800 hover:underline hover:text-green-700 transition-colors"
          >
            {row.prodNm}
          </Link>
          <div className="text-sm text-gray-500">{row.optionInfo}</div>
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
  // [수정] 로딩 및 에러 처리 UX 개선
  if (loading && !orderItemData) {
    return (
      // <div className="w-full py-20 text-center">
      //   <div className="animate-spin inline-block w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mb-4"></div>
      //   <p className="text-gray-500">리뷰 정보를 가져오는 중...</p>
      // </div>
      <Spinner />
    );
  }
  if (error && !orderItemData) {
    return (
      <div className="w-full py-20 text-center text-red-500">
        <p className="mb-4 font-bold">{errorMessage}</p>
        <MyButton onClick={() => navigate(-1)}>뒤로가기</MyButton>
      </div>
    );
  }

  if (!orderItemData) return null;

  return (
    <div className="w-full">
      {/* [추가] 이미지 확대 모달 팝업 */}
      {isModalOpen && (
        <ImgModal
          images={allImages} // 기존+새로고침 이미지 합친 배열
          currentIndex={imageIndex} // 클릭한 번호
          onClose={() => setIsModalOpen(false)} // 닫기
          onChangeIndex={setImageIndex} // 좌우 이동 시 번호 변경
        />
      )}

      <h1 className="text-2xl sm:text-3xl font-bold mb-8 border-b pb-5">
        {reviewYn === 'Y' ? '리뷰보기' : '리뷰쓰기'}
      </h1>

      <div className="flex flex-col lg:flex-row gap-10 ">
        {/* 주문정보 */}

        <div className="w-full lg:w-2/5">
          <div className="sticky top-10">
            <h2 className="text-lg font-bold mb-4">주문 상품 정보</h2>
            <CommonTable columns={orderProductColumns} data={[orderItemData]} />
          </div>
        </div>
        <div className="w-full lg:w-3/5">
          <div className="border rounded-2xl p-8 bg-white shadow-sm">
            {/* 별점 - 호버 애니메이션 추가 */}
            <div className="mb-8">
              <div className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-red-500 rounded-full"></span>
                상품은 어떠셨나요?
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-3xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className={`transition-transform hover:scale-125 ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400'
                          : 'text-gray-200'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className="text-lg font-bold text-gray-400 ml-2">
                  {rating > 0 ? `${rating}점` : '선택해주세요'}
                </span>
              </div>
            </div>

            {/* 리뷰 내용 */}
            <div className="mb-8">
              <div className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-red-500 rounded-full"></span>
                상세 리뷰
              </div>
              <div className="relative">
                <textarea
                  className="w-full h-48 border border-gray-200 rounded-xl p-4 resize-none focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all outline-none text-gray-700"
                  placeholder="다른 구매자들에게 도움이 되도록 솔직한 평을 남겨주세요! (10자 이상)"
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                />
                <div className="absolute bottom-3 right-4 text-xs text-gray-400">
                  {reviewContent.length} / 500
                </div>
              </div>
            </div>

            {/* 이미지 업로드 */}
            {/* 이미지 첨부 */}
            <div className="mb-8">
              <div className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-red-500 rounded-full"></span>
                이미지 첨부
              </div>

              <div className="flex gap-4 items-start">
                {/* 커스텀 업로드 버튼 */}
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <span className="text-2xl text-gray-400">+</span>
                  <span className="text-xs text-gray-400">사진 추가</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {/* 기존 리뷰 이미지 렌더링 */}
                {existingImages.map((img, idx) => (
                  <div
                    key={img.imgNo}
                    className="relative group cursor-pointer"
                    onClick={() => openImageModal(idx)}
                  >
                    <img
                      src={`${IMAGE_BASE_URL}${img.imgUrl}`}
                      className="w-24 h-24 object-cover rounded-xl border hover:opacity-75 transition-opacity"
                    />
                    <div className="absolute inset-0 rounded-xl bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-white text-2xl">🔍</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveExistingImage(img);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow-lg"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* 추가된 이미지 (새로) */}
                {previews.map((src, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative group cursor-pointer"
                    onClick={() =>
                      openImageModal(existingImages.length + index)
                    }
                  >
                    <img
                      src={src}
                      className="w-24 h-24 object-cover rounded-xl border border-blue-200 hover:opacity-75 transition-opacity"
                    />
                    <div className="absolute inset-0 rounded-xl bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-white text-2xl">🔍</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow-lg"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                * 최대 3장까지 등록 가능합니다.
              </p>
            </div>

            {/* 버튼 영역 */}
            <div className="flex justify-center gap-4 mt-12">
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
