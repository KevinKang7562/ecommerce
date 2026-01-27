//context : 전역 공유해야할 업무 도메인 + 여러 화면에서 반복사용되는 것을 공유하기 위해 생성

import { createContext, useContext } from 'react';
import { authContext } from '../Auth/Auth';
// import axios from 'axios';
// import { API_BASE_URL } from '../../constants/api';
import api from '../../api/axios';

//주문 관련 API 담당 context
export const OrderContext = createContext(null);

// Provider의 역할: 하위(감싸진) 컴포넌트들에게 value를 공급하여 Context를 공유
//props.children 프로퍼티를 구조분해 할당(provider에선 props에서 childern 외엔 불필요)
export default function OrderContextProvider({ children }) {
  // const { userToken } = useContext(authContext);

  // const headers = {
  //   token: userToken,
  //   'Content-Type': 'application/json',
  // };

  // =====================================================================
  // 전체 주문 목록 조회
  // =====================================================================
  async function selectOrderList(params) {
    const res = await api.post('/api/order/selectOrderList.do', params, {
      meta: { errorType: 'INLINE' },
    });
    return {
      list: res.data.data ?? [],
      totalPages: res.data.totalPages ?? 0,
    };
  }

  // =====================================================================
  // 취소/반품 목록 조회
  // =====================================================================
  async function selectCancelReturnList(params) {
    const res = await api.post('/api/order/selectCancelReturnList.do', params, {
      meta: { errorType: 'INLINE' },
    });

    return {
      list: res.data.data ?? [],
      totalPages: res.data.totalPages ?? 0,
    };
  }

  // =====================================================================
  //주문상세 데이터 조회
  // =====================================================================
  async function selectOrderDetail(orderNo) {
    return await api
      .get(`/api/order/selectOrderDetail.do/${orderNo}`, {
        meta: { errorType: 'INLINE' },
      })
      .then((res) => res.data.data);
  }

  // =====================================================================
  // 취소 반품 요청
  // =====================================================================
  async function requestCancelReturn(params) {
    const res = await api.post('/api/order/requestCancelReturn.do', params, {
      meta: { errorType: 'ALERT' },
    });

    return res.data;
  }

  // =====================================================================
  // 구매 확정 요청
  // =====================================================================
  async function requestPurchaseConfirm(itemOrderNo) {
    if (itemOrderNo == null || itemOrderNo === '')
      throw new Error('선택된 상품이 없습니다.');
    const res = await api.patch(
      `/api/order/requestPurchaseConfirm.do/${itemOrderNo}`,
      { meta: { errorType: 'ALERT' } },
    );

    return res.data;
  }

  // // =====================================================================
  // // 리뷰 등록
  // // =====================================================================
  // async function submitReview(formData) {
  //   console.log('리뷰등록 컨텍스트', formData);
  //   const res = await axios.post(
  //     `${API_BASE_URL}/api/order/saveReview.do`,
  //     formData,
  //     {
  //       headers: {
  //         token: userToken, // ⚠️ JSON 헤더 쓰면 안 됨
  //       },
  //     },
  //   );
  //   if (!res.data || res.data.code !== 'OK') {
  //     throw new Error('리뷰 등록 실패');
  //   }
  //   return res.data;
  // }
  // // =====================================================================
  // // 리뷰 수정
  // // =====================================================================
  // async function updateReview(formData) {
  //   console.log('리뷰수정 컨텍스트', formData);
  //   formData.forEach((value, key) => {
  //     if (value instanceof File) {
  //       console.log(key, value.name, value.size, value.type);
  //     } else {
  //       console.log(key, value);
  //     }
  //   });

  //   const res = await axios.post(
  //     `${API_BASE_URL}/api/order/updateReview.do`,
  //     formData,
  //     {
  //       headers: {
  //         token: userToken, // ⚠️ JSON 헤더 쓰면 안 됨
  //         // 'Content-Type': 'multipart/form-data',
  //       },
  //     },
  //   );
  //   if (!res.data || res.data.code !== 'OK') {
  //     throw new Error('리뷰 등록 실패');
  //   }
  //   return res.data;
  // }
  return (
    <OrderContext.Provider
      value={{
        selectOrderList,
        selectCancelReturnList,
        selectOrderDetail,
        requestCancelReturn,
        requestPurchaseConfirm,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}
