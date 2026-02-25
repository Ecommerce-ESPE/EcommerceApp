import { useState, useContext, useEffect, useMemo } from "react";
import { CartContext } from "../../context/cartContext";
import { notyf } from "../../../utils/notifications";
import TagChips from "./TagChips";
import "./ship-return.scoped.css";
import { API_BASE } from "../../services/api";

const ProductInfo = ({ product }) => {
  const { addToCart, setShowCart } = useContext(CartContext);

  const findAvailableOption = () => {
    const availableOption = product?.value?.find((v) => v.stock > 0);
    return availableOption ? availableOption._id : product?.value?.[0]?._id || "";
  };

  const [selectedValue, setSelectedValue] = useState(findAvailableOption());
  const [quantity, setQuantity] = useState(1);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(true);
  const [shippingHighlights, setShippingHighlights] = useState([]);
  const [shippingLoading, setShippingLoading] = useState(false);

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

  useEffect(() => {
    let isMounted = true;

    const fetchShippingHighlights = async () => {
      setShippingLoading(true);
      try {
        const response = await fetch(`${API_BASE}/config/shipping-methods/highlights`);
        if (!response.ok) throw new Error("No se pudo cargar shipping highlights");

        const data = await response.json();
        const items = Array.isArray(data?.items) ? data.items : [];

        if (isMounted) setShippingHighlights(items);
      } catch {
        if (isMounted) setShippingHighlights([]);
      } finally {
        if (isMounted) setShippingLoading(false);
      }
    };

    fetchShippingHighlights();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatShippingPrice = (amount, currency) => {
    const value = Number(amount);
    if (!Number.isFinite(value)) return "-";

    try {
      return new Intl.NumberFormat("es-EC", {
        style: "currency",
        currency: currency || "USD",
        minimumFractionDigits: 2,
      }).format(value);
    } catch {
      return `${value.toFixed(2)} ${currency || "USD"}`;
    }
  };

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

      <TagChips tags={product?.tags} />

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

      <div className="pxShipReturn mt-4">
        <section className="pxShipReturn__section">
          <button
            type="button"
            className="pxShipReturn__header"
            onClick={() => setIsDeliveryOpen((prev) => !prev)}
            aria-expanded={isDeliveryOpen}
          >
            <span className="pxShipReturn__title">Entrega</span>
            <span className="pxShipReturn__icon">{isDeliveryOpen ? "−" : "+"}</span>
          </button>
          {isDeliveryOpen && (
            <div className="pxShipReturn__body">
              <div className="pxShipReturn__table">
                <div className="pxShipReturn__row pxShipReturn__row--head">
                  <span>TIPO</span>
                  <span>TIEMPO</span>
                  <span>COSTO</span>
                </div>
                {shippingLoading && (
                  <div className="pxShipReturn__row">
                    <span>Cargando...</span>
                    <span>Cargando...</span>
                    <span>Cargando...</span>
                  </div>
                )}
                {!shippingLoading && shippingHighlights.length > 0 && (
                  <>
                    {shippingHighlights.map((item) => (
                      <div className="pxShipReturn__row" key={item.id}>
                        <span>{item.type || item.delivery || "-"}</span>
                        <span>{item.howLong || "-"}</span>
                        <span>{formatShippingPrice(item.howMuch, item.currency)}</span>
                      </div>
                    ))}
                  </>
                )}
                {!shippingLoading && shippingHighlights.length === 0 && (
                  <div className="pxShipReturn__row">
                    <span>-</span>
                    <span>No hay metodos configurados</span>
                    <span>-</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <div className="pxShipReturn__payments">
          <span className="pxShipReturn__paymentsLabel">Pagos seguros:</span>
          <div className="pxShipReturn__logos">
            <span className="pxShipReturn__logoCard">
              <img
                src="/assets/img/ecommerce/checkout/visa.jpg"
                alt="Visa"
                width="48"
                height="30"
              />
            </span>
            <span className="pxShipReturn__logoCard">
              <img
                src="/assets/img/ecommerce/checkout/master-card.jpg"
                alt="Mastercard"
                width="48"
                height="30"
              />
            </span>
            <span className="pxShipReturn__logoCard">
              <img
                src="/assets/img/ecommerce/checkout/pay-pal.jpg"
                alt="PayPal"
                width="48"
                height="30"
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
