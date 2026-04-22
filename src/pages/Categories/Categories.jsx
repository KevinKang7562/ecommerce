import { useContext, useEffect } from 'react';

import Spinner from '../../components/Spinner/Spinner';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { SHOPPING_PATH, IMAGE_BASE_URL } from '../../constants/api';
import api from '../../api/axios';

export default function Categories() {
  const navigate = useNavigate();

  async function getCategories() {
    // axios.js의 인터셉터가 헤더 붙이고, 에러 나면 alert까지 처리
    const response = await api.post(
      `${SHOPPING_PATH}/selectCategories.do`,
      {},
      { meta: { errorType: 'INLINE' } },
    );
    return response.data.data;
  }

  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const handleCategoryClick = (category) => {
    // DB에서 카테고리 상품 조회를 위해 카테고리ID와 이름으로 쿼리 파라미터 전달

    navigate(
      `/search?categoryId=${category.categoriesId}&categoryName=${encodeURIComponent(category.name)}`,
    );
  };

  return (
    <div className="container py-5 flex flex-wrap items-center">
      {/* 💡 제목 스타일을 공지사항과 동일하게 변경 */}
      <h2
        style={{
          marginTop: '20px', // 제목 상단 여백 추가
          marginBottom: '16px',
          fontSize: '28px',
          fontWeight: 800,
          letterSpacing: '-0.4px',
          color: '#0f172a',
          lineHeight: 1.1,
          fontFamily: 'Inter, Arial, sans-serif',
          width: '100%', // 한 줄을 다 차지하도록 설정
        }}
      >
        상품 카테고리
      </h2>
      {data ? (
        data.map((category) => (
          <div
            className="w-full lg:md:w-1/4 md:w-1/3 sm:w-1/2 p-3 cursor-pointer"
            key={category.categoriesId}
            onClick={() => handleCategoryClick(category)}
          >
            <div className="relative bg-white mx-auto hover:shadow-green-300 transition-shadow shadow-md rounded-lg max-w-sm dark:bg-gray-800 dark:border-gray-700 hover:-translate-y-1 transform transition-transform duration-200">
              <img
                className="rounded-t-lg object-cover object-top w-full h-80"
                src={`${IMAGE_BASE_URL}${category.image}`}
                alt={category.title}
              />
              <div className="px-5 py-2">
                <h3 className="text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-xl tracking-tight dark:text-white">
                  {category.name}
                </h3>
              </div>
            </div>
          </div>
        ))
      ) : (
        <Spinner />
      )}
    </div>
  );
}
