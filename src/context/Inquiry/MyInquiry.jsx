import { createContext } from 'react';
import api from '../../api/axios';

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

  async function saveMyInquiry(formData) {
    const res = await api.post('/api/inquiry/saveMyInquiry.do', formData, {
      meta: { errorType: 'ALERT' },
    });

    return res.data;
  }
  return (
    <MyInquiryContext.Provider
      value={{
        selectMyInquiryList,
        saveMyInquiry,
      }}
    >
      {children}
    </MyInquiryContext.Provider>
  );
}
