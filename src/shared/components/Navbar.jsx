import { useContext } from "react";
import { CartShop } from "../../Ecommerce/components/carshop";
import { CartContext } from "../../Ecommerce/context/cartContext"; 
const API_BASE = "https://backend-ecommerce-aasn.onrender.com/api";

export const NavbarComponent = () => {
   const { cart, setShowCart } = useContext(CartContext);

  return (       
    <>
      <header className="cs-header">
        {/* Navbar */}
        <div className="navbar navbar-expand-lg navbar-light bg-light navbar-sticky" data-fixed-element>
          <div className="container px-0 px-xl-3">
            <a href="index.html" className="navbar-brand order-lg-1 mr-0 pr-lg-3 mr-lg-4">
              <img src="assets/img/ecommerce/logo.svg" alt="Createx Logo" width="130" />
            </a>
            {/* Search desktop */}
            <div className="input-group-overlay ml-4 d-lg-block d-none order-lg-3" style={{maxWidth: '21rem'}}>
              <input className="form-control appended-form-control" type="text" placeholder="Search for products..." />
              <div className="input-group-append-overlay">
                <span className="input-group-text"><i className="cxi-search lead align-middle"></i></span>
              </div>
            </div>
            {/* Toolbar */}
            <div className="d-flex align-items-center order-lg-3">
              <ul className="nav nav-tools flex-nowrap">
                <li className="nav-item d-lg-block d-none mb-0">
                  <a href="account-wishlist.html" className="nav-tool">
                    <i className="cxi-heart nav-tool-icon"></i>
                    <span className="nav-tool-label">2</span>
                  </a>
                </li>
                <li className="divider-vertical mb-0 d-lg-block d-none"></li>
                <li className="nav-item align-self-center mb-0">
                  <a 
                    href="#" 
                    className="nav-tool pr-lg-0" 
                    onClick={(e) => {
                      e.preventDefault();
                      setShowCart(true);
                    }}
                  >
                    <i className="cxi-cart nav-tool-icon"></i>
                    <span className="badge badge-success align-middle mt-n1 ml-2 px-2 py-1 font-size-xs">
                      {cart.length}
                    </span>
                  </a>
                </li>
                <li className="divider-vertical mb-0 d-lg-none d-block"></li>
                <li className="nav-item mb-0">
                  <button 
                    className="navbar-toggler mt-n1 mr-n3" 
                    type="button" 
                    data-toggle="collapse" 
                    data-target="#navbarCollapse" 
                    aria-expanded="false"
                  >
                    <span className="navbar-toggler-icon"></span>
                  </button>
                </li>
              </ul>
            </div>
            {/* Navbar collapse */}
            <nav className="collapse navbar-collapse order-lg-2" id="navbarCollapse">
              {/* Search mobile */}
              <div className="input-group-overlay form-group mb-0 d-lg-none d-block">
                <input type="text" className="form-control prepended-form-control rounded-0 border-0" placeholder="Search for products..." />
                <div className="input-group-prepend-overlay">
                  <span className="input-group-text">
                    <i className="cxi-search font-size-lg align-middle mt-n1"></i>
                  </span>
                </div>
              </div>
              {/* Menu */}
              <ul className="navbar-nav mr-auto">
                <li className="nav-item">
                  <a href="index.html" className="nav-link active">Home</a>
                </li>
                <li className="nav-item dropdown">
                  <a href="#" className="nav-link dropdown-toggle" data-toggle="dropdown">Shop</a>
                  <ul className="dropdown-menu">
                    <li><a href="shop-catalog.html" className="dropdown-item">Catalog with Filters</a></li>
                    <li><a href="shop-single.html" className="dropdown-item">Single Product</a></li>
                    <li><a href="checkout.html" className="dropdown-item">Checkout</a></li>
                  </ul>
                </li>
                <li className="nav-item dropdown mega-dropdown">
                  <a href="#" className="nav-link dropdown-toggle" data-toggle="dropdown">Megamenu</a>
                  <div className="dropdown-menu">
                    <div className="container pt-lg-1 pb-lg-3">
                      <div className="row">
                        <div className="col-lg-2 col-md-3 py-2">
                          <ul className="list-unstyled">
                            <li><a href="#" className="dropdown-item">New collection</a></li>
                            <li><a href="#" className="dropdown-item">Best sellers</a></li>
                            <li><a href="#" className="dropdown-item">Plus size</a></li>
                            <li><a href="#" className="dropdown-item text-danger">Sale up to 70%</a></li>
                          </ul>
                        </div>
                        <div className="col-lg-2 col-md-3 py-2">
                          <h4 className="font-size-sm text-uppercase pt-1 mb-2">Clothes</h4>
                          <ul className="list-unstyled">
                            <li><a href="#" className="dropdown-item">Coats</a></li>
                            <li><a href="#" className="dropdown-item">Jackets</a></li>
                            <li><a href="#" className="dropdown-item">Suits</a></li>
                            <li><a href="#" className="dropdown-item">Dresses</a></li>
                            <li><a href="#" className="dropdown-item">Cardigans &amp; sweaters</a></li>
                            <li><a href="#" className="dropdown-item">Sweatshirts &amp; hoodies</a></li>
                            <li><a href="#" className="dropdown-item">T-shirts &amp; tops</a></li>
                            <li><a href="#" className="dropdown-item">Pants</a></li>
                            <li><a href="#" className="dropdown-item">Jeans</a></li>
                            <li><a href="#" className="dropdown-item">Shorts</a></li>
                            <li><a href="#" className="dropdown-item">Skirts</a></li>
                            <li><a href="#" className="dropdown-item">Lingerie &amp; nightwear</a></li>
                            <li><a href="#" className="dropdown-item">Sportswear</a></li>
                          </ul>
                        </div>
                        <div className="col-lg-2 col-md-3 py-2">
                          <h4 className="font-size-sm text-uppercase pt-1 mb-2">Shoes</h4>
                          <ul className="list-unstyled">
                            <li><a href="#" className="dropdown-item">Boots</a></li>
                            <li><a href="#" className="dropdown-item">Flat shoes</a></li>
                            <li><a href="#" className="dropdown-item">Heels</a></li>
                            <li><a href="#" className="dropdown-item">Sandals</a></li>
                            <li><a href="#" className="dropdown-item">Mules</a></li>
                            <li><a href="#" className="dropdown-item">Sliders</a></li>
                            <li><a href="#" className="dropdown-item">Slippers</a></li>
                            <li><a href="#" className="dropdown-item">Sneakers</a></li>
                            <li><a href="#" className="dropdown-item">Leather</a></li>
                          </ul>
                        </div>
                        <div className="col-lg-2 col-md-3 py-2">
                          <h4 className="font-size-sm text-uppercase pt-1 mb-2">Accessories</h4>
                          <ul className="list-unstyled">
                            <li><a href="#" className="dropdown-item">Bags &amp; backpacks</a></li>
                            <li><a href="#" className="dropdown-item">Hats &amp; scarves</a></li>
                            <li><a href="#" className="dropdown-item">Hair accessories</a></li>
                            <li><a href="#" className="dropdown-item">Belts</a></li>
                            <li><a href="#" className="dropdown-item">Jewellery</a></li>
                            <li><a href="#" className="dropdown-item">Watches</a></li>
                            <li><a href="#" className="dropdown-item">Sunglasses</a></li>
                            <li><a href="#" className="dropdown-item">Purses</a></li>
                            <li><a href="#" className="dropdown-item">Socks &amp; tights</a></li>
                          </ul>
                        </div>
                        <div className="col-lg-1 d-none d-lg-block py-2">
                          <span className="divider-vertical h-100 mx-auto"></span>
                        </div>
                        <div className="col-lg-3 d-none d-lg-block py-2">
                          <a href="#" className="d-block text-decoration-none pt-1">
                            <img src="assets/img/ecommerce/megamenu.jpg" className="d-block rounded mb-3" alt="Promo banner" />
                            <h5 className="font-size-sm mb-3">Back to school. Sale up to 50%</h5>
                            <div className="btn btn-outline-primary btn-sm">
                              See offers
                              <i className="cxi-arrow-right ml-1"></i>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Componente del carrito */}
      <CartShop />
    </>
  );
}

