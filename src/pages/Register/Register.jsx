import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import DaumPostcode from 'react-daum-postcode';
import api from '../../api/axios';
import { AUTH_PATH } from '../../constants/api';

// =========================================================================
// [API 함수들]
// =========================================================================

/** 1. 아이디 중복 확인 [신규] */
const checkUserId = async (userId) => {
  const res = await api.post(
    `${AUTH_PATH}/checkUserId.do`,
    { userId },
    {
      meta: { errorType: 'INLINE' },
    },
  );
  return res.data.data;
};

/** 2. 회원가입 실행 [신규] */
const signup = async (data) => {
  const res = await api.post(`${AUTH_PATH}/signup.do`, data, {
    meta: { errorType: 'INLINE' },
  });
  return res.data;
};

/** 3. 이메일 인증번호 발송 */
const sendEmailCode = async (email) => {
  const res = await api.post(
    `${AUTH_PATH}/send-email-code.do`,
    { email },
    {
      meta: { errorType: 'INLINE' },
    },
  );
  return res.data.data;
};

/** 4. 이메일 인증번호 검증 */
const verifyEmailCode = async (email, code) => {
  const res = await api.post(
    `${AUTH_PATH}/verify-email-code.do`,
    {
      email,
      code,
    },
    {
      meta: { errorType: 'INLINE' },
    },
  );
  return res.data.data;
};

// =========================================================================
// [메인 컴포넌트]
// =========================================================================
export default function Register() {
  const navigate = useNavigate();

  // 1. 상태 관리
  const [userIdChecked, setUserIdChecked] = useState(false);
  const [userIdAvailable, setUserIdAvailable] = useState(false);

  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [isOpenPost, setIsOpenPost] = useState(false);

  // 2. React Query Mutations
  const checkUserIdMutation = useMutation({
    mutationFn: checkUserId,
    onSuccess: (data) => {
      setUserIdChecked(true);
      setUserIdAvailable(data.available);
      if (data.available) toast.success('사용 가능한 아이디입니다.');
      else toast.error('이미 사용 중인 아이디입니다.');
    },
  });

  const sendEmailCodeMutation = useMutation({
    mutationFn: sendEmailCode,
    onSuccess: () => {
      setIsVerificationSent(true);
      toast.success('인증 코드가 발송되었습니다.');
    },
  });

  const verifyEmailCodeMutation = useMutation({
    mutationFn: ({ email, code }) => verifyEmailCode(email, code),
    onSuccess: (isMatch) => {
      if (isMatch) {
        setIsEmailVerified(true);
        setIsVerificationSent(false);
        toast.success('이메일 인증 성공!');
      } else {
        toast.error('인증번호가 틀렸습니다.');
      }
    },
  });

  const signupMutation = useMutation({
    mutationFn: signup,
    // mutation이 실행되기 직전에 찍히는 로그
    onMutate: (variables) => {
      console.log(
        ' [1] 회원가입 mutation 실행됨! 서버로 가는 데이터:',
        variables,
      );
    },
    onSuccess: () => {
      console.log('[2] 회원가입 성공!');
      toast.success('환영합니다! 가입이 완료되었습니다.');
      navigate('/login');
    },
    // 💡 서버에서 에러를 뱉었을 때 찍히는 로그 (필수!)
    onError: (error) => {
      console.error(' [Error] 회원가입 실패:', error);
      toast.error('회원가입 처리 중 오류가 발생했습니다.');
    },
  });

  // 3. 핸들러
  const formatPhoneNumber = (value) => {
    const num = value.replace(/[^\d]/g, ''); // 숫자만 남기기
    if (num.length <= 3) return num;
    if (num.length <= 7) return `${num.slice(0, 3)}-${num.slice(3)}`;

    // 10자리 번호 (예: 011-123-4567) 처리
    if (num.length === 10) {
      return `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6)}`;
    }
    // 11자리 번호 (예: 010-1234-5678)
    return `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7, 11)}`;
  };

  const handleCompletePost = (data) => {
    formik.setFieldValue('postNo', data.zonecode);
    formik.setFieldValue('address', data.address);
    setIsOpenPost(false);
  };

  // 4. Formik 설정
  const formik = useFormik({
    initialValues: {
      userNm: '',
      userId: '',
      password: '',
      rePassword: '',
      email: '',
      phone: '',
      birthday: '',
      gender: '',
      postNo: '',
      address: '',
      addressDetail: '',
      smsYn: 'N',
      emailYn: 'Y',
    },
    validationSchema: Yup.object({
      userNm: Yup.string().required('이름은 필수입니다.'),
      userId: Yup.string()
        .min(4, '4자 이상 입력하세요.')
        .required('아이디는 필수입니다.'),
      password: Yup.string()
        .min(4, '4자 이상 입력하세요.')
        .required('비밀번호는 필수입니다.'),
      rePassword: Yup.string()
        .oneOf([Yup.ref('password')], '비밀번호가 일치하지 않습니다.')
        .required('필수입니다.'),
      email: Yup.string()
        .email('형식이 올바르지 않습니다.')
        .required('이메일은 필수입니다.'),
      phone: Yup.string()
        .matches(/^\d{3}-\d{3,4}-\d{4}$/, '올바른 휴대번호 형식이 아닙니다.')
        .required('휴대폰 번호는 필수입니다.'),
      birthday: Yup.string().required('생년월일은 필수입니다.'),
      gender: Yup.string().required('성별을 선택하세요.'),
      // address: Yup.string().required('주소 입력은 필수입니다.'),
    }),
    onSubmit: (values) => {
      //아이디 중복 확인
      if (!userIdChecked || !userIdAvailable)
        return toast.error('아이디 중복확인을 해주세요.');
      //이메일 인증 검증
      if (!isEmailVerified) return toast.error('이메일 인증이 필요합니다.');
      // 휴대폰 번호 검증
      // 하이픈(-)을 포함하여 010-0000-0000 형식에 정확히 맞는지 정규식으로 검사
      const phoneRegex = /^\d{3}-?\d{3,4}-?\d{4}$/;

      if (!phoneRegex.test(values.phone)) {
        return toast.error(
          '휴대번호 형식이 올바르지 않습니다. (예: 000-0000-0000)',
        );
      }

      const submitData = {
        ...values,
        phone: values.phone.replace(/-/g, ''),
        birthday: values.birthday.replace(/-/g, ''),
      };

      // 화면 전용인 rePassword는 백엔드로 보낼 필요가 없으므로 제거
      delete submitData.rePassword;
      signupMutation.mutate(submitData);
    },
  });

  // =========================================================================
  // 5. 화면 UI 렌더링
  // =========================================================================
  return (
    <div className="container pb-20 pt-10">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          회원가입
        </h1>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* [1] 이름 및 아이디 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                이름
              </label>
              <input
                type="text"
                {...formik.getFieldProps('userNm')}
                className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5"
                placeholder="실명을 입력하세요"
              />
              {formik.touched.userNm && formik.errors.userNm && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.userNm}
                </p>
              )}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                아이디
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="userId"
                  value={formik.values.userId}
                  onChange={(e) => {
                    formik.handleChange(e);
                    setUserIdChecked(false);
                    setUserIdAvailable(false);
                  }}
                  onBlur={formik.handleBlur}
                  className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5"
                  placeholder="4자 이상"
                />
                <button
                  type="button"
                  onClick={() =>
                    checkUserIdMutation.mutate(formik.values.userId)
                  }
                  className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-4 py-2.5 shrink-0"
                >
                  중복확인
                </button>
              </div>
              {formik.touched.userId && formik.errors.userId && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.userId}
                </p>
              )}
              {userIdChecked && !formik.errors.userId && (
                <p
                  className={`text-xs mt-1 ${userIdAvailable ? 'text-green-600' : 'text-red-500'}`}
                >
                  {userIdAvailable ? '사용 가능합니다.' : '이미 사용 중입니다.'}
                </p>
              )}
            </div>
          </div>

          {/* [2] 비밀번호 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                비밀번호
              </label>
              <input
                type="password"
                {...formik.getFieldProps('password')}
                className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5"
                placeholder="비밀번호 입력"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.password}
                </p>
              )}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                비밀번호 확인
              </label>
              <input
                type="password"
                {...formik.getFieldProps('rePassword')}
                className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5"
                placeholder="비밀번호 재입력"
              />
              {formik.touched.rePassword && formik.errors.rePassword && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.rePassword}
                </p>
              )}
            </div>
          </div>

          {/* [3] 개인정보 (생년월일, 성별, 휴대폰) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                생년월일
              </label>
              <input
                type="date"
                {...formik.getFieldProps('birthday')}
                className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5"
              />
              {formik.touched.birthday && formik.errors.birthday && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.birthday}
                </p>
              )}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                성별
              </label>
              <select
                {...formik.getFieldProps('gender')}
                className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5"
              >
                <option value="" disabled>
                  선택
                </option>
                <option value="M">남성</option>
                <option value="F">여성</option>
              </select>
              {formik.touched.gender && formik.errors.gender && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.gender}
                </p>
              )}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                휴대번호
              </label>
              <input
                type="tel"
                name="phone"
                value={formik.values.phone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  formik.setFieldValue('phone', formatted);
                }}
                onBlur={formik.handleBlur}
                maxLength={13}
                className="bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5"
                placeholder="010-0000-0000"
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* [4] 이메일 인증 */}
          <div className="pt-4 border-t border-gray-100">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              이메일
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                name="email"
                value={formik.values.email}
                onChange={(e) => {
                  formik.handleChange(e);
                  setIsEmailVerified(false);
                  setIsVerificationSent(false);
                }}
                onBlur={formik.handleBlur}
                readOnly={isEmailVerified}
                className={`bg-gray-50 border border-gray-300 text-sm rounded-lg block w-full p-2.5 ${isEmailVerified ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="이메일 주소 입력"
              />
              <button
                type="button"
                onClick={() =>
                  sendEmailCodeMutation.mutate(formik.values.email)
                }
                disabled={
                  isEmailVerified || !formik.values.email || formik.errors.email
                }
                className={`text-white font-medium rounded-lg text-sm px-4 py-2.5 shrink-0 ${isEmailVerified ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800'}`}
              >
                {sendEmailCodeMutation.isPending
                  ? '발송 중...'
                  : isEmailVerified
                    ? '인증완료'
                    : '코드발송'}
              </button>
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
            )}

            {/* 인증번호 입력칸 */}
            {isVerificationSent && !isEmailVerified && (
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="인증번호 6자리"
                  className="bg-gray-50 border border-red-300 text-sm rounded-lg block w-full p-2.5"
                />
                <button
                  type="button"
                  onClick={() =>
                    verifyEmailCodeMutation.mutate({
                      email: formik.values.email,
                      code: verificationCode,
                    })
                  }
                  disabled={verifyEmailCodeMutation.isPending}
                  className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm  shrink-0  px-4 py-2.5"
                >
                  {verifyEmailCodeMutation.isPending ? '확인 중...' : '확인'}
                </button>
              </div>
            )}
          </div>

          {/* 🎯 [5] 빼먹었던 SMS/이메일 수신 동의 복구! */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 items-center">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                SMS 수신동의
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="smsYn"
                    value="Y"
                    checked={formik.values.smsYn === 'Y'}
                    onChange={formik.handleChange}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                  />{' '}
                  수신
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="smsYn"
                    value="N"
                    checked={formik.values.smsYn === 'N'}
                    onChange={formik.handleChange}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                  />{' '}
                  거부
                </label>
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                이메일 수신동의
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="emailYn"
                    value="Y"
                    checked={formik.values.emailYn === 'Y'}
                    onChange={formik.handleChange}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                  />{' '}
                  수신
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="emailYn"
                    value="N"
                    checked={formik.values.emailYn === 'N'}
                    onChange={formik.handleChange}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                  />{' '}
                  거부
                </label>
              </div>
            </div>
          </div>

          {/* [6] 주소 */}
          <div className="pt-4 border-t border-gray-100">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              주소
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                {...formik.getFieldProps('postNo')}
                readOnly
                className="bg-gray-100 border border-gray-300 text-sm rounded-lg w-24 p-2.5 cursor-not-allowed"
                placeholder="우편번호"
              />
              <button
                type="button"
                onClick={() => setIsOpenPost(true)}
                className="text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-4 py-2.5"
              >
                주소검색
              </button>
            </div>
            <input
              type="text"
              {...formik.getFieldProps('address')}
              readOnly
              className="bg-gray-100 border border-gray-300 text-sm rounded-lg w-full p-2.5 mb-2 cursor-not-allowed"
              placeholder="기본 주소"
            />
            <input
              type="text"
              {...formik.getFieldProps('addressDetail')}
              className="bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2.5"
              placeholder="상세주소를 입력해 주세요"
            />
          </div>

          {/* 제출 버튼 */}
          <div className="pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-3.5 shadow-md disabled:bg-gray-400"
            >
              {signupMutation.isPending ? '처리 중...' : '회원가입 완료'}
            </button>
          </div>
        </form>
      </div>

      {/* 우편번호 모달 */}
      {isOpenPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white p-5 rounded-lg w-full max-w-lg relative">
            <button
              type="button"
              onClick={() => setIsOpenPost(false)}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-900 text-xl font-bold"
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-4">주소 검색</h2>
            <DaumPostcode
              onComplete={handleCompletePost}
              style={{ height: '450px' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
