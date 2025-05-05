import React, { useEffect, useRef } from 'react';
import { tns } from 'tiny-slider';
import 'tiny-slider/dist/tiny-slider.css';

// Importar imágenes (asegúrate de que las rutas sean correctas)
import product1 from '../../assets/img/ecommerce/shop/03.jpg';
import product2 from '../../assets/img/ecommerce/shop/13.jpg';
import product3 from '../../assets/img/ecommerce/shop/04.jpg';
import product4 from '../../assets/img/ecommerce/shop/02.jpg';
import product5 from '../../assets/img/ecommerce/shop/06.jpg';
import product6 from '../../assets/img/ecommerce/shop/08.jpg';
import product7 from '../../assets/img/ecommerce/shop/12.jpg';

export const ProductCarousel = () => {
  const sliderRef = useRef(null);
  const pagerRef = useRef(null);
  const sliderInstance = useRef(null);

  // Datos de los productos con importación correcta de imágenes
  const products = [
    {
      id: 1,
      image: product1,
      title: 'Black and white sport cap',
      price: '$18.15',
      rating: 5,
      wishlist: true
    },
    {
      id: 2,
      image: product2,
      title: 'Metal bridge sunglasses',
      price: '$15.95',
      rating: 0,
      wishlist: true
    },
    {
      id: 3,
      image: product3,
      title: 'Green baby romper',
      price: '$20.40',
      rating: 4,
      wishlist: true
    },
    {
      id: 4,
      image: product4,
      title: 'Mid-rise slim cropped fit jeans',
      price: '$40.00',
      rating: 0,
      wishlist: true
    },
    {
      id: 5,
      image: product5,
      title: 'Red dangle earrings',
      price: '$29.95',
      rating: 3,
      wishlist: true
    },
    {
      id: 6,
      image: product6,
      title: 'Baby shoes with laces',
      price: '$30.75',
      rating: 0,
      wishlist: true
    },
    {
      id: 7,
      image: product7,
      title: 'Men fashion gray shoes',
      price: '$85.00',
      rating: 0,
      wishlist: true
    }
  ];

  useEffect(() => {
    // Solo ejecutar en el navegador
    if (typeof window === 'undefined') return;

    const initSlider = () => {
      if (!sliderRef.current) return;

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
          controls: true,
          controlsText: [
            '<i class="cxi-arrow-left"></i>',
            '<i class="cxi-arrow-right"></i>',
          ],
          nav: true,
          autoplay: false,
          navContainer: pagerRef.current,
          navPosition: 'bottom',
          mouseDrag: true,
          preventScrollOnTouch: 'force',
          responsive: {
            0: {
              items: 1,
              gutter: 20
            },
            420: {
              items: 2,
              gutter: 20
            },
            600: {
              items: 3,
              gutter: 20
            },
            700: {
              items: 3,
              gutter: 30
            },
            900: {
              items: 4,
              gutter: 30
            },
            1200: {
              items: 5,
              gutter: 30
            },
            1400: {
              items: 6,
              gutter: 30
            }
          },
          onInit: () => {
            console.log('Product slider inicializado correctamente');
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

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i 
          key={i} 
          className={`sr-star cxi-star-filled ${i <= rating ? 'active' : ''}`}
        />
      );
    }
    return <div className="star-rating">{stars}</div>;
  };

  return (
    <div className="cs-carousel cs-nav-outside">
      {/* Slider principal */}
      <div className="cs-carousel-inner" ref={sliderRef}>
        {products.map((product) => (
          <div key={product.id} className="tns-item">
            <div className="card card-product">
              <div className="card-product-img">
                <a href="shop-single.html" className="card-img-top">
                  <img src={product.image} alt={product.title} />
                </a>
                
                {product.rating > 0 && (
                  <div className="card-product-widgets-top">
                    {renderStars(product.rating)}
                  </div>
                )}
                
                <div className="card-product-widgets-bottom">
                  <button 
                    className="btn-wishlist ml-auto" 
                    data-toggle="tooltip" 
                    data-placement="left" 
                    title="Add to wishlist"
                    aria-label="Add to wishlist"
                  />
                </div>
              </div>
              
              <div className="card-body">
                <h3 className="card-product-title text-truncate mb-2">
                  <a href="shop-single.html" className="nav-link">
                    {product.title}
                  </a>
                </h3>
                
                <div className="d-flex align-items-center">
                  <span className="h5 d-inline-block mb-0">
                    {product.price}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navegación (pager) */}
      <div className="tns-nav" ref={pagerRef} aria-label="Carousel Pagination">
        {products.map((_, index) => (
          <button 
            key={index} 
            type="button" 
            data-nav={index}
            aria-label={`Carousel Page ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;