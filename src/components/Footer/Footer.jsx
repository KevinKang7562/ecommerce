import { Link } from 'react-router-dom';
import logo from '../../assets/freshcart-logo.svg';
import { useContext } from 'react';
import { authContext } from '../../context/Auth/Auth';

export default function Footer() {
  const { userToken } = useContext(authContext);

  return (
    <>
      <footer className="bg-white border border-t-1 mt-6 dark:bg-gray-900">
        <div className=" p-6 mx-auto">
          <div className="lg:flex">
            <div className="w-full -mx-6 lg:w-2/5">
              <div className="px-6">
                <a href="/">
                  <img className="w-auto h-7" src={logo} alt="Site Logo" />
                </a>
                <div className="max-w-sm mt-2 text-gray-500 dark:text-gray-400">
                  Discover More, Spend Less - Shop the Best at Your Fingertips!
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 lg:flex-1">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <h3 className="text-gray-700 uppercase dark:text-white">
                    Jump to
                  </h3>
                  {userToken ? (
                    <>
                      <Link
                        to="/"
                        className="block mt-2 text-sm text-gray-600 dark:text-gray-400 hover:underline"
                      >
                        <i className="fa-fw  fas fa-home"></i> Home
                      </Link>

                      <Link
                        to="/cart"
                        className="block mt-2 text-sm text-gray-600 dark:text-gray-400 hover:underline"
                      >
                        <i className="fa-fw  fas fa-shopping-cart"></i> 장바구니
                      </Link>

                      <Link
                        to="/categories"
                        className="block mt-2 text-sm text-gray-600 dark:text-gray-400 hover:underline"
                      >
                        <i className="fa-fw  fas fa-list"></i> 카테고리
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="login"
                        className="block mt-2 text-sm text-gray-600 dark:text-gray-400 hover:underline"
                      >
                        <i className="fas fa-sign-in-alt"></i> Login
                      </Link>
                      <Link
                        to="register"
                        className="block mt-2 text-sm text-gray-600 dark:text-gray-400 hover:underline"
                      >
                        <i className="fas fa-user-plus fa-fw"></i> Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <hr className="h-px my-4 bg-gray-200 border-none dark:bg-gray-700" />
          <div>
            <div className="text-center text-gray-500 dark:text-gray-400">
              &quot;It does not matter how slowly you go as long as you do not
              stop.&quot; - <span className="italic text-md">Confucius</span>
            </div>
          </div>
          <div>
            <div className="text-center italic py-3 text-gray-500 dark:text-gray-400">
              Made with love and passion by Mohamed Emary
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
