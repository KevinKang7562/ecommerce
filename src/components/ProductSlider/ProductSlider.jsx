import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import Spinner from '../Spinner/Spinner';
import api from '../../api/axios';
import StarRating from '../StarRating/StarRating';
import ProductImg from '../ProductImg/ProductImg';
import { cartContext } from '../../context/Cart/CartContextProvider';

export default function ProductSlider({ title, apiEndpoint }) {
  const [products, setProducts] = useState(null);
  const navigate = useNavigate();
  const { addProduct } = useContext(cartContext);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await api.post(apiEndpoint, {});
        if (response.data && response.data.data) {
          setProducts(response.data.data);
        }
      } catch (error) {
        console.error('상품 목록을 불러오는데 실패했습니다.', error);
      }
    }
    fetchProducts();
  }, [apiEndpoint]);

  const settings = {
    dots: true,
    infinite: products && products.length > 4,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          infinite: products && products.length > 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          infinite: products && products.length > 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          infinite: products && products.length > 1,
        },
      },
    ],
  };

  const handleCardClick = (prodNo) => {
    navigate(`/product/${prodNo}`);
  };

  const handleAddToCart = (e, prodNo) => {
    e.stopPropagation();
    if (!prodNo) return;
    addProduct(prodNo);
  };

  return (
    <div className="container flex flex-col my-10 relative overflow-hidden">
      {/* <h3 className="text-3xl font-medium mb-5"> */}
      <h3
        style={{
          marginTop: '20px', // 제목 상단 여백 추가
          marginBottom: '16px',
          fontSize: '28px',
          fontWeight: 800,
          letterSpacing: '-0.4px',
          color: '#0f172a',
          lineHeight: 1.1,
          fontFamily: 'Inter, Arial, sans-serif',
          width: '100%',
        }}
      >
        {title}
      </h3>
      {products ? (
        products.length > 0 ? (
          <div className="w-full relative px-2">
            <Slider {...settings}>
              {products.map((product) => {
                const reviewAvg = product.reviewAvg || 0;
                const reviewCount = product.reviewCount || 0;

                return (
                  <div key={product.prodNo} className="p-3 outline-none">
                    <div
                      onClick={() => handleCardClick(product.prodNo)}
                      className="relative bg-white mx-auto hover:-translate-y-1 transition-transform duration-300 hover:shadow-green-300 shadow-md rounded-lg max-w-sm dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
                    >
                      <ProductImg
                        src={product.imgUrl}
                        className="w-full rounded-t-lg h-60 object-cover"
                      />

                      <div className="px-5 pb-5 mt-3">
                        <h3 className="text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-xl tracking-tight dark:text-white hover:underline">
                          {product.prodNm}
                        </h3>
                        <div className="flex items-center mt-2.5 mb-5">
                          <span className="flex items-center">
                            <StarRating rating={Math.round(reviewAvg)} />
                          </span>
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ml-3">
                            {reviewAvg.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({reviewCount})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="md:text-xl text-lg font-bold text-gray-900 dark:text-white break-keep mr-2">
                            {Number(product.price).toLocaleString()}원
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(e, product.prodNo)}
                            className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg px-2 lg:px-4 py-2 mt-1 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 break-keep"
                          >
                            장바구니
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Slider>
          </div>
        ) : (
          <p className="text-gray-500">조회된 상품이 없습니다.</p>
        )
      ) : (
        <Spinner />
      )}
    </div>
  );
}
