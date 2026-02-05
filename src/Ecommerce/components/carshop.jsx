import { useEffect,useContext } from "react";
import { CartContext } from '../context/cartContext';

const API_BASE = "https://backend-ecommerce-aasn.onrender.com/api";

// Componente CartShop externo (completo con overlay y efectos)
export const CartShop = () => {

  const { 
    cart = [], 
    updateQuantity, 
    removeFromCart,
    showCart,
    setShowCart
  } = useContext(CartContext);

  useEffect(() => {
    if (showCart) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showCart]);

  const subtotal = (cart || []).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );


  return (
    <>
      {showCart && (
        <div
          className="modal-backdrop fade show"
          style={{
            zIndex: 1040,
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
          }}
          onClick={() => setShowCart(false)}
        />
      )}

      <div
        id="cart"
        className={`cs-offcanvas cs-offcanvas-right ${showCart ? "show" : ""}`}
        style={{
          visibility: showCart ? "visible" : "hidden",
          zIndex: 1050,
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "100%",
          maxWidth: 400,
          background: "#fff",
          boxShadow: "-2px 0 16px rgba(0,0,0,0.15)",
          transition: "transform 0.3s",
          transform: showCart ? "translateX(0)" : "translateX(100%)",
          overflowY: "auto",
        }}
        tabIndex={-1}
        aria-modal="true"
        role="dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cs-offcanvas-cap align-items-center border-bottom">
          <h2 className="h5 mb-0">Tu carrito ({cart.length})</h2>
          <button
            className="close mr-n1"
            type="button"
            onClick={() => setShowCart(false)}
            aria-label="Close"
          >
            <span className="h3 font-weight-normal mb-0" aria-hidden="true">
              &times;
            </span>
          </button>
        </div>

        <div className="cs-offcanvas-body">
          {cart.map((item) => (
            <div key={item.sizeId || item.productId || item.id} className="media p-4 border-bottom mx-n4">
              <div style={{ minWidth: "80px" }}>
                <img
                  src={item.image}
                  width="80"
                  alt={`${item.name} thumb`}
                  className="img-fluid"
                />
              </div>
              <div className="media-body pl-3">
                <div className="d-flex justify-content-between">
                  <div className="pr-2">
                    <h3 className="font-size-sm mb-3">
                      <span className="font-weight-bold">{item.name}</span>
                    </h3>
                    <ul className="list-unstyled font-size-xs mt-n2 mb-2">
                      <li className="mb-0">
                        <span className="text-muted">Tamaño:</span> {item.size}
                      </li>
                    </ul>
                    <div className="d-flex align-items-center">
                      <input
                        type="number"
                        className="form-control form-control-sm bg-light mr-3"
                        style={{ width: "4.5rem" }}
                        value={item.quantity}
                        min="1"
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value))
                        }
                      />
                      <div className="text-nowrap">
                        <strong className="text-danger">
                          ${(item.price * item.quantity).toFixed(2)}
                        </strong>
                        <div className="font-size-xs text-muted">
                          ${item.price.toFixed(2)} c/u
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="nav-muted mr-n2">
                    <button
                      className="nav-link px-2 mt-n2 bg-transparent border-0"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <i className="cxi-delete"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="text-center p-4">
              <i className="cxi-cart font-size-xl text-muted mb-3"></i>
              <p className="text-muted">Tu carrito está vacío</p>
              <button
                className="btn btn-outline-primary"
                onClick={() => setShowCart(false)}
              >
                Seguir comprando
              </button>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cs-offcanvas-cap flex-column border-top">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-1">
              <span className="text-muted mr-2">Subtotal:</span>
              <span className="h5 mb-0">${subtotal.toFixed(2)}</span>
            </div>
            <a href="/checkout" className="btn btn-primary btn-lg btn-block">
              <i className="cxi-credit-card font-size-lg mt-n1 mr-1"></i>
              Comprar ahora
            </a>
            <button
              className="btn btn-outline-primary btn-block mt-2"
              onClick={() => setShowCart(false)}
            >
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
};
