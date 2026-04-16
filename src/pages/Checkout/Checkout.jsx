import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import api from '../../api/axios';
import Spinner from '../../components/Spinner/Spinner';
import { DEFAULT_PRODUCT_IMAGE, IMAGE_BASE_URL } from '../../constants/api';

export default function Checkout() {
  const [isLoading, setIsLoading] = useState(false);
  const [cartData, setCartData] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [saveForNextTime, setSaveForNextTime] = useState(true);
  const [savePaymentForNextTime, setSavePaymentForNextTime] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertModalTitle, setAlertModalTitle] = useState('안내');
  const [alertModalMessage, setAlertModalMessage] = useState('');
  const [pendingCheckoutData, setPendingCheckoutData] = useState(null);
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const directProduct = location.state?.directProduct;
  const directQuantity = location.state?.quantity || 1;

  const products = cartData?.products || [];

  const displayProducts = useMemo(() => {
    if (directProduct) {
      return [
        {
          product: directProduct,
          price: Number(directProduct.price) * directQuantity,
          count: directQuantity,
        },
      ];
    }
    return products;
  }, [directProduct, directQuantity, products]);

  const totalPrice = useMemo(() => {
    if (Number(cartData?.totalCartPrice || 0) > 0) {
      return Number(cartData.totalCartPrice);
    }

    return products.reduce((sum, item) => {
      const linePrice = Number(item?.price || 0);
      if (linePrice > 0) {
        return sum + linePrice;
      }
      return sum + Number(item?.product?.price || 0) * Number(item?.count || 0);
    }, 0);
  }, [cartData, products]);

  const displayTotalPrice = directProduct
    ? Number(directProduct.price) * directQuantity
    : totalPrice;

  const formatPrice = (value) => `${Number(value || 0).toLocaleString()} 원`;

  const buttonProps = {
    type: 'button',
    className:
      'w-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-base px-5 py-3 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 select-none disabled:opacity-60',
  };

  function openAlertModal(title, message) {
    setAlertModalTitle(title || '안내');
    setAlertModalMessage(message || '요청을 처리하지 못했습니다.');
    setIsAlertModalOpen(true);
  }

  function closeAlertModal() {
    setIsAlertModalOpen(false);
  }

  const validate = Yup.object({
    receiverName: Yup.string()
      .required('이름을 입력해주세요.')
      .min(2, '이름은 2자 이상 입력해주세요.'),
    city: Yup.string()
      .required('주소를 입력해주세요.')
      .min(3, '주소는 3자 이상 입력해주세요.'),
    details: Yup.string(),
    phone: Yup.string()
      .required('휴대폰 번호를 입력해주세요.')
      .matches(
        /^01[0-9]{8,9}$/,
        '휴대폰 번호 형식이 올바르지 않습니다. (예: 01012345678)',
      ),
    cardNumber: Yup.string()
      .required('카드번호를 입력해주세요.')
      .test('card-number', '카드번호 16자리를 입력해주세요.', (value) => {
        const normalized = (value || '').replace(/\D/g, '');
        return normalized.length === 16;
      }),
    expiryMonth: Yup.string()
      .required('유효기간 월을 입력해주세요.')
      .matches(/^(0[1-9]|1[0-2])$/, '월은 01~12로 입력해주세요.'),
    expiryYear: Yup.string()
      .required('유효기간 년도를 입력해주세요.')
      .matches(/^\d{2}$/, '년도는 2자리로 입력해주세요. (예: 28)'),
    cvc: Yup.string()
      .required('CVC를 입력해주세요.')
      .matches(/^\d{3}$/, 'CVC는 3자리 숫자입니다.'),
  });

  function submitCheckout(data) {
    const checkoutId = id || cartData?._id;

    if (!checkoutId) {
      openAlertModal(
        '주문 불가',
        '결제 정보가 없어 주문을 진행할 수 없습니다.',
      );
      return;
    }

    setIsLoading(true);

    api
      .post(`/api/shopping/orders/checkout-session/${checkoutId}`, {
        ...data,
        cardNumber: data.cardNumber.replace(/\D/g, ''),
        saveForNextTime,
        savePaymentForNextTime,
        totalAmount: displayTotalPrice,
        productCount: displayProducts.length,
        items: displayProducts.map((item) => {
          const product = item?.product || {};
          const quantity = Number(item?.count || item?.quantity || 1);
          const unitPrice = Number(product?.price || 0);
          const totalPrice = Number(item?.price || unitPrice * quantity);

          return {
            prodNo: product?.prodNo ?? item?.prodNo ?? null,
            prodNm: product?.prodNm || product?.title,
            quantity,
            unitPrice,
            totalPrice,
          };
        }),
        url: window.location.origin,
      })
      .then((response) => {
        const payload = response.data?.data ?? response.data;
        const redirectUrl = payload?.session?.url || payload?.redirectUrl;

        if (redirectUrl) {
          if (/^https?:\/\//i.test(redirectUrl)) {
            window.location.href = redirectUrl;
            return;
          }

          navigate(redirectUrl, {
            replace: true,
            state: {
              orderId: payload?.orderId,
              totalAmount: displayTotalPrice,
              productCount: displayProducts.length,
            },
          });
          return;
        }

        navigate('/checkout/complete', {
          replace: true,
          state: {
            orderId: payload?.orderId,
            totalAmount: displayTotalPrice,
            productCount: displayProducts.length,
          },
        });
      })
      .catch((error) => {
        openAlertModal(
          '주문 실패',
          error.response?.data?.message || '주문 처리 중 오류가 발생했습니다.',
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleCheckout(data) {
    if (displayProducts.length === 0) {
      openAlertModal('주문 불가', '주문할 상품이 없습니다.');
      return;
    }

    const checkoutId = id || cartData?._id; //장바구니 고유 ID

    if (!checkoutId) {
      openAlertModal(
        '주문 불가',
        '결제 정보가 없어 주문을 진행할 수 없습니다.',
      );
      return;
    }

    setPendingCheckoutData(data);
    setIsConfirmModalOpen(true);
  }

  function handleConfirmCheckout() {
    if (!pendingCheckoutData || isLoading) {
      return;
    }

    const checkoutData = pendingCheckoutData;
    setIsConfirmModalOpen(false);
    setPendingCheckoutData(null);
    submitCheckout(checkoutData);
  }

  function handleCloseConfirmModal() {
    if (isLoading) {
      return;
    }

    setIsConfirmModalOpen(false);
    setPendingCheckoutData(null);
  }

  async function handlePurchaseClick() {
    const errors = await formik.validateForm();
    formik.setTouched({
      receiverName: true,
      city: true,
      details: true,
      phone: true,
      cardNumber: true,
      expiryMonth: true,
      expiryYear: true,
      cvc: true,
    });

    if (Object.keys(errors).length > 0) {
      const priorityFields = [
        'receiverName',
        'phone',
        'city',
        'cardNumber',
        'expiryMonth',
        'expiryYear',
        'cvc',
      ];
      const firstErrorKey =
        priorityFields.find((key) => errors[key]) || Object.keys(errors)[0];
      const firstErrorMessage =
        errors[firstErrorKey] || '입력값을 다시 확인해주세요.';
      openAlertModal(
        '필수 정보 확인',
        `주문 전 필수 정보를 확인해주세요.\n\n${firstErrorMessage}`,
      );
      return;
    }

    handleCheckout(formik.values);
  }

  const formik = useFormik({
    initialValues: {
      receiverName: '',
      city: '',
      details: '',
      phone: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvc: '',
    },
    onSubmit: handleCheckout,
    validationSchema: validate,
  });

  const getPreferenceValue = (source, ...keys) => {
    if (!source || typeof source !== 'object') {
      return '';
    }

    for (const key of keys) {
      if (source[key] !== undefined && source[key] !== null) {
        return source[key];
      }
    }

    const normalizedEntries = Object.entries(source);
    for (const key of keys) {
      const normalizedKey = key.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const match = normalizedEntries.find(
        ([entryKey]) =>
          entryKey.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === normalizedKey,
      );
      if (match && match[1] !== undefined && match[1] !== null) {
        return match[1];
      }
    }

    return '';
  };

  useEffect(() => {
    Promise.all([
      api
        .get('/api/shopping/cart', { meta: { errorType: 'INLINE' } })
        .catch(() => ({ data: { data: { products: [], totalCartPrice: 0 } } })),
      api
        .get('/api/shopping/checkout-preference', {
          meta: { errorType: 'INLINE' },
        })
        .catch(() => ({ data: { data: {} } })),
    ])
      .then(([cartResponse, preferenceResponse]) => {
        const cartPayload = cartResponse.data?.data ?? cartResponse.data;
        setCartData(cartPayload || { products: [], totalCartPrice: 0 });

        const preferencePayload =
          preferenceResponse.data?.data ?? preferenceResponse.data ?? {};
        if (preferencePayload && Object.keys(preferencePayload).length > 0) {
          const savedOrderer = getPreferenceValue(
            preferencePayload,
            'saveForNextTime',
          );
          const savedPayment = getPreferenceValue(
            preferencePayload,
            'savePaymentForNextTime',
          );

          setSaveForNextTime(
            savedOrderer === true ||
              String(savedOrderer).toUpperCase() === 'Y' ||
              String(savedOrderer).toLowerCase() === 'true',
          );
          setSavePaymentForNextTime(
            savedPayment === true ||
              String(savedPayment).toUpperCase() === 'Y' ||
              String(savedPayment).toLowerCase() === 'true',
          );
          formik.setValues({
            receiverName: getPreferenceValue(preferencePayload, 'receiverName'),
            city: getPreferenceValue(preferencePayload, 'city'),
            details: getPreferenceValue(preferencePayload, 'details'),
            phone: getPreferenceValue(preferencePayload, 'phone'),
            cardNumber: getPreferenceValue(preferencePayload, 'cardNumber'),
            expiryMonth: getPreferenceValue(preferencePayload, 'expiryMonth'),
            expiryYear: getPreferenceValue(preferencePayload, 'expiryYear'),
            cvc: '',
          });
        }
      })
      .finally(() => {
        setCartLoading(false);
      });
  }, []);

  const cardNumberGroups = [0, 1, 2, 3].map((index) =>
    formik.values.cardNumber.slice(index * 4, (index + 1) * 4),
  );

  const handleCardNumberChange = (index, value) => {
    const numbersOnly = value.replace(/\D/g, '').slice(0, 4);
    const nextGroups = [...cardNumberGroups];
    nextGroups[index] = numbersOnly;
    formik.setFieldValue('cardNumber', nextGroups.join(''));
  };

  return (
    <>
      <Helmet>
        <title>주문 / 결제</title>
      </Helmet>

      <div className="container">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">주문 / 결제</h1>

        {cartLoading ? (
          <Spinner />
        ) : (
          <form method="post" onSubmit={formik.handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 gap-3">
                    <h2 className="text-xl font-semibold text-gray-800">
                      주문자 정보
                    </h2>
                    <button
                      type="button"
                      onClick={() => setSaveForNextTime((prev) => !prev)}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700"
                    >
                      <span>다음에도 사용</span>
                      <span
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          saveForNextTime ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            saveForNextTime ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="receiverName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        이름
                      </label>
                      <input
                        type="text"
                        name="receiverName"
                        id="receiverName"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.receiverName}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="홍길동"
                      />
                      {formik.errors.receiverName &&
                        formik.touched.receiverName && (
                          <p className="text-red-600 text-sm mt-1">
                            {formik.errors.receiverName}
                          </p>
                        )}
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        휴대폰 번호
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.phone}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="01012345678"
                      />
                      {formik.errors.phone && formik.touched.phone && (
                        <p className="text-red-600 text-sm mt-1">
                          {formik.errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      주소
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.city}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="서울시 강남구 ..."
                    />
                    {formik.errors.city && formik.touched.city && (
                      <p className="text-red-600 text-sm mt-1">
                        {formik.errors.city}
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="details"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      상세 주소
                    </label>
                    <input
                      type="text"
                      name="details"
                      id="details"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.details}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="동/호수 등"
                    />
                  </div>
                </section>

                <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 gap-3">
                    <h2 className="text-xl font-semibold text-gray-800">
                      결제 정보
                    </h2>
                    <button
                      type="button"
                      onClick={() => setSavePaymentForNextTime((prev) => !prev)}
                      className="flex items-center gap-2 text-sm font-medium text-gray-700"
                    >
                      <span>다음에도 사용</span>
                      <span
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          savePaymentForNextTime
                            ? 'bg-green-600'
                            : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            savePaymentForNextTime
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          }`}
                        />
                      </span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="cardNumber-0"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        카드번호
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {cardNumberGroups.map((group, index) => (
                          <input
                            key={index}
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            id={`cardNumber-${index}`}
                            value={group}
                            onChange={(e) => {
                              handleCardNumberChange(index, e.target.value);
                              if (
                                e.target.value.replace(/\D/g, '').length ===
                                  4 &&
                                index < 3
                              ) {
                                document
                                  .getElementById(`cardNumber-${index + 1}`)
                                  ?.focus();
                              }
                            }}
                            onBlur={() =>
                              formik.setFieldTouched('cardNumber', true)
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="1234"
                          />
                        ))}
                      </div>
                      {formik.errors.cardNumber &&
                        formik.touched.cardNumber && (
                          <p className="text-red-600 text-sm mt-1">
                            {formik.errors.cardNumber}
                          </p>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label
                          htmlFor="expiryMonth"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          유효월
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={2}
                          name="expiryMonth"
                          id="expiryMonth"
                          onChange={(e) =>
                            formik.setFieldValue(
                              'expiryMonth',
                              e.target.value.replace(/\D/g, '').slice(0, 2),
                            )
                          }
                          onBlur={formik.handleBlur}
                          value={formik.values.expiryMonth}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="MM"
                        />
                        {formik.errors.expiryMonth &&
                          formik.touched.expiryMonth && (
                            <p className="text-red-600 text-sm mt-1">
                              {formik.errors.expiryMonth}
                            </p>
                          )}
                      </div>

                      <div>
                        <label
                          htmlFor="expiryYear"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          유효년
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={2}
                          name="expiryYear"
                          id="expiryYear"
                          onChange={(e) =>
                            formik.setFieldValue(
                              'expiryYear',
                              e.target.value.replace(/\D/g, '').slice(0, 2),
                            )
                          }
                          onBlur={formik.handleBlur}
                          value={formik.values.expiryYear}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="YY"
                        />
                        {formik.errors.expiryYear &&
                          formik.touched.expiryYear && (
                            <p className="text-red-600 text-sm mt-1">
                              {formik.errors.expiryYear}
                            </p>
                          )}
                      </div>

                      <div>
                        <label
                          htmlFor="cvc"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          CVC
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={3}
                          name="cvc"
                          id="cvc"
                          onChange={(e) =>
                            formik.setFieldValue(
                              'cvc',
                              e.target.value.replace(/\D/g, '').slice(0, 3),
                            )
                          }
                          onBlur={formik.handleBlur}
                          value={formik.values.cvc}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="123"
                        />
                        {formik.errors.cvc && formik.touched.cvc && (
                          <p className="text-red-600 text-sm mt-1">
                            {formik.errors.cvc}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs font-medium text-amber-600">
                      보안을 위해 CVC는 저장되지 않으며, 주문 시마다 다시
                      입력해야 합니다.
                    </p>
                  </div>
                </section>
              </div>

              <aside className="lg:col-span-1">
                <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-24">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    주문 상품
                  </h2>

                  {displayProducts.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      주문할 상품이 없습니다.
                    </p>
                  ) : (
                    <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                      {displayProducts.map((item, idx) => {
                        const product = item.product || {};
                        const linePrice =
                          Number(item.price || 0) > 0
                            ? Number(item.price || 0)
                            : Number(product.price || 0) *
                              Number(item.count || 0);

                        return (
                          <div
                            key={`${product.prodNo || idx}-${idx}`}
                            className="flex gap-3"
                          >
                            <img
                              src={
                                `${IMAGE_BASE_URL}${item.product.imgUrl}` ||
                                DEFAULT_PRODUCT_IMAGE
                              }
                              className="w-24 h-24 aspect-square object-cover rounded-lg bg-gray-100"
                              onError={(e) => {
                                e.target.src = DEFAULT_PRODUCT_IMAGE; // 에러 났을 때도 상수로 교체!
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {product.prodNm || '상품명 없음'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                수량 {item.count || 0}개
                              </p>
                              <p className="text-sm font-semibold text-gray-900 mt-1">
                                {formatPrice(linePrice)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="border-t border-gray-200 mt-5 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-600">총 결제금액</span>
                      <span className="text-xl font-bold text-gray-900">
                        {formatPrice(displayTotalPrice)}
                      </span>
                    </div>

                    {isLoading ? (
                      <button {...buttonProps} disabled>
                        <i className="fa-solid fa-spinner animate-spin"></i>
                      </button>
                    ) : (
                      <button
                        {...buttonProps}
                        onClick={handlePurchaseClick}
                        disabled={displayProducts.length === 0}
                      >
                        구매하기
                      </button>
                    )}
                  </div>
                </section>
              </aside>
            </div>
          </form>
        )}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <i className="fa-solid fa-bag-shopping"></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">주문 확인</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    총{' '}
                    <span className="font-semibold text-gray-900">
                      {formatPrice(displayTotalPrice)}
                    </span>{' '}
                    결제를 진행할까요?
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    확인을 누르면 주문이 접수되고 주문완료 페이지로 이동합니다.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseConfirmModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCheckout}
                  className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
                  disabled={isLoading}
                >
                  {isLoading ? '주문 처리 중...' : '주문 확인'}
                </button>
              </div>
            </div>
          </div>
        )}
        {isAlertModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-700">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {alertModalTitle}
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
                    {alertModalMessage}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={closeAlertModal}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
