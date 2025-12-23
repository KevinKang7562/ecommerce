//마이페이지 기본 레이아웃
import { Outlet, useLocation } from 'react-router-dom';
import MyPageSidebar from './MyPageSidebar';
import { myPageMenus } from './menuData';
import React, { useState } from 'react';

export default function MyPageLayout() {
  const location = useLocation();
  const currentMenu = myPageMenus.find(
    (menu) => menu.path === location.pathname
  );
  const title = currentMenu ? currentMenu.label : '';
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* ================= 모바일 헤더 ================= */}
      <header className="lg:hidden flex items-center h-14 px-4 border-b bg-white sticky top-0 z-40">
        <button className="text-2xl" onClick={() => setIsOpen(true)}>
          ☰
        </button>
        <span className="ml-4 font-semibold truncate">{'마이페이지'}</span>
      </header>

      {/* ================= 본문 영역 ================= */}
      <div className="flex">
        {/* 데스크톱 사이드바 */}
        <aside className="hidden lg:block w-80 fixed left-0 top-0 h-full">
          <MyPageSidebar />
        </aside>

        {/* 모바일 사이드바 */}
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsOpen(false)}
            />
            <aside className="absolute left-0 top-0 w-72 h-full bg-white shadow-lg">
              <MyPageSidebar onSelect={() => setIsOpen(false)} />
            </aside>
          </div>
        )}

        {/* 메인 영역 */}
        <main className="flex-1 lg:ml-80 px-6 lg:px-10 py-8">
          <div className="max-w-[1400px] mx-auto">
            {/* <div className="max-w-7xl mx-auto"> */}

            {title && (
              <h1 className="text-2xl sm:text-3xl font-bold mb-8 border-b pb-5">
                {title}
              </h1>
            )}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
