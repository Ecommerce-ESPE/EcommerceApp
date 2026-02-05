import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { API_BASE } from "../services/api";

const fallbackCategories = [
  {
    id: "fallback-1",
    name: "Tops",
    image: "/assets/img/ecommerce/home/categories/04.jpg",
    href: "/shop",
  },
  {
    id: "fallback-2",
    name: "T-shirts",
    image: "/assets/img/ecommerce/home/categories/05.jpg",
    href: "/shop",
  },
  {
    id: "fallback-3",
    name: "Caps",
    image: "/assets/img/ecommerce/home/categories/06.jpg",
    href: "/shop",
  },
  {
    id: "fallback-4",
    name: "Sandals",
    image: "/assets/img/ecommerce/home/categories/07.jpg",
    href: "/shop",
  },
  {
    id: "fallback-5",
    name: "Jackets",
    image: "/assets/img/ecommerce/home/categories/08.jpg",
    href: "/shop",
  },
  {
    id: "fallback-6",
    name: "Coats",
    image: "/assets/img/ecommerce/home/categories/09.jpg",
    href: "/shop",
  },
];

const PopularCategories = ({
  title = "Categorias Populares",
  sectionClassName = "container mt-1 mb-3 my-sm-4 py-5 py-lg-6",
  titleClassName = "h1 mb-5 pb-3 text-center",
  maxWidth = 1200,
}) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE}/category/popular?limit=6`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data?.ok && Array.isArray(data.categories) && data.categories.length) {
          const mapped = data.categories.map((cat) => ({
            id: cat._id,
            name: cat.name,
            image: cat.image?.imgUrl || "/assets/img/ecommerce/home/categories/01.jpg",
            href: "/shop",
          }));
          setCategories(mapped);
        } else {
          setCategories(fallbackCategories);
        }
      } catch (err) {
        setError(err.message);
        setCategories(fallbackCategories);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopular();
  }, []);

  if (isLoading) {
    return (
      <section className={`${sectionClassName} text-center`}>
        <div className="spinner-border text-primary" role="status"></div>
      </section>
    );
  }

  if (error && (!categories || categories.length === 0)) {
    return (
      <section className={sectionClassName}>
        <div className="alert alert-danger">
          Error al cargar categorias: {error}
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) return null;

  const maxDesktopSlides = Math.min(4, categories.length);

  return (
    <section className={sectionClassName}>
      <h2 className={titleClassName}>{title}</h2>
      <div
        className="cs-carousel cs-nav-outside position-relative mx-auto"
        style={{ maxWidth }}
      >
        <Swiper
          modules={[Navigation, Autoplay]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={categories.length > 6}
          spaceBetween={30}
          centeredSlides={true}
          centeredSlidesBounds={true}
          navigation={{
            prevEl: ".swiper-button-prev-custom",
            nextEl: ".swiper-button-next-custom",
          }}
          breakpoints={{
            0: { slidesPerView: 1 },
            380: { slidesPerView: Math.min(2, categories.length) },
            550: { slidesPerView: Math.min(3, categories.length) },
            750: { slidesPerView: Math.min(4, categories.length) },
            1000: { slidesPerView: maxDesktopSlides },
            1250: { slidesPerView: maxDesktopSlides },
          }}
        >
          {categories.map((category) => (
            <SwiperSlide key={category.id}>
              <div className="pb-2 d-flex align-items-center justify-content-center">
                <a
                  href={category.href}
                  className="d-block cs-image-scale cs-heading-highlight text-center"
                  style={{ width: "100%", maxWidth: 200 }}
                >
                  <div
                    className="cs-image-inner rounded-circle mx-auto mb-3"
                    style={{ width: 200, height: 200, overflow: "hidden" }}
                  >
                    <img
                      src={category.image}
                      alt={category.name || "Category image"}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/150x150?text=Category";
                      }}
                    />
                  </div>
                  <h3 className="h5 mb-3">{category.name}</h3>
                </a>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default PopularCategories;
