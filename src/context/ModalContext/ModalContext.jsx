import { createContext, useContext, useState } from 'react';

// 1. Context 생성
const ModalContext = createContext();

// 2. 커스텀 훅 (다른 컴포넌트에서 쉽게 꺼내 쓰기 위함)
export const useModal = () => useContext(ModalContext);

// 3. Provider 컴포넌트
export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'alert', // 'alert' | 'confirm'
    message: '',
    resolve: null, // Promise의 resolve 함수를 저장할 곳
  });

  // 💡 Alert 호출 함수 (Promise 반환)
  const showAlert = (message) => {
    return new Promise((resolve) => {
      setModal({ isOpen: true, type: 'alert', message, resolve });
    });
  };

  // 💡 Confirm 호출 함수 (Promise 반환)
  const showConfirm = (message) => {
    return new Promise((resolve) => {
      setModal({ isOpen: true, type: 'confirm', message, resolve });
    });
  };

  // 버튼 클릭 시 모달 닫기 및 결과 반환
  const handleClose = (result) => {
    if (modal.resolve) {
      modal.resolve(result); // 확인(true) 또는 취소(false) 결과 반환
    }
    setModal({ ...modal, isOpen: false });
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {/* 모달 UI (isOpen이 true일 때만 렌더링) */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm transform transition-all">
            {/* 아이콘 및 메시지 */}
            <div className="text-center mb-6 mt-4">
              <div className="text-3xl mb-3">
                {modal.type === 'confirm' ? '🤔' : '💡'}
              </div>
              <p className="text-gray-800 font-medium whitespace-pre-line text-base">
                {modal.message}
              </p>
            </div>

            {/* 버튼 영역 */}
            <div className="flex gap-2 w-full">
              {modal.type === 'confirm' && (
                <button
                  onClick={() => handleClose(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
              )}
              <button
                onClick={() => handleClose(true)}
                className="flex-1 py-3 rounded-xl bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};
