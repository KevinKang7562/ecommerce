import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import MainLayout from './pages/MainLayout/MainLayout';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import NotFound from './pages/NotFound/NotFound';
import AuthContextProvider from './context/Auth/Auth';
import Home from './pages/Home/Home';
import ProtectedRoute from './pages/ProtectedRoute/ProtectedRoute';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import Cart from './pages/Cart/Cart';
import CartContextProvider from './context/Cart/Cart';
import WishlistContextProvider from './context/Wishlist/Wishlist';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import VerifyCode from './pages/VerifyCode/VerifyCode';
import Checkout from './pages/Checkout/Checkout';
import Wishlist from './pages/Wishlist/Wishlist';
import Brands from './pages/Brands/Brands';
import Categories from './pages/Categories/Categories';
import ProductsContextProvider from './context/Products/Products';
import Search from './pages/Search/Search';
import RedirectIfAuthenticated from './components/RedirectIfAuthenticated/RedirectIfAuthenticated';
import Board from './pages/Board/Board';
import BoardDetail from './pages/Board/BoardDetail';
import MyPageLayout from './pages/MyPage/MyPageLayout';
import MyProfileEdit from './pages/MyPage/MyProfileEdit';
import MyPersonalInquiry from './pages/MyPage/MyInquiries/MyPersonalInquiry';
import MyProductQnA from './pages/MyPage/MyInquiries/MyProductQnA';
import MyAllOrders from './pages/MyPage/MyOrders/MyAllOrders';
import MyCancelReturn from './pages/MyPage/MyOrders/MyCancelReturn';

function App() {
  const queryClient = new QueryClient();

  const router = createBrowserRouter([
    {
      path: '',
      element: <MainLayout />, // 공통 UI가 포함된 기본 레이아웃 children이 <Outlet>자리에 랜더링
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          ),
        },
        {
          path: 'login',
          element: (
            <RedirectIfAuthenticated>
              <Login />
            </RedirectIfAuthenticated>
          ),
        },
        {
          path: 'register',
          element: (
            <RedirectIfAuthenticated>
              <Register />
            </RedirectIfAuthenticated>
          ),
        },
        {
          path: 'forgotPassword',
          element: <ForgotPassword />,
        },
        { path: 'forgotPassword/verifyCode', element: <VerifyCode /> },
        {
          path: 'forgotPassword/verifyCode/resetPassword',
          element: <ResetPassword />,
        },
        {
          path: 'product/:id',
          element: (
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          ),
        },
        {
          path: '/checkout/:id',
          element: (
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          ),
        },
        {
          path: 'cart',
          element: (
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          ),
        },
        {
          path: 'wishlist',
          element: (
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          ),
        },
        {
          path: 'brands',
          element: (
            <ProtectedRoute>
              <Brands />
            </ProtectedRoute>
          ),
        },
        {
          path: 'categories',
          element: (
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          ),
        },
        {
          path: 'search',
          element: (
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          ),
        },
        {
          path: 'board',
          element: (
            <ProtectedRoute>
              <Board />
            </ProtectedRoute>
          ),
        },
        {
          path: 'boarddetail/:boardNo',
          element: (
            <ProtectedRoute>
              <BoardDetail />
            </ProtectedRoute>
          ),
        },        
        {
          path: 'mypage',
          //마이페이지 공통 UI가 포함된 기본레이아웃
          element: (
            <ProtectedRoute>
              <MyPageLayout />
            </ProtectedRoute>
          ),
          children: [
            {
              index: true,
              element: (
                <ProtectedRoute>
                  <MyProfileEdit />
                </ProtectedRoute>
              ),
            },
            {
              path: 'myAllOrders',
              element: (
                <ProtectedRoute>
                  <MyAllOrders />
                </ProtectedRoute>
              ),
            },
            {
              path: 'myCancelReturn',
              element: (
                <ProtectedRoute>
                  <MyCancelReturn />
                </ProtectedRoute>
              ),
            },
            {
              path: 'myPersonalInquiry',
              element: (
                <ProtectedRoute>
                  <MyPersonalInquiry />
                </ProtectedRoute>
              ),
            },
            {
              path: 'myProductQnA',
              element: (
                <ProtectedRoute>
                  <MyProductQnA />
                </ProtectedRoute>
              ),
            },
          ],
        },
        { path: '*', element: <NotFound /> },
      ],
    },
  ]);
  return (
    <AuthContextProvider>
      <CartContextProvider>
        <WishlistContextProvider>
          <QueryClientProvider client={queryClient}>
            <ProductsContextProvider>
              <Toaster />
              {/* <ReactQueryDevtools initialIsOpen={false} /> */}
              <RouterProvider router={router} />
            </ProductsContextProvider>
          </QueryClientProvider>
        </WishlistContextProvider>
      </CartContextProvider>
    </AuthContextProvider>
  );
}

export default App;
