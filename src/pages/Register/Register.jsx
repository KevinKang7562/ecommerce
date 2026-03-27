import { useFormik } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import toast from 'react-hot-toast';
import { AUTH_BASE_URL } from '../../config/api';

export default function Register() {
  const [err, setErr] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUserId, setIsCheckingUserId] = useState(false);
  const [userIdChecked, setUserIdChecked] = useState(false);
  const [userIdAvailable, setUserIdAvailable] = useState(false);

  const buttonProps = {
    type: 'submit',
    className:
      'sm:w-36 w-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 select-none',
  };

  const navigate = useNavigate();

  function handleRegister(values) {
    if (!userIdChecked || !userIdAvailable) {
      setErr('Please complete the user ID duplication check.');
      toast.error('Please check your user ID first');
      return;
    }

    setIsLoading(true);
    const requestBody = {
      userNm: values.name,
      userId: values.userId,
      password: values.password,
      phone: values.phone,
      email: values.email,
      birthday: '',
      gender: '',
      postNo: '',
      address: '',
      smsYn: 'Y',
      emailYn: 'Y',
    };

    axios
      .post(`${AUTH_BASE_URL}/signup.do`, requestBody, {
        withCredentials: true,
      })
      .then(() => {
        setErr(null);
        toast.success('Account created successfully');
        setIsLoading(false);
        navigate('/login');
      })
      .catch((error) => {
        toast.error('Please try again');
        setIsLoading(false);
        setErr(error.response?.data?.message || 'Registration failed');
      });
  }

  function handleCheckUserId() {
    const userId = formik.values.userId.trim();

    if (userId.length < 4) {
      setUserIdChecked(false);
      setUserIdAvailable(false);
      setErr('User ID must be at least 4 characters.');
      toast.error('User ID must be at least 4 characters');
      return;
    }

    setIsCheckingUserId(true);
    axios
      .post(
        `${AUTH_BASE_URL}/checkUserId.do`,
        { userId },
        {
          withCredentials: true,
        },
      )
      .then((response) => {
        const available = response.data?.data?.available;
        setUserIdChecked(true);
        setUserIdAvailable(available);
        setErr(null);
        if (available) {
          toast.success('User ID is available');
        } else {
          toast.error('User ID is already in use');
        }
      })
      .catch((error) => {
        setUserIdChecked(false);
        setUserIdAvailable(false);
        setErr(error.response?.data?.message || 'User ID check failed');
      })
      .finally(() => {
        setIsCheckingUserId(false);
      });
  }

  const validate = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters'),
    userId: Yup.string()
      .required('User ID is required')
      .min(4, 'User ID must be at least 4 characters'),
    email: Yup.string()
      .required('Email is required')
      .email('Email is not valid'),
    password: Yup.string()
      .required('Password is required')
      .min(4, 'Password must be at least 4 characters'),
    rePassword: Yup.string()
      .required('Confirm password is required')
      .oneOf([Yup.ref('password')], 'Passwords do not match'),
    phone: Yup.string().required('Phone number is required'),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      userId: '',
      email: '',
      password: '',
      rePassword: '',
      phone: '',
    },
    onSubmit: handleRegister,
    validationSchema: validate,
  });

  const handleUserIdChange = (e) => {
    formik.handleChange(e);
    setUserIdChecked(false);
    setUserIdAvailable(false);
  };

  return (
    <>
      {/* <Helmet>
        <title>Register</title>
      </Helmet> */}

      <div className="container">
        <form
          method="post"
          className="max-w-md mx-auto md:mt-12 mt-0"
          onSubmit={formik.handleSubmit}
        >
          <h1 className="text-2xl text-gray-500 mb-5 font-bold">
            Register Now
          </h1>
          {err && <div className="bg-red-300 py-1 mb-4 font-light">{err}</div>}

          <div className="relative z-0 w-full mb-5 group">
            <input
              type="text"
              name="name"
              id="name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-green-500 focus:outline-none focus:ring-0 focus:border-green-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="name"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-green-600 peer-focus:dark:text-green-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Name
            </label>
            {formik.errors.name && formik.touched.name && (
              <span className="text-red-600 font-light text-sm">
                {formik.errors.name}
              </span>
            )}
          </div>

          <div className="relative z-0 w-full mb-5 group">
            <input
              type="text"
              name="userId"
              id="userId"
              onChange={handleUserIdChange}
              onBlur={formik.handleBlur}
              value={formik.values.userId}
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-green-500 focus:outline-none focus:ring-0 focus:border-green-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="userId"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-green-600 peer-focus:dark:text-green-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              User ID
            </label>
            {formik.errors.userId && formik.touched.userId && (
              <span className="text-red-600 font-light text-sm">
                {formik.errors.userId}
              </span>
            )}
            {userIdChecked && !formik.errors.userId && (
              <span
                className={`text-sm ${
                  userIdAvailable ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {userIdAvailable
                  ? 'User ID is available.'
                  : 'User ID is already in use.'}
              </span>
            )}
            <button
              type="button"
              onClick={handleCheckUserId}
              disabled={isCheckingUserId}
              className="mt-3 text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            >
              {isCheckingUserId ? 'Checking...' : 'Check User ID'}
            </button>
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
              Email address
            </label>
            {formik.errors.email && formik.touched.email && (
              <span className="text-red-600 font-light text-sm">
                {formik.errors.email}
              </span>
            )}
          </div>

          <div className="relative z-0 w-full mb-5 group">
            <input
              type="password"
              name="password"
              id="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-green-500 focus:outline-none focus:ring-0 focus:border-green-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="password"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-green-600 peer-focus:dark:text-green-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Password
            </label>
            {formik.errors.password && formik.touched.password && (
              <span className="text-red-600 font-light text-sm">
                {formik.errors.password}
              </span>
            )}
          </div>

          <div className="relative z-0 w-full mb-5 group">
            <input
              type="password"
              name="rePassword"
              id="rePassword"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.rePassword}
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-green-500 focus:outline-none focus:ring-0 focus:border-green-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="rePassword"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-green-600 peer-focus:dark:text-green-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Confirm password
            </label>
            {formik.errors.rePassword && formik.touched.rePassword && (
              <span className="text-red-600 font-light text-sm">
                {formik.errors.rePassword}
              </span>
            )}
          </div>

          <div className="relative z-0 w-full mb-5 group">
            <input
              type="tel"
              name="phone"
              id="phone"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phone}
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-green-500 focus:outline-none focus:ring-0 focus:border-green-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="phone"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-green-600 peer-focus:dark:text-green-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Phone number
            </label>
            {formik.errors.phone && formik.touched.phone && (
              <span className="text-red-600 font-light text-sm">
                {formik.errors.phone}
              </span>
            )}
          </div>

          {isLoading ? (
            <button {...buttonProps} disabled>
              <i className="fa-solid fa-spinner animate-spin"></i>
            </button>
          ) : (
            <button {...buttonProps}>Register</button>
          )}
        </form>
      </div>
    </>
  );
}
