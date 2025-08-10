import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { API_BASE } from "../services/api";
import "./ProductCarousel.css"; 

export const PopularProductCarousel = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const now = new Date();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(API_BASE + "/utils/featured-items");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.ok && data.items && data.items.length > 0) {
          const mappedProducts = data.items.map((item) => {
            const promo = item.promotion;
            const promoActive =
              promo?.active &&
              new Date(promo.startDate) <= now &&
              now <= new Date(promo.endDate);

            const bestVariant = item.value.reduce((best, variant) => {
              const price =
                promoActive && variant.discountPrice != null
                  ? variant.discountPrice
                  : variant.originalPrice;

              if (!best || price < best.price) {
                return {
                  originalPrice: variant.originalPrice,
                  discountPrice: promoActive ? variant.discountPrice : null,
                  price,
                };
              }
              return best;
            }, null);

            return {
              id: item._id,
              image: item.banner,
              title: item.nameProduct,
              rating: item.rating,
              wishlist: false,  
              link: `/producto/${item.slug || item._id}`,
              price: bestVariant.price,
              originalPrice: bestVariant.originalPrice,
              discountPrice: bestVariant.discountPrice,
              promoPercentage: promoActive ? promo?.percentage : null,
            };
          });

          setProducts(mappedProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const toggleWishlist = (productId) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId
          ? { ...product, wishlist: !product.wishlist }
          : product
      )
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        Error al cargar productos: {error}
      </div>
    );
  }

  if (products.length === 0) {
    return <div className="alert alert-info">No hay productos disponibles</div>;
  }

  return (
    <div className="cs-carousel cs-nav-outside position-relative">
      {/* Swiper Component */}
      <Swiper
        modules={[Navigation, Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        spaceBetween={30}
        navigation={{
          prevEl: ".swiper-button-prev-custom",
          nextEl: ".swiper-button-next-custom",
        }}
        //pagination={{ clickable: true }}
        breakpoints={{
          0: { slidesPerView: 1 },
          420: { slidesPerView: 2 },
          600: { slidesPerView: 3 },
          900: { slidesPerView: 4 },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <div className="card card-product mx-auto">
              <div className="card-product-img fixed-img-container">
                <a href={product.link} className="card-img-top">
                  <img
                    src={product.image}
                    alt={product.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/300x300?text=Imagen+no+disponible";
                    }}
                  />
                </a>

                <div className="card-product-widgets-top">
                  {product.promoPercentage && (
                    <span className="badge product-badge badge-danger">
                      -{product.promoPercentage}%
                    </span>
                  )}
                  {product.rating > 0 && (
                    <div className="star-rating ml-auto">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`sr-star cxi-star-filled ${
                            i < product.rating ? "active" : ""
                          }`}
                        ></i>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card-product-widgets-bottom">
                  <button
                    className={`btn-wishlist ml-auto ${
                      product.wishlist ? "active" : ""
                    }`}
                    onClick={() => toggleWishlist(product.id)}
                    title={
                      product.wishlist
                        ? "Remover de favoritos"
                        : "Agregar a favoritos"
                    }
                    aria-label={
                      product.wishlist
                        ? "Remover de favoritos"
                        : "Agregar a favoritos"
                    }
                  ></button>
                </div>
              </div>

              <div className="card-body pb-2">
                <h3 className="card-product-title text-truncate mb-2">
                  <a href={product.link} className="nav-link">
                    {product.title}
                  </a>
                </h3>

                <div className="d-flex align-items-center">
                  <span
                    className={`h5 d-inline-block mb-0 ${
                      product.discountPrice ? "text-danger" : ""
                    }`}
                  >
                    ${product.price.toFixed(2)}
                  </span>
                  {product.discountPrice && (
                    <del className="d-inline-block ml-2 pl-1 text-muted">
                      ${product.originalPrice.toFixed(2)}
                    </del>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

    </div>
  );
};

export default PopularProductCarousel;
