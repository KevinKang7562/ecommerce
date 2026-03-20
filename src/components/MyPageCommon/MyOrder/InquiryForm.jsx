import {
  forwardRef,
  useContext,
  useImperativeHandle,
  useRef,
  useState,
  useEffect, // 추가
} from 'react';
import { MyInquiryContext } from '../../../context/Inquiry/MyInquiry';
import InputRow from '../Common/InputRow';
import EditorRow from '../Common/EditorRow';
import SelectRow from '../Common/SelectRow';
import { useCommCd } from '../../../hooks/useCommCd';

//함수 컴포넌트는 ref를 받을 수 없으므로 forwardRef를 통해 부모가 준 ref를 자식 컴포넌트가 받을 수 있게 함
//export default forwardRef(function InquiryForm(props, ref) {
const InquiryForm = forwardRef(({ onSuccess, mode, inquiryNo }, ref) => {
  // mode, inquiryNo 프롭스 추가
  // context에서 update 함수도 가져온다고 가정 (혹은 save 함수 내부에서 분기 처리)
  const { saveMyInquiry, updateMyInquiry, selectMyInquiryDetail } =
    useContext(MyInquiryContext);

  const { codes: inquiryCategoryOption } = useCommCd({
    hCd: 'INQUIRY_CATEGORY',
    refCd: 'IT002',
  });

  const [inquiryTitle, setInquiryTitle] = useState('');
  const [inquiryContent, setInquiryContent] = useState('');
  const [inquiryCategory, setInquiryCategory] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); //인라인 에러 메세지 표시

  const titleRef = useRef(null);
  const categoryRef = useRef(null);
  const contentRef = useRef(null);

  const inquiryType = 'IT002';

  //수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (mode === 'UPDATE' && inquiryNo) {
      setLoading(true);
      const fetchDetail = async () => {
        try {
          const data = await selectMyInquiryDetail(inquiryNo);
          setInquiryTitle(data.inquiryTitle);
          setInquiryContent(data.inquiryContent);
          setInquiryCategory(data.inquiryCategory);
        } catch (error) {
          const serverMessage =
            error.response?.data?.message ??
            '문의 내역 조회 중 오류가 발생했습니다.'; // ← 서버에서 보낸 메시지
          setErrorMessage(serverMessage); //INLINE으로 표시
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    }
  }, [mode, inquiryNo]);

  //유효성 검증
  const validate = () => {
    const newErrors = {};
    if (!inquiryTitle.trim()) {
      newErrors.inquiryTitle = '제목을 입력하세요';
      setErrors(newErrors);
      titleRef.current?.focus();
      return false;
    }
    if (!inquiryCategory) {
      newErrors.inquiryCategory = '문의 유형을 선택하세요';
      setErrors(newErrors);
      categoryRef.current?.focus();
      return false;
    }
    if (!inquiryContent.trim()) {
      newErrors.inquiryContent = '내용을 입력하세요';
      setErrors(newErrors);
      contentRef.current?.focus();
      return false;
    }
    setErrors({});
    return true;
  };

  //수정/등록하기
  const handleSubmitMyInquiry = async () => {
    if (loading) return; //연타 방지
    if (!validate()) return; //유효성 검증

    const formData = new FormData();
    formData.append('inquiryType', inquiryType);
    formData.append('inquiryTitle', inquiryTitle);
    formData.append('inquiryContent', inquiryContent);
    formData.append('inquiryCategory', inquiryCategory);

    // [수정 부분] 수정 모드일 때는 PK인 inquiryNo를 추가 전달
    if (mode === 'UPDATE') {
      formData.append('inquiryNo', inquiryNo);
    }

    try {
      setLoading(true);

      //모드에 따라 호출 함수 분기
      if (mode === 'UPDATE') {
        await updateMyInquiry(formData);
        alert('1:1 문의가 수정되었습니다.');
      } else {
        await saveMyInquiry(formData);
        alert('1:1 문의가 접수되었습니다.');
      }

      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  //useImperativeHandle: ref.current로 부모에게 노출할 것을 명시적으로 선택(자식 내부함수에 부모가 접근할 수 있게 하는 것 )
  useImperativeHandle(ref, () => ({
    handleSubmitMyInquiry,
  }));

  return (
    <div>
      <div className="text-red-600 font-bold text-lg text-center py-1">
        {errorMessage}
      </div>
      <div className="border rounded bg-white overflow-hidden">
        <InputRow
          label="제목"
          value={inquiryTitle}
          onChange={(e) => setInquiryTitle(e.target.value)}
          error={errors.inquiryTitle}
          required
          inputRef={titleRef}
        />

        <SelectRow
          label="문의유형"
          value={inquiryCategory}
          onChange={(e) => setInquiryCategory(e.target.value)}
          options={[{ label: '선택', value: '' }, ...inquiryCategoryOption]}
          error={errors.inquiryCategory}
          required
          selectRef={categoryRef}
        />

        <EditorRow
          label="본문"
          value={inquiryContent}
          onChange={setInquiryContent}
          error={errors.inquiryContent}
          required
          maxLength={500}
          editorRef={contentRef}
        />
      </div>
    </div>
  );
});

InquiryForm.displayName = 'InquiryForm';
export default InquiryForm;
