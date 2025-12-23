import SelectBox from '../Common/SelectBox';
import { useCommCd } from '../../../hooks/useCommCd';

//마이페이지 검색 필터
//부모 컴포넌트로부터 상태관리함수 및 검색 버튼 이벤트 전달받음(단반향 데이터 통신이기 때문)
function MyOrdersSearch({
  selected,
  setSelected,
  searchStartDate,
  setSearchStartDate,
  searchEndDate,
  setSearchEndDate,
  onSearch,
}) {
  // =====================================================================
  // useCommCd(공통코드 가져오는 함수) 훅을 사용해 주문처리상태 자동 로딩
  // =====================================================================
  const { codes: statusOptions } = useCommCd('ORDER_STATUS');

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  // =====================================================================
  // 빠른 기간 버튼 이벤트 핸들러
  // =====================================================================
  const setQuickPeriod = (months) => {
    const today = new Date();

    // 종료일 = 오늘
    const endDate = formatDate(today);

    // 시작일 계산
    const start = new Date(today);
    start.setMonth(start.getMonth() - months);

    const startDate = formatDate(start);

    setSearchStartDate(startDate);
    setSearchEndDate(endDate);
    console.log(startDate, endDate);
  };
  return (
    <>
      <div className="border border-gray-300 rounded-md px-4 sm:px-6 py-6 sm:py-8 mb-8 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-16">
          {/* 주문일 */}
          <div className="flex flex-col gap-3">
            <label className="text-base font-medium ">주문일</label>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              {/* 빠른 기간 */}
              <div className="flex flex-nowrap gap-1  whitespace-nowrap">
                <button
                  className="px-3 py-1 border rounded text-sm sm:text-base "
                  onClick={() => setQuickPeriod(0)}
                >
                  오늘
                </button>
                <button
                  className="px-3 py-1 border rounded text-sm sm:text-base "
                  onClick={() => setQuickPeriod(1)}
                >
                  1개월
                </button>
                <button
                  className="px-3 py-1 border rounded text-sm sm:text-base "
                  onClick={() => setQuickPeriod(3)}
                >
                  3개월
                </button>
                <button
                  className="px-3 py-1 border rounded text-sm sm:text-base "
                  onClick={() => setQuickPeriod(6)}
                >
                  6개월
                </button>
              </div>

              {/* 날짜 */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="border rounded px-2 py-1 text-sm sm:text-base"
                  value={searchStartDate}
                  onChange={(e) => setSearchStartDate(e.target.value)}
                />
                <span className="text-sm">~</span>
                <input
                  type="date"
                  className="border rounded px-2 py-1 text-sm sm:text-base"
                  value={searchEndDate}
                  onChange={(e) => setSearchEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 주문상태 셀렉트박스 */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <SelectBox
              label="주문처리상태"
              value={selected}
              options={[{ value: '', label: '전체' }, ...statusOptions]}
              onChange={(e) => setSelected(e.target.value)}
            />
          </div>

          {/* 검색 버튼 */}
          <button
            className="w-full sm:w-auto px-6 py-2 bg-black text-white rounded"
            onClick={onSearch}
          >
            검색
          </button>
        </div>
      </div>
    </>
  );
}

export default MyOrdersSearch;
