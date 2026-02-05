import "./PromoBanner.css";
import bannerImage from "../../../assets/img/ecommerce/home/banners/03.jpg";

const PromoBannerInline = () => {
  return (
    <section
      className="ps-banner--shop catalog-promo catalog-promo--inline catalog-promo--dark"
      role="region"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.75), rgba(0,0,0,0.45)), url(${bannerImage})`,
      }}
    >
      <div className="ps-banner__content">
        <span>Selección destacada</span>
        <h3>Las más pedidas esta semana</h3>
        <p>Encuentra las favoritas y asegúralas antes de que se agoten.</p>
      </div>
      <a href="/shop" className="ps-btn ps-btn--curve ps-btn--sm">
        Explorar
      </a>
    </section>
  );
};

export default PromoBannerInline;
