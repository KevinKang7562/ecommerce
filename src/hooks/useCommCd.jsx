import { useState, useEffect } from 'react';

import api from '../api/axios';

//공통코드 조회 훅함수
// hCd: 조회할 H_CD 값
export const useCommCd = ({ hCd, refCd }) => {
  const [codes, setCodes] = useState([]);

  useEffect(() => {
    if (!hCd) return;

    const fetchCodes = async () => {
      const params = { hCd };
      if (refCd) params.refCd = refCd; //참조 코드는 있는 경우만 추가
      console.log('useCommCd 함수 호출 ' + hCd);

      const response = await api.get('/api/commCd/selectCommCd.do', {
        params,
        meta: { errorType: 'ALERT' },
      });

      // API에서 가져온 서버 응답의 c.dcd, c.dcdNm 을 SelectBox 옵션 형태로 변환
      const options = response.data.data.map((item) => ({
        value: item.dcd,
        label: item.dcdNm,
      }));

      setCodes(options);
      //예외 처리 메세지는 axios.js 인터셉터에서 처리
    };

    fetchCodes();
  }, [hCd, refCd]);

  return { codes };
};
