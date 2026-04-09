import { useContext, useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { wishlistContext } from '../../context/Wishlist/Wishlist';
import Spinner from '../../components/Spinner/Spinner';
import ProductItem from '../../components/ProductItem/ProductItem';
import { productsContext } from '../../context/Products/Products';

export default function Search() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { searchRes } = useContext(productsContext);
  const categoryIdFromQuery = searchParams.get('categoryId');
  const categoryNameFromQuery = searchParams.get('categoryName');

  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { getWishlist, addToWishlist, deleteWishlistItem } =
    useContext(wishlistContext);

  const [wishlistIds, setWishlistIds] = useState(null);

  async function handleWishlist(id) {
    if (wishlistIds?.indexOf(id) !== -1) {
      await deleteWishlistItem(id);
    } else {
      const product = searchRes?.find((item) => item._id === id);
      await addToWishlist(product ?? id);
    }
    main();
  }

  async function main() {
    const wishlistItems = await getWishlist();
    const ids = wishlistItems.map((item) => item._id);
    setWishlistIds(ids);
  }

  useEffect(() => {
    main();
  }, []);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!categoryIdFromQuery) {
        setProducts(searchRes || []);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('=== selectProducts 호출 ===');
        console.log('categoryIdFromQuery:', categoryIdFromQuery);
        
        const response = await api.post('/api/shopping/selectProducts.do', {
          categoriesId: categoryIdFromQuery,  // DTO의 categoriesId 필드로 조회
        });

        console.log('응답 데이터:', response.data);
        const resData = response?.data?.data ?? response?.data;
        setProducts(Array.isArray(resData) ? resData : []);
      } catch (err) {
        console.error('에러:', err);
        setError('상품 조회 중 오류가 발생했습니다.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [categoryIdFromQuery, searchRes]);

  return (
    <>
      <div className="container flex flex-wrap items-center">
        <h3 className="text-3xl font-medium mb-5 w-full">
          {categoryIdFromQuery ? `${categoryNameFromQuery} 상품 리스트` : 'Search Results:'}
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
