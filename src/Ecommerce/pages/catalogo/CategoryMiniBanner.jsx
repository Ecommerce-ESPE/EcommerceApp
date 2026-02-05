import "./CategoryMiniBanner.css";

const gradientForCategory = (name = "") => {
  const key = name.toLowerCase();
  if (key.includes("pizza") || key.includes("picante")) return "grad-warm";
  if (key.includes("electro") || key.includes("tecno")) return "grad-cool";
  if (key.includes("promo") || key.includes("oferta")) return "grad-berry";
  if (key.includes("familia") || key.includes("hogar")) return "grad-sand";
  return "grad-neutral";
};

const CategoryMiniBanner = ({ categoryName, imageUrl, link }) => {
  const hasImage = Boolean(imageUrl);
  const gradientClass = gradientForCategory(categoryName);

  const style = hasImage
    ? { backgroundImage: `url(${imageUrl})` }
    : undefined;

  return (
    <article className={`category-mini-banner premium ${!hasImage ? gradientClass : ""}`} style={style}>
      <a href={link} className="category-mini-banner__link" aria-label={categoryName}>
        <div className="category-mini-banner__overlay" aria-hidden="true" />
        <div className="category-mini-banner__content">
          <h4 className="category-mini-banner__title">{categoryName}</h4>
          <span className="category-mini-banner__cta">
            Ver productos
          </span>
        </div>
      </a>
    </article>
  );
};

export default CategoryMiniBanner;
