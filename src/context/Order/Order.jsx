//context : 전역 공유해야할 업무 도메인 + 여러 화면에서 반복사용되는 것을 공유하기 위해 생성

import { createContext, useContext } from 'react';
import { authContext } from '../Auth/Auth';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/api';

//주문 관련 API 담당 context
export const OrderContext = createContext(null);

// Provider의 역할: 하위(감싸진) 컴포넌트들에게 value를 공급하여 Context를 공유
//props.childre 프로퍼티를 구조분해 할당(provider에선 props에서 childern 외엔 불필요)
export default function OrderContextProvider({ children }) {
  const { userToken } = useContext(authContext);

  const headers = {
    token: userToken,
    'Content-Type': 'application/json',
  };

  // =====================================================================
  // 전체 주문 목록 조회
  // =====================================================================
  async function selectOrderList(params) {
    const res = await axios.post(
      `${API_BASE_URL}/api/order/selectOrderList.do`,
      params,
      { headers }
    );
    return {
      list: res.data.data ?? [],
      totalPages: res.data.totalPages ?? 0,
    };
  }

  // =====================================================================
  // 취소/반품 목록 조회
  // =====================================================================
  async function selectCancelReturnList(params) {
    const res = await axios.post(
      `${API_BASE_URL}/api/order/selectCancelReturnList.do`,
      params,
      { headers }
    );

    return {
      list: res.data.data ?? [],
      totalPages: res.data.totalPages ?? 0,
    };
  }

  // =====================================================================
  //주문상세 데이터 조회
  // =====================================================================
  async function selectOrderDetail(orderNo) {
    return await axios
      .get(`${API_BASE_URL}/api/order/selectOrderDetail.do`, {
        params: { orderNo },
        headers,
      })
      .then((res) => res.data.data);
  }

  // =====================================================================
  // 취소 반품 요청
  // =====================================================================
  async function cancelReturnRequest(params) {
    const res = await axios.post(
      `${API_BASE_URL}/api/order/cancelReturnRequest.do`,
      params,
      { headers }
    );

    if (!res.data || res.data.code !== 'OK') {
      throw new Error('취소/반품 요청 실패');
    }

    return res.data;
  }
  return (
    <OrderContext.Provider
      value={{
        selectOrderList,
        selectCancelReturnList,
        selectOrderDetail,
        cancelReturnRequest,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}
