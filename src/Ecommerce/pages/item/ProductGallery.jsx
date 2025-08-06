import React, { useEffect, useRef, useState } from 'react';
import { tns } from 'tiny-slider';
import 'tiny-slider/dist/tiny-slider.css';
import lightGallery from 'lightgallery';
import lgVideo from 'lightgallery/plugins/video';
import lgZoom from 'lightgallery/plugins/zoom';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-video.css';

const ProductGallery = ({ product }) => {
  const sliderRef = useRef(null);
  const pagerRef = useRef(null);
  const galleryRef = useRef(null);
  const sliderInstance = useRef(null);
  const lightGalleryInstance = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const images = product?.images?.map(img => img?.imgUrl) || [];
  const name = product?.nameProduct || 'Producto';
  const hasVideo = !!product?.video;
  const totalItems = images.length + (hasVideo ? 1 : 0);
  const productImage = product?.banner || 'https://via.placeholder.com/570x570?text=No+Image';
  // Check if we have content to show
  useEffect(() => {
    if (totalItems > 0) {
      // Wait for DOM to be ready
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  // Initialize slider and lightGallery when ready
  useEffect(() => {
    if (!isReady || typeof window === 'undefined' || totalItems === 0) return;
    
    const initSlider = () => {
      // Clean up existing slider instance
      if (sliderInstance.current && typeof sliderInstance.current.destroy === 'function') {
        try {
          sliderInstance.current.destroy(true);
          sliderInstance.current = null;
        } catch (error) {
          console.warn('Error destroying previous slider:', error);
        }
      }

      try {
        // Initialize tiny-slider
        sliderInstance.current = tns({
          container: sliderRef.current,
          items: 1,
          slideBy: 1,
          mode: "gallery",
          navContainer: pagerRef.current,
          navAsThumbnails: true,
          autoplay: false,
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
          }
        });
      } catch (error) {
        console.error('Error initializing slider:', error);
        console.error('Error initializing slider:', error);
      }
    };
    const initLightGallery = () => {
      // Clean up existing lightGallery instance
      if (lightGalleryInstance.current && 
          typeof lightGalleryInstance.current.destroy === 'function') {
        try {
          lightGalleryInstance.current.destroy(true);
          lightGalleryInstance.current = null;
        } catch (error) {
          console.warn('Error destroying previous lightGallery:', error);
        }
      }

      try {
        // Initialize lightGallery
        if (galleryRef.current) {
          lightGalleryInstance.current = lightGallery(galleryRef.current, {
            selector: '.cs-gallery-item',
            download: false,
            videojs: true,
            youtubePlayerParams: { 
              modestbranding: 1, 
              showinfo: 0, 
              rel: 0 
            },
            vimeoPlayerParams: { 
              byline: 0, 
              portrait: 0 
            },
            plugins: [lgZoom, lgVideo]
          });
        }
      } catch (error) {
        console.error('Error initializing lightGallery:', error);
      }
    };

    initSlider();
    initLightGallery();
    
    // Cleanup function
    return () => {
      if (sliderInstance.current && typeof sliderInstance.current.destroy === 'function') {
        try {
          sliderInstance.current.destroy(true);
        } catch (error) {
          console.warn('Slider cleanup error:', error);
        }
      }
      
      if (lightGalleryInstance.current && 
          typeof lightGalleryInstance.current.destroy === 'function') {
        try {
          lightGalleryInstance.current.destroy(true);
        } catch (error) {
          console.warn('LightGallery cleanup error:', error);
        }
      }
    };
  }, [isReady, totalItems]);

  // Don't render if no content
  if (totalItems === 0) {
    return (
      <div 
        className="cs-carousel cs-gallery cs-product-gallery mx-auto d-flex align-items-center justify-content-center" 
        style={{ maxWidth: '570px', minHeight: '400px' }}
      >
        <img src={productImage} alt="" />
      </div>
    );
  }

  return (
    <div 
      ref={galleryRef}
      className="cs-carousel cs-gallery cs-product-gallery mx-auto" 
      style={{ maxWidth: '570px' }}
    >
      {/* Main Slider */}
      <div className="cs-carousel-inner" ref={sliderRef}>
        {/* Image Gallery Items */}
        {images.map((imgUrl, index) => (
          <a
            key={`img-${index}`}
            className="cs-gallery-item"
            href={imgUrl}
            data-sub-html={`<h6 class="text-light">${name} - Image ${index + 1}</h6>`}
          >
            <img 
              className="rounded" 
              src={imgUrl} 
              alt={`${name} - ${index + 1}`} 
              onError={(e) => e.target.src = 'https://via.placeholder.com/570x570?text=Image+Not+Available'} 
            />
            <span className="cs-gallery-caption">
              {name} - Image {index + 1}
            </span>
          </a>
        ))}

        {/* Video Item */}
        {hasVideo && (
          <a
            className="cs-gallery-item video-item"
            href={product.video}
            data-sub-html={`<h6 class="text-light">${name} - Video</h6>`}
            data-video={`{"source": [{"src":"${product.video}", "type":"video/mp4"}], "attributes": {"preload": false, "controls": true}}`}
          >
            <img 
              className="rounded" 
              src={images[0] || 'https://via.placeholder.com/570x570?text=Video'} 
              alt={`${name} - Video`} 
            />
            <span className="cs-gallery-caption">
              {name} - Video
            </span>
          </a>
        )}
      </div>

      {/* Thumbnails Navigation */}
      <div className="cs-thumbnails" ref={pagerRef} id="cs-thumbnails">
        {images.map((imgUrl, index) => (
          <button key={`thumb-${index}`} type="button" data-nav={index}>
            <img 
              src={imgUrl} 
              alt={`Thumbnail ${index + 1}`} 
              onError={(e) => e.target.src = 'https://via.placeholder.com/100x100?text=Thumb'} 
            />
          </button>
        ))}
        
        {hasVideo && (
          <button 
            type="button" 
            data-nav={images.length}
            className="video-indicator"
          >
            <img 
              src={images[0] || 'https://via.placeholder.com/100x100?text=Video'} 
              alt="Video Thumbnail" 
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;