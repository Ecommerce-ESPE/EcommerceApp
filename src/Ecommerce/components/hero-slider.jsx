import React, { useEffect, useRef, useState } from "react";
import { tns } from "tiny-slider";
import "tiny-slider/dist/tiny-slider.css";

import { API_BASE } from "../services/api";

export const HeroSlider = () => {
  const sliderRef = useRef(null);
  const pagerRef = useRef(null);
  const sliderInstance = useRef(null);
  const [slides, setSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialized = useRef(false); // Para controlar inicialización única

  // Obtener datos de la API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE}/utils/banner-hero/date`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.ok && data.banners && data.banners.length > 0) {
          setSlides(data.banners);
        } else {
          setSlides([]);
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
  }, []);

  // Inicializar/reinicializar slider cuando los slides cambian
  useEffect(() => {
    // No hacer nada si estamos en SSR, no hay slides, o ya está inicializado
    if (
      typeof window === "undefined" ||
      slides.length === 0 ||
      initialized.current
    )
      return;

    const initSlider = () => {
      // Destruir instancia existente si hay una
      if (
        sliderInstance.current &&
        typeof sliderInstance.current.destroy === "function"
      ) {
        try {
          sliderInstance.current.destroy();
        } catch (e) {
          console.warn("Error destroying slider:", e);
        }
      }

      try {
        sliderInstance.current = tns({
          container: sliderRef.current,
          mode: "gallery",
          navContainer: pagerRef.current,
          navAsThumbnails: true,
          autoplay: true,
          autoplayButtonOutput: false,
          mouseDrag: true,
          preventScrollOnTouch: "force",
          controls: true,
          controlsText: [
            '<i class="cxi-arrow-left"></i>',
            '<i class="cxi-arrow-right"></i>',
          ],
          responsive: {
            0: { controls: false },
            991: { controls: true },
          },
          onInit: () => {
            console.log("Slider inicializado correctamente");
            initialized.current = true;
          },
        });
      } catch (error) {
        console.error("Error initializing slider:", error);
      }
    };

    const timer = setTimeout(initSlider, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [slides]); // Solo se ejecuta cuando slides cambia

  // Manejar limpieza al desmontar
  useEffect(() => {
    return () => {
      if (
        sliderInstance.current &&
        typeof sliderInstance.current.destroy === "function"
      ) {
        try {
          sliderInstance.current.destroy();
          initialized.current = false;
        } catch (e) {
          console.warn("Error cleaning up slider:", e);
        }
      }
    };
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

  if (error) {
    return (
      <div
        className="alert alert-danger my-5 mx-auto"
        style={{ maxWidth: "600px" }}
      >
        <h4>Error al cargar los banners</h4>
        <p>{error}</p>
        <button
          className="btn btn-secondary mt-3"
          onClick={() => window.location.reload()}
        >
          Recargar
        </button>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div
        className="alert alert-warning my-5 mx-auto"
        style={{ maxWidth: "600px" }}
      >
        No hay banners disponibles en este momento
      </div>
    );
  }

  return (
    <section className="cs-carousel cs-controls-onhover">
      {/* Slider principal */}
      <div className="cs-carousel-inner" ref={sliderRef}>
        {slides.map((slide) => (
          <div
            key={slide._id}
            className="bg-size-cover py-xl-6 d-flex align-items-center"
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              minHeight: "700px",
              minWidth: "1200px",
              aspectRatio: "12 / 5",
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* Overlay oscuro */}
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.40)",
                zIndex: -1,
              }}
            ></div>
            <div className="container pt-5 pb-6">
              <div className="row pb-lg-6">
                <div className="col-lg-6 offset-lg-1 offset-xl-0 pb-4 pb-md-6">
                  <h3
                    className="font-size-lg text-uppercase cs-from-left cs-delay-1 text-white mb-3"
                    style={{
                      fontSize: "clamp(1rem, 2vw, 2rem)",
                      lineHeight: 1.2,
                      wordBreak: "break-word",
                    }}
                  >
                    {slide.subtitle}
                  </h3>
                  <h2
                    className="display-2 mb-lg-5 pb-3 cs-from-left text-white cs-delay-2"
                    style={{
                      fontSize: "clamp(2rem, 5vw, 4rem)",
                      lineHeight: 1.1,
                      wordBreak: "break-word",
                    }}
                  >
                    {slide.title}
                  </h2>
                  <div className="mb-4 cs-scale-up cs-delay-2">
                    <a
                      href={slide.href}
                      className="btn btn-outline-primary btn-lg active"
                      style={{
                        fontSize: "clamp(1rem, 1vw, 1.5rem)",
                        padding:
                          "clamp(0.5rem, 1vw, 1rem) clamp(1.5rem, 3vw, 2.5rem)",
                      }}
                    >
                      {slide.buttonText}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="container position-relative">
        <div className="row mt-lg-n5 ">
          <div className="col-lg-7 col-md-8 col-sm-10 offset-lg-1 offset-xl-0 ">
            <div className="position-relative">
              <div
                id="pager"
                className="cs-pager cs-pager-inverse mb-xl-5 pb-5 pb-md-6 "
                ref={pagerRef}
              >
                {slides.map((_, index) => (
                  <button
                    className="text-white"
                    key={index}
                    type="button"
                    data-nav={index}
                    aria-label={`Ir al slide ${index + 1}`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
