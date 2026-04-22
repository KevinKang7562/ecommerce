import { useContext, useEffect, useState } from 'react';
import CommonTable from '../../../components/MyPageCommon/Common/CommonTable';
import Pagination from '../../../components/MyPageCommon/Common/Pagination';
import { MyInquiryContext } from '../../../context/Inquiry/MyInquiry';
import { DEFAULT_PRODUCT_IMAGE, IMAGE_BASE_URL } from '../../../constants/api';
import ProductImg from '../../../components/ProductImg/ProductImg';
import { Link } from 'react-router-dom';
import Spinner from '../../../components/Spinner/Spinner';
// import { authContext } from '../../../context/Auth/Auth';

//나의 상품 문의 목록
export default function MyProductQnA() {
  const { selectMyProductQnAList } = useContext(MyInquiryContext);
  // const { userNo } = useContext(authContext);

  const [loading, setLoading] = useState(false); //로딩 표시
  const [error, setError] = useState(false); //에러표시
  const [errorMessage, setErrorMessage] = useState(''); //인라인 에러 메세지 표시

  const [MyProductQnA, setMyProductQnA] = useState([]);

  const [currentPage, setCurrentPage] = useState(1); //현재 페이지
  const [totalPages, setTotalPages] = useState(0); //전체 페이지 수
  // ... 기존 useState들
  const [expandedId, setExpandedId] = useState(null); // 펼쳐진 문의의 ID(inquiryNo) 저장

  const itemsPerPage = 5;
  const inquiryType = 'IT001';
  const myProductQnAcolumns = [
    {
      key: 'prodNo',
      header: '상품번호',
      className: 'hidden sm:table-cell w-20',
    },
    {
      key: 'imgUrl',
      header: '상품이미지',

      className: 'w-24 sm:w-32 ',
      render: (v, row) => (
        // 💡 2. Link로 감싸줍니다.
        <Link to={`/product/${row.prodNo}`} className="block">
          <ProductImg src={v} className="hover:opacity-80 transition-opacity" />
        </Link>
      ),
    },
    {
      key: 'productInfo',
      header: '상품정보',
      className: 'hidden w-48 sm:table-cell md:w-64 ',
      render: (_, row) => (
        <div className="text-start flex flex-col gap-1 break-keep">
          <div className="text-sm text-gray-600">상품번호 : {row.prodNo}</div>
          {/* 💡 3. 상품명 부분도 Link로 감싸고, 마우스를 올리면 밑줄이 생기게(hover:underline) 해줍니다. */}
          <Link
            to={`/product/${row.prodNo}`}
            className="font-bold hover:underline hover:text-green-700 transition-colors"
          >
            {row.prodNm}
          </Link>
        </div>
      ),
    },
    {
      key: 'inquiryTitle',
      header: '제목',
      className: 'w-32 sm:w-40 md:w-48',
      render: (v, row) => (
        <div
          className="cursor-pointer hover:underline text-blue-700 font-medium text-sm sm:text-base break-keep"
          onClick={() =>
            setExpandedId(expandedId === row.inquiryNo ? null : row.inquiryNo)
          }
        >
          {v}
        </div>
      ),
    },
    {
      key: 'inquiryCategoryNm',
      header: '문의유형',
      className: 'hidden md:table-cell w-24',
    },
    {
      key: 'inquiryStatusNm',
      header: '답변상태',
      className: 'w-20 sm:w-24',
    },
    {
      key: 'inquiryDate',
      header: '문의작성일',
      className: 'w-24 sm:w-28',
    },
  ];
  // 2. 제목 클릭 시 하단에 보여줄 상세 UI 정의
  const renderInquiryDetail = (row) => (
    <div className="p-4 sm:p-6 text-start flex flex-col gap-4 bg-white border-x-4 border-l-green-700">
      <div className="flex flex-col gap-2">
        <span className="text-red-500 font-bold text-sm sm:text-base">
          문의내용
        </span>
        <p className="text-gray-800 whitespace-pre-wrap text-sm sm:text-base">
          {row.inquiryContent}
        </p>
      </div>

      <div className="border-t pt-4 flex flex-col gap-2">
        <span className="text-blue-600 font-bold text-sm sm:text-base">
          답변내용
        </span>
        {row.answerContent ? (
          <>
            <p className="text-gray-800 whitespace-pre-wrap text-sm sm:text-base">
              {row.answerContent}
            </p>
            <div className="mt-2 flex justify-end gap-4 text-xs sm:text-sm text-gray-500">
              <span>작성자: {row.answerUserNo ? '관리자' : '시스템'}</span>
              <span>작성일: {row.answerDate}</span>
            </div>
          </>
        ) : (
          <p className="text-gray-400 italic text-sm sm:text-base">
            아직 등록된 답변이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
  const fetchMyProductQnAList = async () => {
    setLoading(true);
    setError(false);
    setErrorMessage(null);
    console.log('조회시작');
    try {
      const { list, totalPages } = await selectMyProductQnAList({
        inquiryType: inquiryType,
        // userNo: userNo, //로그인 사용자의 userNo로 조회
        currentPage: currentPage,
        pageSize: itemsPerPage,
      });

      console.log(list);
      console.log(totalPages);

      setMyProductQnA(list);
      setTotalPages(totalPages);
    } catch (error) {
      setError(true);
      const serverMessage =
        error.response?.data?.message ??
        '상품Q&A 내역 조회 중 오류가 발생했습니다.';
      setErrorMessage(serverMessage);
      setMyProductQnA([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProductQnAList();
  }, [currentPage]);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="overflow-x-auto">
        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="py-20 text-center text-red-500 text-sm sm:text-base">
            {errorMessage} {/*INLINE 에러 표시 */}
          </div>
        ) : (
          <CommonTable
            columns={myProductQnAcolumns}
            data={MyProductQnA}
            keyName="inquiryNo" // 데이터 식별자 (PK)
            expandedId={expandedId} // 현재 펼쳐진 ID
            renderExpansion={renderInquiryDetail} // 상세 렌더링 함수
          />
        )}
      </div>
      <div className="border-t pt-4 mt-4">
        {/* 페이지(최하단에 위치 고정) */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onChange={(p) => setCurrentPage(p)}
        />
      </div>
    </div>
  );
}
