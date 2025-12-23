import CommonTable from '../Common/CommonTable';

function MyOrdersTable({ items }) {
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
    {
      key: 'csStatusNm',
      header: '취소/반품상태',
    },
    {
      key: 'reviewYn',
      header: '리뷰',
      render: (v, row) =>
        v === 'Y' ? <button>리뷰보기</button> : <button>리뷰쓰기</button>,
    },
  ];

  return <CommonTable columns={columns} data={items || []} />; //item 없는 경우 빈배열처리
}

export default MyOrdersTable;
