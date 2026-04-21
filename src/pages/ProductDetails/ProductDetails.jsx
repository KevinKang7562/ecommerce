import { useContext, useEffect, useState } from 'react';
import Slider from 'react-slick/lib/slider.js';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import api from '../../api/axios';
import { useCommCd } from '../../hooks/useCommCd';
import { cartContext } from '../../context/Cart/CartContextProvider';
import { authContext } from '../../context/Auth/Auth.jsx';
import {
  DEFAULT_PRODUCT_IMAGE,
  IMAGE_BASE_URL,
  SHOPPING_PATH,
  MY_INQUIRY_PATH,
  MY_REVIEW_PATH,
} from '../../constants/api';
import StarRating from '../../components/StarRating/StarRating';
import ProductImg from '../../components/ProductImg/ProductImg.jsx'; // 💡 공통 이미지 컴포넌트 import
import ImgModal from '../../components/ImgModal/ImgModal.jsx';

export default function ProductDetails() {
  const { addProduct } = useContext(cartContext);
  const { userToken } = useContext(authContext);
  const { codes: inquiryCategoryOptions } = useCommCd({
    hCd: 'INQUIRY_CATEGORY',
    refCd: 'IT001',
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
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const [totalReviewPages, setTotalReviewPages] = useState(1);
  const [totalReviewCount, setTotalReviewCount] = useState(0);
  const [currentQnaPage, setCurrentQnaPage] = useState(1);
  const [totalQnaPages, setTotalQnaPages] = useState(1);
  const [totalQnACount, setTotalQnACount] = useState(0);

  // 이미지 확대 팝업 상태
  const [isModalOpen, setIsModalOpen] = useState(false); //리뷰 이미지 모달 상태
  const [imageIndex, setImageIndex] = useState(0); //리뷰 이미지 모달에서 현재 보고 있는 이미지 인덱스
  // 💡 [추가] 모달에 띄워줄 "현재 리뷰의 사진 배열"을 저장할 State
  const [modalImages, setModalImages] = useState([]);

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

  // 💡 1. 순수 파일 경로만 추출하는 함수 (ProductImg 컴포넌트에 넘겨주기 위함)
  // IMAGE_BASE_URL을 여기서 붙이지 않고 순수한 DB 경로만 반환합니다.
  function getRawImagePath(imgUrl) {
    const trimmed = String(imgUrl || '').trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed) || /^data:/i.test(trimmed))
      return trimmed;
    const path = trimmed.includes(':')
      ? trimmed.split(':').slice(1).join(':')
      : trimmed;
    return path;
  }

  // 💡 2. 리뷰 등에서 여전히 전체 URL이 필요한 곳을 위한 기존 함수 유지
  function normalizeImageUrl(imgUrl) {
    const path = getRawImagePath(imgUrl);
    if (!path) return '';
    if (/^https?:\/\//i.test(path) || /^data:/i.test(path)) return path;
    return `${IMAGE_BASE_URL}${path}`;
  }

  // 💡 3. 상품 서브 이미지 배열 추출 (getRawImagePath 적용)
  const imageUrls = Array.isArray(ProdDetails.images)
    ? ProdDetails.images
        .map((item) =>
          getRawImagePath(
            typeof item === 'string'
              ? item
              : item?.IMG_URL || item?.imgUrl || '',
          ),
        )
        .filter(Boolean)
    : [];

  // 💡 4. 메인 이미지 추출 (getRawImagePath 적용)
  const mainImage = getRawImagePath(ProdDetails.imgUrl) || imageUrls[0] || ''; // 빈 값이면 ProductImg가 알아서 DEFAULT로 처리합니다.

  // 💡 5. 썸네일 이미지 배열 조립 및 중복 제거 (getRawImagePath 적용)
  const rawThumbnails = [
    getRawImagePath(ProdDetails.imgUrl),
    ...imageUrls,
  ].filter((img) => img && img !== DEFAULT_PRODUCT_IMAGE);

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
      .map((value) => normalizeImageUrl(value))
      .filter(Boolean);

  const maskUserId = (userId) => {
    if (!userId || userId.length <= 3) return userId || '구매자';
    return userId.substring(0, 3) + '*'.repeat(userId.length - 3);
  };

  const fetchProductExtraData = async (
    targetProdNo,
    reviewPage = 1,
    qnaPage = 1,
  ) => {
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
          .get(
            `${MY_REVIEW_PATH}/product/${targetProdNo}?page=${reviewPage}&size=5`,
            {
              meta: { errorType: 'INLINE' },
            },
          )
          .catch(() => ({
            data: { data: { reviews: [], totalReviewCount: 0 } },
          })),
        api
          .get(
            `${MY_INQUIRY_PATH}/product/${targetProdNo}/qna?page=${qnaPage}&size=5`,
            {
              meta: { errorType: 'INLINE' },
            },
          )
          .catch(() => ({
            data: { data: { qnaList: [], totalQnACount: 0 } },
          })),
      ]);

      const reviewData = reviewResponse.data?.data ?? {
        reviews: [],
        totalReviewCount: 0,
      };
      const nextReviews = reviewData.reviews ?? [];
      const totalReviewCount = reviewData.totalReviewCount ?? 0;
      const qnaData = qnaResponse.data?.data ?? {
        qnaList: [],
        totalQnACount: 0,
      };
      const nextQnAs = qnaData.qnaList ?? [];
      const qnaTotalCount = qnaData.totalQnACount ?? 0;

      setProductReviews(nextReviews);
      setTotalReviewCount(totalReviewCount);
      setTotalReviewPages(Math.ceil(totalReviewCount / 5));
      setProductQnAs(nextQnAs);
      setTotalQnACount(qnaTotalCount);
      setTotalQnaPages(Math.ceil(qnaTotalCount / 5));
      setCurrentReviewPage(reviewPage);
      setCurrentQnaPage(qnaPage);
      setOpenReviewNo(null);
      setOpenInquiryNo(null);
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

  //상품 Q&A 등록
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
    formData.append('inquiryType', 'IT001');
    formData.append('inquiryCategory', qnaForm.inquiryCategory);
    formData.append('inquiryTitle', qnaForm.inquiryTitle.trim());
    formData.append('inquiryContent', qnaForm.inquiryContent.trim());

    try {
      setQnaSubmitting(true);
      setQnaErrorMessage('');
      setQnaSuccessMessage('');

      await api.post(`${MY_INQUIRY_PATH}/saveMyProductQnA.do`, formData, {
        meta: { errorType: 'ALERT' },
      });

      setQnaForm({
        inquiryCategory: '',
        inquiryTitle: '',
        inquiryContent: '',
      });
      setQnaSuccessMessage('상품 Q&A가 등록되었습니다.');
      setShowQnaForm(false);
      await fetchProductExtraData(prodNo, currentReviewPage, currentQnaPage);
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
          slidesToShow: 3, // 태블릿 화면에서도 3칸 기준 고정
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
    if (!prodNo) return;
    setCurrentReviewPage(1);
    setCurrentQnaPage(1);
    fetchProductExtraData(prodNo, 1, 1);
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

  //이미지 팝업 열기
  // 💡 [수정] 열기 함수: 이제 클릭한 사진의 URL이 아니라, "사진 배열"과 "클릭한 순서(index)"를 받습니다.
  const openImageModal = (imagesArray, clickedIndex) => {
    setModalImages(imagesArray); // 모달한테 "이 배열만 보여줘!" 하고 전달
    setImageIndex(clickedIndex); // "이 번호 사진부터 띄워!"
    setIsModalOpen(true);
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
              {/* 💡 6. 기존 img 태그를 ProductImg로 교체! */}
              <ProductImg
                className="w-full "
                src={selectedImage || mainImage}
                alt={ProdDetails.prodNm || '상품 이미지'}
              />
            </div>

            {/* 썸네일 슬라이더 */}
            {thumbnailImages.length > 0 && (
              <div className="px-1 pb-2">
                <Slider {...thumbnailSettings}>
                  {thumbnailImages.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`p-1 outline-none ${img === selectedImage ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
                    >
                      {/* 💡 7. 썸네일 img 태그를 ProductImg로 교체! */}
                      <ProductImg
                        className="w-full rounded-lg"
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
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {ProdDetails.prodNm}
            </h2>

            <div className="flex justify-end items-center gap-2 mt-2">
              <StarRating rating={Math.round(reviewAvg)} />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {reviewAvg.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">({reviewCount}건)</span>
            </div>

            <p className="mt-4 text-base text-gray-600 dark:text-gray-400">
              {ProdDetails.shortDesc || ProdDetails.detailDesc}
            </p>

            <div className="text-right mt-6">
              <span className="text-3xl md:text-4xl font-extrabold text-black-600 dark:text-black-500">
                {formatWon(ProdDetails.price)}
              </span>
            </div>

            <hr className="my-6 border-gray-200 dark:border-gray-700" />

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
                  총 {totalReviewCount}건
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
                                {maskUserId(review.userId || review.userNm)}
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
                                    className="w-full aspect-square cursor-pointer rounded-lg object-cover bg-white transition-transform hover:scale-105"
                                    // 💡 [핵심 수정] 함수에 현재 리뷰의 이미지 배열(reviewImages)과 클릭한 인덱스를 던져줍니다!
                                    onClick={() =>
                                      openImageModal(reviewImages, index)
                                    }
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

              {/* 페이지네이션 */}
              {totalReviewPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newPage = Math.max(1, currentReviewPage - 5);
                        setCurrentReviewPage(newPage);
                        fetchProductExtraData(prodNo, newPage);
                      }}
                      disabled={currentReviewPage <= 5}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      이전
                    </button>

                    {Array.from(
                      {
                        length: Math.min(
                          5,
                          Math.max(
                            0,
                            totalReviewPages -
                              Math.floor((currentReviewPage - 1) / 5) * 5,
                          ),
                        ),
                      },
                      (_, i) => {
                        const pageNum =
                          Math.floor((currentReviewPage - 1) / 5) * 5 + i + 1;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => {
                              setCurrentReviewPage(pageNum);
                              fetchProductExtraData(
                                prodNo,
                                pageNum,
                                currentQnaPage,
                              );
                            }}
                            className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                              currentReviewPage === pageNum
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      },
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const newPage = Math.min(
                          totalReviewPages,
                          Math.floor((currentReviewPage - 1) / 5) * 5 + 6,
                        );
                        setCurrentReviewPage(newPage);
                        fetchProductExtraData(prodNo, newPage);
                      }}
                      disabled={currentReviewPage > totalReviewPages - 5}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-2xl font-bold text-gray-900">상품 Q&A</h3>
                  <span className="mt-1 text-sm text-gray-500">
                    총 {totalQnACount}건
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className="mt-1 text-sm text-gray-500">
                    상품 관련 문의와 답변을 확인할 수 있습니다.
                  </p>
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
                <>
                  <div className="space-y-3">
                    {productQnAs.map((qna) => {
                      const isOpen = openInquiryNo === qna.inquiryNo;
                      const isAnswered = Boolean(qna.answerContent);
                      const inquiryUserLabel =
                        qna.inquiryUserId || qna.inquiryUserNm;
                      const answerUserLabel =
                        qna.answerUserId || qna.answerUserNm;

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
                                {inquiryUserLabel && (
                                  <>
                                    {' '}
                                    &middot; 문의자{' '}
                                    {maskUserId(inquiryUserLabel)}
                                  </>
                                )}
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
                                  {qna.inquiryContent ||
                                    '문의 내용이 없습니다.'}
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
                                {answerUserLabel && (
                                  <p className="mt-2 text-xs text-gray-500">
                                    답변자 {maskUserId(answerUserLabel)}
                                  </p>
                                )}
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
                  {totalQnaPages > 1 && (
                    <div className="mt-6 flex justify-center">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newPage = Math.max(1, currentQnaPage - 5);
                            setCurrentQnaPage(newPage);
                            fetchProductExtraData(
                              prodNo,
                              currentReviewPage,
                              newPage,
                            );
                          }}
                          disabled={currentQnaPage <= 5}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          이전
                        </button>

                        {Array.from(
                          {
                            length: Math.min(
                              5,
                              Math.max(
                                0,
                                totalQnaPages -
                                  Math.floor((currentQnaPage - 1) / 5) * 5,
                              ),
                            ),
                          },
                          (_, i) => {
                            const pageNum =
                              Math.floor((currentQnaPage - 1) / 5) * 5 + i + 1;
                            return (
                              <button
                                key={pageNum}
                                type="button"
                                onClick={() => {
                                  setCurrentQnaPage(pageNum);
                                  fetchProductExtraData(
                                    prodNo,
                                    currentReviewPage,
                                    pageNum,
                                  );
                                }}
                                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                                  currentQnaPage === pageNum
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          },
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const newPage = Math.min(
                              totalQnaPages,
                              Math.floor((currentQnaPage - 1) / 5) * 5 + 6,
                            );
                            setCurrentQnaPage(newPage);
                            fetchProductExtraData(
                              prodNo,
                              currentReviewPage,
                              newPage,
                            );
                          }}
                          disabled={currentQnaPage > totalQnaPages - 5}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          다음
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  등록된 상품 Q&A가 없습니다. 첫 문의를 남겨보세요.
                </p>
              )}
            </section>
          </div>
        )}
      </div>

      {/* 이미지 확대 모달 */}

      {isModalOpen && (
        <ImgModal
          // images={allReviewImages} // 전체 이미지 배열
          images={modalImages} // 💡 [수정] 전체 이미지가 아니라, 방금 클릭한 리뷰의 이미지 배열만 쏙!
          currentIndex={imageIndex} // 현재 인덱스
          onClose={() => setIsModalOpen(false)} // 닫기 로직
          onChangeIndex={setImageIndex} // 인덱스 변경 로직
        />
      )}
    </>
  );
}
