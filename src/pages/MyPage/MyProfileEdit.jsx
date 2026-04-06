import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../api/axios';
import { authContext } from '../../context/Auth/Auth';
import DaumPostcode from 'react-daum-postcode';

// =========================================================================
// API 함수들 (백엔드와 통신)
// =========================================================================

// 1. 비밀번호 검증
const verifyPassword = async (password) => {
  const res = await api.post('/api/userProfile/verifyPassword.do', {
    password,
  });
  return res.data.data; // true or false
};

// 2. 회원정보 조회
const getProfile = async () => {
  const res = await api.get('/api/userProfile/getProfile.do');
  console.log('getProfile 결과:', res.data.data);
  return res.data.data; // UserProfileResponseDto
};

// 3. 이메일 인증번호 발송
const sendEmailCode = async (email) => {
  const res = await api.post('/api/userProfile/send-email-code.do', { email });
  return res.data.data;
};

// 4. 이메일 인증번호 검증
const verifyEmailCode = async (email, code) => {
  const res = await api.post('/api/userProfile/verify-email-code.do', {
    email,
    code,
  });
  return res.data.data; // true or false
};

// 5. 회원정보 수정
const updateProfile = async (data) => {
  const res = await api.post('/api/userProfile/updateUserProfile.do', data);
  return res.data.data;
};

export default function MyProfileEdit() {
  const navigate = useNavigate();

  // =========================================================================
  // 1. 상태 관리 (State) - 먼저 선언
  // =========================================================================

  // 1-1. 비밀번호 확인 상태
  const [isVerified, setIsVerified] = useState(false);
  const [inputPassword, setInputPassword] = useState('');

  // 1-2. 회원정보 폼 상태 (DB 스키마 기준 변수명 매핑)
  const [formData, setFormData] = useState({
    userId: '', // USER_ID
    password: '', // PASSWORD (변경할 새 비밀번호)
    passwordConfirm: '', // 새 비밀번호 확인 (UI 전용)
    smsYn: 'N', // SMS_YN
    emailYn: 'Y', // EMAIL_YN
    userNm: '', // USER_NM (이름)
    birthday: '', // BIRTHDAY (생년월일)
    gender: '', // GENDER (M/F)
    phone: '', // PHONE
    email: '', // EMAIL
    postNo: '', // POST_NO (우편번호)
    address: '', // ADDRESS (기본 주소 )
    addressDetail: '', // 상세주소 입력용
  });
  // 이메일 인증 관련 상태
  const [isVerificationSent, setIsVerificationSent] = useState(false); // 인증번호 발송 여부
  const [verificationCode, setVerificationCode] = useState(''); // 사용자가 입력한 인증번호
  const [isEmailVerified, setIsEmailVerified] = useState(false); // 인증 완료 여부
  const [originalEmail, setOriginalEmail] = useState(''); // 원래 이메일 주소 (변경 여부 확인용)

  //주소 검색 모달 상태
  const [isOpenPost, setIsOpenPost] = useState(false);

  // =========================================================================
  // 2. React Query - Mutations & Queries
  // =========================================================================

  // 1. 비밀번호 검증 mutation
  const verifyPasswordMutation = useMutation({
    mutationFn: verifyPassword,
    onSuccess: (data) => {
      if (data === true) {
        setIsVerified(true);
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        '비밀번호 검증 중 오류가 발생했습니다.';
      alert(message);
    },
  });

  // 2. 회원정보 조회 query (isVerified가 true일 때만 호출)
  const getProfileQuery = useQuery({
    queryKey: ['userProfile'],
    queryFn: getProfile,
    enabled: isVerified,
  });

  const {
    data: profileData,
    isError: isProfileError,
    error: profileError,
  } = getProfileQuery;

  // 3. 이메일 인증번호 발송 mutation
  const sendEmailCodeMutation = useMutation({
    mutationFn: (email) => sendEmailCode(email),
    onSuccess: () => {
      setIsVerificationSent(true);
      alert('입력하신 이메일로 인증 코드가 발송되었습니다.');
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        '인증 코드 발송 중 오류가 발생했습니다.';
      alert(message);
    },
  });

  // 4. 이메일 인증번호 검증 mutation
  const verifyEmailCodeMutation = useMutation({
    mutationFn: ({ email, code }) => verifyEmailCode(email, code),
    onSuccess: (data) => {
      if (data === true) {
        setIsEmailVerified(true);
        setIsVerificationSent(false);
        alert('이메일 인증이 완료되었습니다.');
      } else {
        alert('인증번호가 일치하지 않습니다.');
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        '인증번호 검증 중 오류가 발생했습니다.';
      alert(message);
    },
  });

  // 5. 회원정보 수정 mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      // 화면을 다시 [비밀번호 입력 창]으로 되돌리기 위함
      setIsVerified(false);
      setInputPassword(''); // 다음번 입력을 위해 비밀번호 입력칸도 깨끗하게 비워줍니다.
      alert('회원정보가 성공적으로 수정되었습니다.');
      navigate('/mypage');
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        '회원정보 수정 중 오류가 발생했습니다.';
      alert(message);
    },
  });

  // =========================================================================
  // 3. 초기 데이터 및 이벤트 핸들러
  // =========================================================================

  // DB의 "YYYYMMDD" 문자열을 "YYYY-MM-DD" 형태로 변환하는 함수
  const formatBirthday = (dateStr) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
  };

  // 숫자를 받아서 휴대폰 번호 형식으로 변환
  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, ''); // 숫자 외 제거
    const phoneNumberLength = phoneNumber.length;

    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 8) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    }
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`;
  };

  // 회원정보 데이터가 조회되면 폼 상태 업데이트
  useEffect(() => {
    if (profileData) {
      setFormData((prev) => ({
        //서버에서 가져오진 않지만 화면에는 필요한 값들을 위해 prev필요(password, passwordConfirm)
        ...prev,
        userId: profileData.userId || '',
        userNm: profileData.userNm || '',
        birthday: formatBirthday(profileData.birthday) || '',
        gender: profileData.gender || '',
        phone: formatPhoneNumber(profileData.phone) || '',
        email: profileData.email || '',
        postNo: profileData.postNo || '',
        address: profileData.address || '',
        addressDetail: profileData.addressDetail || '',
        smsYn: profileData.smsYn || 'N',
        emailYn: profileData.emailYn || 'Y',
      }));
    }
  }, [profileData]);

  // 회원정보 조회 에러 처리
  useEffect(() => {
    if (isProfileError && profileError) {
      const message =
        profileError.response?.data?.message ||
        '회원정보 조회 중 오류가 발생했습니다.';
      alert(message);
    }
  }, [isProfileError, profileError]);

  // 프로필 조회 후 원래 이메일 저장
  useEffect(() => {
    if (profileData?.email) {
      setOriginalEmail(profileData.email);
    }
  }, [profileData?.email]);

  // 입력 폼 변경 공통 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData((prev) => ({ ...prev, [name]: formatPhoneNumber(value) })); // 휴대폰 번호는 입력할 때마다 포맷팅
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 주소 검색 팝업 (가상)
  const handleCompletePost = (data) => {
    // 기존 데이터(...prev)는 유지하고, 우편번호와 주소만 덮어씌웁니다.
    setFormData((prev) => ({
      ...prev,
      postNo: data.zonecode,
      address: data.address,
    }));
    setIsOpenPost(false); // 팝업 닫기
  };

  // [A] 이메일 인증번호 발송 핸들러
  const handleEmailVerification = () => {
    if (!formData.email) {
      alert('이메일을 먼저 입력해 주세요.');
      return;
    }
    sendEmailCodeMutation.mutate(formData.email);
  };

  // [B] 이메일 인증번호 확인 핸들러
  const handleVerifyCode = () => {
    if (!verificationCode) {
      alert('인증번호를 입력해 주세요.');
      return;
    }
    verifyEmailCodeMutation.mutate({
      email: formData.email,
      code: verificationCode,
    });
  };

  // =========================================================================
  // 4. 제출 핸들러 (Submit)
  // =========================================================================

  // [A] 비밀번호 확인 제출
  const handleVerifyPassword = (e) => {
    e.preventDefault();
    verifyPasswordMutation.mutate(inputPassword);
  };

  // [B] 회원정보 수정 제출
  const handleSubmit = (e) => {
    e.preventDefault();

    // 새 비밀번호 입력 시 검증
    if (formData.password) {
      if (formData.password !== formData.passwordConfirm) {
        alert('비밀번호 확인이 일치하지 않습니다.');
        return;
      }
    }

    //휴대폰 번호 자릿수 검증 (숫자만 남겼을 때 10자리나 11자리인지 확인)
    const purePhone = formData.phone.replace(/[^\d]/g, '');
    if (purePhone.length < 10) {
      alert('정확한 휴대폰 번호를 입력해 주세요.');
      return;
    }

    // 이메일이 변경되었거나 새로 입력된 경우, 인증 여부 확인
    if (formData.email !== originalEmail && !isEmailVerified) {
      alert('새로운 이메일 주소는 반드시 인증을 완료해야 합니다.');
      return;
    }

    // 전송할 데이터 가공 (상세주소를 DB ADDRESS 컬럼에 맞게 병합)
    const submitData = {
      // userNm: formData.userNm,
      // birthday: formData.birthday,
      // gender: formData.gender,
      phone: formData.phone.replace(/[^\d]/g, ''),
      email: formData.email,
      postNo: formData.postNo,
      address: formData.address, // 기본 주소 따로
      addressDetail: formData.addressDetail,
      smsYn: formData.smsYn,
      emailYn: formData.emailYn,
    };

    // password 필드는 새 비밀번호를 입력했을 때만 포함
    if (formData.password && formData.password.trim() !== '') {
      submitData.password = formData.password;
    }

    updateProfileMutation.mutate(submitData);
  };

  // =========================================================================
  // 5. 화면 렌더링 (UI)
  // =========================================================================

  // --- [화면 A] 비밀번호 인증 전 ---
  if (!isVerified) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-md border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center dark:text-white">
          비밀번호 재확인
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          회원님의 개인정보 보호를 위해 비밀번호를 다시 한번 확인합니다.
        </p>
        <form onSubmit={handleVerifyPassword} className="space-y-4">
          <input
            type="password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            placeholder="비밀번호를 입력해주세요"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
            required
            disabled={verifyPasswordMutation.isPending}
          />
          <button
            type="submit"
            disabled={verifyPasswordMutation.isPending}
            className="w-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {verifyPasswordMutation.isPending ? '확인 중...' : '확인'}
          </button>
        </form>
      </div>
    );
  }

  // --- [화면 B] 비밀번호 인증 통과 후 (수정 폼) ---
  return (
    <div>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 dark:bg-gray-800 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* [1] 아이디 (불가) */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              아이디
            </label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              readOnly
              className="bg-gray-100 border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
            />
          </div>

          {/* [2] 비밀번호 변경 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  비밀번호
                </label>
                <span
                  className="text-gray-400 cursor-help"
                  title="영문 대소문자/숫자/특수문자 중 2가지 이상 조합으로 10자~16자까지 입력이 가능합니다."
                >
                  <i className="fa-regular fa-circle-question" />
                </span>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="새 비밀번호 입력 시에만 작성"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                비밀번호 확인
              </label>
              <input
                type="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
              />
            </div>
          </div>

          {/* [3] 수신 여부 (SMS_YN, EMAIL_YN) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 items-center">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                sms수신여부
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="smsYn"
                    value="Y"
                    checked={formData.smsYn === 'Y'}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                  />{' '}
                  수신
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="smsYn"
                    value="N"
                    checked={formData.smsYn === 'N'}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                  />{' '}
                  수신거부
                </label>
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                이메일수신여부
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="emailYn"
                    value="Y"
                    checked={formData.emailYn === 'Y'}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                  />{' '}
                  수신
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="emailYn"
                    value="N"
                    checked={formData.emailYn === 'N'}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                  />{' '}
                  수신거부
                </label>
              </div>
            </div>
          </div>

          {/* [4] 개인 정보 (이름, 생년월일, 성별 수정 불가 / 휴대번호 수정 가능) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                이름
              </label>
              <input
                type="text"
                name="userNm"
                value={formData.userNm}
                readOnly
                className="bg-gray-100 border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                생년월일
              </label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                readOnly
                className="bg-gray-100 border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                성별
              </label>
              <select
                name="gender"
                value={formData.gender}
                disabled
                className="bg-gray-100 border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed"
              >
                <option value="">선택</option>
                <option value="M">남성</option>
                <option value="F">여성</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                휴대번호{' '}
                <span className="text-xs text-gray-400 ml-1">
                  (010-0000-0000)
                </span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                maxLength={13}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
              />
            </div>
          </div>

          {/* --- [5] 이메일 영역 --- */}
          <div className="pt-4 border-t border-gray-100">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              이메일
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                readOnly={isEmailVerified} // 인증 완료되면 수정 불가
                required
                className={`border text-sm rounded-lg block w-full p-2.5 ${
                  isEmailVerified
                    ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed focus:outline-none focus:ring-0 focus:border-gray-300'
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-green-500 focus:border-green-500'
                }`}
              />
              <button
                type="button"
                onClick={handleEmailVerification}
                disabled={isEmailVerified || sendEmailCodeMutation.isPending}
                className={`font-medium rounded-lg text-sm w-40 py-2.5 text-white ${
                  isEmailVerified
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 disabled:bg-gray-400 disabled:cursor-not-allowed'
                }`}
              >
                {sendEmailCodeMutation.isPending
                  ? '발송 중...'
                  : isEmailVerified
                    ? '인증완료'
                    : '이메일 인증'}
              </button>
            </div>

            {/* 인증번호 입력 폼 */}
            {isVerificationSent && !isEmailVerified && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="인증번호 6자리 입력"
                  className="bg-gray-50 border border-red-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                  disabled={verifyEmailCodeMutation.isPending}
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={verifyEmailCodeMutation.isPending}
                  className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm w-40 py-2.5 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {verifyEmailCodeMutation.isPending ? '확인 중...' : '확인'}
                </button>
              </div>
            )}
          </div>
          {/* [6] 주소 (POST_NO, ADDRESS) */}
          <div className="pt-4 border-t border-gray-100">
            <label className="block mb-2 text-sm font-medium text-gray-900">
              주소
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                name="postNo"
                value={formData.postNo}
                readOnly
                className="bg-gray-100 border border-gray-300 text-gray-500 text-sm rounded-lg w-24 p-2.5 cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setIsOpenPost(true)}
                className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2.5 flex items-center gap-1"
              >
                주소수정 <i className="fa-solid fa-chevron-right text-xs" />
              </button>
            </div>
            <input
              type="text"
              name="address"
              value={formData.address}
              readOnly
              className="bg-gray-100 border border-gray-300 text-gray-500 text-sm rounded-lg w-full p-2.5 mb-2 cursor-not-allowed"
            />
            <input
              type="text"
              name="addressDetail"
              value={formData.addressDetail}
              onChange={handleChange}
              placeholder="상세주소를 입력해 주세요."
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
            />
          </div>

          {/* [7] 하단 버튼 */}
          <div className="flex gap-4 pt-6 border-t border-gray-100 mt-10">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={updateProfileMutation.isPending}
              className="w-full text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-3 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {updateProfileMutation.isPending ? '수정 중...' : '수정하기'}
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
            {/* 카카오에서 만든 우편번호 검색 컴포넌트 */}
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
