import { useContext, useEffect, useState } from 'react';
import MyOrdersSearch from '../../../components/MyPageCommon/MyOrder/MyOrderSearch';
import { useCommCd } from '../../../hooks/useCommCd';
import Pagenation from '../../../components/MyPageCommon/Common/Pagination';
import MyOrderBlock from '../../../components/MyPageCommon/MyOrder/MyOrderBlock';
import { OrderContext } from '../../../context/Order/Order';

// 나의 취소/반품 목록
export default function MyCancelReturn() {
  //api는 context로 분리
  //context 사용 이유 : 동일한 api 중복 사용 및 로그인 여부에 대한 공통헤더 필요, 주문이라는 동일한 도메인을 사용하기 때문
  const { selectCancelReturnList } = useContext(OrderContext);

  const [cancleReturnList, setCancleReturnList] = useState([]); //취소반품목록

  const [currentPage, setCurrentPage] = useState(1); //현재 페이지
  const [totalPages, setTotalPages] = useState(0); //전체 페이지 수

  const [selected, setSelected] = useState(''); //주문처리상태 검색필터
  const [searchStartDate, setSearchStartDate] = useState(''); //시작날짜 검색필터
  const [searchEndDate, setSearchEndDate] = useState(''); //종료날짜 검색필터

  const [searchTrigger, setSearchTrigger] = useState(0); //검색 버튼 클릭여부

  const [loading, setLoading] = useState(false); //로딩표시
  const [error, setError] = useState(false); //에러표시

  const itemsPerPage = 5; //페이지당 보일 항목 수

  const cancelReturnColumns = [
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
            {row.totalPrice?.toLocaleString()}원
          </div>
        </div>
      ),
    },

    { key: 'orderStatusNm', header: '주문처리상태' },
    {
      key: 'csStatusNm',
      header: '취소/반품상태',
    },
  ];
  // =====================================================================
  // useCommCd(공통코드 가져오는 함수) 훅을 사용해 주문처리상태 자동 로딩
  // =====================================================================
  const { codes: csStatusOptions } = useCommCd('CS_STATUS');

  // =====================================================================
  // 취소/반품 목록 조회 + 검색 버튼 이벤트
  // =====================================================================
  const fetchCancelReturnList = async () => {
    setLoading(true);
    setError(false);

    try {
      const { list, totalPages } = await selectCancelReturnList({
        orderNo: null, //추후 특정 주문번호로 검색 기능 필요시 수정 필요
        userNo: null, //추후 로그인기능 완성 시 수정 필요!
        csStatus: selected || null, //검색필터의 주문상태 조건
        searchStartDate: searchStartDate || null,
        searchEndDate: searchEndDate || null,
        currentPage: currentPage,
        pageSize: itemsPerPage,
      });

      setCancleReturnList(list); //주문목록 없는 경우 빈배열로 마운트/언마운트 시에만 실행
      setTotalPages(totalPages);
    } catch (err) {
      console.error('주문 조회 실패:', err);
      setError(true);
      setCancleReturnList([]);
    } finally {
      setLoading(false);
    }
  };

  // //useEffect : MyCancelReturn 컴포넌트 및 자식 컴포넌트 랜더링 이후 주문목록 조회(비동기), 최초 진입 + currentPage 변경될 때마다 실행
  useEffect(() => {
    fetchCancelReturnList();
  }, [currentPage, searchTrigger]);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <div className="flex-1 overflow-auto">
        {/* 검색조건 */}
        <MyOrdersSearch
          searchStartDate={searchStartDate}
          setSearchStartDate={setSearchStartDate}
          searchEndDate={searchEndDate}
          setSearchEndDate={setSearchEndDate}
          selected={selected}
          setSelected={setSelected}
          selectBoxLabel="취소/반품 처리 상태"
          selectBoxOption={csStatusOptions}
          onSearch={() => {
            //검색 시 페이지 1로 초기화
            //+ searchTrigger 변경(이미 1페이지인 경우 setCurrentPage는 실행 안되므로 currentPage만 deps로 쓸경우 useEffect 실행 안되기 때문)
            setCurrentPage(1);
            setSearchTrigger((prev) => prev + 1);
          }}
        />

        {/* 주문목록 */}
        {loading ? (
          <div className="py-20 text-center">
            주문내역을 불러오는 중입니다...
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-500">
            주문내역 조회 중 오류가 발생했습니다.
          </div>
        ) : cancleReturnList.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            주문내역이 없습니다.
          </div>
        ) : (
          cancleReturnList.map((cancleReturn) => (
            //주문번호별로 그룹핑
            <MyOrderBlock
              key={cancleReturn.orderNo}
              order={cancleReturn}
              columns={cancelReturnColumns}
            />
          ))
        )}
      </div>

      <div className="border-t pt-4">
        {/* 페이지(최하단에 위치 고정) */}
        <Pagenation
          currentPage={currentPage}
          totalPages={totalPages}
          onchange={(p) => setCurrentPage(p)}
        />
      </div>
    </div>
  );
}
