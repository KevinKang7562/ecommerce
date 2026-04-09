import { useContext, useEffect } from 'react';
import axios from 'axios';
import Spinner from '../../components/Spinner/Spinner';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { productsContext } from '../../context/Products/Products';
import { SHOPPING_API_BASE_URL } from '../../config/api';

export default function Categories() {
  const navigate = useNavigate();
  const { data: products, setSearchRes } = useContext(productsContext);

  async function getCategories() {
    const url = `${SHOPPING_API_BASE_URL}/selectCategories.do`;

    try {
      const response = await axios.post(
        url,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.data;
    } catch (error) {
      alert(error);
      throw error;
    }
  }

  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const handleCategoryClick = (category) => {
    // DB에서 카테고리 상품 조회를 위해 카테고리ID와 이름으로 쿼리 파라미터 전달
    setSearchRes(null);
    navigate(`/search?categoryId=${category.categoriesId}&categoryName=${encodeURIComponent(category.name)}`);
  };

  useEffect(() => {
    getCategories();
  }, []);

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
