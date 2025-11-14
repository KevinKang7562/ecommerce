//마이페이지 사이드바
import { NavLink } from 'react-router-dom';
import { myPageMenus } from './menuData';

export default function MyPageSidebar() {
  const linkStyle =
    'block py-3 px-4 rounded-md transition-all duration-150 hover:bg-green-100';

  const activeStyle = 'bg-green-700 text-white hover:bg-green-700'; //현재 메뉴

  return (
    <aside className="w-80 bg-white border-r border-gray-200 p-10 fixed left-0 top-0 h-full shadow-lg flex flex-col">
      {/* 사이드바 제목 */}
      <h2 className="text-xl font-bold mb-6 text-center">마이페이지</h2>
      {/* 메뉴(메뉴명은 menuData.js파일에서 관리) */}
      <nav className="flex-1 space-y-4 mt-2">
        {myPageMenus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            end
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
