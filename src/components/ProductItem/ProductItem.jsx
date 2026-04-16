import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { cartContext } from '../../context/Cart/CartContextProvider';
import { useNavigate } from 'react-router-dom';
import StarRating from '../StarRating/StarRating';
import { DEFAULT_PRODUCT_IMAGE, IMAGE_BASE_URL } from '../../constants/api';

export default function ProductItem({ product }) {
  const { addProduct } = useContext(cartContext);
  const navigate = useNavigate(); // ✨ 2. navigate 객체 생성

  // ✨ 3. 카드 전체 클릭 시 실행할 이동 함수
  const handleCardClick = () => {
    navigate(`/product/${product.prodNo}`);
  };

  // 백엔드에서 받아온 리뷰 통계 데이터 꺼내기 (없으면 0으로 안전하게 처리)
  const reviewAvg = product.reviewAvg || 0;
  const reviewCount = product.reviewCount || 0;
  const handleAddToCart = (e) => {
    e.stopPropagation(); // ✨ 핵심: 클릭이 부모(카드)로 번져서 페이지 이동되는 걸 막음!
    const productId = product?.prodNo;
    if (!productId) {
      return;
    }
    addProduct(productId);
  };

  return (
    <div className="w-full lg:md:w-1/4 md:w-1/3 sm:w-1/2 p-3">
      {/* ✨ 4. Link를 없애고 카드 전체 div에 onClick과 cursor-pointer 적용 */}
      <div
        onClick={handleCardClick}
        className="relative bg-white mx-auto hover:scale-105 transition-all duration-400 hover:shadow-green-300 shadow-md rounded-lg max-w-sm dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
      >
        {/* 상품이미지 */}

        <img
          src={`${IMAGE_BASE_URL}${product.imgUrl}` || DEFAULT_PRODUCT_IMAGE}
          className="w-full aspect-square object-cover rounded-t-lg bg-gray-100"
          alt={product.prodNm || '상품 이미지'}
          loading="lazy"
          onError={(e) => {
            e.target.src = DEFAULT_PRODUCT_IMAGE;
          }}
        />

        {/* 상품 정보 */}
        <div className="px-5 pb-5" style={{ marginTop: '0.75rem' }}>
          {/* 제목 (Link 태그 제거, 하지만 hover:underline으로 링크처럼 보이게 유지) */}
          <h3 className="text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-xl tracking-tight dark:text-white hover:underline">
            {product.prodNm}
          </h3>
          {/* 리뷰 통계표시 */}
          <div className="flex items-center mt-2.5 mb-5">
            {/*  새로 만든 별점 컴포넌트 호출 (평균 점수 반올림해서 전달) */}
            <span className="flex items-center">
              <StarRating rating={Math.round(reviewAvg)} />
            </span>

            {/*  평균 점수 소수점 1자리까지 표시 (예: 4.0) */}
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ml-3">
              {reviewAvg.toFixed(1)}
            </span>

            {/*  총 리뷰 갯수 표시 */}
            <span className="text-sm text-gray-500 ml-2">({reviewCount})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="md:text-xl text-2xl font-bold text-gray-900 dark:text-white">
              {Number(product.price).toLocaleString()} 원
            </span>
            <button
              type="button"
              onClick={handleAddToCart}
              className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              장바구니
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
