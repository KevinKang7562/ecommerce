import { createContext } from 'react';
import api from '../../api/axios';
import { list } from 'postcss';

//1:1문의 관련 api 담당 context
export const MyInquiryContext = createContext(null);

export default function MyInquiryContextProvider({ children }) {
  // =====================================================================
  // 1:1 문의 목록 조회
  // =====================================================================
  async function selectMyInquiryList(params) {
    console.log(params);
    const res = await api.post('/api/inquiry/selectMyInquiryList.do', params, {
      meta: { errorType: 'INLINE' },
    });
    return {
      list: res.data.data ?? [],
      totalPages: res.data.totalPages ?? 0,
    };
  }

  // =====================================================================
  // 1:1 문의 상세 데이터 조회
  // =====================================================================

  async function selectMyInquiryDetail(inquiryNo) {
    console.log('상세조회', inquiryNo);
    return await api
      .get(
        `/api/inquiry/selectMyInquiryDetail.do/${inquiryNo}`,

        {
          meta: { errorType: 'INLINE' },
        },
      )
      .then((res) => res.data.data);
  }

  // =====================================================================
  // 1:1 문의 등록
  // =====================================================================
  async function saveMyInquiry(formData) {
    const res = await api.post('/api/inquiry/saveMyInquiry.do', formData, {
      meta: { errorType: 'ALERT' },
    });

    return res.data;
  }

  // =====================================================================
  // 1:1 문의 삭제 (논리 삭제)
  // =====================================================================
  async function deleteMyInquiry(inquiryNo) {
    console.log('삭제요청', inquiryNo);
    // 컨트롤러가 @RequestBody MyInquiryDto를 받으므로 객체 형태로 전달
    const res = await api.post(
      '/api/inquiry/deleteMyInquiry.do',
      { inquiryNo },
      {
        meta: { errorType: 'ALERT' },
      },
    );
    return res.data;
  }

  // =====================================================================
  // 1:1 문의 수정
  // =====================================================================
  async function updateMyInquiry(formData) {
    const res = await api.post('/api/inquiry/updateMyInquiry.do', formData, {
      meta: { errorType: 'ALERT' },
      // headers: { 'Content-Type': 'multipart/form-data' }, // 명시적 지정
    });

    return res.data;
  }

  // =====================================================================
  // 상품 Q&A문의 목록 조회
  // =====================================================================

  async function selectMyProductQnAList(params) {
    console.log('selectMyProductQnAList');
    const res = await api.post(
      '/api/inquiry/selectMyProductQnAList.do',
      params,
      {
        meta: { errorType: 'INLINE' },
      },
    );

    return {
      list: res.data.data ?? [],
      totalPages: res.data.totalPages ?? 0,
    };
  }
  return (
    <MyInquiryContext.Provider
      value={{
        selectMyInquiryList,
        selectMyInquiryDetail,
        saveMyInquiry,
        deleteMyInquiry,
        updateMyInquiry,
        selectMyProductQnAList,
      }}
    >
      {children}
    </MyInquiryContext.Provider>
  );
}
