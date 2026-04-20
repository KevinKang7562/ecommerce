import logo from '../../assets/freshcart-logo.svg';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState, useRef } from 'react';
import { authContext } from '../../context/Auth/Auth';
import { initFlowbite } from 'flowbite'; //UI 컴포넌트 라이브러리(모바일 메뉴 토글 등)
// import { productsContext } from '../../context/Products/Products';
// import Search from '../../pages/Search/Search';
import { AUTH_PATH } from '../../constants/api';
import api from '../../api/axios';

export function logout() {
  localStorage.removeItem('authToken');
}

export default function Navbar() {
  const { userToken, setUserToken } = useContext(authContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState(''); // ✨ 검색어 상태 관리 추가
  const navbarRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  // const { data, setSearchRes } = useContext(productsContext);

  function handleLogout(e) {
    e.preventDefault();
    api
      .post(
        `${AUTH_PATH}/logout.do`,
        {},
        {
          withCredentials: true,
        },
      )
      .catch(() => null)
      .finally(() => {
        setUserToken(null);
        logout();
        localStorage.removeItem('email');
        navigate('/login');
      });
  }

  // 네비바 메뉴 닫기 함수 (Flowbite 동작 방식에 맞게 개선)
  const closeNavbarMenu = () => {
    const navbar = document.getElementById('navbar-search');
    if (navbar && !navbar.classList.contains('hidden')) {
      // 돋보기 버튼이나 햄버거 버튼 중에서, 지금 막 눌려서 메뉴를 연 버튼 찾기
      const collapseToggleBtn = document.querySelector(
        '[data-collapse-toggle="navbar-search"][aria-expanded="true"]',
      );
      if (collapseToggleBtn) {
        collapseToggleBtn.click(); //Flowbite에 의해 메뉴 자동 닫기
      }
    }
  };

  // 엔터키와 마우스 클릭 모두를 처리할 통합 검색 함수
  const executeSearch = () => {
    // 포커스를 주기
    const isMobile = window.innerWidth < 1024;
    const inputRef = isMobile ? mobileSearchInputRef : searchInputRef;

    if (inputRef.current) {
      inputRef.current.focus();
    }

    if (!searchTerm.trim()) return; // 빈칸이면 검색하지 않음
    navigate(`/search?keyword=${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm(''); //검색 후 입력창 비우기
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  };

  useEffect(() => {
    initFlowbite();
  }, []);

  // 페이지 네비게이션 후 메뉴 닫기
  useEffect(() => {
    closeNavbarMenu();
  }, [location.pathname]);

  // 외부 클릭 시 네비바 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        closeNavbarMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLinkClass = (path) => {
    return location.pathname === path
      ? 'block py-2 px-3 text-white bg-green-700 rounded lg:bg-transparent lg:text-green-700 lg:p-0 lg:dark:text-green-500'
      : 'block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 lg:hover:bg-transparent lg:hover:text-green-700 lg:p-0 dark:text-white lg:dark:hover:text-green-500 dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700';
  };

  return (
    <>
      <nav
        className="bg-white border-gray-200 shadow-md dark:bg-gray-900 fixed top-0 w-full z-50"
        ref={navbarRef}
      >
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          {/* 로고 */}
          <Link
            to="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <img src={logo} className="h-8" alt="Freshcart Logo" />
          </Link>

          {/* ===== 상단 오른쪽 버튼 영역 (모바일 검색/햄버거, 웹 검색창) ===== */}
          <div className="flex lg:order-2">
            {/* {userToken ? ( */}
            <>
              {/* [모바일 전용] 돋보기 아이콘 검색 버튼 - navbar-search 컨테이너를 토글하며, 클릭 시 모바일 검색창에 포커스 */}
              <button
                type="button"
                data-collapse-toggle="navbar-search"
                aria-controls="navbar-search"
                aria-expanded="false"
                onClick={() => {
                  setTimeout(() => {
                    mobileSearchInputRef.current?.focus(); //메뉴 열릴 때 입력란 포커싱
                  }, 100);
                }}
                className="lg:hidden text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 me-1"
              >
                <svg
                  className="w-5 h-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
                <span className="sr-only">Search</span>
              </button>
              {/* [웹 전용] 데스크톱 검색창 - lg 이상에서만 보임 */}
              <div className="relative hidden lg:block">
                {/* [웹 전용] 데스크톱 검색창 내 돋보기 아이콘 버튼 - 클릭 시 검색 입력창에 포커스 */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    searchInputRef.current?.focus();
                  }}
                  className="absolute inset-y-0 start-0 flex items-center ps-3 cursor-pointer hover:text-green-600 transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                  <span className="sr-only">Search icon</span>
                  {/* </div> */}
                </button>
                {/* [웹 전용] 데스크톱 검색 입력 필드 - 엔터키 입력 시 검색 실행 */}
                <input
                  type="text"
                  ref={searchInputRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (searchTerm.trim()) {
                        navigate(
                          `/search?keyword=${encodeURIComponent(searchTerm.trim())}`,
                        );
                        setSearchTerm('');
                      }
                    }
                  }}
                  id="search-navbar"
                  className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
                  placeholder="상품명 검색"
                />
              </div>
            </>
            {/* ) : (
              ''
            )} */}
            {/* [모바일 전용] 햄버거 아이콘 버튼 - navbar-search 컨테이너를 토글하여 모바일 네비게이션 메뉴 열기/닫기 */}
            <button
              data-collapse-toggle="navbar-search"
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="navbar-search"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
          </div>
          {/* [모바일 전용] 네비바 메뉴 컨테이너 - 햄버거 버튼이나 돋보기 버튼으로 토글됨. lg 이상에서는 항상 표시 */}
          <div
            className="items-center justify-between hidden w-full lg:flex lg:w-auto lg:order-1"
            id="navbar-search"
          >
            {/* {userToken ? ( */}
            {/* [모바일 전용] 모바일 네비바 내 검색창 영역 - mt-3는 상단 여백, lg:hidden으로 웹에서는 숨김 */}
            <div className="relative mt-3 lg:hidden">
              {/* [모바일 전용] 모바일 네비바 내 돋보기 버튼 - 클릭 시 모바일 검색 입력창에 포커스 (setTimeout으로 애니메이션 완료 후 포커싱) */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setTimeout(() => {
                    mobileSearchInputRef.current?.focus();
                  }, 100);
                }}
                className="absolute inset-y-0 start-0 flex items-center ps-3 cursor-pointer hover:text-green-600 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </button>
              {/* [모바일 전용] 모바일 네비바 내 검색 입력 필드 - 엔터키 입력 시 검색 실행 후 네비바 자동 닫힘 */}
              <input
                type="text"
                ref={mobileSearchInputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (searchTerm.trim()) {
                      navigate(
                        `/search?keyword=${encodeURIComponent(searchTerm.trim())}`,
                      );
                      setSearchTerm('');
                      closeNavbarMenu();
                    }
                  }
                }}
                id="search-navbar-mobile"
                className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-green-500 dark:focus:border-green-500"
                placeholder="상품명 검색"
              />
            </div>
            {/* ) : (
              ''
            )} */}
            {/* [모바일 + 웹 공용] 네비게이션 메뉴 링크 리스트 - 모바일에서는 세로 배열(flex-col), 웹에서는 가로 배열(lg:flex-row) */}
            <ul
              className={`flex flex-col p-4 lg:p-0 mt-4 
                
              w-full font-medium border border-gray-100 rounded-lg bg-gray-50 lg:space-x-8 rtl:space-x-reverse lg:flex-row lg:mt-0 lg:border-0 lg:bg-white dark:bg-gray-800 lg:dark:bg-gray-900 dark:border-gray-700`}
            >
              {/* ===== 공통 메뉴 (모든 사용자 대상) ===== */}

              {/* 장바구니 링크 - 클릭 시 모바일 네비바 자동 닫힘 */}
              <li onClick={closeNavbarMenu}>
                <Link to="cart" className={getLinkClass('/cart')}>
                  <div className="flex lg:flex-col lg:justify-center items-center space-x-1">
                    <i className="fas fa-cart-shopping fa-fw"></i>
                    <span>장바구니</span>
                  </div>
                </Link>
              </li>

              {/* 카테고리 링크 - 클릭 시 모바일 네비바 자동 닫힘 */}
              <li onClick={closeNavbarMenu}>
                <Link to="categories" className={getLinkClass('/categories')}>
                  <div className="flex lg:flex-col lg:justify-center items-center space-x-1">
                    <i className="fa-solid fa-list" />
                    <span>카테고리</span>
                  </div>
                </Link>
              </li>

              {/* 이벤트 링크 - 클릭 시 모바일 네비바 자동 닫힘 */}
              <li onClick={closeNavbarMenu}>
                <Link to="event" className={getLinkClass('/event')}>
                  <div className="flex lg:flex-col lg:justify-center items-center space-x-1">
                    <i className="fa-solid fa-list" />
                    <span>이벤트</span>
                  </div>
                </Link>
              </li>

              {/* 공지사항 링크 - 클릭 시 모바일 네비바 자동 닫힘 */}
              <li onClick={closeNavbarMenu}>
                <Link to="board" className={getLinkClass('/board')}>
                  <div className="flex lg:flex-col lg:justify-center items-center space-x-1">
                    <i className="fa-solid fa-bell" />
                    <span>공지사항</span>
                  </div>
                </Link>
              </li>

              {/* ===== 로그인 상태별 메뉴 ===== */}
              {/* 로그인한 사용자에게만 표시 */}
              {userToken ? (
                <>
                  {/* 마이페이지 링크 (로그인 사용자만) - 클릭 시 모바일 네비바 자동 닫힘 */}
                  <li onClick={closeNavbarMenu}>
                    <Link to="mypage" className={getLinkClass('/mypage')}>
                      <div className="flex lg:flex-col lg:justify-center items-center space-x-1">
                        <i className="fas fa-user fa-fw"></i>
                        <span>마이페이지</span>
                      </div>
                    </Link>
                  </li>

                  {/* 로그아웃 링크 (로그인 사용자만) - 클릭 시 handleLogout 실행하고 모바일 네비바 자동 닫힘 */}
                  <li onClick={closeNavbarMenu}>
                    <Link
                      to="login"
                      onClick={handleLogout}
                      className={getLinkClass('/login')}
                    >
                      <div className="flex lg:flex-col lg:justify-center items-center space-x-1">
                        <i className="fas fa-arrow-right-from-bracket fa-fw"></i>
                        <span>로그아웃</span>
                      </div>
                    </Link>
                  </li>
                </>
              ) : (
                //{/* 비로그인 사용자에게만 표시 */}
                <>
                  {/* 로그인 링크 (비로그인 사용자만) - 클릭 시 모바일 네비바 자동 닫힘 */}
                  <li onClick={closeNavbarMenu}>
                    <Link to="login" className={getLinkClass('/login')}>
                      <div className="flex lg:flex-col lg:justify-center items-center space-x-1">
                        <i className="fas fa-sign-in-alt fa-fw"></i>
                        <span>로그인</span>
                      </div>
                    </Link>
                  </li>

                  {/* 회원가입 링크 (비로그인 사용자만) - 클릭 시 모바일 네비바 자동 닫힘 */}
                  <li onClick={closeNavbarMenu}>
                    <Link to="register" className={getLinkClass('/register')}>
                      <div className="flex lg:flex-col lg:justify-center items-center space-x-1">
                        <i className="fas fa-user-plus fa-fw"></i>
                        <span>회원가입</span>
                      </div>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
