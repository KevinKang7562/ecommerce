//마이페이지 사이드바
// export default function MyPageSidebar() {}
// import { NavLink } from 'react-router-dom';

// const MyPageSidebar = () => {
//   const linkStyle =
//     'block py-2 px-3 rounded-md transition-all duration-150 hover:bg-green-100';
//   const activeStyle = 'bg-green-700 text-white hover:bg-green-700';

//   return (
//     <aside className="w-64 bg-white border-r border-gray-200 p-4">
//       <h2 className="text-lg font-semibold mb-4">마이페이지</h2>
//       <nav className="space-y-1">
//         {/* 회원정보 수정 */}
//         <NavLink
//           to="/mypage"
//           end
//           className={({ isActive }) =>
//             `${linkStyle} ${isActive ? activeStyle : 'text-gray-700'}`
//           }
//         >
//           회원정보 수정
//         </NavLink>

//         {/* 주문내역 */}
//         <div>
//           <p className="mt-3 mb-1 text-sm font-semibold text-gray-500">
//             주문내역
//           </p>
//           <div className="pl-3 space-y-1">
//             <NavLink
//               to="/mypage/myAllOrders"
//               className={({ isActive }) =>
//                 `${linkStyle} ${isActive ? activeStyle : 'text-gray-700'}`
//               }
//             >
//               전체 주문내역
//             </NavLink>
//             <NavLink
//               to="/mypage/myCancelReturn"
//               className={({ isActive }) =>
//                 `${linkStyle} ${isActive ? activeStyle : 'text-gray-700'}`
//               }
//             >
//               취소/반품내역
//             </NavLink>
//           </div>
//         </div>

//         {/* 문의내역 */}
//         <div>
//           <p className="mt-3 mb-1 text-sm font-semibold text-gray-500">
//             문의내역
//           </p>
//           <div className="pl-3 space-y-1">
//             <NavLink
//               to="/mypage/myProductQnA"
//               className={({ isActive }) =>
//                 `${linkStyle} ${isActive ? activeStyle : 'text-gray-700'}`
//               }
//             >
//               상품 Q&A
//             </NavLink>
//             <NavLink
//               to="/mypage/myPersonalInquiry"
//               className={({ isActive }) =>
//                 `${linkStyle} ${isActive ? activeStyle : 'text-gray-700'}`
//               }
//             >
//               1:1 문의
//             </NavLink>
//           </div>
//         </div>
//       </nav>
//     </aside>
//   );
// };

// export default MyPageSidebar;

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
