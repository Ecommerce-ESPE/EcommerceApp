import { useState, useContext, useEffect, useMemo } from "react";
import { CartContext } from "../../context/cartContext";
import { notyf } from "../../../utils/notifications";

const ProductInfo = ({ product }) => {
  const { addToCart, setShowCart } = useContext(CartContext);

  const findAvailableOption = () => {
    const availableOption = product?.value?.find((v) => v.stock > 0);
    return availableOption ? availableOption._id : product?.value?.[0]?._id || "";
  };

  const [selectedValue, setSelectedValue] = useState(findAvailableOption());
  const [quantity, setQuantity] = useState(1);

  const selectedOption = useMemo(
    () => product?.value?.find((v) => v._id === selectedValue),
    [product, selectedValue]
  );

  useEffect(() => {
    if (!selectedOption && product?.value?.length) {
      setSelectedValue(findAvailableOption());
      setQuantity(1);
    }
  }, [product, selectedOption]);

  const handleAddToCart = () => {
    if (!selectedOption || selectedOption.stock === 0) {
      notyf.error({
        message: "Lo sentimos, este producto no esta disponible actualmente",
        dismissible: true,
      });
      return;
    }

    const price = selectedOption.discountPrice ?? selectedOption.originalPrice ?? 0;

    const cartItem = {
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

  const now = new Date();
  const promo = product?.promotion;
  const promoActive =
    promo?.active &&
    new Date(promo.startDate) <= now &&
    now <= new Date(promo.endDate);

  const hasStockAvailable = product?.value?.some((v) => v.stock > 0);
  const selectedStock = selectedOption?.stock ?? 0;
  const baseOriginal = selectedOption?.originalPrice ?? product?.pricing?.original ?? 0;
  const baseDiscount = selectedOption?.discountPrice ?? product?.pricing?.promo ?? null;
  const showPromo = promoActive && baseDiscount != null;
  const displayPrice = showPromo ? baseDiscount : baseOriginal;
  const savings = showPromo ? Math.max(0, baseOriginal - baseDiscount) : 0;

  const brand =
    product?.brand && typeof product.brand === "object" ? product.brand : {};
  const brandName =
    brand?.name || (typeof product?.brand === "string" ? product.brand : "Marca");
  const brandLogo = brand?.logoUrl || "";
  const brandWebsite = brand?.website || "";

  const ctaDisabled = !hasStockAvailable || selectedStock <= 0;

  return (
    <div>
      <div className="d-flex align-items-center mb-2">
        {brandLogo ? (
          <img
            src={brandLogo}
            alt={brandName}
            className="rounded bg-light"
            style={{ width: 40, height: 40, objectFit: "contain" }}
          />
        ) : (
          <div
            className="rounded bg-secondary d-flex align-items-center justify-content-center text-uppercase"
            style={{ width: 40, height: 40, fontWeight: 700, color: "#424551" }}
          >
            {brandName?.[0] || "M"}
          </div>
        )}
        <div className="ml-2">
          <span className="d-block text-muted font-size-xs">Marca</span>
          {brandWebsite ? (
            <a
              className="text-decoration-none"
              href={brandWebsite}
              target="_blank"
              rel="noreferrer"
            >
              {brandName}
            </a>
          ) : (
            <span className="font-weight-bold">{brandName}</span>
          )}
        </div>
      </div>

      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <div className="mb-sm-0 mb-3">
          {hasStockAvailable ? (
            <>
              <div className="d-flex align-items-end flex-wrap">
                <span className="h2 d-inline-block mb-0 text-danger">
                  ${displayPrice.toFixed(2)}
                </span>
                {showPromo && baseOriginal > displayPrice && (
                  <del className="ml-2 text-muted">${baseOriginal.toFixed(2)}</del>
                )}
                {showPromo && (
                  <span className="badge badge-danger ml-2">
                    -{promo?.percentage}%
                  </span>
                )}
              </div>
              {savings > 0 && (
                <span className="d-block text-success font-size-sm mt-1">
                  Ahorras ${savings.toFixed(2)}
                </span>
              )}
            </>
          ) : (
            <span className="h4 text-danger mb-0">Agotado</span>
          )}
        </div>

        <div className="text-sm-right">
          <div className="star-rating ml-auto">
            {[...Array(5)].map((_, i) => (
              <i
                key={i}
                className={`sr-star cxi-star-filled ${
                  i < (product?.rating || 0) ? "active" : ""
                }`}
              ></i>
            ))}
          </div>
          <span className="font-size-sm text-muted">
            Rating: {product?.rating || 0}/5
          </span>
        </div>
      </div>

      <form className="row">
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
              disabled={!hasStockAvailable}
            >
              {product?.value?.map((v) => (
                <option key={v._id} value={v._id} disabled={v.stock === 0}>
                  {v.size} {v.stock === 0 ? "(Agotado)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="col-lg-2 col-4">
          <div className="form-group">
            <select
              className="form-control custom-select"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
              disabled={!selectedOption || selectedOption.stock === 0}
            >
              {selectedOption?.stock > 0 ? (
                Array.from(
                  { length: Math.min(5, selectedOption.stock) },
                  (_, i) => i + 1
                ).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))
              ) : (
                <option value="0">0</option>
              )}
            </select>
          </div>
        </div>

        <div className="col-lg-6">
          <button
            type="button"
            className="btn btn-block btn-primary"
            onClick={handleAddToCart}
            disabled={ctaDisabled}
          >
            <i className="cxi-cart mr-2"></i>
            {!hasStockAvailable
              ? "Agotado"
              : selectedOption?.stock === 0
              ? "Sin stock"
              : "Anadir al carrito"}
          </button>
        </div>

        <div className="col-lg-4 col-8">
          <button
            className="btn btn-block btn-outline-primary"
            type="button"
            disabled={ctaDisabled}
          >
            <i className="cxi-heart mr-2"></i>
            Favorito
          </button>
        </div>
      </form>

      {!hasStockAvailable && (
        <div className="alert alert-warning mt-3">
          Lo sentimos, este producto no esta disponible actualmente. Por favor
          revisa mas tarde.
        </div>
      )}

      {showPromo && hasStockAvailable && (
        <div className="alert alert-info mt-4">
          <strong>Oferta especial!</strong> Descuento del{" "}
          <span className="font-weight-bold">{promo?.percentage}%</span> valido
          hasta el {new Date(promo.endDate).toLocaleDateString()}.
        </div>
      )}

      <div
        className="accordion-alt mt-4"
        id={`product-accordion-${product?._id || "main"}`}
      >
        <div className="card">
          <div className="card-header">
            <h3 className="accordion-alt-heading">
              <a
                href={`#delivery-${product?._id || "main"}`}
                data-toggle="collapse"
                aria-expanded="true"
                className="collapsed"
              >
                Delivery
              </a>
            </h3>
          </div>
          <div
            className="collapse show"
            id={`delivery-${product?._id || "main"}`}
            data-parent={`#product-accordion-${product?._id || "main"}`}
          >
            <div className="card-body font-size-sm text-muted">
              Entrega estandar en 3-5 dias habiles. Envio express disponible al
              finalizar la compra.
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="accordion-alt-heading">
              <a
                href={`#return-${product?._id || "main"}`}
                data-toggle="collapse"
                aria-expanded="false"
                className="collapsed"
              >
                Return
              </a>
            </h3>
          </div>
          <div
            className="collapse"
            id={`return-${product?._id || "main"}`}
            data-parent={`#product-accordion-${product?._id || "main"}`}
          >
            <div className="card-body font-size-sm text-muted">
              Devoluciones gratuitas dentro de los 30 dias posteriores a la
              entrega. Producto sin usar y con empaques originales.
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center flex-wrap mt-4">
        <span className="text-muted font-size-sm mr-2">Pagos seguros:</span>
        <img
          src="/assets/img/ecommerce/checkout/visa.jpg"
          alt="Visa"
          className="mr-2 mb-2"
          width="48"
          height="30"
        />
        <img
          src="/assets/img/ecommerce/checkout/master-card.jpg"
          alt="Mastercard"
          className="mr-2 mb-2"
          width="48"
          height="30"
        />
        <img
          src="/assets/img/ecommerce/checkout/pay-pal.jpg"
          alt="PayPal"
          className="mb-2"
          width="48"
          height="30"
        />
      </div>
    </div>
  );
};

export default ProductInfo;
