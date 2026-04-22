import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CommonTable from '../../../components/MyPageCommon/Common/CommonTable';
import Pagination from '../../../components/MyPageCommon/Common/Pagination';
import { MyInquiryContext } from '../../../context/Inquiry/MyInquiry';
import ProductImg from '../../../components/ProductImg/ProductImg';
import Spinner from '../../../components/Spinner/Spinner';
import api from '../../../api/axios';
import { useCommCd } from '../../../hooks/useCommCd';
import { useModal } from '../../../context/ModalContext/ModalContext';

export default function MyProductQnA() {
  const { showAlert, showConfirm } = useModal();
  const { selectMyProductQnAList } = useContext(MyInquiryContext);

  // =====================================================================
  // 1. 상태 관리 (State)
  // =====================================================================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [MyProductQnA, setMyProductQnA] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [expandedId, setExpandedId] = useState(null); // 펼쳐진 문의 번호

  // [수정/삭제] 인라인 폼 관련 상태
  const [editInquiryNo, setEditInquiryNo] = useState(null);
  const [editForm, setEditForm] = useState({
    inquiryCategory: '',
    inquiryTitle: '',
    inquiryContent: '',
  });

  const { codes: inquiryCategoryOptions } = useCommCd({
    hCd: 'INQUIRY_CATEGORY',
    refCd: 'IT001',
  });

  const itemsPerPage = 5;
  const inquiryType = 'IT001';

  // =====================================================================
  // 2. 데이터 조회 로직
  // =====================================================================
  const fetchMyProductQnAList = async () => {
    setLoading(true);
    setError(false);
    setErrorMessage(null);
    try {
      const { list, totalPages } = await selectMyProductQnAList({
        inquiryType: inquiryType,
        currentPage: currentPage,
        pageSize: itemsPerPage,
      });
      setMyProductQnA(list);
      setTotalPages(totalPages);
    } catch (error) {
      setError(true);
      const serverMessage =
        error.response?.data?.message ??
        '상품 Q&A 내역 조회 중 오류가 발생했습니다.';
      setErrorMessage(serverMessage);
      setMyProductQnA([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProductQnAList();
  }, [currentPage]);

  // =====================================================================
  // 3. 수정 / 삭제 로직 (직접 api 호출)
  // =====================================================================
  const handleDeleteQnA = async (inquiryNo) => {
    const confirmed = await showConfirm(
      '정말 문의를 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.',
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      await api.post('/api/inquiry/deleteMyInquiry.do', { inquiryNo });
      await showAlert('문의가 삭제되었습니다.');
      fetchMyProductQnAList(); // 목록 갱신
    } catch (error) {
      await showAlert(error.response?.data?.message || '삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQnA = async (e, inquiryNo) => {
    e.preventDefault();
    if (!editForm.inquiryTitle.trim() || !editForm.inquiryContent.trim()) {
      await showAlert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('inquiryNo', inquiryNo);
    formData.append('inquiryCategory', editForm.inquiryCategory);
    formData.append('inquiryTitle', editForm.inquiryTitle.trim());
    formData.append('inquiryContent', editForm.inquiryContent.trim());

    try {
      setLoading(true);
      await api.post('/api/inquiry/updateMyInquiry.do', formData);
      await showAlert('성공적으로 수정되었습니다.');
      setEditInquiryNo(null); // 수정 폼 닫기
      fetchMyProductQnAList(); // 목록 갱신
    } catch (error) {
      await showAlert(error.response?.data?.message || '수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // =====================================================================
  // 4. 테이블 컬럼 및 상세 UI 정의
  // =====================================================================
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

  // 클릭 시 보여줄 상세 UI (수정 모드 vs 일반 모드)
  const renderInquiryDetail = (row) => {
    const isEditing = editInquiryNo === row.inquiryNo;
    const isAnswered = Boolean(row.answerContent);

    // 🎯 [수정 폼 모드]
    if (isEditing) {
      return (
        <div className="p-4 sm:p-6 text-start flex flex-col gap-4 bg-white border-x-4 border-l-blue-500">
          <form
            onSubmit={(e) => handleUpdateQnA(e, row.inquiryNo)}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">
                문의유형
              </label>
              <select
                value={editForm.inquiryCategory}
                onChange={(e) =>
                  setEditForm({ ...editForm, inquiryCategory: e.target.value })
                }
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">선택</option>
                {inquiryCategoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">제목</label>
              <input
                type="text"
                value={editForm.inquiryTitle}
                onChange={(e) =>
                  setEditForm({ ...editForm, inquiryTitle: e.target.value })
                }
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700">내용</label>
              <textarea
                value={editForm.inquiryContent}
                onChange={(e) =>
                  setEditForm({ ...editForm, inquiryContent: e.target.value })
                }
                rows={4}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setEditInquiryNo(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-800"
              >
                저장
              </button>
            </div>
          </form>
        </div>
      );
    }

    // 🎯 [일반 조회 모드]
    return (
      <div className="p-4 sm:p-6 text-start flex flex-col gap-4 bg-white border-x-4 border-l-green-700">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <span className="text-red-500 font-bold text-sm sm:text-base">
                문의내용
              </span>
              <p className="text-gray-800 whitespace-pre-wrap text-sm sm:text-base">
                {row.inquiryContent}
              </p>
            </div>

            {/* 답변 대기 상태일 때만 수정/삭제 노출 */}
            {!isAnswered && (
              <div className="flex gap-3 text-sm shrink-0 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditInquiryNo(row.inquiryNo);
                    setEditForm({
                      inquiryCategory: row.inquiryCategory || '',
                      inquiryTitle: row.inquiryTitle || '',
                      inquiryContent: row.inquiryContent || '',
                    });
                  }}
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteQnA(row.inquiryNo)}
                  className="text-gray-400 hover:text-red-600 font-semibold transition-colors"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
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
  };

  // =====================================================================
  // 5. 화면 렌더링
  // =====================================================================
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="overflow-x-auto">
        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="py-20 text-center text-red-500 text-sm sm:text-base">
            {errorMessage}
          </div>
        ) : (
          <CommonTable
            columns={myProductQnAcolumns}
            data={MyProductQnA}
            keyName="inquiryNo"
            expandedId={expandedId}
            renderExpansion={renderInquiryDetail}
          />
        )}
      </div>

      {!loading && !error && totalPages > 0 && (
        <div className="border-t pt-4 mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}
    </div>
  );
}
