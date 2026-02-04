import {
  forwardRef,
  useContext,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { MyInquiryContext } from '../../../context/Inquiry/MyInquiry';
import InputRow from '../Common/InputRow';
import EditorRow from '../Common/EditorRow';
import SelectRow from '../Common/SelectRow';
import { useCommCd } from '../../../hooks/useCommCd';

//함수 컴포넌트는 ref를 받을 수 없으므로 forwardRef를 통해 부모가 준 ref를 자식 컴포넌트가 받을 수 있게 함
//export default forwardRef(function InquiryForm(props, ref) {
const InquiryForm = forwardRef(({ onSuccess }, ref) => {
  const { saveMyInquiry } = useContext(MyInquiryContext);
  const { codes: inquiryCategoryOption } = useCommCd({
    hCd: 'INQUIRY_CATEGORY',
    refCd: 'IT002',
  });

  const [inquiryTitle, setInquiryTitle] = useState('');
  const [inquiryContent, setInquiryContent] = useState('');
  const [inquiryCategory, setInquiryCategory] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const titleRef = useRef(null);
  const categoryRef = useRef(null);
  const contentRef = useRef(null);

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

  const handleSubmitMyInquiry = async () => {
    if (loading) return; //연타 방지
    if (!validate()) return;

    const formData = new FormData();

    formData.append('inquiryType', 'IT02');
    formData.append('inquiryTitle', inquiryTitle);
    formData.append('inquiryContent', inquiryContent);
    formData.append('inquiryCategory', inquiryCategory);

    try {
      setLoading(true);
      await saveMyInquiry(formData);
      alert('1:1 문의가 접수되었습니다.');
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
  );
});

InquiryForm.displayName = 'InquiryForm';
export default InquiryForm;
