import { useContext } from "react";
import { CartShop } from "../../Ecommerce/components/carshop";
import { CartContext } from "../../Ecommerce/context/cartContext";
import { useAuth } from "../../auth/authContext";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/img/ecommerce/logo.svg";
import avatar from "../../assets/img/ecommerce/home/categories/03.jpg";
import { notyf } from "../../utils/notifications";
import { Link } from "react-router-dom";

const initialMenuData = {
  mainMenu: [
    { id: 1, title: "Inicio", url: "/home", type: "link" },
    {
      id: 2,
      title: "Tienda",
      type: "dropdown",
      children: [
        { id: 21, title: "Catálogo", url: "/shop" },
        //{ id: 22, title: "Producto Individual", url: "/shop-single" },
        { id: 23, title: "Checkout", url: "/checkout" },
      ],
    },
    {
      id: 3,
      title: "Promociones",
      type: "promotions",
      url: "/promotions",
    },
    {
      id: 4,
      title: "Categorías",
      type: "megamenu",
      sections: [
        {
          id: 41,
          title: "Destacados",
          links: [
            { id: 411, title: "Nueva colección", url: "#", promo: true },
            { id: 412, title: "Más vendidos", url: "#" },
            { id: 413, title: "Talla plus", url: "#" },
            { id: 414, title: "Ofertas hasta 70%", url: "#", highlight: true },
          ],
        },
        {
          id: 42,
          title: "Ropa",
          links: [
            { id: 421, title: "Abrigos", url: "#" },
            { id: 422, title: "Chaquetas", url: "#" },
            { id: 423, title: "Vestidos", url: "#" },
            { id: 424, title: "Cardigans y suéteres", url: "#" },
            { id: 425, title: "Camisetas", url: "#" },
            { id: 426, title: "Pantalones", url: "#" },
            { id: 427, title: "Jeans", url: "#" },
            { id: 428, title: "Shorts", url: "#" },
            { id: 429, title: "Faldas", url: "#" },
            { id: 430, title: "Ropa deportiva", url: "#" },
          ],
        },
        {
          id: 43,
          title: "Zapatos",
          links: [
            { id: 431, title: "Botas", url: "#" },
            { id: 432, title: "Zapatos planos", url: "#" },
            { id: 433, title: "Tacones", url: "#" },
            { id: 434, title: "Sandalias", url: "#" },
            { id: 435, title: "Mules", url: "#" },
            { id: 436, title: "Slippers", url: "#" },
            { id: 437, title: "Sneakers", url: "#" },
            { id: 438, title: "Cuero", url: "#" },
          ],
        },
        {
          id: 44,
          title: "Accesorios",
          links: [
            { id: 441, title: "Bolsos y mochilas", url: "#" },
            { id: 442, title: "Sombreros y bufandas", url: "#" },
            { id: 443, title: "Accesorios de pelo", url: "#" },
            { id: 444, title: "Cinturones", url: "#" },
            { id: 445, title: "Joyas", url: "#" },
            { id: 446, title: "Relojes", url: "#" },
            { id: 447, title: "Gafas de sol", url: "#" },
            { id: 448, title: "Billeteras", url: "#" },
            { id: 449, title: "Medias", url: "#" },
          ],
        },
      ],
      promo: {
        imageUrl: "assets/img/ecommerce/megamenu.jpg",
        title: "Vuelta al cole. Ofertas hasta 50%",
        url: "#",
        buttonText: "Ver ofertas",
      },
    },
  ],
};

export const NavbarComponent = () => {
  const { cart, setShowCart } = useContext(CartContext);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  // Logout handler
  const handleLogout = () => {
    logout();
    navigate("/login");
    notyf.success("Sesión cerrada correctamente");
  };
  return (
    <>
      <header className="cs-header">
        <div
          className="navbar navbar-expand-lg navbar-light bg-light navbar-sticky"
          data-fixed-element
        >
          <div className="container px-0 ">
            {/* Logo */}
            <a
              href="/"
              className="navbar-brand order-lg-1 mr-0 pr-lg-3 mr-lg-4"
            >
              <img src={logo} alt="Createx Logo" width="130" />
            </a>

            {/* Buscador Desktop */}
            <div
              className="input-group-overlay ml-4 d-lg-block d-none order-lg-3"
              style={{ maxWidth: "21rem" }}
            >
              <input
                className="form-control appended-form-control"
                type="text"
                placeholder="Buscar productos..."
              />
              <div className="input-group-append-overlay">
                <span className="input-group-text">
                  <i className="cxi-search lead align-middle"></i>
                </span>
              </div>
            </div>

            {/* Iconos derecha */}
            <div className="d-flex align-items-center order-lg-3">
              <ul className="nav nav-tools flex-nowrap">
                {/* Wishlist */}
                <li className="nav-item d-lg-block d-none mb-0">
                  <a href="/wishlist" className="nav-tool">
                    <i className="cxi-heart nav-tool-icon"></i>
                    <span className="nav-tool-label">2</span>
                  </a>
                </li>

                {/* Carrito */}
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

                {/* Usuario */}
                <li className="nav-item dropdown align-self-center mb-0 ml-1">
                  {user ? (
                    <>
                      <a
                        className="nav-tool d-flex align-items-center dropdown-toggle"
                        href="#"
                        id="userDropdown"
                        role="button"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <i className="cxi-profile nav-tool-icon mr-2"></i>
                        <span className="font-size-sm text-nowrap">
                          {user.nombre}
                        </span>
                      </a>

                      {/* Dropdown tipo widget */}
                      <div
                        className="dropdown-menu dropdown-menu-right p-3"
                        aria-labelledby="userDropdown"
                        style={{ minWidth: "280px" }}
                      >
                        <div className="d-flex align-items-start">
                          <img
                            className="rounded-circle mr-3"
                            src={user.perfil || avatar} // imagen por defecto si no hay
                            alt="Foto de perfil"
                            width="64"
                            height="64"
                          />
                          <div className="ml-2">
                            <h6 className="mb-1">{user.nombre}</h6>
                            <p className="mb-2 text-muted small">
                              {user.email || ""}
                            </p>
                            <p className="mb-2 text-muted small font-weight-bold">
                              $ {user.wallet.toFixed(2) || 0.0} Dolares
                            </p>
                          </div>
                        </div>

                        <hr className="my-2" />

                        <Link
                          to="/dashboard/profile"
                          className="dropdown-item d-flex align-items-center"
                        >
                          <i className="cxi-user mr-2"></i>
                          Mi perfil
                        </Link>

                        <a
                          className="dropdown-item d-flex align-items-center"
                          href="/configuracion"
                        >
                          <i className="cxi-settings mr-2"></i> Configuración
                        </a>
                        <button
                          className="dropdown-item d-flex align-items-center"
                          onClick={handleLogout}
                        >
                          <i className="cxi-logout mr-2"></i> Cerrar sesión
                        </button>
                      </div>
                    </>
                  ) : (
                    <a
                      href="/login"
                      className="nav-tool d-flex align-items-center"
                    >
                      <i className="cxi-profile nav-tool-icon mr-2"></i>
                      <span className="font-size-sm text-nowrap">
                        Iniciar sesión
                      </span>
                    </a>
                  )}
                </li>

                {/* Toggler Mobile */}
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

            {/* Menú principal */}
            <nav
              className="collapse navbar-collapse order-lg-2"
              id="navbarCollapse"
            >
              <div className="input-group-overlay form-group mb-0 d-lg-none d-block">
                <input
                  type="text"
                  className="form-control prepended-form-control rounded-0 border-0"
                  placeholder="Buscar productos..."
                />
                <div className="input-group-prepend-overlay">
                  <span className="input-group-text">
                    <i className="cxi-search font-size-lg align-middle mt-n1"></i>
                  </span>
                </div>
              </div>

              <ul className="navbar-nav mr-auto">
                {initialMenuData.mainMenu.map((item) => {
                  if (item.type === "link") {
                    return (
                      <li className="nav-item" key={item.id}>
                        <a href={item.url} className="nav-link">
                          {item.title}
                        </a>
                      </li>
                    );
                  }

                  if (item.type === "dropdown") {
                    return (
                      <li className="nav-item dropdown" key={item.id}>
                        <a
                          href="#"
                          className="nav-link dropdown-toggle"
                          data-toggle="dropdown"
                        >
                          {item.title}
                        </a>
                        <ul className="dropdown-menu">
                          {item.children.map((child) => (
                            <li key={child.id}>
                              <a href={child.url} className="dropdown-item">
                                {child.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </li>
                    );
                  }

                  if (item.type === "promotions") {
                    return (
                      <li className="nav-item" key={item.id}>
                        <a
                          href={item.url}
                          className="nav-link active font-weight-bold"
                        >
                          {item.title}
                        </a>
                      </li>
                    );
                  }

                  if (item.type === "megamenu") {
                    return (
                      <li
                        className="nav-item dropdown mega-dropdown"
                        key={item.id}
                      >
                        <a
                          href="#"
                          className="nav-link dropdown-toggle"
                          data-toggle="dropdown"
                        >
                          {item.title}
                        </a>
                        <div className="dropdown-menu">
                          <div className="container pt-lg-1 pb-lg-3">
                            <div className="row">
                              {item.sections.map((section) => (
                                <div
                                  className="col-lg-2 col-md-3 py-2"
                                  key={section.id}
                                >
                                  {section.title && (
                                    <h4 className="font-size-sm text-uppercase pt-1 mb-2">
                                      {section.title}
                                    </h4>
                                  )}
                                  <ul className="list-unstyled">
                                    {section.links.map((link) => (
                                      <li key={link.id}>
                                        <a
                                          href={link.url}
                                          className={`dropdown-item ${
                                            link.promo ? "text-info" : ""
                                          } ${
                                            link.highlight
                                              ? "text-danger font-weight-bold"
                                              : ""
                                          }`}
                                        >
                                          {link.title}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                              <div className="col-lg-1 d-none d-lg-block py-2">
                                <span className="divider-vertical h-100 mx-auto"></span>
                              </div>
                              <div className="col-lg-3 d-none d-lg-block py-2">
                                <a
                                  href={item.promo.url}
                                  className="d-block text-decoration-none pt-1"
                                >
                                  <img
                                    src={item.promo.imageUrl}
                                    className="d-block rounded mb-3"
                                    alt="Promo banner"
                                  />
                                  <h5 className="font-size-sm mb-3">
                                    {item.promo.title}
                                  </h5>
                                  <div className="btn btn-outline-primary btn-sm">
                                    {item.promo.buttonText}
                                    <i className="cxi-arrow-right ml-1"></i>
                                  </div>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  }

                  return null;
                })}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Carrito Modal */}
      <CartShop />
    </>
  );
};
