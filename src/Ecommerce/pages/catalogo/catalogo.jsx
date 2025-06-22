import { useEffect, useState, useContext } from "react";
import { CartShop } from "../../components/carshop";
import { CartContext } from "../../context/cartContext";
//Api Prduction
//const API_BASE = "https://backend-ecommerce-aasn.onrender.com/api";
//Api Development
const API_BASE = "http://localhost:3200/api";

export const CatalogoComponent = () => {
  const {
    cart,
    addToCart: contextAddToCart,
    updateQuantity,
    removeFromCart,
    showCart,
    setShowCart,
  } = useContext(CartContext);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    subcategory: "",
    sort: "price_asc",
    page: 1,
    limit: 12,
  });

  // Estado para los tamaños seleccionados por producto
  const [selectedSizes, setSelectedSizes] = useState({});

  // Estado para el carrito
  const [openCategory, setOpenCategory] = useState("category");
  //const [openPrice, setOpenPrice] = useState('price');
  const [bootstrapLoaded, setBootstrapLoaded] = useState(false);
  useEffect(() => {
    const checkBootstrap = () => {
      if (
        typeof window !== "undefined" &&
        window.bootstrap &&
        window.bootstrap.Offcanvas &&
        window.bootstrap.Collapse
      ) {
        setBootstrapLoaded(true);
        return true;
      }
      return false;
    };

    // Intentar inmediatamente
    if (checkBootstrap()) return;

    // Si no está cargado, esperar a que esté disponible
    const interval = setInterval(() => {
      if (checkBootstrap()) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Inicializar componentes de Bootstrap cuando esté cargado
  useEffect(() => {
    if (!bootstrapLoaded) return;

    // Inicializar offcanvas
    const offcanvasElement = document.getElementById("filtersOffcanvas");
    if (offcanvasElement) {
      new window.bootstrap.Offcanvas(offcanvasElement);
    }

    // Inicializar collapse
    const collapseElements = document.querySelectorAll(".collapse");
    collapseElements.forEach((el) => {
      new window.bootstrap.Collapse(el, { toggle: false });
    });
  }, [bootstrapLoaded, categories]);

  // Función para mostrar los filtros en móviles
  const showFilters = () => {
    if (!bootstrapLoaded) return;

    const offcanvasElement = document.getElementById("filtersOffcanvas");
    if (offcanvasElement) {
      const offcanvas = new window.bootstrap.Offcanvas(offcanvasElement);
      offcanvas.show();
    }
  };

  // Cargar categorías al montar
  useEffect(() => {
    fetch(`${API_BASE}/category`)
      .then((res) => res.json())
      .then((data) => setCategories(data.categorias || []));
  }, []);

  // Cargar productos cuando cambian los filtros
  useEffect(() => {
    const params = new URLSearchParams();

    if (
      filters.category &&
      filters.category !== "" &&
      filters.category !== "ninguna"
    )
      params.append("category", filters.category);
    if (
      filters.subcategory &&
      filters.subcategory !== "" &&
      filters.subcategory !== "ninguna"
    )
      params.append("subcategory", filters.subcategory);

    if (filters.sort) params.append("sort", filters.sort);
    params.append("page", filters.page);
    params.append("limit", filters.limit);

    fetch(`${API_BASE}/items/filter?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.items || []));
  }, [filters]);

  // Handlers para filtros
  const handleCategory = (catId) => {
    setFilters((f) => ({
      ...f,
      category: catId,
      subcategory: "", // reset subcategory
      page: 1,
    }));
  };

  const handleSubcategory = (subId) => {
    setFilters((f) => ({
      ...f,
      subcategory: subId,
      page: 1,
    }));
  };

  const handleSortChange = (e) => {
    setFilters((f) => ({
      ...f,
      sort: e.target.value,
      page: 1,
    }));
  };

  const handleLimitChange = (e) => {
    setFilters((f) => ({
      ...f,
      limit: parseInt(e.target.value),
      page: 1,
    }));
  };

  const handleSizeChange = (prodId, sizeId) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [prodId]: sizeId,
    }));
  };
  const handleAddToCart = (product, sizeId) => {
    if (!sizeId) {
      alert("Por favor seleccione un tamaño");
      return;
    }

    const selectedSize = product.value.find((v) => v._id === sizeId);

    if (!selectedSize) {
      alert("Tamaño no disponible");
      return;
    }

    const newItem = {
      id: `${product._id}-${sizeId}`,
      productId: product._id,
      name: product.nameProduct,
      image: product.banner || "https://via.placeholder.com/300",
      price: selectedSize.price,
      size: selectedSize.size,
      sizeId: sizeId,
      quantity: 1,
    };

    // Usa la función del contexto
    contextAddToCart(newItem);

    // Muestra el carrito
    //setShowCart(false);
  };

  return (
    <section className="container pt-3 pb-5 pb-md-6 mb-2 mb-lg-0">
      {/* Botón para mostrar el carrito en móviles */}
      <div
        className="fixed-top d-lg-none"
        style={{ top: "80px", right: "20px", zIndex: 1000 }}
      >
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCart(true)}
        >
          <i className="cxi-cart"></i>
          <span className="badge badge-light ml-1">{cart.length}</span>
        </button>
      </div>

      {/* Toolbar + Pagination */}
      <div className="row mb-4 pb-2">
        <div className="col-md-3 pr-lg-4 mb-3 mb-md-0">
          {/* Show / hide filters on Desktop */}
          <div className="d-none d-lg-block">
            <h3>
              <i className="cxi-filter-1"></i> Filtros:
            </h3>
          </div>

          {/* Show / hide filters (off-canvas) on Mobile */}
          <button
            type="button"
            className="btn btn-primary btn-block mt-0 d-lg-none"
            data-toggle="offcanvas"
            data-target="filtersOffcanvas"
            onClick={showFilters}
          >
            <i className="cxi-filter-2 mr-1"></i>
            Mostrar filtros
          </button>
        </div>

        <div className="col-md-9">
          <div className="d-flex align-items-center">
            <div className="form-inline flex-nowrap mr-3 mr-xl-5">
              <label
                htmlFor="sorting-top"
                className="font-weight-bold text-nowrap mr-2 pr-1 d-none d-lg-block"
              >
                Ordenar por
              </label>
              <select
                id="sorting-top"
                className="custom-select"
                value={filters.sort}
                onChange={handleSortChange}
              >
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
                <option value="name_asc">Nombre: A-Z</option>
                <option value="name_desc">Nombre: Z-A</option>
              </select>
            </div>
            <div className="form-inline flex-nowrap d-none d-sm-flex mr-3 mr-xl-5">
              <label
                htmlFor="pager-top"
                className="font-weight-bold text-nowrap mr-2 pr-1 d-none d-lg-block"
              >
                Mostrar
              </label>
              <select
                id="pager-top"
                className="custom-select"
                value={filters.limit}
                onChange={handleLimitChange}
              >
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="48">48</option>
                <option value="72">72</option>
              </select>
              <span className="font-size-sm text-muted text-nowrap ml-2 d-none d-lg-block">
                productos por página
              </span>
            </div>
            <nav className="ml-auto" aria-label="Pagination">
              <ul className="pagination mb-0">
                <li className="page-item d-sm-none">
                  <span className="page-link page-link-static">1 / 5</span>
                </li>
                <li
                  className="page-item active d-none d-sm-block"
                  aria-current="page"
                >
                  <span className="page-link">
                    1<span className="sr-only">(current)</span>
                  </span>
                </li>
                <li className="page-item d-none d-sm-block">
                  <a className="page-link" href="#">
                    2
                  </a>
                </li>
                <li className="page-item d-none d-sm-block">
                  <a className="page-link" href="#">
                    3
                  </a>
                </li>
                <li className="page-item d-none d-sm-block">
                  <a className="page-link" href="#">
                    4
                  </a>
                </li>
                <li className="page-item d-none d-sm-block">
                  <a className="page-link" href="#">
                    5
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    <i className="cxi-arrow-right"></i>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div className="row flex-lg-nowrap">
        {/* Filters (sidebar) */}
        <div id="filtersSidebar" className="col-lg-3 pr-lg-4">
          <div
            id="filtersOffcanvas"
            className="cs-offcanvas cs-offcanvas-collapse"
          >
            <div className="cs-offcanvas-cap align-items-center border-bottom mb-3">
              <h2 className="h5 mb-0">Filtros de búsqueda</h2>
              <button
                className="close mr-n1"
                type="button"
                data-dismiss="offcanvas"
                aria-label="Close"
              >
                <span
                  className="h2 font-weight-normal mt-n1 mb-0"
                  aria-hidden="true"
                >
                  &times;
                </span>
              </button>
            </div>
            <div className="cs-offcanvas-body accordion-alt pb-4">
              {/* Category Filter */}
              <div className="card border-bottom">
                <div className="card-header pt-0 pb-3" id="category-panel">
                  <h6 className="accordion-heading">
                    <a
                      href="#category"
                      role="button"
                      data-toggle="collapse"
                      aria-expanded="true"
                      aria-controls="category"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenCategory(
                          openCategory === "category" ? "" : "category"
                        );
                      }}
                    >
                      Categorías
                      <span className="accordion-indicator">
                        {openCategory === "category" ? "−" : "+"}
                      </span>
                    </a>
                  </h6>
                </div>
                <div
                  className={`collapse ${
                    openCategory === "category" ? "show" : "collapse"
                  }`}
                  id="category"
                  aria-labelledby="category-panel"
                >
                  <div className="cs-widget-data-list cs-filter">
                    <div className="input-group-overlay mb-3">
                      <input
                        type="text"
                        className="cs-filter-search form-control form-control-sm appended-form-control"
                        placeholder="Buscar categorías"
                      />
                      <div className="input-group-append-overlay">
                        <span className="input-group-text">
                          <i className="cxi-search font-size-sm"></i>
                        </span>
                      </div>
                    </div>
                    <ul
                      className="cs-filter-list list-unstyled pr-3"
                      style={{ height: "12rem" }}
                      data-simplebar
                      data-simplebar-auto-hide="false"
                    >
                      {categories.map((cat) => (
                        <li className="cs-filter-item" key={cat._id}>
                          <div className="custom-control custom-checkbox">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id={`cat-${cat._id}`}
                              checked={filters.category === cat._id}
                              onChange={() => handleCategory(cat._id)}
                            />
                            <label
                              htmlFor={`cat-${cat._id}`}
                              className="custom-control-label"
                            >
                              <span className="cs-filter-item-text">
                                {cat.name}
                              </span>
                            </label>
                          </div>

                          {/* Subcategorías */}
                          {filters.category === cat._id &&
                            cat.subcategories &&
                            cat.subcategories.length > 0 && (
                              <ul className="pl-3 mt-2">
                                {cat.subcategories.map((sub) => (
                                  <li className="cs-filter-item" key={sub._id}>
                                    <div className="custom-control custom-checkbox">
                                      <input
                                        type="checkbox"
                                        className="custom-control-input"
                                        id={`sub-${sub._id}`}
                                        checked={
                                          filters.subcategory === sub._id
                                        }
                                        onChange={() =>
                                          handleSubcategory(sub._id)
                                        }
                                      />
                                      <label
                                        htmlFor={`sub-${sub._id}`}
                                        className="custom-control-label"
                                      >
                                        <span className="cs-filter-item-text">
                                          {sub.name}
                                        </span>
                                      </label>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Price Filter */}
              <div className="card border-bottom">
                <div className="card-header py-3" id="price-panel">
                  <h6 className="accordion-heading">
                    <a
                      href="#price"
                      role="button"
                      data-toggle="collapse"
                      aria-expanded="true"
                      aria-controls="price"
                    >
                      Precio
                      <span className="accordion-indicator"></span>
                    </a>
                  </h6>
                </div>
                <div
                  className="collapse show"
                  id="price"
                  aria-labelledby="price-panel"
                >
                  <div className="cs-widget pl-1 pr-3 pb-4 mt-n3">
                    <div
                      className="cs-range-slider"
                      data-start-min="250"
                      data-start-max="680"
                      data-min="0"
                      data-max="1000"
                      data-step="1"
                    >
                      <div className="cs-range-slider-ui"></div>
                      <div className="d-flex align-items-center mt-3">
                        <div className="w-50">
                          <div className="form-group position-relative mb-0">
                            <input
                              type="number"
                              className="form-control form-control-sm cs-range-slider-value-min"
                              placeholder="Mín"
                            />
                          </div>
                        </div>
                        <div className="mx-1 px-2 font-size-xs">—</div>
                        <div className="w-50">
                          <div className="form-group position-relative mb-0">
                            <input
                              type="number"
                              className="form-control form-control-sm cs-range-slider-value-max"
                              placeholder="Máx"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product grid */}
        <div className="col">
          <div
            className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3"
            data-filters-columns
          >
            {products.map((prod) => {
              // Obtener el size seleccionado para este producto, o el primero por defecto
              const selectedSize =
                selectedSizes[prod._id] ||
                (prod.value && prod.value.length > 0
                  ? prod.value[0]._id
                  : null);

              // Encontrar el valor seleccionado
              const selectedValue =
                prod.value && prod.value.length > 0
                  ? prod.value.find((v) => v._id === selectedSize)
                  : null;

              return (
                <div className="col pb-sm-2 mb-grid-gutter" key={prod._id}>
                  <div className="card card-product mx-auto">
                    <div className="card-product-img">
                      <a
                        href={`/producto/${prod._id}`}
                        className="card-img-top"
                      >
                        <img
                          src={prod.banner || "https://via.placeholder.com/300"}
                          alt={prod.nameProduct}
                        />
                      </a>
                      <div className="card-product-widgets-top">
                        <div className="star-rating ml-auto">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i
                              key={star}
                              className={`sr-star ${
                                prod.rating > 0 ? "cxi-star-filled" : "cxi-star"
                              } ${
                                star <= Math.round(prod.rating) ? "active" : ""
                              }`}
                            ></i>
                          ))}
                          {prod.rating === 0 && (
                            <span className="small text-muted ml-1"></span>
                          )}
                        </div>
                      </div>
                      <div className="card-product-widgets-bottom">
                        <a
                          href="#"
                          className="btn-wishlist ml-auto"
                          data-toggle="tooltip"
                          data-placement="left"
                          title="Añadir a favoritos"
                        ></a>
                      </div>
                    </div>
                    <div className="card-body pb-2">
                      <h3 className="card-product-title text-truncate mb-2">
                        <a href={`/producto/${prod._id}`} className="nav-link">
                          {prod.nameProduct}
                        </a>
                      </h3>
                      <div className="d-flex align-items-center">
                        <span className="h5 d-inline-block mb-0">
                          {selectedValue
                            ? `$${selectedValue.price}`
                            : prod.value && prod.value.length > 0
                            ? `$${Math.min(...prod.value.map((v) => v.price))}`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="card-footer">
                      <div className="d-flex align-items-center mb-2 pb-3 flex-wrap gap-2">
                        {prod.value && prod.value.length > 0 && (
                          <div className="d-flex flex-wrap gap-2">
                            {prod.value.map((val) => (
                              <div key={val._id} className="position-relative">
                                <input
                                  type="radio"
                                  id={`size-${val._id}`}
                                  name={`size-${prod._id}`}
                                  checked={selectedSize === val._id}
                                  onChange={() =>
                                    handleSizeChange(prod._id, val._id)
                                  }
                                  className="d-none" // oculta el input
                                />
                                <label
                                  htmlFor={`size-${val._id}`}
                                  className={`badge badge-pill border px-2 py-2 size-option ${
                                    selectedSize === val._id
                                      ? "bg-primary text-white"
                                      : "bg-light text-dark"
                                  }`}
                                  style={{
                                    fontSize: "0.75rem",
                                    cursor: "pointer",
                                    userSelect: "none",
                                  }}
                                >
                                  {val.size}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary btn-block"
                        onClick={() => handleAddToCart(prod, selectedSize)}
                      >
                        <i className="cxi-cart align-middle mt-n1 mr-2"></i>
                        Añadir al carrito
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Componente del carrito */}
      <CartContext.Provider
        value={{
          cart,
          updateQuantity,
          removeFromCart,
          showCart,
          setShowCart,
        }}
      >
        <CartShop /> {/* ¡Quita el comentario de esta línea! */}
      </CartContext.Provider>
    </section>
  );
};
