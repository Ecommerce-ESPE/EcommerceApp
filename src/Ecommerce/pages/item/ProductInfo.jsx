import { useState, useContext } from "react";
import { CartContext } from "../../context/cartContext";
import { notyf } from "../../../utils/notifications";

const ProductInfo = ({ product }) => {
  const [selectedValue, setSelectedValue] = useState(
    product.value?.[0]?._id || ""
  );
  const [quantity, setQuantity] = useState(1);

  const { addToCart, setShowCart } = useContext(CartContext);

  const selectedOption = product.value.find((v) => v._id === selectedValue);

  const handleAddToCart = () => {
    if (!selectedOption) return;

    // CORRECCIÓN: Asegurar que el precio siempre sea un número válido
    const price = selectedOption.discountPrice ?? selectedOption.originalPrice ?? 0;

    const cartItem = {
      //id: `${product._id}-${selectedValue}`,
      productId: product._id,
      name: product.nameProduct,
      description: product.description,
      quantity,
      size: selectedOption.size,
      sizeId: selectedValue,
      price,
      icon: selectedOption.icon,
      image: product.banner || "",
    };

    addToCart(cartItem);
    setShowCart(false);

    notyf.success({
      message: `${quantity} ${quantity > 1 ? "unidades" : "unidad"} de ${
        product.nameProduct
      } agregada${quantity > 1 ? "s" : ""} al carrito`,
      dismissible: true,
    });
  };

  // Promoción activa
  const now = new Date();
  const promo = product.promotion;
  const promoActive =
    promo?.active &&
    new Date(promo.startDate) <= now &&
    now <= new Date(promo.endDate);

  return (
    <div>
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        {/* Precio */}
        <div className="d-flex align-items-center mb-sm-0 mb-4">
          <span className="h3 d-inline-block mb-0 text-danger">
            {promoActive && selectedOption?.discountPrice != null
              ? `$${(selectedOption.discountPrice || 0).toFixed(2)}` 
              : `$${(selectedOption?.originalPrice || 0).toFixed(2)}`} 
          </span>
          {promoActive &&
            selectedOption?.originalPrice != null &&
            selectedOption?.discountPrice != null &&
            selectedOption.originalPrice > selectedOption.discountPrice && (
              <span
                className="ml-2 text-muted"
                style={{ textDecoration: "line-through" }}
              >
                ${(selectedOption.originalPrice || 0).toFixed(2)} // Corrección
              </span>
            )}
          {promoActive && (
            <span className="badge badge-success ml-2">
              -{promo.percentage}%
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="text-sm-right">
          <div className="star-rating ml-auto">
            {[...Array(5)].map((_, i) => (
              <i
                key={i}
                className={`sr-star cxi-star-filled ${
                  i < product.rating ? "active" : ""
                }`}
              ></i>
            ))}
          </div>
          <span className="font-size-sm text-muted">
            Rating: {product.rating}/5
          </span>
        </div>
      </div>

      {/* Formulario */}
      <form className="row">
        {/* Tamaño / modelo */}
        <div className="col-12">
          <div className="form-group">
            <label htmlFor="size">Tipo :</label>
            <select
              className="form-control custom-select"
              id="size"
              value={selectedValue}
              onChange={(e) => {
                setSelectedValue(e.target.value);
                setQuantity(1);
              }}
            >
              {product.value.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cantidad */}
        <div className="col-lg-2 col-4">
          <div className="form-group">
            <select
              className="form-control custom-select"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              disabled={!selectedOption || selectedOption.stock === 0}
            >
              {selectedOption &&
                Array.from(
                  { length: Math.min(5, selectedOption.stock) },
                  (_, i) => i + 1
                ).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Botones */}
        <div className="col-lg-6">
          <button
            type="button"
            className="btn btn-block btn-primary"
            onClick={handleAddToCart}
            disabled={!selectedOption || selectedOption.stock === 0}
          >
            <i className="cxi-cart mr-2"></i>
            {selectedOption?.stock === 0 ? "Sin stock" : "Añadir al carrito"}
          </button>
        </div>

        <div className="col-lg-4 col-8">
          <button className="btn btn-block btn-outline-primary" type="button">
            <i className="cxi-heart mr-2"></i>
            Favorito
          </button>
        </div>
      </form>

      {/* Promoción activa */}
      {promoActive && (
        <div className="alert alert-info mt-4">
          <strong>¡Oferta especial!</strong> Este producto tiene un descuento
          del
          <span className="p1"> {promo?.percentage}% </span> válido hasta el{" "}
          {new Date(promo.endDate).toLocaleDateString()}.
        </div>
      )}
    </div>
  );
};

export default ProductInfo;