import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { API_BASE } from "../../services/api";
import { CartContext } from "../../context/cartContext";
import { notyf } from "../../../utils/notifications";
import ProductCard from "../catalogo/ProductCard";
import { Helmet } from "@dr.pogodin/react-helmet";
import { getVariantPricing } from "../../utils/productPricing";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const PromoResolvePage = () => {
  const { addToCart } = useContext(CartContext);
  const location = useLocation();
  const [selectedSizes, setSelectedSizes] = useState({});
  const [bgIndex, setBgIndex] = useState(0);
  const carouselRef = useRef(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchResolvedPage = async () => {
      setState({ loading: true, error: null, data: null });
      try {
        const href = location.pathname;
        const url = `${API_BASE}/page/resolve?href=${encodeURIComponent(href)}`;
        const response = await fetch(url, { signal: controller.signal });
        const data = await response.json();

        if (!response.ok || data?.ok === false) {
          throw new Error(data?.message || "No se pudo resolver la pagina");
        }

        if (isMounted) {
          setState({ loading: false, error: null, data });
        }
      } catch (error) {
        if (error.name === "AbortError") return;
        if (isMounted) {
          setState({ loading: false, error: error.message, data: null });
        }
      }
    };

    fetchResolvedPage();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [location.pathname]);

  const products = useMemo(() => {
    const list = state.data?.products || [];
    return list;
  }, [state.data]);

  const bestSellers = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const ventasDiff = (b.nventas || 0) - (a.nventas || 0);
        if (ventasDiff !== 0) return ventasDiff;
        return (b.rating || 0) - (a.rating || 0);
      })
      .slice(0, 4);
  }, [products]);

  const handleSizeChange = (productId, sizeId) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: sizeId }));
  };

  const handleAddToCart = (product, sizeId) => {
    if (!sizeId) return notyf.error("Por favor seleccione un tamano");
    const size = product.value?.find((v) => v._id === sizeId);
    if (!size) return notyf.error("Tamano no disponible");
    const price = getVariantPricing(size).display ?? 0;

    addToCart({
      id: `${product._id}-${sizeId}`,
      productId: product._id,
      name: product.nameProduct,
      image: product.banner,
      price,
      size: size.size,
      sizeId,
      quantity: 1,
    });

    notyf.success(`${product.nameProduct} (${size.size}) agregado al carrito`);
  };

  const promo = state.data?.promo;
  const category = state.data?.category;
  const subcategories = state.data?.subcategories || [];
  const promoDates = {
    start: promo?.startDate ? new Date(promo.startDate) : null,
    end: promo?.endDate ? new Date(promo.endDate) : null,
  };

  const backgroundSources = useMemo(() => {
    const categoryImages = Array.isArray(category?.images)
      ? category.images.filter(Boolean)
      : [];
    const subcategoryImages = subcategories
      .flatMap((sub) => (Array.isArray(sub?.images) ? sub.images : []))
      .filter(Boolean);

    const images = categoryImages.length ? categoryImages : subcategoryImages;
    if (images.length > 0) {
      return images.map((image) => ({ type: "image", value: image }));
    }

    return [
      { type: "gradient", value: "linear-gradient(120deg, #111827, #4f46e5)" },
      { type: "gradient", value: "linear-gradient(120deg, #1f2937, #ec4899)" },
      { type: "gradient", value: "linear-gradient(120deg, #0f172a, #f59e0b)" },
      { type: "gradient", value: "linear-gradient(120deg, #0b1320, #10b981)" },
    ];
  }, [category, subcategories]);

  useEffect(() => {
    if (backgroundSources.length <= 1) return;
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundSources.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [backgroundSources.length]);

  useEffect(() => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;

    const handleScroll = () => {
      const firstItem = container.querySelector("[data-carousel-item='true']");
      if (!firstItem) return;
      const itemWidth = firstItem.getBoundingClientRect().width + 18;
      const index = Math.round(container.scrollLeft / itemWidth);
      setCarouselIndex(Math.max(0, Math.min(index, bestSellers.length - 1)));
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener("scroll", onScroll);
  }, [bestSellers.length]);

  if (state.loading) {
    return (
      <section className="container pt-3 pb-5 mb-2 mb-lg-0">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden"></span>
          </div>
        </div>
      </section>
    );
  }

  if (state.error) {
    return (
      <section className="container pt-3 pb-5 mb-2 mb-lg-0">
        <div className="alert alert-danger">{state.error}</div>
      </section>
    );
  }

  return (
    <>
      <Helmet>
        <title>{promo?.title || "Promociones"}</title>
        <meta
          name="description"
          content={promo?.subtitle || "Productos con promocion activa"}
        />
      </Helmet>
      <section className="container pt-4 pb-5 mb-2 mb-lg-0">
        <style>{`
          .promo-carousel {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .promo-carousel::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="row align-items-stretch mb-4">
          <div className="col-lg-7 mb-4 mb-lg-0">
            <div
              className="rounded shadow-lg overflow-hidden h-100"
              style={{
                backgroundImage: promo?.image
                  ? `linear-gradient(120deg, rgba(15,23,42,0.9), rgba(15,23,42,0.35)), url(${promo.image})`
                  : "linear-gradient(120deg, #0f172a, #334155)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="p-4 p-md-5 text-white h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex flex-wrap align-items-center mb-3" style={{ gap: "8px" }}>
                    <span className="badge badge-light text-dark text-uppercase">
                      {promo?.estado === "enCurso" ? "En curso" : promo?.estado === "proximo" ? "Proximamente" : "Promo"}
                    </span>
                    {promo?.tipo && (
                      <span className="badge badge-danger text-uppercase">{promo.tipo}</span>
                    )}
                  </div>
                  {promo?.subtitle ? (
                    <h5 className="text-uppercase mb-2 text-primary h6" style={{ letterSpacing: "1px" }}>
                      {promo.subtitle}
                    </h5>
                  ) : null}
                  <h1 className="display-4 mb-4 font-weight-bold text-white" style={{ whiteSpace: "pre-line" }}>
                    {promo?.title || "Promocion"}
                  </h1>
                </div>
                <div className="d-flex flex-wrap align-items-center">
                  {promo?.promotionPercentage != null && (
                    <span className="badge badge-danger p-2 mr-3 mb-2">
                      -{promo.promotionPercentage}%
                    </span>
                  )}
                  {promoDates.start && promoDates.end && (
                    <span className="small text-white-50 mr-3 mb-2">
                      Vigencia: {promoDates.start.toLocaleDateString()} - {promoDates.end.toLocaleDateString()}
                    </span>
                  )}
                  <span className="small text-white-50 mb-2">
                    {products.length} productos
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div
              className="rounded shadow-lg overflow-hidden h-100 position-relative"
              style={{
                backgroundImage:
                  backgroundSources[bgIndex]?.type === "image"
                    ? `linear-gradient(120deg, rgba(15,23,42,0.55), rgba(15,23,42,0.2)), url(${backgroundSources[bgIndex].value})`
                    : backgroundSources[bgIndex]?.value || "linear-gradient(120deg, #111827, #4f46e5)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "260px",
                transition: "background-image 0.6s ease-in-out",
              }}
            >
              <div className="position-absolute w-100 h-100" style={{ backdropFilter: "blur(2px)" }}></div>
              <div className="position-relative p-4 p-md-5 text-white h-100 d-flex flex-column justify-content-between">
                <div>
                  <p className="text-uppercase small mb-2">Categoria destacada</p>
                  <h2 className="h3 mb-2 text-white">{category?.name || "Categoria"}</h2>
                  <p className="text-white-50 mb-0">
                    {category?.description || "Explora las mejores opciones de esta promo"}
                  </p>
                </div>
                {subcategories.length > 0 && (
                  <div className="d-flex flex-wrap gap-2">
                    {subcategories.map((sub) => (
                      <span key={sub._id} className="badge badge-pill badge-light text-dark">
                        {sub.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {bestSellers.length > 0 && (
          <section className="mb-2">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <p className="text-uppercase small text-muted mb-1">
                  Seleccion destacada
                </p>
                <h2 className="h4 mb-0">Lo mas vendido en esta promo</h2>
              </div>
              <span className="small text-muted">Top {bestSellers.length}</span>
            </div>
            <div className="position-relative cs-carousel cs-nav-outside">
              <Swiper
                modules={[Navigation, Autoplay]}
                autoplay={{ delay: 3500, disableOnInteraction: false }}
                loop={bestSellers.length > 4}
                spaceBetween={20}
                navigation
                breakpoints={{
                  0: { slidesPerView: 1 },
                  420: { slidesPerView: 2 },
                  600: { slidesPerView: 3 },
                  900: { slidesPerView: 4 },
                }}
                className="pb-1"
              >
                {bestSellers.map((product, index) => {
                  const selectedSize = product.value?.find(
                    (v) => v._id === selectedSizes[product._id]
                  );
                  return (
                    <SwiperSlide key={`top-${product._id}`}>
                      <div className="position-relative h-100">
                        <span
                          className="badge badge-warning text-dark position-absolute"
                          style={{ top: "10px", left: "10px", zIndex: 3 }}
                        >
                          Top {index + 1}
                        </span>
                        <ProductCard
                          product={product}
                          selectedSize={selectedSize}
                          onSizeChange={(sizeId) =>
                            handleSizeChange(product._id, sizeId)
                          }
                          onAddToCart={handleAddToCart}
                        />
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          </section>
        )}

        {bestSellers.length > 0 && products.length > 0 && (
          <div className="mb-4 pt-1">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h2 className="h4 mb-0 text-primary font-weight-bold" style={{ letterSpacing: "-0.5px" }}>
                Todos los productos en promoción
              </h2>
            </div>
          </div>
        )}

        {products.length === 0 ? (
          <div className="card border-0 shadow">
            <div className="card-body text-center py-5">
              <i className="cxi-cart display-3 text-muted mb-3"></i>
              <h3 className="h4">No hay productos disponibles</h3>
              <p className="text-muted mb-0">
                No se encontraron productos para esta promocion.
              </p>
            </div>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3">
            {products.map((product) => {
              const selectedSize = product.value?.find(
                (v) => v._id === selectedSizes[product._id]
              );
              return (
                <ProductCard
                  key={product._id}
                  product={product}
                  selectedSize={selectedSize}
                  onSizeChange={(sizeId) => handleSizeChange(product._id, sizeId)}
                  onAddToCart={handleAddToCart}
                />
              );
            })}
          </div>
        )}
      </section>
    </>
  );
};

export default PromoResolvePage;
