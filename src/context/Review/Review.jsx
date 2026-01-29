import { createContext, useContext } from 'react';
// import { authContext } from '../Auth/Auth';
// import { API_BASE_URL } from '../../constants/api';
// import axios from 'axios';
import api from '../../api/axios';

//리뷰 관련 api 담당 context
export const ReviewContext = createContext(null);

export default function ReviewContextProvider({ children }) {
  // const { userToken } = useContext(authContext);

  // const headers = {
  //   token: userToken,
  //   'Content-type': 'application/json',
  // };

  // =====================================================================
  // 주문 상품 및 리뷰 조회
  // =====================================================================
  async function selectOrderItemReview(itemOrderNo) {
    // return await axios
    //   .get(
    //     `${API_BASE_URL}/api/review/selectOrderItemReview.do/${itemOrderNo}`,
    //     { headers },
    //   )
    return await api
      .get(`/api/review/selectOrderItemReview.do/${itemOrderNo}`, {
        meta: { errorType: 'INLINE' },
      })
      .then((res) => res.data.data);
  }

  // =====================================================================
  // 리뷰 등록
  // =====================================================================
  async function saveReview(formData) {
    console.log('리뷰등록 컨텍스트', formData instanceof FormData); // 폼데이터 형식인지 확인, 반드시 true여야 함
    formData.forEach((value, key) => {
      //폼데이터 로그 확인용
      if (value instanceof File) {
        console.log(key, value.name, value.size, value.type);
      } else {
        console.log(key, value);
      }
    });

    // const res = await axios.post(
    //   `${API_BASE_URL}/api/order/saveReview.do`,
    //   formData,
    //   {
    //     headers: {
    //       token: userToken, // ⚠️ JSON 헤더 쓰면 안 됨
    //     },
    //   },
    // );
    const res = await api.post('/api/review/saveReview.do', formData, {
      meta: { errorType: 'ALERT' },
    });

    return res.data;
  }
  // =====================================================================
  // 리뷰 수정
  // =====================================================================
  async function updateReview(formData) {
    formData.forEach((value, key) => {
      //폼데이터 로그 확인용
      if (value instanceof File) {
        console.log(key, value.name, value.size, value.type);
      } else {
        console.log(key, value);
      }
    });

    console.log(formData instanceof FormData); // 폼데이터 형식인지 확인, 반드시 true여야 함

    // const res = await axios.post(
    //   `${API_BASE_URL}/api/order/updateReview.do`,
    //   formData,
    //   {
    //     headers: {
    //       token: userToken, //formData는 json 헤더 쓰면 안됨
    //     },
    //   },
    // );
    const res = await api.post('/api/review/updateReview.do', formData, {
      meta: { errorType: 'ALERT' },
    });

    return res.data;
  }

  return (
    <ReviewContext.Provider
      value={{
        selectOrderItemReview,
        saveReview,
        updateReview,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}
