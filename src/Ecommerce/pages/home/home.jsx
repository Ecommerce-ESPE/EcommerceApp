import { HeroSlider } from "../../components/hero-slider";
import { ProductCarousel } from "../../components/product-carousel";
import { CartShop } from "../../components/carshop";
import { PromoBar } from "../../components/promo-bar";
import { BannersPromo } from "../../components/BannersPromo";
import PopularProductCarousel from "../../components/popularCarousel";
import PopularCategories from "../../components/popular_categories";

export const HomeComponent = () => {
  return (
    <>
      <PromoBar />
      <HeroSlider />
      <section className="container-fluid px-xl-grid-gutter mt-5 mb-3 mb-sm-4 mt-md-0 mb-lg-5 py-5 py-lg-6">
        <div className="text-center mb-5 pb-2">
          <h2 className="h1">Nuevos Productos</h2>
          <p className="font-size-lg text-muted mb-1">
            Descubre nuestras últimas novedades para la próxima temporada
          </p>
          <a href="shop-catalog.html" className="font-size-lg">
            Ver la colección aquí
          </a>
        </div>
        <ProductCarousel />

        <div className="text-center mb-5 pb-2">
          <h2 className="h1">Productos Destacados</h2>
          <p className="font-size-lg text-muted mb-1">
            Explora nuestros productos más populares y mejor valorados
          </p>
          <a href="shop-catalog.html" className="font-size-lg">
            Ver la colección aquí
          </a>
        </div>
        <PopularProductCarousel />
        <PopularCategories />
       <div className="text-center mb-5 pb-2">
          <h2 className="h2">Ofertas Especiales</h2>
        </div>
        <BannersPromo />
      </section>

      <CartShop />

      
    </>
  );
};
