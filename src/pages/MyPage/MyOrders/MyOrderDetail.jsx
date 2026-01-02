import OrderInfo from '../../../components/MyPageCommon/MyOrder/OrderInfo';
import CommonTable from '../../../components/MyPageCommon/Common/CommonTable';
import MyButton from '../../../components/MyPageCommon/Common/MyButton';
import InfoSection from '../../../components/MyPageCommon/Common/InfoSection';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../../constants/api';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MyOrderDetail() {
  //주문번호 파라미터
  const { orderNo } = useParams();

  //상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [orderData, setOrderData] = useState(null);

  //페이지이동
  const navigate = useNavigate();
  const location = useLocation();
  console.log('location.state:', location.state);
  console.log('from:', location.state?.from);
  const goToOrderList = () => {
    if (location.state?.from === 'orderList') {
      navigate(-1); //주문 목록에서 이동한 경우 뒤로가기로 이동
    } else {
      navigate('/mypage/myAllOrders'); //url로 직접 접근, 새로고침 등인 경우 목록화면으로 바로 이동
    }
  };

  //우측영역 : 주문상품목록 컬럼
  const columns = [
    { key: 'itemOrderNo', header: '상품주문번호' },
    {
      key: 'imgUrl',
      header: '상품이미지',
      render: (v) => <img src={v} className="w-16" />,
    },
    { key: 'prodNm', header: '상품명' },
    { key: 'optionInfo', header: '옵션/수량' },
    {
      key: 'totalAmt',
      header: '상품별총액',
      render: (v) => v.toLocaleString() + '원',
    },
    { key: 'orderStatusNm', header: '주문처리상태' },
  ];

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError(false);

    const url = `${API_BASE_URL}/api/order/selectOrderDetail.do`;

    try {
      const response = await axios.get(url, {
        params: { orderNo },
      });

      const resData = response.data;

      console.log('주문상세 : ', response);

      setOrderData({
        order: {
          orderNo: resData.orderNo,
          orderDate: resData.orderDate,
        },

        delivery: {
          recipientNm: resData.recipientNm,
          recipientTell: resData.recipientTell,
          address: resData.address,
        },

        payment: {
          totalPrice: resData.totalPrice ?? 0,
          deliveryFee: resData.deliveryFee ?? 0,
          payAmt: resData.payAmt ?? 0,
          payMethod: resData.payMethod ?? '',
        },

        refund: {
          refundAmt: resData.refundAmt ?? 0,
          refundMethod: resData.refundMethod ?? '',
        },

        productitems: resData.items ?? [],
      });
    } catch (err) {
      console.error('주문상세 조회 실패 : ', err);
      setError(true);
      setOrderData(null);
    } finally {
      setLoading(false); //로딩완료
    }
  };
  useEffect(() => {
    fetchOrderDetail(orderNo);
  }, [orderNo]);

  if (loading) {
    return <div className="py-20 text-center">로딩중...</div>;
  }

  if (error) {
    return <div className="py-20 text-center text-red-500">{error}</div>;
  }

  if (!orderData) {
    return <div className="py-20 text-center">주문 정보 없음</div>;
  }

  //주문정보 구조분해
  const { order, delivery, payment, refund, productitems } = orderData;

  //좌측영역 : 주문정보
  //주문상세정보
  const orderInfoItems = [
    { label: '주문번호', value: order.orderNo },
    { label: '주문일', value: order.orderDate },
  ];

  //배송정보
  const deliveryInfoItems = [
    { label: '수취인', value: delivery.recipientNm },
    { label: '휴대폰번호', value: delivery.recipientTell },
    { label: '주소', value: delivery.address },
  ];

  //결제정보
  const paymentInfoItems = [
    { label: '상품총액', value: `${payment.totalPrice.toLocaleString()}원` },
    { label: '배송비', value: `${payment.deliveryFee.toLocaleString()}원` },
    { label: '총결제금액', value: `${payment.payAmt.toLocaleString()}원` },
    { label: '결재수단', value: payment.payMethod },
  ];

  //취소/환불정보
  const refundInfoItems = [
    { label: '환불금액', value: `${refund.refundAmt}` },
    { label: '환불수단', value: refund.refundMethod },
  ];

  return (
    <div className="w-full px-5 ">
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
          <CommonTable columns={columns} data={productitems} />
          <div className="flex justify-center gap-10 mt-20">
            <MyButton>취소/반품요청</MyButton>
            <MyButton onClick={goToOrderList}>주문목록</MyButton>
          </div>
        </div>
      </div>
    </div>
  );
}
