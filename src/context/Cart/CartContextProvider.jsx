import { createContext } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

export const cartContext = createContext(null);

export default function CartContextProvider(props) {
  const URL = '/api/shopping/cart';

  function getProducts() {
    return api
      .get(URL)
      .then((response) => response.data?.data ?? response.data)
      .catch((error) => {
        throw error;
      });
  }

  function addProduct(id, quantity = 1) {
    const safeQuantity = Math.max(1, Number(quantity) || 1);
    const data = {
      productId: id,
      prodNo: id,
      count: safeQuantity,
      quantity: safeQuantity,
    };

    return toast.promise(
      api
        .post(URL, data)
        .then((response) => response.data)
        .catch((error) => {
          throw error;
        }),
      {
        loading: '장바구니에 담는 중...',
        success: '장바구니에 담았습니다.',
        error: '장바구니 담기에 실패했습니다.',
      }
    );
  }

  function deleteProduct(id) {
    return toast.promise(
      api
        .delete(`${URL}/${id}`)
        .then((response) => response.data)
        .catch((error) => {
          throw error;
        }),
      {
        loading: '상품 삭제 중...',
        success: '상품을 삭제했습니다.',
        error: '상품 삭제에 실패했습니다.',
      }
    );
  }

  function updateProductQuantity(id, quantity) {
    const data = { count: quantity };

    return toast.promise(
      api
        .put(`${URL}/${id}`, data)
        .then((response) => response.data)
        .catch((error) => {
          throw error;
        }),
      {
        loading: '수량 변경 중...',
        success: '수량을 변경했습니다.',
        error: '수량 변경에 실패했습니다.',
      }
    );
  }

  function emptyCart() {
    return api
      .delete(URL)
      .then((response) => response.data)
      .catch((error) => {
        throw error;
      });
  }

  return (
    <cartContext.Provider
      value={{
        getProducts,
        addProduct,
        deleteProduct,
        updateProductQuantity,
        emptyCart,
      }}
    >
      {props.children}
    </cartContext.Provider>
  );
}
