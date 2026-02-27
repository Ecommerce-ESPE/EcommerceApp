import {useEffect} from "react";
import WishlistIconButton from "../../components/WishlistIconButton";

const ProductCard = ({
  product,
  selectedSize,
  onSizeChange,
  onAddToCart
}) => {
  // Verificar promoción activa
  const now = new Date();
  const startDate = product.promotion?.startDate ? new Date(product.promotion.startDate) : null;
  const endDate = product.promotion?.endDate ? new Date(product.promotion.endDate) : null;
  const isPromoActive = product.promotion?.active && 
                        startDate && endDate &&
                        now >= startDate && now <= endDate;
  const promoPercent = product.promotion?.percentage;

  // Precio seleccionado
  const size = selectedSize || (product.value?.[0] ? product.value[0] : null);
  
  // Determinar si hay descuento aplicable
  const hasDiscount = isPromoActive && 
                     size?.discountPrice && 
                     size.discountPrice < size.originalPrice;

  // Precio a mostrar y enviar al carrito
  const displayPrice = hasDiscount ? size?.discountPrice : size?.originalPrice;
  const originalPrice = size?.originalPrice;

  // Seleccionar el tamaño por defecto si no hay uno seleccionado
  useEffect(() => {
    if (!selectedSize && product.value?.length > 0) {
      // Buscar el primer tamaño con stock > 0
      const firstAvailable = product.value.find(val => val.stock > 0);
      if (firstAvailable) {
        onSizeChange(firstAvailable._id);
      } else {
        // Si ninguno tiene stock, seleccionar el primero
        onSizeChange(product.value[0]._id);
      }
    }
  }, [selectedSize, product.value, onSizeChange]);


  // Verificar si el stock del tamaño seleccionado es 0
  const isOutOfStock = selectedSize?.stock === 0;
  
  return (
    <div className="col pb-sm-2 mb-grid-gutter">
      <div className="card card-product mx-auto">
        <div className="card-product-img fixed-img-container" style={{ position: "relative" }}>
          <a href={`/producto/${product.slug || product._id}`} className="card-img-top">
            <img 
              src={product.banner || "https://via.placeholder.com/300"} 
              alt={product.nameProduct} 
              className="img-fluid"
            />
            {isPromoActive && (
              <span
                className="badge product-badge badge-danger"
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  zIndex: 2
                }}
              >
                -{promoPercent}%
              </span>
            )}
          </a>
          <div className="card-product-widgets-bottom">
            <WishlistIconButton itemId={product._id} size="medium" />
          </div>
        </div>
        <div className="card-body pb-2">
          <h3 className="card-product-title text-truncate mb-2">
            <a href={`/producto/${ product.slug || product._id}`} className="nav-link">
              {product.nameProduct}
            </a>
          </h3>
          {(product.brandName || (Array.isArray(product.tagNames) && product.tagNames.length > 0)) && (
            <div className="mb-2">
              {product.brandName ? (
                <span className="badge badge-light mr-2">Marca: {product.brandName}</span>
              ) : null}
              {Array.isArray(product.tagNames) && product.tagNames.length > 0 ? (
                <small className="text-muted">#{product.tagNames.slice(0, 2).join(" #")}</small>
              ) : null}
            </div>
          )}
          <div className="d-flex align-items-center">
            {hasDiscount ? (
              <>
                <span className="h5 d-inline-block mb-0 text-danger">
                  ${displayPrice?.toFixed(2) || 'N/A'}
                </span>
                <span className="text-muted ml-2">
                  <del>${originalPrice?.toFixed(2)}</del>
                </span>
              </>
            ) : (
              <span className="h5 d-inline-block mb-0">
                ${displayPrice?.toFixed(2) || 'N/A'}
              </span>
            )}
          </div>
          {/* Mostrar stock del tamaño seleccionado */}
          <div className="mt-2">
            <small className="text-muted">
              Stock: {selectedSize?.stock ?? 'N/A'}
            </small>
          </div>
        </div>
        <div className="card-footer">
          <div className="d-flex flex-wrap gap-2 mb-3">
            {product.value?.map((val) => (
              <div key={val._id} className="position-relative">
                <input
                  type="radio"
                  id={`size-${val._id}`}
                  name={`size-${product._id}`}
                  checked={selectedSize?._id === val._id}
                  onChange={() => onSizeChange(val._id)}
                  className="d-none"
                  disabled={val.stock === 0}
                />
                <label
                  htmlFor={`size-${val._id}`}
                  className={`badge badge-pill border px-2 py-2 ${
                    selectedSize?._id === val._id
                      ? "bg-primary text-white"
                      : "bg-light text-dark"
                  } ${val.stock === 0 ? "opacity-50" : ""}`}
                  style={val.stock === 0 ? { cursor: "not-allowed" } : {}}
                >
                  {val.size}
                </label>
              </div>
            ))}
          </div>
          <button
            className="btn btn-primary btn-block"
            onClick={() => onAddToCart(product, selectedSize?._id)}
            disabled={!selectedSize || isOutOfStock}
          >
            <i className="cxi-cart align-middle mt-n1 mr-2"></i>
            {isOutOfStock ? "No disponible" : "Añadir al carrito"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
