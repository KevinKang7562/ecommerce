//나의 1:1문의 목록

import { useContext, useEffect, useState } from 'react';
import CommonTable from '../../../components/MyPageCommon/Common/CommonTable';
import MyButton from '../../../components/MyPageCommon/Common/MyButton';
import Pagination from '../../../components/MyPageCommon/Common/Pagination';
import { MyInquiryContext } from '../../../context/Inquiry/MyInquiry';
// import { authContext } from '../../../context/Auth/Auth';
import { useNavigate } from 'react-router-dom';
export default function MyPersonalInquiry() {
  const { selectMyInquiryList } = useContext(MyInquiryContext);
  // const { userNo } = useContext(authContext);

  const [loading, setLoading] = useState(false); //로딩 표시
  const [error, setError] = useState(false); //에러표시
  const [errorMessage, setErrorMessage] = useState(''); //인라인 에러 메세지 표시

  // ====== [수정] 초기값을 세션 스토리지에서 가져오도록 변경 ======
  const [currentPage, setCurrentPage] = useState(
    () => Number(sessionStorage.getItem('inquiry_page')) || 1,
  );
  const [totalPages, setTotalPages] = useState(0);

  const [myInquiryList, setMyInquiryList] = useState([]);

  // ====== [추가] 페이지가 변경될 때마다 세션 스토리지에 저장 ======
  useEffect(() => {
    sessionStorage.setItem('inquiry_page', currentPage);
  }, [currentPage]);

  const itemsPerPage = 5; //페이지당 보일 항목 수
  const inquiryType = 'IT002';
  const navigate = useNavigate();

  //1:1문의하기 이동
  const moveMyInquiryForm = () => {
    navigate(`/mypage/inquiryWrite`, {
      state: {
        from: 'myInquiryList',
        mode: 'CREATE',
      },
    });
  };

  //문의 내용 상세보기 이동
  const moveMyInquiryDetail = (inquiryNo) => {
    console.log(inquiryNo);
    navigate(`/mypage/myInquiryDetail/${inquiryNo}`);
  };

  const myInquirycolumns = [
    {
      key: 'inquiryNo',
      header: '글번호',
      width: '80px',
    },
    {
      key: 'inquiryStatusNm',
      header: '답변상태',
      width: '120px',
    },
    {
      key: 'inquiryCategoryNm',
      header: '문의유형',
      width: '150px',
    },
    {
      key: 'inquiryTitle',
      header: '제목',
      render: (value, row) => {
        return (
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => moveMyInquiryDetail(row.inquiryNo)}
          >
            {value}
          </span>
        );
      },
    },
    // {
    //   key: 'inquiryUserNm',
    //   header: '작성자',
    //   width: '150px',
    // },
    {
      key: 'inquiryDate',
      header: '작성일',
      width: '200px',
    },
  ];

  //1:1문의 목록 조회하기
  const fetchMyInquiryList = async () => {
    setLoading(true);
    setError(false);
    setErrorMessage(null);

    try {
      const { list, totalPages } = await selectMyInquiryList({
        inquiryType: inquiryType,
        // userNo: userNo, //로그인 사용자의 userNo로 조회
        currentPage: currentPage,
        pageSize: itemsPerPage,
      });

      console.log(list);
      console.log(totalPages);

      setMyInquiryList(list);
      setTotalPages(totalPages);
    } catch (error) {
      setError(true);
      const serverMessage =
        error.response?.data?.message ??
        '1:1문의 내역 조회 중 오류가 발생했습니다.';
      setErrorMessage(serverMessage);
      setMyInquiryList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyInquiryList();
  }, [currentPage]);

  return (
    <div>
      <div className="pb-10">
        <MyButton className="px-8 py-3 text-xl" onClick={moveMyInquiryForm}>
          문의하기
        </MyButton>
      </div>

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
          <CommonTable
            columns={myInquirycolumns}
            data={myInquiryList}
          ></CommonTable>
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
