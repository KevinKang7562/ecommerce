import SelectBox from '../Common/SelectBox';
import MyButton from '../Common/MyButton';

//마이페이지 검색 필터
//부모 컴포넌트로부터 상태관리함수 및 검색 버튼 이벤트 전달받음(단반향 데이터 통신이기 때문)
export default function MyOrdersSearch({
  searchStartDate,
  setSearchStartDate,
  searchEndDate,
  setSearchEndDate,
  selectBoxLabel,
  selectBoxOption,
  selected,
  setSelected,
  onSearch,
}) {
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
        {/* 💡 1. lg:flex-wrap 추가: 화면이 좁아질 때 검색 버튼이 잘리지 않고 다음 줄로 넘어가도록 함 */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-16 lg:flex-wrap">
          {/* 주문일 */}
          <div className="flex flex-col gap-3">
            <label className="text-base font-medium ">주문일</label>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              {/* 빠른 기간 */}
              {/* 💡 2. flex-nowrap 제거 -> flex-wrap 적용: 모바일에서 버튼들이 화면 밖으로 튀어나가지 않음 */}
              <div className="flex flex-wrap gap-1">
                <MyButton onClick={() => setQuickPeriod(0)}>오늘</MyButton>
                <MyButton onClick={() => setQuickPeriod(1)}>1개월</MyButton>
                <MyButton onClick={() => setQuickPeriod(3)}>3개월</MyButton>
                <MyButton onClick={() => setQuickPeriod(6)}>6개월</MyButton>
              </div>

              {/* 날짜 */}
              <div className="flex items-center gap-2">
                {/* 💡 3. w-full을 추가하여 좁은 화면에서도 화면 바깥으로 뚫고 나가지 않도록 제한 */}
                <input
                  type="date"
                  className="border rounded px-2 py-1 text-sm sm:text-base w-full"
                  value={searchStartDate}
                  onChange={(e) => setSearchStartDate(e.target.value)}
                />
                <span className="text-sm">~</span>
                <input
                  type="date"
                  className="border rounded px-2 py-1 text-sm sm:text-base w-full"
                  value={searchEndDate}
                  onChange={(e) => setSearchEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 주문상태 셀렉트박스 */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <SelectBox
              label={selectBoxLabel}
              value={selected}
              options={[{ value: '', label: '전체' }, ...selectBoxOption]}
              onChange={(e) => setSelected(e.target.value)}
            />
          </div>

          {/* 검색 버튼 */}
          <button
            className="w-full sm:w-auto px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800 break-keep"
            onClick={onSearch}
          >
            검색
          </button>
        </div>
      </div>
    </>
  );
}
