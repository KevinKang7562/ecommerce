import { DEFAULT_PRODUCT_IMAGE, IMAGE_BASE_URL } from '../../constants/api';

const ProductImg = ({
  src, // 이미지의 상대 경로 (예: product.imgUrl)
  alt = '상품 이미지', // 기본 alt 텍스트
  className = 'w-24 h-24  rounded-lg ', // 기본 클래스 (필요에 따라 조정)
  loading = 'lazy', // 기본 lazy loading
  ...props // 기타 props (예: onClick 등)
}) => {
  return (
    <img
      src={src ? `${IMAGE_BASE_URL}${src}` : DEFAULT_PRODUCT_IMAGE}
      alt={alt}
      className={`object-cover aspect-square  bg-gray-100 ${className}`}
      loading={loading}
      // onError는 '주소는 멀쩡한데 막상 서버에 가보니 이미지가 지워졌거나 엑스박스 뜰 때'를 대비
      onError={(e) => {
        e.target.src = DEFAULT_PRODUCT_IMAGE; // 에러 시 대체 이미지
      }}
      {...props} // 추가 props 전달
    />
  );
};

export default ProductImg;
