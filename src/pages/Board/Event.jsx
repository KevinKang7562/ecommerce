import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../../components/Spinner/Spinner';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { API_BASE_URL, SESSION_ALERT } from '../../constants/api';
import { logout } from '../../components/Navbar/Navbar';

export default function Event() {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('ongoing'); // 'ongoing' | 'ended'

  const statusMap = {
    ongoing: 'ES02', // 진행중
    ended: 'ES03',   // 종료
  };

  // API 호출: eventStatus 를 body에 포함
  async function getEvent(eventStatus) {
    const url = `${API_BASE_URL}/api/board/selectEvent.do`;

    const requestBody = {
      'eventStatus': eventStatus ?? statusMap[activeTab]
    };

    const requestHeaders = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.post(url, requestBody, {
        headers: requestHeaders,
      });
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 401) {
        alert(`${SESSION_ALERT}`);
        logout();
        window.location.href = '/login';
        throw error;
      }
      alert(error);
      throw error;
    }
  }

  // useQuery: activeTab 변경 시 쿼리키가 바뀌어 재요청됨
  const { data, isLoading } = useQuery({
    queryKey: ['event', activeTab],
    queryFn: () => getEvent(statusMap[activeTab]),
    retry: false,
  });

  function onItemClick(item) {
    // 상세페이지로 이동 (예: /eventdetail/123)
    navigate('/eventdetail/' + item.boardNo);
  }

  useEffect(() => {
    // no-op
  }, []);

  return (
    <>
      <div className="container">

        { /* 제목 */ }
        <h3 className="text-3xl font-medium mb-5 w-full">이벤트</h3>

        {/* 탭 네비게이션 */}
        <div className="flex items-center justify-start gap-3 mb-6">
          <button
            onClick={() => {
              setActiveTab('ongoing');
            }}
            aria-pressed={activeTab === 'ongoing'}
            className={`px-4 py-2 rounded-md font-semibold transition ${
              activeTab === 'ongoing'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            진행중 이벤트
          </button>

          <button
            onClick={() => {
              setActiveTab('ended');
            }}
            aria-pressed={activeTab === 'ended'}
            className={`px-4 py-2 rounded-md font-semibold transition ${
              activeTab === 'ended'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            종료된 이벤트
          </button>
        </div>

        {/* 설명 */}
        <p className="text-sm text-gray-500 mb-6">
          {activeTab === 'ongoing' ? '현재 진행중인 이벤트 목록입니다.' : '종료된 이벤트 목록입니다.'}
        </p>

        {/* 컨텐츠 그리드 (두 탭에 동일한 레이아웃, API는 eventStatus로 분기) */}
        <div className="flex flex-wrap items-center">
          {isLoading ? (
            <div className="w-full">
              <Spinner />
            </div>
          ) : data && data.length ? (
            data.map((event) => (
              <div className="w-full lg:md:w-1/4 md:w-1/3 sm:w-1/2 p-3" key={event._id}>
                <div className="relative bg-white mx-auto hover:shadow-green-300 transition-shadow shadow-md rounded-lg max-w-sm dark:bg-gray-800 dark:border-gray-700">
                  <img
                    onClick={() => onItemClick(event)}
                    className="rounded-t-lg sm:object-cover object-contain object-top w-full h-80"
                    src={event.imgUrl}
                    alt={event.title}
                  />
                  <div className="px-5 py-2">
                    <p className="text-yellow-500 dark:text-yellow-300 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-base tracking-tight">
                      {event.title}
                    </p>
                  </div>
                  <div className="px-5 py-2 text-center">
                    <p className="text-yellow-500 dark:text-yellow-300 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-base tracking-tight">
                      {event.startDate} ~ {event.endDate}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full text-center text-gray-500">표시할 항목이 없습니다.</div>
          )}
        </div>
      </div>
    </>
  );
}
