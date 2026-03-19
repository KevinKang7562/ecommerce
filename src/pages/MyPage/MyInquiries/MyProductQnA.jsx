import { useContext, useEffect, useState } from 'react';
import CommonTable from '../../../components/MyPageCommon/Common/CommonTable';
import Pagination from '../../../components/MyPageCommon/Common/Pagination';
import { MyInquiryContext } from '../../../context/Inquiry/MyInquiry';

//나의 상품 문의 목록
export default function MyProductQnA() {
  const { selectMyProductQnAList } = useContext(MyInquiryContext);

  const [loading, setLoading] = useState(false); //로딩 표시
  const [error, setError] = useState(false); //에러표시
  const [errorMessage, setErrorMessage] = useState(''); //인라인 에러 메세지 표시

  const [MyProductQnA, setMyProductQnA] = useState([]);

  const [currentPage, setCurrentPage] = useState(1); //현재 페이지
  const [totalPages, setTotalPages] = useState(0); //전체 페이지 수
  // ... 기존 useState들
  const [expandedId, setExpandedId] = useState(null); // 펼쳐진 문의의 ID(inquiryNo) 저장

  // 제목 클릭 시 실행될 함수
  const handleTitleClick = (id) => {
    // 이미 열려있는 걸 다시 누르면 닫고, 아니면 새로 엽니다.
    setExpandedId(expandedId === id ? null : id);
  };
  const itemsPerPage = 5;
  const inquiryType = 'IT001';
  const myProductQnAcolumns = [
    {
      key: 'prodNo',
      header: '상품번호',
      width: '90px',
    },
    {
      key: 'imgUrl',
      header: '상품이미지',
      width: '140px',
      render: (v) => <img src={v} className="w-24 h-24 object-cover-16" />,
    },
    {
      key: 'productInfo',
      header: '상품정보',
      width: '180px',
      render: (_, row) => (
        <div className="text-start flex flex-col gap-1 min-w-[200px]">
          <div className="text-sm text-gray-600">상품번호 : {row.prodNo}</div>
          <div className="font-medium">{row.prodNm}</div>
        </div>
      ),
    },
    {
      key: 'inquiryTitle',
      header: '제목',
      render: (v, row) => (
        <div
          className="cursor-pointer hover:underline text-blue-700 font-medium"
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
      width: '120px',
    },
    {
      key: 'inquiryStatusNm',
      header: '답변상태',
      width: '120px',
    },
    {
      key: 'inquiryDate',
      header: '문의작성일',
      width: '140px',
    },
  ];
  // 2. 제목 클릭 시 하단에 보여줄 상세 UI 정의
  const renderInquiryDetail = (row) => (
    <div className="p-6 text-start flex flex-col gap-4 bg-white border-x-4 border-l-green-700">
      <div className="flex flex-col gap-2">
        <span className="text-red-500 font-bold text-sm">문의내용</span>
        <p className="text-gray-800 whitespace-pre-wrap">
          {row.inquiryContent}
        </p>
      </div>

      <div className="border-t pt-4 flex flex-col gap-2">
        <span className="text-blue-600 font-bold text-sm">답변내용</span>
        {row.answerContent ? (
          <>
            <p className="text-gray-800 whitespace-pre-wrap">
              {row.answerContent}
            </p>
            <div className="mt-2 flex justify-end gap-4 text-xs text-gray-500">
              <span>작성자: {row.answerUserNo ? '관리자' : '시스템'}</span>
              <span>작성일: {row.answerDate}</span>
            </div>
          </>
        ) : (
          <p className="text-gray-400 italic">아직 등록된 답변이 없습니다.</p>
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
    <div>
      {' '}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-20 text-center">
            문의 내역을 불러오는 중입니다...
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-500">
            {errorMessage} {/*INLINE 에러 표시 */}
          </div>
        ) : (
          // <CommonTable
          //   columns={myProductQnAcolumns}
          //   data={MyProductQnA}
          // ></CommonTable>
          <CommonTable
            columns={myProductQnAcolumns}
            data={MyProductQnA}
            keyName="inquiryNo" // 데이터 식별자 (PK)
            expandedId={expandedId} // 현재 펼쳐진 ID
            renderExpansion={renderInquiryDetail} // 상세 렌더링 함수
          />
        )}
      </div>
      <div className="border-t pt-4">
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
