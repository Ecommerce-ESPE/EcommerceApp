import "./PromoBanner.css";

const PromoBannerTop = () => {
  return (
    <section 
      className="ps-banner--shop catalog-promo catalog-promo--top" 
      role="region"
      style={{
        backgroundColor: "#1a1a1a",
        color: "#ffffff",
        padding: "20px"
      }}
    >
      <div className="ps-banner__content">
        <h3 style={{ fontSize: "16px", fontWeight: "500", margin: "0", color: "#ffffff" }}>
          🔥 Promo de hoy: 10% OFF&nbsp;&nbsp;Envío gratis desde $15
        </h3>
      </div>
      <a 
        href="/shop" 
        className="ps-btn ps-btn--outline ps-btn--curve ps-btn--sm"
        style={{
          borderColor: "#ffffff",
          color: "#ffffff",
          backgroundColor: "transparent",
          marginTop: "12px"
        }}
      >
        Ver promos
      </a>
    </section>
  );
};

export default PromoBannerTop;
