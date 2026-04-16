import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function TitleManager() {
  const location = useLocation();

  useEffect(() => {
    // 1. 여기에 주소(경로)별로 원하는 탭 제목을 딕셔너리로 쭉 적어둡니다.
    //    key: 주소(경로), value: 탭 제목
    // 경로 고정된 정적 페이지만 가능(동적 경로는 각 페이지에서 Helmet으로 별도 관리 필요)
    const pageTitles = {
      '/': 'Home',
      '/login': '로그인',
      '/register': '회원가입',
      '/cart': '장바구니',

      '/mypage': '마이페이지',
      '/brands': '브랜드',
      '/categories': '카테고리',
      '/event': '이벤트',
      '/board': '공지사항',
      '/forgotPassword': '비밀번호 찾기',
      '/forgotPassword/verifyCode/resetPassword': '비밀번호 재설정',
    };

    // 2. 현재 주소에 맞는 제목을 찾습니다. (목록에 없으면 기본값 'FreshCart' 사용)
    const currentTitle = pageTitles[location.pathname] || '쇼핑몰';

    // 3. 브라우저 탭 제목을 업데이트합니다.
    document.title = currentTitle;
  }, [location.pathname]); // 주소가 바뀔 때마다 이 코드가 실행됨

  // 화면에 그릴 UI는 없으므로 null을 반환합니다 (투명 컴포넌트)
  return null;
}
