import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import { API_BASE } from "../services/api";

export const PromoBar = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPromoBars = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/utils/promo-bar/date`
        );
        const data = await res.json();
        if (data.ok && Array.isArray(data.promoBars)) {
          setMessages(data.promoBars.filter((p) => p.visible));
        }
      } catch (error) {
        console.error("Error fetching promo bars:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPromoBars();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="ci-arrow-reload"></span>
        </div>
      </div>
    );
  }

  if (messages.length === 0) return null;

  return (
    <div className="cs-promo-bar bg-primary py-2">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        slidesPerView={1}
      >
        {messages.map((msg) => (
          <SwiperSlide key={msg._id}>
            <div className="text-center">
              <a href={msg.link} className="text-white text-decoration-none">
                {msg.text}
              </a>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default PromoBar;
