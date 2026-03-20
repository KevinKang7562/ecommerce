import { createContext, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { authContext } from '../Auth/Auth';

export const wishlistContext = createContext(null);

const STORAGE_KEY = 'wishlistItems';

function readWishlist() {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];

    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function writeWishlist(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function normalizeWishlistItem(productOrId) {
  if (typeof productOrId === 'object' && productOrId !== null) {
    const id = productOrId._id ?? productOrId.id ?? productOrId.prodNo;

    if (id == null) {
      throw new Error('상품 식별자가 없습니다.');
    }

    return {
      _id: String(id),
      title:
        productOrId.title ??
        productOrId.prodNm ??
        productOrId.name ??
        'Wishlist Product',
      imageCover:
        productOrId.imageCover ??
        productOrId.mainImage ??
        productOrId.imgUrl ??
        '',
      price: Number(productOrId.price ?? productOrId.discountPrice ?? 0),
    };
  }

  if (productOrId == null || productOrId === '') {
    throw new Error('상품 식별자가 없습니다.');
  }

  return {
    _id: String(productOrId),
    title: 'Wishlist Product',
    imageCover: '',
    price: 0,
  };
}

export default function WishlistContextProvider(props) {
  useContext(authContext);

  function addToWishlist(productOrId) {
    return toast.promise(
      Promise.resolve().then(() => {
        const nextItem = normalizeWishlistItem(productOrId);
        const wishlistItems = readWishlist();
        const exists = wishlistItems.some((item) => item._id === nextItem._id);

        if (!exists) {
          writeWishlist([...wishlistItems, nextItem]);
        }

        return { data: readWishlist() };
      }),
      {
        loading: 'Adding product to wishlist...',
        success: 'Product added successfully!',
        error: 'Error adding product',
      },
    );
  }

  function deleteWishlistItem(id) {
    return toast.promise(
      Promise.resolve().then(() => {
        const nextItems = readWishlist().filter(
          (item) => item._id !== String(id),
        );
        writeWishlist(nextItems);
        return { data: nextItems };
      }),
      {
        loading: 'Removing product from wishlist...',
        success: 'Product removed successfully!',
        error: 'Error removing product',
      },
    );
  }

  function getWishlist() {
    return Promise.resolve(readWishlist());
  }

  return (
    <wishlistContext.Provider
      value={{ addToWishlist, getWishlist, deleteWishlistItem }}
    >
      {props.children}
    </wishlistContext.Provider>
  );
}
