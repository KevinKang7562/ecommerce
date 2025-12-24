import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

//공통코드 조회 훅함수
// hCd: 조회할 H_CD 값
export const useCommCd = (hCd) => {
  const [codes, setCodes] = useState([]);

  useEffect(() => {
    if (!hCd) return;

    const fetchCodes = async () => {
      // setLoading(true);
      const url = `${API_BASE_URL}/api/commCd/selectCommCd.do`;
      console.log('useCommCd 함수 호출 ' + hCd);
      try {
        const response = await axios.get(url, {
          params: { hCd },
        });

        // API에서 가져온 서버 응답의 c.dcd, c.dcdNm 을 SelectBox 옵션 형태로 변환
        const options = response.data.data.map((item) => ({
          value: item.dcd,
          label: item.dcdNm,
        }));

        setCodes(options);
      } catch (err) {
        console.error('공통코드 조회 실패:', err);
      }
    };

    fetchCodes();
  }, [hCd]);

  return { codes };
};
