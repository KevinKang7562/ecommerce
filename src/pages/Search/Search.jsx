import { useContext, useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { wishlistContext } from '../../context/Wishlist/Wishlist';
import Spinner from '../../components/Spinner/Spinner';
import ProductItem from '../../components/ProductItem/ProductItem';

import { useQuery } from '@tanstack/react-query';

import { SHOPPING_PATH } from '../../constants/api';

export default function Search() {
  // const location = useLocation();
  const [searchParams] = useSearchParams();
  // const { searchRes } = useContext(productsContext);
  const categoryIdFromQuery = searchParams.get('categoryId');
  const categoryNameFromQuery = searchParams.get('categoryName');
  const keywordFromQuery = searchParams.get('keyword'); // 네비바 검색어 쿼리 파라미터

  const { getWishlist, addToWishlist, deleteWishlistItem } =
    useContext(wishlistContext);

  const [wishlistIds, setWishlistIds] = useState(null);

  // 위시리스트 초기 로딩 함수 (헷갈리던 main() 이름을 직관적으로 변경)
  const fetchWishlist = async () => {
    try {
      const wishlistItems = await getWishlist();
      const ids = wishlistItems.map((item) => item._id);
      setWishlistIds(ids);
    } catch (err) {
      console.error('위시리스트 로딩 에러:', err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // 위시리스트 추가/삭제 핸들러
  async function handleWishlist(id) {
    if (wishlistIds?.includes(id)) {
      await deleteWishlistItem(id);
    } else {
      // 옛날의 searchRes(Context) 대신, 방금 useQuery로 가져온 products에서 상품을 찾습니다
      const product = products?.find((item) => item._id === id);
      await addToWishlist(product ?? id);
    }
    fetchWishlist(); // 하트 색깔 갱신
  }

  // useQuery 도입: useState 3개(products, loading, error)와 useEffect를 이거 하나로 압축
  const {
    data: products,
    isLoading: loading,
    isError: error,
  } = useQuery({
    // categoryIdFromQuery가 바뀔 때마다 알아서 쿼리를 다시 실행하고 캐싱합니다.
    queryKey: ['products', categoryIdFromQuery, keywordFromQuery], // 검색어도 쿼리 키에 추가해서 검색어 변경 시에도 데이터 갱신
    queryFn: async () => {
      // if (!categoryIdFromQuery) return []; // 카테고리 ID가 없으면 빈 배열 반환

      // const response = await api.post('/api/shopping/selectProducts.do', {
      //   categoriesId: categoryIdFromQuery,
      // });
      //위에서 아래로 수정(네비바에 검색어로 검색하는 것 추가됨)
      if (!categoryIdFromQuery && !keywordFromQuery) return [];

      // ✨ 4. 서버로 보낼 택배 상자(데이터) 조립
      const requestData = {};
      if (categoryIdFromQuery) requestData.categoriesId = categoryIdFromQuery;

      // 주의: 'searchKeyword' 부분은 질문자님의 Spring 백엔드 DTO 변수명과 똑같이 맞춰주세요!
      if (keywordFromQuery) requestData.searchKeyword = keywordFromQuery;

      const response = await api.post(
        `${SHOPPING_PATH}/selectProducts.do`,
        requestData,
      );
      return response?.data?.data ?? response?.data ?? [];
    },
  });

  return (
    <>
      <div className="container flex flex-wrap items-center">
        <h3 className="text-3xl font-medium mb-5 w-full">
          {categoryIdFromQuery
            ? `${categoryNameFromQuery} 상품 리스트`
            : keywordFromQuery
              ? `"${keywordFromQuery}" 검색 결과`
              : 'Search Results'}
        </h3>
        {loading ? (
          <div className="w-full">
            <Spinner />
          </div>
        ) : error ? (
          <div className="w-full py-20 text-center text-red-500">{error}</div>
        ) : products && products.length > 0 ? (
          products.map((product) => (
            <ProductItem
              product={product}
              isWished={wishlistIds?.indexOf(product._id) !== -1 ? true : false}
              key={product._id}
              handleWishlist={handleWishlist}
            />
          ))
        ) : (
          <div className="w-full py-20 text-center text-gray-500">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </>
  );
}
