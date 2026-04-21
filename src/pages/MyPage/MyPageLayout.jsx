// 마이페이지 기본 레이아웃
import { Outlet, useLocation } from 'react-router-dom';
import MyPageSidebar from './MyPageSidebar';
import { myPageMenus } from './menuData';
import React, { useState, useEffect } from 'react';

export default function MyPageLayout() {
  const location = useLocation();
  const currentMenu = myPageMenus.find(
    (menu) => menu.path === location.pathname,
  );
  const title = currentMenu ? currentMenu.label : '';
  const [isOpen, setIsOpen] = useState(false);

  // 1. 페이지 이동 시 모바일 사이드바 닫기
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // 💡 2. 메인 네비바를 열었을 때 -> 마이페이지 사이드바 자동 닫기
  useEffect(() => {
    const handleGlobalClick = (e) => {
      // 사용자가 메인 네비바의 햄버거/검색 버튼을 클릭한 경우 사이드바를 닫음
      if (e.target.closest('[data-collapse-toggle="navbar-search"]')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // 💡 3. 마이페이지 사이드바를 열었을 때 -> 메인 네비바 자동 닫기
  const handleOpenSidebar = () => {
    setIsOpen(true);
    const navbar = document.getElementById('navbar-search');
    if (navbar && !navbar.classList.contains('hidden')) {
      const collapseToggleBtn = document.querySelector(
        '[data-collapse-toggle="navbar-search"][aria-expanded="true"]',
      );
      if (collapseToggleBtn) collapseToggleBtn.click(); // Flowbite 네비바 강제 닫기
    }
  };

  return (
    // 💡 87px -> 72px로 모두 교체
    <div className="flex flex-col lg:flex-row w-full bg-white min-h-[calc(100vh-72px)]">
      {/* ================= 모바일 전용 헤더 ================= */}
      <header className="lg:hidden sticky top-[72px] h-14 px-4 border-b bg-white z-30 flex items-center">
        {/* 💡 열기 버튼에 교차 닫힘 로직(handleOpenSidebar) 적용 */}
        <button className="text-2xl p-2" onClick={handleOpenSidebar}>
          ☰
        </button>
        <span className="ml-2 font-bold truncate">{'마이페이지'}</span>
      </header>

      {/* ================= 본문 영역 ================= */}
      <div className="flex flex-1 w-full">
        {/* [데스크톱 사이드바] 💡 top-[72px], 높이도 72px 빼기 */}
        <aside className="hidden lg:block w-[240px] fixed left-0 top-[72px] h-[calc(100vh-72px)] border-r border-gray-200 bg-white z-20">
          <MyPageSidebar />
        </aside>

        {/* [모바일 사이드바] 💡 top-[72px] 적용 */}
        {isOpen && (
          <div className="fixed inset-0 top-[72px] z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsOpen(false)}
            />
            <aside className="absolute left-0 top-0 w-64 h-full bg-white shadow-lg">
              <MyPageSidebar onSelect={() => setIsOpen(false)} />
            </aside>
          </div>
        )}

        {/* [메인 영역] */}
        <main className="flex-1 lg:ml-[240px] p-6 lg:p-10 w-full">
          <div className="max-w-[1400px] mx-auto">
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
