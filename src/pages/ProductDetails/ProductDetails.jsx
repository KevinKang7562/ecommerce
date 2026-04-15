import { useContext, useEffect, useState } from 'react';
import Slider from 'react-slick/lib/slider.js';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import api from '../../api/axios';
import { useCommCd } from '../../hooks/useCommCd';
import { cartContext } from '../../context/Cart/CartContextProvider';
import { authContext } from '../../context/Auth/Auth.jsx';
import { DEFAULT_PRODUCT_IMAGE, SHOPPING_PATH } from '../../constants/api';
import StarRating from '../../components/StarRating/StarRating';

export default function ProductDetails() {
  const { addProduct } = useContext(cartContext);
  // const { renderStars } = useContext(productsContext);
  const { userToken } = useContext(authContext);
  const { codes: inquiryCategoryOptions } = useCommCd({
    hCd: 'INQUIRY_CATEGORY',
    refCd: 'IT002',
  });

  const navigate = useNavigate();
  const [ProdDetails, setProdDetails] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [productReviews, setProductReviews] = useState([]);
  const [productQnAs, setProductQnAs] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [qnaLoading, setQnaLoading] = useState(false);
  const [openReviewNo, setOpenReviewNo] = useState(null);
  const [openInquiryNo, setOpenInquiryNo] = useState(null);
  const [showQnaForm, setShowQnaForm] = useState(false);
  const [qnaSubmitting, setQnaSubmitting] = useState(false);
  const [qnaErrorMessage, setQnaErrorMessage] = useState('');
  const [qnaSuccessMessage, setQnaSuccessMessage] = useState('');
  const [qnaForm, setQnaForm] = useState({
    inquiryCategory: '',
    inquiryTitle: '',
    inquiryContent: '',
  });

  const { id } = useParams();

  const prodNo = ProdDetails?.prodNo ? Number(ProdDetails.prodNo) : null;
  const isDbProduct = Boolean(prodNo);
  const hasExtraDetailInfo = Boolean(
    ProdDetails?.detailDesc ||
    ProdDetails?.shortDesc ||
    ProdDetails?.stockQty ||
    ProdDetails?.deliveryType ||
    ProdDetails?.deliveryFee ||
    ProdDetails?.saleState,
  );

  const formatWon = (value) => `${Number(value || 0).toLocaleString()} 원`;

  const imageUrls = Array.isArray(ProdDetails.images)
    ? ProdDetails.images
        .map((item) =>
          typeof item === 'string' ? item : item?.IMG_URL || item?.imgUrl || '',
        )
        .filter(Boolean)
    : [];

  const mainImage = ProdDetails.imgUrl || imageUrls[0] || DEFAULT_PRODUCT_IMAGE;

  // 메인 이미지를 포함한 전체 이미지 리스트를 만들고, Set으로 중복된 이미지를 제거
  // const rawThumbnails = [ProdDetails.imgUrl, ...imageUrls].filter(Boolean);
  // ✨ 수정: DB에 등록된 '진짜' 이미지만 필터링 (기본 이미지는 걸러냄)
  const rawThumbnails = [ProdDetails.imgUrl, ...imageUrls].filter(
    (img) => img && img !== DEFAULT_PRODUCT_IMAGE,
  );
  const thumbnailImages = [...new Set(rawThumbnails)];

  const [selectedImage, setSelectedImage] = useState(mainImage);

  useEffect(() => {
    setSelectedImage(mainImage);
  }, [mainImage]);

  const reviewAvg = Number(ProdDetails.reviewAvg || 0);
  const reviewCount = Number(ProdDetails.reviewCount || 0);

  const getReviewImages = (imgUrls) =>
    String(imgUrls || '')
      .split(',')
      .map((value) => {
        const trimmed = value.trim();
        if (!trimmed) {
          return '';
        }
        return trimmed.includes(':')
          ? trimmed.split(':').slice(1).join(':')
          : trimmed;
      })
      .filter(Boolean);

  const fetchProductExtraData = async (targetProdNo) => {
    if (!targetProdNo) {
      setProductReviews([]);
      setProductQnAs([]);
      setOpenReviewNo(null);
      setOpenInquiryNo(null);
      return;
    }

    setReviewsLoading(true);
    setQnaLoading(true);

    try {
      const [reviewResponse, qnaResponse] = await Promise.all([
        api
          .get(`/api/review/product/${targetProdNo}`, {
            meta: { errorType: 'INLINE' },
          })
          .catch(() => ({ data: { data: [] } })),
        api
          .get(`/api/inquiry/product/${targetProdNo}/qna`, {
            meta: { errorType: 'INLINE' },
          })
          .catch(() => ({ data: { data: [] } })),
      ]);

      const nextReviews = reviewResponse.data?.data ?? [];
      const nextQnAs = qnaResponse.data?.data ?? [];

      setProductReviews(nextReviews);
      setProductQnAs(nextQnAs);
      setOpenReviewNo(nextReviews[0]?.reviewNo ?? null);
      setOpenInquiryNo(nextQnAs[0]?.inquiryNo ?? null);
    } finally {
      setReviewsLoading(false);
      setQnaLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!userToken) {
      setShowLoginModal(true);
      return;
    }

    navigate(`/checkout/${ProdDetails.prodNo || ProdDetails.id}`, {
      state: { directProduct: ProdDetails, quantity },
    });
  };

  const handleAddToCart = async () => {
    if (!userToken) {
      setShowLoginModal(true);
      return;
    }

    try {
      await addProduct(ProdDetails.prodNo || ProdDetails.id, quantity);
    } catch (error) {
      if (error?.response?.status === 401) {
        setShowLoginModal(true);
        return;
      }
      console.error(error);
    }
  };

  const handleQnaInputChange = (e) => {
    const { name, value } = e.target;
    setQnaForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitProductQna = async (e) => {
    e.preventDefault();

    if (!userToken) {
      setShowLoginModal(true);
      return;
    }

    if (!prodNo) {
      setQnaErrorMessage('DB 상품에 대해서만 상품 Q&A 등록이 가능합니다.');
      return;
    }

    if (!qnaForm.inquiryCategory) {
      setQnaErrorMessage('문의 유형을 선택해주세요.');
      return;
    }

    if (!qnaForm.inquiryTitle.trim()) {
      setQnaErrorMessage('문의 제목을 입력해주세요.');
      return;
    }

    if (!qnaForm.inquiryContent.trim()) {
      setQnaErrorMessage('문의 내용을 입력해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('prodNo', String(prodNo));
    formData.append('inquiryType', 'IT002');
    formData.append('inquiryCategory', qnaForm.inquiryCategory);
    formData.append('inquiryTitle', qnaForm.inquiryTitle.trim());
    formData.append('inquiryContent', qnaForm.inquiryContent.trim());

    try {
      setQnaSubmitting(true);
      setQnaErrorMessage('');
      setQnaSuccessMessage('');

      ///api/inquiry/saveMyInquiry.do는 1:1문의 등록이므로 상품QnA등록용 api 생성 필요
      await api.post('/api/inquiry/saveMyInquiry.do', formData, {
        meta: { errorType: 'ALERT' },
      });

      setQnaForm({
        inquiryCategory: '',
        inquiryTitle: '',
        inquiryContent: '',
      });
      setQnaSuccessMessage('상품 Q&A가 등록되었습니다.');
      setShowQnaForm(false);
      await fetchProductExtraData(prodNo);
    } catch (error) {
      setQnaErrorMessage(
        error.response?.data?.message ||
          '상품 Q&A 등록 중 오류가 발생했습니다.',
      );
    } finally {
      setQnaSubmitting(false);
    }
  };

  const thumbnailSettings = {
    dots: false,
    infinite: false, // ✨ 회전문(무한 스크롤) 방지: 마지막 이미지에 도달하면 더 이상 안 넘어감
    slidesToShow: 4, // ✨ 핵심: 이미지가 1개든 2개든 무조건 '4칸 기준'으로 고정해서 당근 이미지 팽창 방지
    slidesToScroll: 1,
    arrows: true,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min3, // 태블릿 화면에서도 3칸 기준 고정
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2, // 모바일 화면에서도 2칸 기준 고정
        },
      },
    ],
  };

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      try {
        const dbResponse = await api.get(`${SHOPPING_PATH}/products/${id}`, {
          meta: { errorType: 'INLINE' },
        });

        if (isMounted) {
          setProdDetails(dbResponse.data?.data ?? dbResponse.data ?? {});
        }
        return;
      } catch (error) {
        // ❌  외부 API로 넘어가지 않고, 여기서 깔끔하게 에러 처리!
        if (isMounted) {
          setProdDetails({});
        }
        console.error('상품 정보를 불러오지 못했습니다:', error);
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!prodNo) {
      setProductReviews([]);
      setProductQnAs([]);
      return;
    }

    fetchProductExtraData(prodNo);
  }, [prodNo]);

  const handleDecreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncreaseQuantity = () => {
    setQuantity((prev) => Math.min(99, prev + 1));
  };

  const handleQuantityInput = (e) => {
    const value = Number(e.target.value);
    if (Number.isNaN(value)) {
      return;
    }
    setQuantity(Math.min(99, Math.max(1, value)));
  };

  return (
    <>
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-80 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              로그인이 필요합니다
            </h3>
            <p className="text-gray-500 dark:text-gray-300 mb-6 text-sm">
              로그인 페이지로 이동하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  navigate('/login');
                }}
                className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium"
              >
                로그인
              </button>
            </div>
          </div>
        </div>
      )}

      <Helmet>
        <title>{ProdDetails.prodNm || '상품 상세'}</title>
      </Helmet>

      {/* 1. 최상단 컨테이너: 
       - 기본(작은 화면): container 클래스로 기존 비율 유지
       - lg(큰 화면): max-w-6xl로 너비를 제한하고 px-10으로 안쪽 여백을 더 넓게 줌 */}
      <div className="container lg:max-w-6xl mx-auto px-4 lg:px-10 dark:bg-gray-800">
        {/* 2. 그리드 레이아웃:
         - 기본(작은 화면): gap-6으로 좁은 간격 유지
         - lg(큰 화면): gap-20으로 좌우 단락 사이를 시원하게 벌림 */}
        <div className="grid gap-6 lg:gap-20 md:grid-cols-12 items-start">
          {/* ================= 좌측: 이미지 영역 (5칸 차지) ================= */}
          <div className="space-y-4 min-w-0 md:col-span-5">
            {/* 메인 이미지 */}
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white">
              <img
                className="w-full aspect-square object-contain"
                src={selectedImage || mainImage}
                alt={ProdDetails.prodNm || '상품 이미지'}
                loading="lazy"
                onError={(e) => {
                  e.target.src = DEFAULT_PRODUCT_IMAGE;
                }}
              />
            </div>

            {/* 썸네일 슬라이더 */}
            {thumbnailImages.length > 0 && (
              <div className="px-1 overflow-hidden max-h-[100px] md:max-h-[150px]">
                <Slider {...thumbnailSettings}>
                  {thumbnailImages.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`p-1 outline-none ${img === selectedImage ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
                    >
                      <img
                        className="w-full aspect-square object-cover rounded-lg border border-gray-200 bg-white"
                        src={img}
                        alt={`Product thumbnail ${index + 1}`}
                      />
                    </button>
                  ))}
                </Slider>
              </div>
            )}
          </div>

          {/* ================= 우측: 상품 정보 영역 (7칸 차지) ================= */}
          <div className="w-full flex flex-col h-full pt-2 md:col-span-7">
            {/* 1. 상품명 (좌측) */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {ProdDetails.prodNm}
            </h2>

            {/* 2. 별점 (우측 정렬) */}
            <div className="flex justify-end items-center gap-2 mt-2">
              <StarRating rating={Math.round(reviewAvg)} />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {reviewAvg.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">({reviewCount}건)</span>
            </div>

            {/* 3. 상품 상세 설명 (좌측 정렬) */}
            <p className="mt-4 text-base text-gray-600 dark:text-gray-400">
              {ProdDetails.shortDesc || ProdDetails.detailDesc}
            </p>

            {/* 4. 가격 (우측 정렬) */}
            <div className="text-right mt-6">
              <span className="text-3xl md:text-4xl font-extrabold text-black-600 dark:text-black-500">
                {formatWon(ProdDetails.price)}
              </span>
            </div>

            <hr className="my-6 border-gray-200 dark:border-gray-700" />

            {/* 5. 배송 방식 및 배송비 (구매 버튼 위쪽 배치, 공통코드 이름 매핑) */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 mb-6 space-y-3 text-sm">
              <div className="flex items-center gap-6">
                <span className="text-gray-500 dark:text-gray-400 w-16">
                  배송 방식
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {ProdDetails.deliveryTypeNm || '일반배송'}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-gray-500 dark:text-gray-400 w-16">
                  배송비
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {ProdDetails.deliveryFee
                    ? formatWon(ProdDetails.deliveryFee)
                    : '무료배송'}
                </span>
              </div>
            </div>

            {/* 6. 수량 선택 및 총 금액 */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  수량
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDecreaseQuantity}
                    className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 hover:bg-gray-50 outline-none"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={quantity}
                    onChange={handleQuantityInput}
                    className="w-12 text-center border-none bg-transparent font-medium focus:ring-0 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleIncreaseQuantity}
                    className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 hover:bg-gray-50 outline-none"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-2 pt-2">
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  총 상품 금액
                </span>
                <span className="text-2xl font-bold text-green-700 dark:text-green-500">
                  {ProdDetails.price
                    ? formatWon(quantity * Number(ProdDetails.price))
                    : '0 원'}
                </span>
              </div>
            </div>

            {/* 7. 구매 및 장바구니 버튼 */}
            <div className="flex gap-2 mt-auto">
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg transition-colors"
              >
                바로 구매
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-4 rounded-xl font-bold text-lg transition-colors"
              >
                장바구니
              </button>
            </div>
          </div>
        </div>

        {/* 상세정보/리뷰/QnA */}
        {isDbProduct && (
          <div className="mt-10 space-y-6 pb-8">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-2xl font-bold text-gray-900">
                  상품상세 정보
                </h3>
              </div>

              {hasExtraDetailInfo ? (
                <>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">
                        상품번호
                      </span>
                      <div className="mt-1">{ProdDetails.prodNo}</div>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">
                        판매상태
                      </span>
                      <div className="mt-1">
                        {ProdDetails.saleStateNm || '-'}
                      </div>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">
                        재고수량
                      </span>
                      <div className="mt-1">{ProdDetails.stockQty || '-'}</div>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">
                        배송비
                      </span>
                      <div className="mt-1">
                        {ProdDetails.deliveryFee
                          ? formatWon(ProdDetails.deliveryFee)
                          : '무료'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-gray-50 p-4">
                    <h4 className="text-base font-semibold text-gray-900">
                      상세 설명
                    </h4>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
                      {ProdDetails.detailDesc || ProdDetails.shortDesc}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  등록된 상세 정보가 없습니다.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-2xl font-bold text-gray-900">상품 리뷰</h3>
                <span className="text-sm font-medium text-gray-500">
                  총 {productReviews.length}건
                </span>
              </div>

              {reviewsLoading ? (
                <p className="text-sm text-gray-500">
                  리뷰를 불러오는 중입니다...
                </p>
              ) : productReviews.length > 0 ? (
                <div className="space-y-3">
                  {productReviews.map((review) => {
                    const reviewImages = getReviewImages(review.imgUrls);
                    const isOpen = openReviewNo === review.reviewNo;

                    return (
                      <div
                        key={review.reviewNo}
                        className="overflow-hidden rounded-xl border border-gray-200"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenReviewNo((prev) =>
                              prev === review.reviewNo ? null : review.reviewNo,
                            )
                          }
                          className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-gray-50"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {review.userNm || '구매자'}
                              </span>
                              <span className="flex text-sm gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <i
                                    key={i}
                                    className={`fa fa-star ${i < Math.round(Number(review.rating || 0)) ? 'text-yellow-400' : 'text-gray-300'}`}
                                  />
                                ))}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              {review.reviewDate || '-'}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-green-700">
                            {isOpen ? '접기' : '상세보기'}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="border-t border-gray-100 bg-gray-50 p-4">
                            <p className="whitespace-pre-line text-sm leading-6 text-gray-700">
                              {review.reviewContent || '리뷰 내용이 없습니다.'}
                            </p>

                            {reviewImages.length > 0 && (
                              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                                {reviewImages.map((imageUrl, index) => (
                                  <img
                                    key={`${review.reviewNo}-${index}`}
                                    src={imageUrl}
                                    alt="리뷰 이미지"
                                    className="h-28 w-full rounded-lg object-cover bg-white"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  해당 상품에 등록된 리뷰가 없습니다.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">상품 Q&A</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    상품 관련 문의와 답변을 확인할 수 있습니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!userToken) {
                      setShowLoginModal(true);
                      return;
                    }
                    setQnaErrorMessage('');
                    setQnaSuccessMessage('');
                    setShowQnaForm((prev) => !prev);
                  }}
                  className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
                >
                  Q&A 등록
                </button>
              </div>

              {showQnaForm && (
                <form
                  onSubmit={handleSubmitProductQna}
                  className="mb-5 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      문의유형
                    </label>
                    <select
                      name="inquiryCategory"
                      value={qnaForm.inquiryCategory}
                      onChange={handleQnaInputChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">선택</option>
                      {inquiryCategoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      제목
                    </label>
                    <input
                      type="text"
                      name="inquiryTitle"
                      value={qnaForm.inquiryTitle}
                      onChange={handleQnaInputChange}
                      placeholder="문의 제목을 입력해주세요"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      내용
                    </label>
                    <textarea
                      name="inquiryContent"
                      value={qnaForm.inquiryContent}
                      onChange={handleQnaInputChange}
                      rows={4}
                      maxLength={500}
                      placeholder="상품에 대해 궁금한 점을 남겨주세요"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="mt-1 text-right text-xs text-gray-400">
                      {qnaForm.inquiryContent.length} / 500
                    </p>
                  </div>

                  {qnaErrorMessage && (
                    <p className="text-sm font-medium text-red-600">
                      {qnaErrorMessage}
                    </p>
                  )}
                  {qnaSuccessMessage && (
                    <p className="text-sm font-medium text-green-600">
                      {qnaSuccessMessage}
                    </p>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQnaForm(false)}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={qnaSubmitting}
                      className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
                    >
                      {qnaSubmitting ? '등록 중...' : '등록하기'}
                    </button>
                  </div>
                </form>
              )}

              {qnaLoading ? (
                <p className="text-sm text-gray-500">
                  상품 Q&A를 불러오는 중입니다...
                </p>
              ) : productQnAs.length > 0 ? (
                <div className="space-y-3">
                  {productQnAs.map((qna) => {
                    const isOpen = openInquiryNo === qna.inquiryNo;
                    const isAnswered = Boolean(qna.answerContent);

                    return (
                      <div
                        key={qna.inquiryNo}
                        className="overflow-hidden rounded-xl border border-gray-200"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenInquiryNo((prev) =>
                              prev === qna.inquiryNo ? null : qna.inquiryNo,
                            )
                          }
                          className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-gray-50"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  isAnswered
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {isAnswered ? '답변완료' : '답변대기'}
                              </span>
                              <span className="font-semibold text-gray-900">
                                {qna.inquiryTitle}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              {qna.inquiryCategoryNm || '상품문의'} ·{' '}
                              {qna.inquiryDate || '-'}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-green-700">
                            {isOpen ? '접기' : '상세보기'}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="space-y-3 border-t border-gray-100 bg-gray-50 p-4">
                            <div>
                              <p className="text-xs font-semibold text-gray-500">
                                문의 내용
                              </p>
                              <p className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-700">
                                {qna.inquiryContent || '문의 내용이 없습니다.'}
                              </p>
                            </div>

                            <div
                              className={`rounded-lg p-4 ${
                                isAnswered
                                  ? 'border border-green-200 bg-green-50'
                                  : 'border border-dashed border-gray-200 bg-white'
                              }`}
                            >
                              <p className="text-xs font-semibold text-gray-500">
                                답변
                              </p>
                              <p className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-700">
                                {qna.answerContent ||
                                  '아직 등록된 답변이 없습니다.'}
                              </p>
                              {qna.answerDate && (
                                <p className="mt-2 text-xs text-gray-500">
                                  답변일 {qna.answerDate}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  등록된 상품 Q&A가 없습니다. 첫 문의를 남겨보세요.
                </p>
              )}
            </section>
          </div>
        )}
      </div>
    </>
  );
}
