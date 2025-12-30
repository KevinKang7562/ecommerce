import { useNavigate } from 'react-router-dom';
import CommonTable from '../Common/CommonTable';

function MyOrderBlock({ order, columns }) {
  // console.log('MyOrderBlock order:', order);
  // console.log('order.items:', order.items);

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

        {/* <button className="text-sm  px-5 py-2 bg-green-700 text-white rounded hover:bg-green-800"> */}
        <button className="text-sm border-2 rounded border-green-600 text-green-600 px-3 py-1 transition-colors hover:bg-green-600 hover:text-white">
          주문상세보기
        </button>
      </div>

      {/* 상품주문번호 기준 테이블(item 없는 경우 빈배열처리) */}
      <CommonTable columns={columns} data={order.items || []} />
    </div>
  );
}
export default MyOrderBlock;
