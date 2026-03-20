import { useNavigate } from 'react-router-dom';
import CommonTable from '../Common/CommonTable';
import MyButton from '../Common/MyButton';

export default function MyOrderBlock({ order, columns }) {
  // console.log('MyOrderBlock order:', order);
  // console.log('order.items:', order.items);

  const navigate = useNavigate();
  const moveOrderDetail = () => {
    navigate(`/mypage/myOrderDetail/${order.orderNo}`, {
      state: { from: 'orderList' }, //주문목록에서 이동한 경우 주문목록 버튼 클릭시 '뒤로가기'로 이동하게 하기 위한 표시
    });
  };
  //주문번호 기준으로 그룹핑 -> 주문번호 내에서 상품주문번호별로 테이블에 표시
  return (
    <div className="border mb-6 p-4 rounded bg-white">
      {/* 주문 헤더 */}
      <div className="flex justify-between mb-3">
        <div>
          <span className="mr-10 font-semibold">{order.orderDate}</span>
          <span className="mr-6 text-gray-500">주문번호 : {order.orderNo}</span>
        </div>

        <MyButton onClick={moveOrderDetail}>주문상세내역</MyButton>
      </div>

      {/* 상품주문번호 기준 테이블(item 없는 경우 빈배열처리) */}
      <CommonTable columns={columns} data={order.items || []} />
    </div>
  );
}
