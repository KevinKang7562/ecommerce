//마이페이지 사이드바
import { NavLink } from 'react-router-dom';
import { myPageMenus } from './menuData';

export default function MyPageSidebar() {
  // 💡 메뉴 클릭 시 세션 스토리지를 초기화하는 함수
  const handleMenuClick = () => {
    // 삭제할 키 목록 (전체 주문, 취소/반품, 1:1 문의 관련)
    const keysToRemove = [
      'order_page',
      'order_status',
      'order_start',
      'order_end', //
      'cs_page',
      'cs_status',
      'cs_start',
      'cs_end', //
      'inquiry_page', //
    ];

    // 스토리지에서 각 키 삭제
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));

    // 모바일 환경에서 사이드바를 닫아주는 부모의 함수 호출 (MyPageLayout에서 전달됨)
    // if (onSelect) {
    //   onSelect(); //
    // }
  };

  const linkStyle =
    'block py-3 px-4 rounded-md transition-all duration-150 hover:bg-green-100'; //기본 스타일

  const activeStyle = 'bg-green-700 text-white hover:bg-green-700'; //현재 메뉴

  return (
    <aside className="w-full bg-white border-r border-gray-200 p-10 left-0 top-0 h-full shadow-lg flex flex-col">
      {/* 사이드바 제목 */}
      <h2 className="text-xl font-bold mb-6 text-center">마이페이지</h2>
      {/* 메뉴(메뉴명은 menuData.js파일에서 관리) */}
      <nav className="flex-1 space-y-4 mt-2">
        {myPageMenus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            end
            // 💡 클릭 시 스토리지 초기화 로직 실행
            onClick={handleMenuClick}
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? activeStyle : 'text-gray-700'}`
            }
          >
            {menu.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
