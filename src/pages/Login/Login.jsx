import * as Yup from 'yup';
import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authContext } from '../../context/Auth/Auth';
// import { Helmet } from 'react-helmet';
import toast from 'react-hot-toast';
import { AUTH_PATH } from '../../constants/api';
import api from '../../api/axios';

export default function Login() {
  const [err, setErr] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  // const { setUserToken, setUserNo } = useContext(authContext);
  const { setUserToken } = useContext(authContext);
  const navigate = useNavigate();

  const buttonProps = {
    type: 'submit',
    className:
      'sm:w-36 w-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800',
  };

  async function handleLogin(e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = {
      userId: String(formData.get('userId') || '').trim(),
      password: String(formData.get('password') || ''),
    };

    try {
      await validate.validate(data, { abortEarly: false });
      setFieldErrors({});
      setErr(null);
    } catch (validationError) {
      const nextFieldErrors = {};

      validationError.inner?.forEach((item) => {
        if (item.path && !nextFieldErrors[item.path]) {
          nextFieldErrors[item.path] = item.message;
        }
      });

      setFieldErrors(nextFieldErrors);
      return;
    }

    setIsLoading(true);
    api
      .post(`${AUTH_PATH}/login.do`, data, { meta: { errorType: 'INLINE' } })
      .then((response) => {
        // 서버 응답 성공 = 세션 쿠키 발급 완료
        // AuthContext에 상태 공유용 플래그 저장 (이 값이 localStorage에 저장되어 다른 창으로 전파됨)
        setUserToken('LOGGED_IN');
        setErr(null);
        toast.success('로그인하였습니다.');
        setIsLoading(false);
        navigate('/');
      })
      .catch((error) => {
        setIsLoading(false);
        setErr(error.response?.data?.message || 'Login failed');
      });
  }

  const validate = Yup.object({
    userId: Yup.string().required('User ID is required'),
    password: Yup.string().required('Password is required'),
  });

  return (
    <>
      {/* <Helmet>
        <title>로그인</title>
      </Helmet> */}

      <div className="container">
        <form
          method="post"
          noValidate
          className="max-w-md mx-auto md:mt-12 mt-0"
          onSubmit={handleLogin}
        >
          <h1 className="text-2xl text-gray-500 mb-5 font-bold">Login Now</h1>
          {err && <div className="bg-red-300 py-1 mb-4 font-light">{err}</div>}
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="text"
              name="userId"
              id="userId"
              autoComplete="username"
              onChange={() =>
                setFieldErrors((prev) => ({ ...prev, userId: undefined }))
              }
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-green-500 focus:outline-none focus:ring-0 focus:border-green-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="userId"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-green-600 peer-focus:dark:text-green-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              User ID
            </label>
            {fieldErrors.userId && (
              <span className="text-red-600 font-light text-sm">
                {fieldErrors.userId}
              </span>
            )}
          </div>
          <div className="relative z-0 w-full group">
            <input
              type="password"
              name="password"
              id="password"
              autoComplete="current-password"
              onChange={() =>
                setFieldErrors((prev) => ({ ...prev, password: undefined }))
              }
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-green-500 focus:outline-none focus:ring-0 focus:border-green-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="password"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-green-600 peer-focus:dark:text-green-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Password
            </label>
            {fieldErrors.password && (
              <span className="text-red-600 font-light text-sm">
                {fieldErrors.password}
              </span>
            )}
          </div>
          <Link
            to="/forgotPassword"
            className="text-green-800 text-sm underline block my-3"
          >
            Forgot password?
          </Link>
          {isLoading ? (
            <button {...buttonProps} disabled>
              <i className="fa-solid fa-spinner animate-spin"></i>
            </button>
          ) : (
            <button {...buttonProps}>Login</button>
          )}
        </form>
      </div>
    </>
  );
}
