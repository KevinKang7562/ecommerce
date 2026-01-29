import CommonTable from '../../../components/MyPageCommon/Common/CommonTable';
import MyButton from '../../../components/MyPageCommon/Common/MyButton';
import InfoSection from '../../../components/MyPageCommon/Common/InfoSection';
import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import CsDetailModal from '../../../components/MyPageCommon/MyOrder/CsDetailModal';
import { OrderContext } from '../../../context/Order/Order';

export default function MyOrderDetail() {
  //주문번호 파라미터
  const { orderNo } = useParams();

  //api 호출은 context 이용
  const { selectOrderDetail } = useContext(OrderContext);
  //상태
  const [loading, setLoading] = useState(false); //로딩표시
  const [error, setError] = useState(false); //에러표시
  const [errorMessage, setErrorMessage] = useState(''); //인라인 에러 메세지 표시

  const [orderData, setOrderData] = useState(null); //주문상세내역

  // =====================================================================
  //페이지이동
  // =====================================================================
  const navigate = useNavigate(); //페이지 이동 훅(이벤트 발생)
  const location = useLocation(); //현재 url, state 등 위치 정보 조회 훅(렌더링/조건 판단)
  console.log('location.state:', location.state);
  console.log('from:', location.state?.from);
  // 주문목록으로 이동
  const goToOrderList = () => {
    if (location.state?.from === 'orderList') {
      navigate(-1); //주문 목록에서 이동한 경우 뒤로가기로 이동
    } else {
      navigate('/mypage/myAllOrders'); //url로 직접 접근, 새로고침 등인 경우 목록화면으로 바로 이동
    }
  };

  //취소/반품요청 페이지로 이동
  const moveCancelReturnRequest = (cancelReturnType) => {
    navigate(`/mypage/CancelReturnRequest/${orderNo}`, {
      // navigate(`/mypage/CancelReturnRequest/${order.orderNo}`, {
      state: { from: 'orderDetail', cancelReturnType }, //URL로 표현할 필요 없는 부가정보(context)
    });
  };

  // =====================================================================
  //취소/반품 상세보기 이벤트(팝업)
  // =====================================================================
  //팝업 상태
  const [csPopupOpen, setCsPopupOpen] = useState(false);
  const [selectedCsItem, setSelectedCsItem] = useState(null);

  //팝업열기 이벤트
  const handelOpenCsPopup = (item) => {
    setSelectedCsItem(item);
    setCsPopupOpen(true);
  };

  //팝업닫기 이벤트
  const handleCloseCsPopup = () => {
    setCsPopupOpen(false);
    setSelectedCsItem(null);
  };

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
    { key: 'displayStatusNm', header: '주문처리상태' },
    {
      key: 'csStatusNm',
      header: '취소/반품상태',
      render: (v, row) => {
        const hasCs = Boolean(row.csTypeNm);
        return (
          <div className="flex flex-col gap-1">
            {hasCs ? (
              <>
                <div className="text-md">{row.csStatusNm}</div>
                <MyButton size="sm" onClick={() => handelOpenCsPopup(row)}>
                  {row.csTypeNm} 상세보기
                </MyButton>
              </>
            ) : (
              <span className="text-gray-400 text-sm">-</span>
            )}
          </div>
        );
      },
    },
  ];

  // =====================================================================
  //주문상세 데이터 조회
  // =====================================================================
  const fetchOrderDetail = async (orderNo) => {
    setLoading(true);
    setError(false);

    try {
      const resData = await selectOrderDetail(orderNo);

      console.log('주문상세 : ', resData);

      setOrderData({
        order: {
          orderNo: resData.orderNo,
          orderDate: resData.orderDate,
          canCancelYn: resData.canCancelYn,
          canReturnYn: resData.canReturnYn,
        },

        delivery: {
          recipientNm: resData.recipientNm,
          recipientTell: resData.recipientTell,
          postCd: resData.postCd,
          address: resData.address,
          addressDetail: resData.addressDetail,
        },

        payment: {
          totalAmt: resData.totalAmt ?? 0, //상품별 총금액의 합
          deliveryFee: resData.deliveryFee ?? 0,
          totalPayAmt: resData.totalPayAmt ?? 0, //총 결제 금액 (배송비 포함 금액인데 실제 배송비는 0원인 걸로 고려)
          payMethod: resData.payMethod ?? '',
          payMethodNm: resData.payMethodNm ?? '',
          refundTotal: resData.refundTotal ?? '',
        },

        productitems: resData.items ?? [],
      });
    } catch (error) {
      setError(true);
      const serverMessage =
        error.response?.data?.message ??
        '주문 상세 내역 조회 중 오류가 발생했습니다.';
      setErrorMessage(serverMessage);
      console.error('주문상세 조회 실패 : ', error);
      setOrderData(null);
    } finally {
      setLoading(false); //로딩완료
    }
  };

  useEffect(() => {
    fetchOrderDetail(orderNo);
  }, [orderNo]);

  // =====================================================================
  //조건부 랜더링(데이터 조회 전 orderData 구조분해 실행으로 인한 에러발생 방지하기 위해 초기 랜더링 시 구조분해 전에 return으로 함수 조기 종료)
  // =====================================================================
  if (loading) {
    return <div className="py-20 text-center">로딩중...</div>;
  }
  if (error) {
    return <div className="py-20 text-center text-red-500">{errorMessage}</div>;
  }
  if (!orderData) {
    return <div className="py-20 text-center">주문 정보 없음</div>;
  }

  // =====================================================================
  //데이터 가공
  // =====================================================================
  //주문정보 구조분해
  //(반드시 조건부 랜더링 아래 위치해야 함
  //데이터 조회 전 초기 랜더링 시 orderData = null로 인해 구조분해 단계에서 에러 발생 방지하기 위함)
  const { order, delivery, payment, productitems } = orderData;

  //주문상세정보
  const orderInfoItems = [
    { label: '주문번호', value: order.orderNo },
    { label: '주문일', value: order.orderDate },
  ];

  //배송정보
  const deliveryInfoItems = [
    { label: '수취인', value: delivery.recipientNm },
    { label: '휴대폰번호', value: delivery.recipientTell },
    {
      label: '주소',
      value: (
        <div className="text-end">
          {delivery.postCd}
          <br />
          {delivery.address}
          <br />
          {delivery.addressDetail}
        </div>
      ),
    },
  ];

  //결제정보
  const paymentInfoItems = [
    { label: '상품총액', value: `${payment.totalAmt.toLocaleString()}원` },
    { label: '배송비', value: `${payment.deliveryFee.toLocaleString()}원` }, //배송비는 따로 없는 상태라 무조건 0으로 나올 것...
    { label: '총결제금액', value: `${payment.totalPayAmt.toLocaleString()}원` },
    { label: '결재수단', value: payment.payMethodNm },
  ];

  //환불정보
  const refundInfoItems = [
    { label: '환불금액', value: `${payment.refundTotal.toLocaleString()}원` },
  ];
  console.log('상세데이터 : ', orderData);
  return (
    <div className="w-full  ">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 border-b pb-5">
        주문상세내역
      </h1>

      <div className="flex flex-col lg:flex-row gap-10 ">
        {/* 주문정보 */}

        <div className="w-full lg:w-2/5">
          <InfoSection
            title={'주문상세정보'}
            items={orderInfoItems}
          ></InfoSection>
          <InfoSection
            title={'배송정보'}
            items={deliveryInfoItems}
          ></InfoSection>
          <InfoSection
            title={'결제정보'}
            items={paymentInfoItems}
          ></InfoSection>
          <InfoSection title={'환불정보'} items={refundInfoItems}></InfoSection>
        </div>

        {/* 주문상품목록 */}

        <div className="w-full lg:w-3/5">
          <CommonTable columns={orderProductColumns} data={productitems} />
          <div className="flex justify-center gap-10 mt-20">
            {order.canCancelYn === 'Y' && (
              //파라미터 있는 경우 화살표함수 사용할 것
              <MyButton onClick={() => moveCancelReturnRequest('CANCEL')}>
                취소요청
              </MyButton>
            )}
            {order.canReturnYn === 'Y' && (
              <MyButton onClick={() => moveCancelReturnRequest('RETURN')}>
                반품요청
              </MyButton>
            )}
            <MyButton onClick={goToOrderList}>주문목록</MyButton>
          </div>
        </div>
      </div>

      {csPopupOpen && selectedCsItem && (
        <CsDetailModal item={selectedCsItem} onClose={handleCloseCsPopup} />
      )}
    </div>
  );
}
