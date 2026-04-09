import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'react-router-dom';

export default function CheckoutComplete() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const orderId = params.get('orderId') || location.state?.orderId || '주문번호 확인 중';
  const totalAmount = location.state?.totalAmount;
  const productCount = location.state?.productCount;

  return (
    <>
      <Helmet>
        <title>주문 완료</title>
      </Helmet>

      <div className="container max-w-3xl py-10">
        <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
            ✓
          </div>

          <h1 className="text-3xl font-bold text-gray-900">주문이 완료되었습니다.</h1>
          <p className="mt-2 text-gray-600">
            결제가 정상적으로 접수되었으며, 저장 체크한 정보는 다음 주문에도 사용할 수 있습니다.
          </p>

          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm">
              <span className="text-gray-500">주문번호</span>
              <span className="font-semibold text-gray-900">{orderId}</span>
            </div>
            {typeof totalAmount === 'number' && (
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 text-sm">
                <span className="text-gray-500">결제금액</span>
                <span className="font-semibold text-gray-900">{totalAmount.toLocaleString()} 원</span>
              </div>
            )}
            {typeof productCount === 'number' && (
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-gray-500">주문상품 수</span>
                <span className="font-semibold text-gray-900">{productCount}개</span>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/mypage/myAllOrders"
              className="rounded-lg bg-green-700 px-5 py-3 text-sm font-medium text-white hover:bg-green-800"
            >
              주문내역 보기
            </Link>
            <Link
              to="/"
              className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              쇼핑 계속하기
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
