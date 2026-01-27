import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CommonTable from '../../../components/MyPageCommon/Common/CommonTable';
import InfoSection from '../../../components/MyPageCommon/Common/InfoSection';
import SelectBox from '../../../components/MyPageCommon/Common/SelectBox';
import MyButton from '../../../components/MyPageCommon/Common/MyButton';
import { useCommCd } from '../../../hooks/useCommCd';
import { useEffect, useState, useContext } from 'react';
import { OrderContext } from '../../../context/Order/Order';

export default function CancelReturnRequest() {
  // 주문 번호 파라미터
  const { orderNo } = useParams();

  //api 호출은 context 이용
  const { selectOrderDetail, requestCancelReturn } = useContext(OrderContext);

  // =====================================================================
  // 상태
  // =====================================================================
  const [loading, setLoading] = useState(false); //로딩표시
  //   const [error, setError] = useState(false); //에러표시
  const [orderInfo, setOrderInfo] = useState(null); //주문메타정보
  const [productitems, setProductitems] = useState([]); //주문상품별 정보
  const [selectedCsReason, setSelectedCsReason] = useState(''); //취소/반품사유

  const [loadError, setLoadError] = useState(false); // 최초 조회 실패
  const [loadErrorMessage, setLoadErrorMessage] = useState(''); //조회 실패시 서버 메시지 표시용
  const [requestError, setRequestError] = useState(false); // 요청 실패
  const [requestErrorMessage, setRequestErrorMessage] = useState(''); //요청 실패시 서버 메시지 표시용

  // =====================================================================
  // 페이지이동 및 정보
  // =====================================================================
  const navigate = useNavigate(); //페이지 이동 훅(이벤트 발생)
  const goToOrderList = () => {
    // navigate('/mypage/myAllOrders');
    navigate(-2);
  };

  const location = useLocation(); //현재 url, state 등 위치 정보 조회 훅(렌더링/조건 판단)
  const cancelReturnType = location.state?.cancelReturnType;
  //취소/반품 여부 확인(코드-> 화면표시용 매핑 객체, [key]로 접근)
  const csTitle = {
    CANCEL: '취소',
    RETURN: '반품',
  };

  // =====================================================================
  // 취소/반품사유 셀렉트박스 공통코드 조회 훅
  // =====================================================================
  const { codes: csReasonOption } = useCommCd('CS_REASON');

  // =====================================================================
  // 취소/반품 체크박스
  // =====================================================================

  //체크박스 변경 핸들러
  const handleCsCheckChange = (rowKey, checked) => {
    setProductitems((prev) =>
      prev.map((item) => {
        if (item.rowKey !== rowKey) return item;

        const qty = checked ? item.newCsReqQty : 1; // 기본 1
        const price = Number(item.itemPrice);
        const reqAmt = checked ? price * qty : 0;

        return {
          ...item,
          csChecked: checked,
          newCsReqQty: qty,
          csRequestAmt: reqAmt,
        };
      }),
    );
  };

  //취소/반품 요청 수량 변경 핸들러
  const handleNewCsReqQtyChange = (rowKey, newCsReqQty) => {
    setProductitems((prev) => {
      console.log('수량 변경 전:', prev);
      const next = prev.map((item) => {
        if (item.rowKey !== rowKey) return item;

        const qty = Number(newCsReqQty);
        const price = Number(item.itemPrice);

        return {
          ...item,
          newCsReqQty: qty,
          csRequestAmt: price * qty,
        };
      });
      console.log('수량 변경 후:', next);
      return next;
    });
  };

  // =====================================================================
  //취소/반품 상품 선택에 따른 취소정보 계산
  // =====================================================================
  const selectedItems = productitems.filter((item) => item.csChecked);

  const totalNewCsReqQty = selectedItems.reduce(
    (sum, item) => sum + item.newCsReqQty,
    0,
  );

  const totalCsReqAmt = selectedItems.reduce((sum, item) => {
    //상품 단가 = 상품별 총금액 / 주문수량
    // const unitPrice = item.totalPrice / item.quantity;
    return sum + item.itemPrice * item.newCsReqQty;
  }, 0);

  //반품 배송비 = 임시로 기본 반품비 3000원 설정
  const returnFee =
    cancelReturnType === 'RETURN' && selectedItems.length > 0 ? 3000 : 0;

  const reqRefundTotal = totalCsReqAmt - returnFee;

  const csInfo = [
    {
      label: `${csTitle[cancelReturnType]}수량`,
      value: totalNewCsReqQty,
    },
    {
      label: `${csTitle[cancelReturnType]} 요청 금액`,
      value: `${totalCsReqAmt.toLocaleString()}원`,
    },
    ...(cancelReturnType === 'RETURN' //스프레드 연산자로 '반품'인 경우만 반품배송비 배열 추가
      ? [
          {
            label: '반품 배송비',
            value: `${returnFee.toLocaleString()}원`,
          },
        ]
      : []),
    {
      label: '환불금액',
      value: `${reqRefundTotal.toLocaleString()}원`,
    },
  ];

  //주문상품 목록 테이블 컬럼
  const orderProductColumns = [
    {
      key: 'csSelect',
      header: '선택',
      render: (_, row) => {
        //체크박스 활성화 여부 확인 (orderStatus가 주문완료/배송완료인 경우만 활성화 + 이미 취소/반품신청한 경우 비활성화)
        const isEnabled = row.canCheckYn === 'Y' ? true : false;
        return (
          <input
            type="checkbox"
            className={`w-4 h-4
                        ${
                          !isEnabled
                            ? 'opacity-40 cursor-not-allowed'
                            : 'cursor-pointer'
                        }`}
            checked={row.csChecked}
            disabled={!isEnabled}
            onChange={(e) => handleCsCheckChange(row.rowKey, e.target.checked)}
          />
        );
      },
    },
    {
      key: 'imgUrl',
      header: '상품이미지',
      render: (v) => <img src={v} className="w-24 h-24 object-cover-16" />,
    },
    {
      key: 'productInfo',
      header: '상품정보',
      render: (_, row) => {
        // const csEnableQty = getRemainQty(row);
        console.log('단가', row.itemPrice);
        const csEnableQty = row.remainQty;
        return (
          <div className="text-start flex flex-col gap-1 min-w-[200px]">
            <div className="text-sm text-gray-600">
              상품주문번호 : {row.itemOrderNo}
            </div>
            <div className="font-medium">{row.prodNm}</div>
            <div className="text-sm text-gray-600">
              수량/옵션 : {row.optionInfo}
            </div>

            <div className="text-sm font-semibold">
              {/* 상품별 총금액 (구매단가-할인금액+옵션추가금)*수량)*/}
              {row.csAppliedAmt?.toLocaleString()}원
            </div>

            {/* 체크박스 체크 + 상품 수량 2개이상인 경우 수량 선택 셀렉트박스 노출 */}
            {row.csChecked && row.remainQty > 1 && (
              <div className="mt-1">
                <span>수량 선택 : </span>
                <select
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                  value={row.newCsReqQty}
                  onChange={(e) =>
                    handleNewCsReqQtyChange(row.rowKey, e.target.value)
                  }
                >
                  {Array.from({ length: csEnableQty }, (_, i) => i + 1).map(
                    (qty) => (
                      <option key={qty} value={qty}>
                        {qty}개
                      </option>
                    ),
                  )}
                </select>
              </div>
            )}
          </div>
        );
      },
    },
    { key: 'displayStatusNm', header: '주문처리상태' },
    {
      key: 'csStatusNm',
      header: '취소/반품상태',
    },
  ];

  // =====================================================================
  // 취소/반품 요청
  // =====================================================================
  //취소/반품 상품 선택 + 사유 선택
  const isRequestDisabled = !selectedCsReason || selectedItems.length === 0;

  const handleCancelRefundRequest = async () => {
    if (!orderInfo?.order) return;
    const { order } = orderInfo; //이벤트 핸들러 발동되는 시점에 orderInfo 객체 상태 검증
    const params = {
      orderNo,
      payNo: order.payNo,
      csType: cancelReturnType,
      csReason: selectedCsReason,
      refundTotal: reqRefundTotal,
      items: selectedItems.map((item) => ({
        itemOrderNo: item.itemOrderNo,
        requestQty: item.newCsReqQty,
        csRequestAmt: item.csRequestAmt,
      })),
    };
    console.log('파라미터 : ', params);
    const confirmed = window.confirm(
      `${csTitle[cancelReturnType]} 요청을 진행하시겠습니까?`,
    );

    if (!confirmed) {
      return; // 사용자가 취소를 누르면 여기서 종료
    }
    setLoading(true);
    setRequestError(false);
    setRequestErrorMessage('');

    try {
      await requestCancelReturn(params);

      alert(`${csTitle[cancelReturnType]} 요청이 완료되었습니다.`);
      navigate(-1);
    } catch (error) {
      console.error(`주문 ${csTitle[cancelReturnType]} 실패 : `, error);

      setRequestError(true);
      setRequestErrorMessage(
        error.response?.data?.message ??
          `${csTitle[cancelReturnType]} 요청 중 오류가 발생했습니다.`,
      ); //서버 메시지 표시
    } finally {
      setLoading(false);
    }
  };
  // =====================================================================
  //주문상세 데이터 조회
  // =====================================================================
  const fetchOrderDetail = async () => {
    setLoading(true);
    setLoadError(false);
    setLoadErrorMessage('');

    try {
      const resData = await selectOrderDetail(orderNo);

      console.log('주문상세 : ', resData);

      //주문 메타 정보
      setOrderInfo({
        order: {
          orderNo: resData.orderNo,
          payNo: resData.payNo,
          orderDate: resData.orderDate,
          canCancelYn: resData.canCancelYn,
          canReturnYn: resData.canReturnYn,
        },
      });

      //상품목록
      setProductitems(
        (resData.items ?? []).map((item) => ({
          ...item,
          csChecked: false, //체크박스 초기상태
          newCsReqQty: 1, //취소/반품 기본 선택 수량
          csRequestAmt: 0,
        })),
      );
    } catch (err) {
      console.error('주문상세 조회 실패 : ', err);
      setLoadError(true);
      setLoadErrorMessage(
        err.response?.data?.message ?? '주문 정보를 불러오지 못했습니다.',
      );
      setOrderInfo(null);
      setProductitems([]);
    } finally {
      setLoading(false); //로딩완료
    }
  };

  useEffect(() => {
    fetchOrderDetail(orderNo);
  }, [orderNo]);

  // =====================================================================
  //조건부 랜더링(데이터 조회 전 orderInfo 구조분해 실행으로 인한 에러발생 방지하기 위해 초기 랜더링 시 구조분해 전에 return으로 함수 조기 종료)
  // =====================================================================
  if (loading) {
    return <div className="py-20 text-center">로딩중...</div>;
  }
  if (loadError) {
    return (
      <div className="py-20 text-center text-red-500">{loadErrorMessage}</div>
    );
  }
  if (!orderInfo) {
    return <div className="py-20 text-center">주문 정보 없음</div>;
  }

  // =====================================================================
  //데이터 가공
  // =====================================================================
  //주문정보 구조분해(jsx 화면 랜더링을 위한 데이터 접근)
  //(반드시 조건부 랜더링 아래 위치해야 함
  //데이터 조회 전 초기 랜더링 시 orderInfo = null로 인해 구조분해 단계에서 에러 발생 방지하기 위함)
  const { order } = orderInfo;

  return (
    <div className="w-full">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 border-b pb-5">
        {csTitle[cancelReturnType]} 요청
      </h1>

      {/* 🔧 FIX: 요청 실패 메시지 표시 */}
      {requestError && (
        <div className="mb-4 text-center text-red-500">
          {csTitle[cancelReturnType]}요청 실패 : {requestErrorMessage}
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div className="w-full">
          <div className="mb-3">
            <span className="mr-10 font-semibold">{order.orderDate}</span>
            <span className="mr-6 text-gray-500">
              주문번호 : {order.orderNo}
            </span>
          </div>
          <CommonTable columns={orderProductColumns} data={productitems} />
        </div>

        <div className="flex flex-col lg:flex-row gap-5 lg:gap-x-12 lg:pt-12 sm:pt-5">
          <div className="lg:w-2/5 px-5">
            <SelectBox
              label={`${csTitle[cancelReturnType]} 사유`}
              value={selectedCsReason}
              options={[{ value: '', label: '사유 선택' }, ...csReasonOption]}
              onChange={(e) => setSelectedCsReason(e.target.value)}
            ></SelectBox>
          </div>
          <div className="lg:w-3/5 px-5 pt-5 lg:pt-0">
            <InfoSection
              title={`${csTitle[cancelReturnType]} 정보`}
              items={csInfo}
            />
          </div>
        </div>

        <div className="w-full  flex justify-center gap-10">
          <MyButton
            onClick={handleCancelRefundRequest}
            disabled={isRequestDisabled}
            className="w-full sm:w-auto"
          >
            {`${csTitle[cancelReturnType]}요청`}
          </MyButton>
          <MyButton onClick={goToOrderList}>주문목록</MyButton>
        </div>
      </div>
    </div>
  );
}
