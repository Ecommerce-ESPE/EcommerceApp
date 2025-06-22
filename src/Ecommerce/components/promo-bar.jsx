import React, { useEffect, useRef } from 'react';
import { tns } from 'tiny-slider';
import 'tiny-slider/dist/tiny-slider.css';

// Mensajes promocionales
const messages = [
  {
    id: 1,
    text: 'Envio gratis en pedidos mayores a $50 dolares',
    link: '#',
    type: 'info' 
  },
  {
    id: 2,
    text: '¡30% de descuento en productos seleccionados!',
    link: '#',
    type: 'promo'
  },
  {
    id: 3,
    text: 'Nuevas colecciones ya disponibles',
    link: '#',
    type: 'update'
  },
  {
    id: 4,
    text: 'Klever',
    link: '#',
    type: 'update'
  }
];

export const PromoBar = () => {
  const sliderRef = useRef(null);
  const sliderInstance = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initSlider = () => {
      if (!sliderRef.current) return;

      if (sliderInstance.current && sliderInstance.current.destroy) {
        try {
          sliderInstance.current.destroy();
        } catch (error) {
          console.warn('Error al destruir el slider anterior:', error);
        }
      }

      try {
        sliderInstance.current = tns({
          container: sliderRef.current,
          items: 1,
          autoplay: true,
          autoplayButtonOutput: false,
          controls: false,
          nav: false,
          loop: true,
          speed: 500,
          autoplayTimeout: 3000,
          mouseDrag: true
        });
      } catch (error) {
        console.error('Error al inicializar el slider:', error);
      }
    };

    const timeout = setTimeout(initSlider, 100);

    return () => {
      clearTimeout(timeout);
      if (sliderInstance.current && sliderInstance.current.destroy) {
        try {
          sliderInstance.current.destroy();
        } catch (error) {
          console.warn('Error al limpiar el slider:', error);
        }
      }
    };
  }, []);

  return (
    <div className="cs-promo-bar bg-primary py-2">
      <div className="promo-bar-inner" ref={sliderRef}>
        {messages.map((msg) => (
          <div key={msg.id} className="text-center tns-item">
            <a href={msg.link} className="text-white text-decoration-none">
              {msg.text}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromoBar;
