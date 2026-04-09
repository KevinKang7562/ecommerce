import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import Slider from 'react-slick/lib/slider.js';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import api from '../../api/axios';
import { useCommCd } from '../../hooks/useCommCd';
import { cartContext } from '../../context/Cart/CartContextProvider';
import { productsContext } from '../../context/Products/Products.jsx';
import { authContext } from '../../context/Auth/Auth.jsx';

export default function ProductDetails() {
  const { addProduct } = useContext(cartContext);
  const { renderStars } = useContext(productsContext);
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
  const location = useLocation();
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

  const getReviewImages = (imgUrls) =>
    String(imgUrls || '')
      .split(',')
      .map((value) => {
        const trimmed = value.trim();
        if (!trimmed) {
          return '';
        }
        return trimmed.includes(':') ? trimmed.split(':').slice(1).join(':') : trimmed;
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
        error.response?.data?.message || '상품 Q&A 등록 중 오류가 발생했습니다.',
      );
    } finally {
      setQnaSubmitting(false);
    }
  };

  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 1500,
    pauseOnHover: true,
  };

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      if (location.state?.product) {
        setProdDetails(location.state.product);
        return;
      }

      try {
        const dbResponse = await api.get(`/api/shopping/products/${id}`, {
          meta: { errorType: 'INLINE' },
        });

        if (isMounted) {
          setProdDetails(dbResponse.data?.data ?? dbResponse.data ?? {});
        }
        return;
      } catch (dbError) {
        try {
          const response = await axios.get(
            `https://ecommerce.routemisr.com/api/v1/products/${id}`,
          );
          if (isMounted) {
            setProdDetails(response.data.data);
          }
        } catch (error) {
          if (isMounted) {
            setProdDetails({});
          }
          console.error(error);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id, location.state]);

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
        <title>{ProdDetails.prodNm || ProdDetails.title || '상품 상세'}</title>
      </Helmet>

      <div className="container dark:bg-gray-800">
        <div className="flex flex-col md:flex-row md:space-x-8">
          <div className="w-full md:w-1/3 mb-8 md:mb-0">
            <div className="rounded-xl overflow-hidden mb-7 dark:bg-gray-700">
              {ProdDetails.imgUrl ? (
                <div className="w-full h-[460px]">
                  <img
                    className="w-full h-full object-contain rounded-xl"
                    src={ProdDetails.imgUrl}
                    alt={ProdDetails.prodNm || ProdDetails.title}
                  />
                </div>
              ) : ProdDetails.images ? (
                <Slider {...settings}>
                  {ProdDetails.images.map((img, index) => (
                    <div key={index} className="w-full h-[460px]">
                      <img
                        className="w-full h-full object-contain rounded-xl"
                        src={img}
                        alt={`Product image ${index + 1}`}
                      />
                    </div>
                  ))}
                </Slider>
              ) : (
                <div className="w-full h-[460px] bg-gray-200 rounded-xl"></div>
              )}
            </div>
          </div>

          <div className="w-full md:w-2/3">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-10">
              {ProdDetails.prodNm || ProdDetails.title}
            </h2>

            <span className="text-xl font-bold text-gray-700 dark:text-gray-300">
              상품 설명 :
            </span>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-5">
              {ProdDetails.shortDesc || ProdDetails.detailDesc || ProdDetails.description}
            </p>

            <div className="mb-4">
              <div className="flex justify-between my-4">
                <div className="text-xl font-bold text-gray-800 dark:text-white">
                  평점
                </div>
                <div className="flex items-center">
                  <span className="flex">
                    {renderStars(Math.round(ProdDetails.ratingsAverage || 0)).map(
                      (star, index) => (
                        <span key={index} className="transform scale-150">
                          {star}
                        </span>
                      ),
                    )}
                  </span>
                  <span className="bg-gray-100 text-gray-800 text-xl font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ml-3">
                    {ProdDetails.ratingsAverage || 0}
                  </span>
                </div>
              </div>

              <div className="my-5 flex justify-between text-gray-900 dark:text-white">
                <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  가격 :
                </div>
                <div className="text-xl font-bold">
                  {ProdDetails.imgUrl
                    ? formatWon(ProdDetails.price)
                    : ` ${ProdDetails.price}`}
                </div>
              </div>

              <div className="w-full max-w-md ml-auto">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 mb-4">
                  <span className="text-base font-semibold text-gray-700 dark:text-gray-200">
                    수량
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDecreaseQuantity}
                      className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={quantity}
                      onChange={handleQuantityInput}
                      className="w-14 text-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                    />
                    <button
                      type="button"
                      onClick={handleIncreaseQuantity}
                      className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 mb-4">
                  <span className="text-base font-semibold text-gray-700 dark:text-gray-200">
                    총 금액
                  </span>
                  <span className="text-xl font-bold text-green-700 dark:text-green-400">
                    {ProdDetails.imgUrl
                      ? formatWon(quantity * Number(ProdDetails.price))
                      : `${(quantity * Number(ProdDetails.price)).toFixed(2)}`}
                  </span>
                </div>

                <div className="flex mt-4 gap-3">
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-green-700 hover:bg-green-800 dark:bg-green-600 text-white py-2 px-4 rounded-lg font-bold dark:hover:bg-green-700"
                  >
                    바로 구매
                  </button>
                  <button
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 px-4 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={handleAddToCart}
                  >
                    장바구니 담기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isDbProduct && (
          <div className="mt-10 space-y-6 pb-8">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-2xl font-bold text-gray-900">상품상세 정보</h3>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  DB 연동 상품
                </span>
              </div>

              {hasExtraDetailInfo ? (
                <>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">상품번호</span>
                      <div className="mt-1">{ProdDetails.prodNo}</div>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">판매상태</span>
                      <div className="mt-1">{ProdDetails.saleState || '-'}</div>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">재고수량</span>
                      <div className="mt-1">{ProdDetails.stockQty || '-'}</div>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">배송비</span>
                      <div className="mt-1">
                        {ProdDetails.deliveryFee ? formatWon(ProdDetails.deliveryFee) : '무료'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-gray-50 p-4">
                    <h4 className="text-base font-semibold text-gray-900">상세 설명</h4>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
                      {ProdDetails.detailDesc || ProdDetails.shortDesc}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">등록된 상세 정보가 없습니다.</p>
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
                <p className="text-sm text-gray-500">리뷰를 불러오는 중입니다...</p>
              ) : productReviews.length > 0 ? (
                <div className="space-y-3">
                  {productReviews.map((review) => {
                    const reviewImages = getReviewImages(review.imgUrls);
                    const isOpen = openReviewNo === review.reviewNo;

                    return (
                      <div key={review.reviewNo} className="overflow-hidden rounded-xl border border-gray-200">
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
                              <span className="flex text-sm">
                                {renderStars(Math.round(Number(review.rating || 0))).map(
                                  (star, index) => (
                                    <span key={index}>{star}</span>
                                  ),
                                )}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">{review.reviewDate || '-'}</p>
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
                <p className="text-sm text-gray-500">해당 상품에 등록된 리뷰가 없습니다.</p>
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
                    <label className="mb-1 block text-sm font-medium text-gray-700">문의유형</label>
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
                    <label className="mb-1 block text-sm font-medium text-gray-700">제목</label>
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
                    <label className="mb-1 block text-sm font-medium text-gray-700">내용</label>
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
                    <p className="text-sm font-medium text-red-600">{qnaErrorMessage}</p>
                  )}
                  {qnaSuccessMessage && (
                    <p className="text-sm font-medium text-green-600">{qnaSuccessMessage}</p>
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
                <p className="text-sm text-gray-500">상품 Q&A를 불러오는 중입니다...</p>
              ) : productQnAs.length > 0 ? (
                <div className="space-y-3">
                  {productQnAs.map((qna) => {
                    const isOpen = openInquiryNo === qna.inquiryNo;
                    const isAnswered = Boolean(qna.answerContent);

                    return (
                      <div key={qna.inquiryNo} className="overflow-hidden rounded-xl border border-gray-200">
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
                              <span className="font-semibold text-gray-900">{qna.inquiryTitle}</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              {qna.inquiryCategoryNm || '상품문의'} · {qna.inquiryDate || '-'}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-green-700">
                            {isOpen ? '접기' : '상세보기'}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="space-y-3 border-t border-gray-100 bg-gray-50 p-4">
                            <div>
                              <p className="text-xs font-semibold text-gray-500">문의 내용</p>
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
                              <p className="text-xs font-semibold text-gray-500">답변</p>
                              <p className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-700">
                                {qna.answerContent || '아직 등록된 답변이 없습니다.'}
                              </p>
                              {qna.answerDate && (
                                <p className="mt-2 text-xs text-gray-500">답변일 {qna.answerDate}</p>
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
