import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

//공통코드 조회 훅함수
// hCd: 조회할 H_CD 값
export const useCommCd = (hCd) => {
  const [codes, setCodes] = useState([]);
  // const [loading, setLoading] = useState(false); // 로딩 UI 필요하면 사용
  // const [error, setError] = useState(null);      // 에러 UI 필요하면 사용

  useEffect(() => {
    if (!hCd) return;

    const fetchCodes = async () => {
      // setLoading(true);
      const url = `${API_BASE_URL}/api/commCd/selectCommCd.do`;
      console.log('useCommCd 함수 호출 ' + hCd);
      try {
        const response = await axios.get(url, {
          params: { hCd },
          // withCredentials: true,//공통코드 조회는 로그인 불필요하므로 쿠키 전송할 필요 없음
        });

        // API에서 가져온 서버 응답의 c.dcd, c.dcdNm 을 SelectBox 옵션 형태로 변환
        const options = response.data.data.map((item) => ({
          value: item.dcd,
          label: item.dcdNm,
        }));

        setCodes(options);
      } catch (err) {
        console.error('공통코드 조회 실패:', err);
        // setError(err);
      } finally {
        // setLoading(false);
      }
    };

    fetchCodes();
  }, [hCd]);

  return { codes };
  // return { codes, loading, error }; // 로딩 UI 필요할 때 사용
};
