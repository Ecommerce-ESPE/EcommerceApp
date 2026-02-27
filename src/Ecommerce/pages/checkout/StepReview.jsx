import { Link } from "react-router-dom";
import QuantityInput from "../../components/QuantityInput";
const StepReview = ({ cart, updateQuantity, removeFromCart, subtotal }) => {
  const getCartItemKey = (item, index) =>
    item?.id || `${item?.productId || "item"}-${item?.sizeId || item?.size || index}`;

  return (
    <>
      <h2 className="h4 mb-4">1. Revisión del Pedido</h2>
      {cart.length === 0 ? (
        <div className="card border-0 shadow">
          <div className="card-body text-center py-5">
            <i className="cxi-cart display-3 text-muted mb-3"></i>
            <h3 className="h4">Tu carrito está vacío</h3>
            <p className="text-muted mb-4">
              Parece que aún no has añadido productos a tu carrito
            </p>
            <Link to="/shop" className="btn btn-primary">
              <i className="cxi-arrow-left mr-2"></i>
              Volver a la tienda
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-secondary rounded mb-5">
          {cart.map((producto, index) => {
            const itemKey = getCartItemKey(producto, index);
            const productPath = `/producto/${encodeURIComponent(
              producto?.slug || producto?.productId || producto?.id || ""
            )}`;
            return (
            <div
              key={itemKey}
              className="media px-2 px-sm-4 py-4 border-bottom"
            >
              <Link to={productPath} style={{ minWidth: 80 }}>
                <img src={producto.image} width="80" alt="Producto" />
              </Link>
              <div className="media-body w-100 pl-3">
                <div className="d-sm-flex">
                  <div className="pr-sm-3 w-100" style={{ maxWidth: "16rem" }}>
                    <h3 className="font-size-sm mb-3">
                      <Link to={productPath} className="nav-link font-weight-bold">
                        {producto.name}
                      </Link>
                    </h3>
                    {(producto.color || producto.size) && (
                      <ul className="list-unstyled font-size-xs mt-n2 mb-2">
                        {producto.color && (
                          <li className="mb-0">
                            <span className="text-muted">Color:</span>{" "}
                            {producto.color}
                          </li>
                        )}
                        {producto.size && (
                          <li className="mb-0">
                            <span className="text-muted">Talla:</span>{" "}
                            {producto.size}
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                  <div className="d-flex pr-sm-3">
                    <QuantityInput
                      value={producto.quantity}
                      onCommit={(nextQty) => updateQuantity(itemKey, nextQty)}
                    />
                    <div className="text-nowrap pt-2">
                      <strong>
                        ${(producto.price * producto.quantity).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                  <div className="d-flex align-items-center flex-sm-column text-sm-center ml-sm-auto pt-3 pt-sm-0">
                    <button
                      className="btn btn-outline-primary btn-sm mr-2 mr-sm-0"
                      onClick={() => removeFromCart(itemKey)}
                    >
                      Eliminar
                    </button>
                    <button className="btn btn-link btn-sm text-decoration-none pt-0 pt-sm-2 px-0 pb-0 mt-0 mt-sm-1">
                      Mover a<i className="cxi-heart ml-1"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
          <div className="px-3 px-sm-4 py-4 text-right">
            <span className="text-muted">
              Subtotal:
              <strong className="text-dark font-size-lg ml-2">
                ${subtotal.toFixed(2)}
              </strong>
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default StepReview;
