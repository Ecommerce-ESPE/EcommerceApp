import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import Skeleton from "../components/Skeleton";
import { useWishlist } from "../../hooks/useWishlist";
import WishlistIconButton from "../../components/WishlistIconButton";

const getProductImage = (product) => {
  if (product?.banner) return product.banner;
  const first = Array.isArray(product?.images) ? product.images[0] : null;
  return first?.imgUrl || "https://via.placeholder.com/480x480?text=Producto";
};

const getBasePrice = (product) => {
  const values = Array.isArray(product?.value) ? product.value : [];
  const prices = values
    .map((v) => Number(v?.originalPrice))
    .filter((v) => Number.isFinite(v) && v > 0);
  if (!prices.length) return null;
  return Math.min(...prices);
};

const WishlistPage = () => {
  const { items, isLoading, error, refetch } = useWishlist();

  if (isLoading) {
    return (
      <div className="row">
        {[...Array(6)].map((_, idx) => (
          <div className="col-sm-6 col-lg-4 mb-3" key={`wl-skeleton-${idx}`}>
            <Skeleton height={260} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon="cxi-close-circle"
        title="No se pudo cargar tu wishlist"
        description={error}
        action={
          <button type="button" className="btn btn-primary" onClick={refetch}>
            Reintentar
          </button>
        }
      />
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        icon="cxi-heart"
        title="Aun no tienes favoritos"
        description="Guarda productos en tu wishlist y apareceran aqui."
        action={
          <Link to="/shop" className="btn btn-primary">
            Explorar productos
          </Link>
        }
      />
    );
  }

  return (
    <div className="row">
      {items.map((product) => {
        const image = getProductImage(product);
        const basePrice = getBasePrice(product);
        const productLink = `/producto/${product?.slug || product?._id}`;

        return (
          <div className="col-sm-6 col-lg-4 mb-4" key={product?._id || product?.id}>
            <div className="card h-100 card-product">
              <div className="card-product-img" style={{ position: "relative" }}>
                <Link to={productLink} className="card-img-top d-block">
                  <img src={image} alt={product?.nameProduct || "Producto"} />
                </Link>
                <div className="card-product-widgets-bottom">
                  <WishlistIconButton itemId={product?._id} size="medium" />
                </div>
              </div>
              <div className="card-body pb-2">
                <h3 className="card-product-title text-truncate mb-2">
                  <Link to={productLink} className="nav-link">
                    {product?.nameProduct || "Producto"}
                  </Link>
                </h3>
                <div className="d-flex align-items-center justify-content-between">
                  <span className="h5 d-inline-block mb-0">
                    {basePrice != null ? `$${basePrice.toFixed(2)}` : "N/A"}
                  </span>
                  <Link to={productLink} className="btn btn-sm btn-outline-primary">
                    Ver producto
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WishlistPage;
