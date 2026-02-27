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
  const isMountedRef = useRef(false);
  const touchStartRef = useRef({ x: 0, y: 0, moved: false });
  const [isReady, setIsReady] = useState(false);

  const images = product?.images?.map(img => img?.imgUrl) || [];
  const name = product?.nameProduct || 'Producto';
  const hasVideo = !!product?.video;
  const totalItems = images.length + (hasVideo ? 1 : 0);
  const productImage = product?.banner || 'https://via.placeholder.com/570x570?text=No+Image';
  // Check if we have content to show
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (totalItems > 0) {
      // Wait for DOM to be ready
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          setIsReady(true);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  // Initialize slider and lightGallery when ready
  useEffect(() => {
    if (!isReady || typeof window === 'undefined' || totalItems === 0) return;

    const safeDestroySlider = () => {
      const instance = sliderInstance.current;
      if (!instance || typeof instance.destroy !== 'function') return;
      try {
        instance.destroy();
      } catch (error) {
        console.warn('Slider cleanup error:', error);
      } finally {
        sliderInstance.current = null;
      }
    };

    const safeDestroyLightGallery = () => {
      const instance = lightGalleryInstance.current;
      if (!instance || typeof instance.destroy !== 'function') return;
      try {
        instance.destroy();
      } catch (error) {
        console.warn('LightGallery cleanup error:', error);
      } finally {
        lightGalleryInstance.current = null;
      }
    };
    
    const initSlider = () => {
      // Clean up existing slider instance
      safeDestroySlider();

      try {
        if (!sliderRef.current || !pagerRef.current) return;
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
          preventScrollOnTouch: 'auto',
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
      }
    };
    const initLightGallery = () => {
      // Clean up existing lightGallery instance
      safeDestroyLightGallery();

      try {
        // Initialize lightGallery
        if (galleryRef.current) {
          lightGalleryInstance.current = lightGallery(galleryRef.current, {
            selector: '.cs-gallery-item',
            download: false,
            hideScrollbar: false,
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
            mobileSettings: {
              controls: false,
              showCloseIcon: true,
              download: false,
            },
            licenseKey: import.meta.env.VITE_LIGHTGALLERY_LICENSE_KEY || undefined,
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
      safeDestroySlider();
      safeDestroyLightGallery();
    };
  }, [isReady, totalItems]);

  const handleTouchStart = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, moved: false };
  };

  const handleTouchMove = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    const dx = Math.abs(touch.clientX - touchStartRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartRef.current.y);
    if (dx > 8 || dy > 8) {
      touchStartRef.current.moved = true;
    }
  };

  const handleGalleryItemClick = (event) => {
    // In mobile swipe gestures, prevent opening lightGallery by mistake.
    if (touchStartRef.current.moved) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

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
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onClick={handleGalleryItemClick}
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
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onClick={handleGalleryItemClick}
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
