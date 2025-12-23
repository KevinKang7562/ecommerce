import { useNavigate } from 'react-router-dom';
import MyOrdersTable from './MyOrdersTale';

function MyOrderBlock({ order }) {
  console.log('MyOrderBlock order:', order);
  console.log('order.items:', order.items);

  const navigate = useNavigate();
  const moveOrderDetail = () => {
    navigate(`mypage/myOrderDetail/${order.orderNo}`);
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

        <button className="text-sm border px-3 py-1">주문상세보기</button>
      </div>

      {/* 상품주문번호 테이블 */}
      <MyOrdersTable items={order.items || []} />
    </div>
  );
}
export default MyOrderBlock;
