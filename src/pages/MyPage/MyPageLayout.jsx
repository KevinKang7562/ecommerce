//마이페이지 기본 레이아웃
// import { Offline } from 'react-detect-offline';
// import { Outlet } from 'react-router-dom';
// import MyPageSidebar from './MyPageSidebar';

// export default function MyPageLayout() {
//   return (
//     <div className="flex flex-col min-h-screen">
//       <Offline>
//         <p className="w-fit font-bold bg-red-500 rounded-lg text-white text-center p-2 fixed bottom-5 right-5 z-10">
//           인터넷 연결이 끊어졌습니다. 네트워크를 확인해주세요.
//         </p>
//       </Offline>
//       <div className="flex min-h-screen bg-gray-50">
//         {/* 왼쪽 사이드바 */}
//         <MyPageSidebar />

//         {/* 오른쪽 본문 영역 */}
//         <main className="flex-1 p-6">
//           <Outlet /> {/* 자식 라우트들(MyProfileEdit 등) 렌더링 */}
//         </main>
//       </div>
//     </div>
//   );
// }

import { Outlet, useLocation } from 'react-router-dom';
import MyPageSidebar from './MyPageSidebar';
import { myPageMenus } from './menuData';

export default function MyPageLayout() {
  const location = useLocation();
  const currentMenu = myPageMenus.find(
    (menu) => menu.path === location.pathname
  );
  const title = currentMenu ? currentMenu.label : '';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 왼쪽 사이드바 */}
      <MyPageSidebar />

      {/* 오른쪽 본문 영역 */}
      <main className="flex-1 ml-80 p-8">
        {' '}
        {/* ml-72 = sidebar 너비와 동일 */}
        {/* 제목 */}
        {title && (
          <h1 className="text-3xl font-bold mb-4 ml-4 mr-10 border-b border-gray-300 pb-2 ">
            {title}
          </h1>
        )}
        {/* 실제 페이지 렌더링 */}
        <Outlet />
      </main>
    </div>
  );
}
