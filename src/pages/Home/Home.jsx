import CategorySlider from '../../components/CategorySlider/CategorySlider';
import Products from '../../components/Products/Products';
import MainSlider from '../../components/MainSlider/MainSlider';
import ProductSlider from '../../components/ProductSlider/ProductSlider';
import { SHOPPING_PATH } from '../../constants/api';

export default function Home() {
  return (
    <>
      <MainSlider />
      {/* <CategorySlider /> */}
      <ProductSlider
        title="베스트 상품"
        apiEndpoint={`${SHOPPING_PATH}/selectBestProducts.do`}
      />
      <ProductSlider
        title="이달의 신상품"
        apiEndpoint={`${SHOPPING_PATH}/selectNewProducts.do`}
      />

      <Products />
    </>
  );
}
