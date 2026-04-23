import { useFormik } from 'formik';

import * as Yup from 'yup';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import toast from 'react-hot-toast';
import { AUTH_PATH } from '../../constants/api';
import api from '../../api/axios';

export default function ForgotPassword() {
  const [err, setErr] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const buttonProps = {
    type: 'submit',
    className:
      'text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800',
  };

  const navigate = useNavigate();

  function handleForgotPassword(data) {
    setIsLoading(true);

    api
      .post(`${AUTH_PATH}/requestPasswordReset.do`, data, {
        meta: { errorType: 'INLINE' },
      })
      .then(() => {
        setErr(null);
        setSuccessMessage('이메일로 인증코드를 전송했습니다.');
        localStorage.setItem('resetUserId', data.userId);
        localStorage.setItem('resetEmail', data.email);
        toast.success('이메일로 인증코드를 전송했습니다.');
        setIsLoading(false);
        setTimeout(() => {
          navigate('verifyCode');
        }, 800);
      })
      .catch((err) => {
        setIsLoading(false);
        setSuccessMessage('');
        setErr(
          err.response?.data?.message || 'Failed to request password reset',
        );
      });
  }

  const validate = Yup.object({
    userId: Yup.string().required('아이디를 입력해 주세요'),
    email: Yup.string()
      .required('이메일을 입력해 주세요')
      .email('이메일 형식이 올바르지 않습니다'),
  });

  const formik = useFormik({
    initialValues: {
      userId: '',
      email: '',
    },
    onSubmit: handleForgotPassword,
    validationSchema: validate,
  });

  return (
    <>
      <Helmet>
        <title>Forgot Password</title>
      </Helmet>
      비밀번호 찾기
      <div className="container">
        <form
          method="post"
          className="max-w-md mx-auto md:mt-12 mt-0"
          onSubmit={formik.handleSubmit}
        >
          <h1 className="text-2xl text-gray-500 mb-4 font-bold">
            비밀번호 찾기
          </h1>
          <div className="min-h-[20px] mb-5">
            {err ? (
              <div className="text-red-500 py-1 font-light">{err}</div>
            ) : null}
          </div>
          {successMessage && (
            <div className="bg-green-100 text-green-800 py-2 px-3 mb-4 text-sm rounded">
              {successMessage}
            </div>
          )}

          <div className="relative z-0 w-full mb-5 group">
            <input
              type="text"
              name="userId"
              id="userId"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.userId}
              className="block py-2 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-green-500 focus:outline-none focus:ring-0 focus:border-green-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="userId"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-green-600 peer-focus:dark:text-green-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              ID
            </label>
            {formik.errors.userId && formik.touched.userId && (
              <span className="text-red-600 font-light text-sm">
                {formik.errors.userId}
              </span>
            )}
          </div>

          <div className="relative z-0 w-full mb-5 group">
            <input
              type="email"
              name="email"
              id="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-green-500 focus:outline-none focus:ring-0 focus:border-green-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="email"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-green-600 peer-focus:dark:text-green-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Email
            </label>
            {formik.errors.email && formik.touched.email && (
              <span className="text-red-600 font-light text-sm">
                {formik.errors.email}
              </span>
            )}
          </div>

          {isLoading ? (
            <button {...buttonProps} disabled>
              <i className="fa-solid fa-spinner animate-spin"></i>
            </button>
          ) : (
            <button {...buttonProps}>인증코드 발송</button>
          )}
        </form>
      </div>
    </>
  );
}
