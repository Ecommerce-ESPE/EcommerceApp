import React, { useEffect, useRef } from 'react';
import { tns } from 'tiny-slider';
import 'tiny-slider/dist/tiny-slider.css';

// Importar imágenes
import slide1 from '../../assets/img/ecommerce/home/hero-slider/01.jpg';
import slide2 from '../../assets/img/ecommerce/home/hero-slider/02.jpg';
import slide3 from '../../assets/img/ecommerce/home/hero-slider/03.jpg';
import slide4 from '../../assets/img/ecommerce/home/hero-slider/04.jpg';

export const HeroSlider = () => {
  const sliderRef = useRef(null);
  const pagerRef = useRef(null);
  const sliderInstance = useRef(null);

  // Datos de los slides
  const slides = [
    {
      id: 1,
      image: slide1,
      subtitle: "Nuevo",
      title: "ROPA CARA",
      buttonText: "Shop the menswear",
      href: "/shop"
    },
    {
      id: 2,
      image: slide2,
      subtitle: "New Collection",
      title: "Fall-Winter 2021",
      buttonText: "Shop the collection",
      href: "/shop"
    },
    {
      id: 3,
      image: slide3,
      subtitle: "Limited Edition",
      title: "Leather Issue",
      buttonText: "Shop the collection",
      href: "/shop"
    },
    {
      id: 4,
      image: slide4,
      subtitle: "Hottest Prices",
      title: "Kidswear Sales",
      buttonText: "Shop sale now",
      href: "/shop"
    }
  ];

  useEffect(() => {
    // Solo ejecutar en el navegador
    if (typeof window === 'undefined') return;

    const initSlider = () => {
      if (!sliderRef.current || !pagerRef.current) return;

      // Destruir instancia existente si hay una válida
      if (sliderInstance.current && sliderInstance.current.destroy) {
        try {
          sliderInstance.current.destroy();
        } catch (error) {
          console.warn('Error al destruir slider anterior:', error);
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
          preventScrollOnTouch: 'force',
          controls: true,
          controlsText: [
            '<i class="cxi-arrow-left"></i>',
            '<i class="cxi-arrow-right"></i>',
          ],
          responsive: {
            0: { controls: false },
            991: { controls: true }
          },
          onInit: () => {
            console.log('Slider inicializado correctamente');
          }
        });
      } catch (error) {
        console.error('Error al inicializar el slider:', error);
      }
    };

    // Pequeño retraso para asegurar que el DOM está listo
    const initTimeout = setTimeout(initSlider, 100);

    // Función de limpieza
    return () => {
      clearTimeout(initTimeout);
      if (sliderInstance.current && sliderInstance.current.destroy) {
        try {
          sliderInstance.current.destroy();
        } catch (error) {
          console.warn('Error al destruir slider en cleanup:', error);
        }
      }
    };
  }, []);

  return (
    <section className="cs-carousel cs-controls-onhover">
      {/* Slider principal */}
      <div className="cs-carousel-inner" ref={sliderRef}>
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="bg-size-cover py-xl-6"
            style={{ 
              backgroundImage: `url(${slide.image})`,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              minHeight: '500px' // Asegura altura mínima
            }}
          >
            <div className="container pt-5 pb-6">
              <div className="row pb-lg-6">
                <div className="col-lg-6 offset-lg-1 offset-xl-0 pb-4 pb-md-6">
                  <h3 className="font-size-lg text-uppercase cs-from-left cs-delay-1">
                    {slide.subtitle}
                  </h3>
                  <h2 className="display-2 mb-lg-5 pb-3 cs-from-left">
                    {slide.title}
                  </h2>
                  <div className="mb-4 cs-scale-up cs-delay-2">
                    <a href={slide.href} className="btn btn-outline-primary btn-lg">
                      {slide.buttonText}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navegación */}
      <div className="container position-relative">
        <div className="row mt-lg-n5">
          <div className="col-lg-7 col-md-8 col-sm-10 offset-lg-1 offset-xl-0">
            <div className="position-relative">
              <div 
                id="pager" 
                className="cs-pager cs-pager-inverse mb-xl-5 pb-5 pb-md-6"
                ref={pagerRef}
              >
                {slides.map((_, index) => (
                  <button 
                    key={index} 
                    type="button" 
                    data-nav={index}
                    aria-label={`Ir al slide ${index + 1}`}
                  >
                    {String(index + 1).padStart(2, '0')}
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