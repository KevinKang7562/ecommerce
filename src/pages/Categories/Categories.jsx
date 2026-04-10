import { useContext, useEffect } from 'react';

import Spinner from '../../components/Spinner/Spinner';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { productsContext } from '../../context/Products/Products';
import { SHOPPING_PATH } from '../../constants/api';
import api from '../../api/axios';

export default function Categories() {
  const navigate = useNavigate();
  const { data: products, setSearchRes } = useContext(productsContext);

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
    setSearchRes(null);
    navigate(
      `/search?categoryId=${category.categoriesId}&categoryName=${encodeURIComponent(category.name)}`,
    );
  };

  //불필요 getCategories는 state로 관리할 필요가 없고, react-query의 useQuery 훅이 데이터를 캐싱하고 관리하기 때문에 useEffect로 getCategories를 호출할 필요가 없습니다.
  // useEffect(() => {
  //   getCategories();
  // }, []);

  return (
    <div className="container flex flex-wrap items-center">
      <h3 className="text-3xl font-medium mb-5 w-full">상품 카테고리</h3>
      {data ? (
        data.map((category) => (
          <div
            className="w-full lg:md:w-1/4 md:w-1/3 sm:w-1/2 p-3 cursor-pointer"
            key={category._id}
            onClick={() => handleCategoryClick(category)}
          >
            <div className="relative bg-white mx-auto hover:shadow-green-300 transition-shadow shadow-md rounded-lg max-w-sm dark:bg-gray-800 dark:border-gray-700 hover:-translate-y-1 transform transition-transform duration-200">
              <img
                className="rounded-t-lg sm:object-cover object-contain object-top w-full h-80"
                src={category.image}
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
        <div className="w-full">
          <Spinner />
        </div>
      )}
    </div>
  );
}
