import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import api from '../../api/axios';
import { IMAGE_BASE_URL, DEFAULT_EVENT_IMAGE } from '../../constants/api';
import { useNavigate } from 'react-router-dom';
import Spinner from '../Spinner/Spinner';

// 1. 커스텀 이전(Left) 화살표 컴포넌트
const CustomPrevArrow = (props) => {
  const { onClick } = props;
  return (
    <button
      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/50 hover:bg-white/90 text-gray-800 rounded-full shadow-md transition-all"
      onClick={onClick}
    >
      <i className="fa-solid fa-chevron-left"></i>
    </button>
  );
};

// 2. 커스텀 다음(Right) 화살표 컴포넌트
const CustomNextArrow = (props) => {
  const { onClick } = props;
  return (
    <button
      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/50 hover:bg-white/90 text-gray-800 rounded-full shadow-md transition-all"
      onClick={onClick}
    >
      <i className="fa-solid fa-chevron-right"></i>
    </button>
  );
};

export default function MainSlider() {
  const [events, setEvents] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMainEvents() {
      try {
        const response = await api.post('/api/board/selectMainEvent.do', {});
        if (response.data && response.data.data) {
          setEvents(response.data.data);
        }
      } catch (error) {
        console.error('이벤트 슬라이더 정보를 불러오는데 실패했습니다.', error);
      }
    }
    fetchMainEvents();
  }, []);

  const settings = {
    dots: false,
    infinite: events.length > 1,
    arrows: events.length > 1,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: (current, next) => {
      setDragging(true);
      setCurrentSlide(next);
    },
    afterChange: (current) => {
      setDragging(false);
      setCurrentSlide(current);
    },
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${IMAGE_BASE_URL}${url}`;
  };

  const handleImageClick = (e, boardNo) => {
    if (dragging) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    navigate(`/eventdetail/${boardNo}`);
  };

  const handleMoreClick = (e) => {
    e.stopPropagation();
    navigate('/event');
  };

  return (
    <div className="container mt-12">
      <div className="flex">
        <div className="w-full my-0 relative">
          {events.length > 0 ? (
            <>
              <Slider {...settings}>
                {events.map((event) => (
                  <div
                    key={event.boardNo}
                    onClick={(e) => handleImageClick(e, event.boardNo)}
                    className="cursor-pointer outline-none"
                  >
                    {/* 💡 수정 1: 모바일에서도 덜 뚱뚱해 보이도록 모바일 비율을 aspect-[5/2] 정도로 약간 납작하게 조정했습니다. */}
                    <div className="w-full aspect-[5/2] md:aspect-[21/9] lg:aspect-[4/1] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        // 💡 수정 2: object-cover(꽉채우고 자르기) -> object-contain(안 자르고 무조건 다 보여주기)로 변경!!
                        className="w-full h-full object-contain object-center"
                        src={getImageUrl(event.imgUrl) || DEFAULT_EVENT_IMAGE}
                        alt={event.title}
                      />
                    </div>
                  </div>
                ))}
              </Slider>
              {/* 우측 하단 카운터 & 이벤트 전체보기 버튼 */}
              <div
                onClick={handleMoreClick}
                className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white text-xs sm:text-sm px-4 py-1.5 rounded-2xl cursor-pointer flex items-center gap-3 backdrop-blur-sm transition-colors z-20 shadow-md"
              >
                <span className="font-semibold tracking-widest">
                  {currentSlide + 1} / {events.length}
                </span>
                <span className="w-px h-3 bg-white/40"></span>
                <span className="flex items-center gap-1">
                  모두보기 <i className="fa-solid fa-plus text-[10px]"></i>
                </span>
              </div>
            </>
          ) : (
            // 💡 스켈레톤 로딩 UI도 고정 높이 대신 범용적인 가로세로 비율(aspect-ratio)을 사용하도록 변경
            <div className="w-full aspect-[5/2] md:aspect-[21/9] lg:aspect-[4/1] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
              <span className="text-gray-500">
                <Spinner />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
