
export const CartShop = () => {
  // Datos del carrito (podrías mover esto a un estado o contexto)
  const cartItems = [
    {
      id: 1,
      image: '/assets/img/ecommerce/cart/01.png',
      title: 'Basic hooded sweatshirt in pink',
      color: 'Pink',
      size: 'S',
      price: 15.00,
      originalPrice: 31.00,
      quantity: 1
    },
    // Puedes añadir más items aquí
  ];

  // Calcular subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div id="cart" className="cs-offcanvas cs-offcanvas-right">
      {/* Header */}
      <div className="cs-offcanvas-cap align-items-center border-bottom">
        <h2 className="h5 mb-0">Your cart ({cartItems.length})</h2>
        <button 
          className="close mr-n1" 
          type="button" 
          data-dismiss="offcanvas" 
          aria-label="Close"
        >
          <span className="h3 font-weight-normal mb-0" aria-hidden="true">&times;</span>
        </button>
      </div>

      {/* Body */}
      <div className="cs-offcanvas-body">
        {cartItems.map(item => (
          <div key={item.id} className="media p-4 border-bottom mx-n4">
            <a href="shop-single.html" style={{ minWidth: '80px' }}>
              <img 
                src={item.image} 
                width="80" 
                alt={`${item.title} thumb`}
                className="img-fluid"
              />
            </a>
            <div className="media-body pl-3">
              <div className="d-flex justify-content-between">
                <div className="pr-2">
                  <h3 className="font-size-sm mb-3">
                    <a href="shop-single.html" className="nav-link font-weight-bold">
                      {item.title}
                    </a>
                  </h3>
                  <ul className="list-unstyled font-size-xs mt-n2 mb-2">
                    <li className="mb-0">
                      <span className="text-muted">Color:</span> {item.color}
                    </li>
                    <li className="mb-0">
                      <span className="text-muted">Size:</span> {item.size}
                    </li>
                  </ul>
                  <div className="d-flex align-items-center">
                    <input 
                      type="number" 
                      className="form-control form-control-sm bg-light mr-3" 
                      style={{ width: '4.5rem' }} 
                      value={item.quantity}
                      min="1"
                      onChange={() => {
                        // Aquí iría la lógica para actualizar la cantidad
                      }}
                    />
                    <div className="text-nowrap">
                      <strong className="text-danger">${item.price.toFixed(2)}</strong>
                      {item.originalPrice && (
                        <s className="font-size-xs text-muted ml-1">
                          ${item.originalPrice.toFixed(2)}
                        </s>
                      )}
                    </div>
                  </div>
                  <button className="btn btn-link btn-sm text-decoration-none px-0 pb-0">
                    Move to <i className="cxi-heart ml-1"></i>
                  </button>
                </div>
                <div className="nav-muted mr-n2">
                  <button 
                    className="nav-link px-2 mt-n2 bg-transparent border-0" 
                    data-toggle="tooltip" 
                    title="Remove"
                    onClick={() => {
                      // Aquí iría la lógica para eliminar el item
                    }}
                  >
                    <i className="cxi-delete"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="cs-offcanvas-cap flex-column border-top">
        <div className="d-flex align-items-center justify-content-between mb-3 pb-1">
          <span className="text-muted mr-2">Subtotal:</span>
          <span className="h5 mb-0">${subtotal.toFixed(2)}</span>
        </div>
        <a href="checkout.html" className="btn btn-primary btn-lg btn-block">
          <i className="cxi-credit-card font-size-lg mt-n1 mr-1"></i>
          Checkout
        </a>
      </div>
    </div>
  );
};

export default CartShop;