import React, { useState, useContext } from "react";
import { CartContext } from "../../context/cartContext";
import { notyf } from "../../../utils/notifications";
import { useCatalog } from "./useCatalog";
import ProductCard from "./ProductCard";
import PromoBannerTop from "./PromoBannerTop";
import PromoBannerInline from "./PromoBannerInline";
import CategoryMiniBanner from "./CategoryMiniBanner";
import FiltersSidebar from "./FiltersSidebar";
import Toolbar from "./Toolbar";
import { CartShop } from "../../components/carshop";
import { Helmet } from "@dr.pogodin/react-helmet";

const CatalogComponent = () => {
  const {
    cart,
    addToCart: contextAddToCart,
    setShowCart,
  } = useContext(CartContext);

  const {
    categories,
    products,
    filters,
    handleCategory,
    handleSubcategory,
    handleSortChange,
    handleLimitChange,
    loading,
  } = useCatalog({
    category: "",
    subcategory: "",
    sort: "price_asc",
    page: 1,
    limit: 12,
  });

  const [selectedSizes, setSelectedSizes] = useState({});
  const [openCategory, setOpenCategory] = useState("category");

  // Mostrar filtro móvil si el usuario lo abre
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const handleSizeChange = (prodId, sizeId) => {
    setSelectedSizes((prev) => ({ ...prev, [prodId]: sizeId }));
  };

  const handleAddToCart = (product, sizeId) => {
    if (!sizeId) return notyf.error("Por favor seleccione un tamaño");
    const size = product.value?.find((v) => v._id === sizeId);
    if (!size) return notyf.error("Tamaño no disponible");

    const now = new Date();
    const startDate = new Date(product.promotion?.startDate);
    const endDate = new Date(product.promotion?.endDate);
    const isPromoActive =
      product.promotion?.active && now >= startDate && now <= endDate;

    const price =
      isPromoActive &&
      size.discountPrice &&
      size.discountPrice < size.originalPrice
        ? size.discountPrice
        : size.originalPrice;

    contextAddToCart({
      id: `${product._id}-${sizeId}`,
      productId: product._id,
      name: product.nameProduct,
      image: product.banner,
      price,
      size: size.size,
      sizeId,
      quantity: 1,
    });

    notyf.success(`${product.nameProduct} (${size.size}) agregado al carrito`);
  };

  return (
    <>
      <Helmet>
        <title>Catálogo | Createx Shop</title>
        <meta
          name="description"
          content="Explora nuestro catálogo de productos y encuentra lo que necesitas."
        />
        
      </Helmet>
      <section className="container pt-3 pb-5 mb-2 mb-lg-0">
        {/* Mobile Cart Button */}
        <div
          className="d-lg-none position-fixed"
          style={{ top: "0px", right: "0px", zIndex: 1050 }}
        >
          <button
            className="btn btn-primary btn-sm position-fixed"
            onClick={() => setShowCart(true)}
            style={{
              width: "100px",
              height: "50px",
              bottom: "20px", // margen desde abajo
              right: "0px",
              zIndex: 1050,
            }}
          >
            <i className="cxi-cart"></i>
            <span className="badge badge-light ml-1">{cart.length}</span>
          </button>
        </div>

        {/* Toolbar and Filters button */}
        <div className="row mb-4 pb-2">
          <div className="col-md-3 pr-lg-4 mb-3 mb-md-0">
            <div className="d-none d-lg-block">
              <h3>
                <i className="cxi-filter-1"></i> Filtros:
              </h3>
            </div>
            {/* Mobile show filters button */}
            <button
              type="button"
              className="btn btn-primary btn-block mt-0 d-lg-none"
              onClick={() => setShowFiltersMobile(true)}
            >
              <i className="cxi-filter-2 mr-1"></i> Mostrar filtros
            </button>
          </div>

          <div className="col-lg-3 pr-lg-4">
            <Toolbar
              filters={filters}
              onSortChange={handleSortChange}
              onLimitChange={handleLimitChange}
            />
          </div>
        </div>


        <div className="row flex-lg-nowrap">
          {/* Sidebar desktop */}
          <FiltersSidebar
            categories={categories}
            filters={filters}
            handleCategory={handleCategory}
            handleSubcategory={handleSubcategory}
            openCategory={openCategory}
            setOpenCategory={setOpenCategory}
            className="d-none d-lg-block"
          />

          {/* Sidebar mobile offcanvas */}
          {showFiltersMobile && (
            <>
              <div
                className="filters-offcanvas d-lg-none position-fixed top-0 start-0 w-75 h-100 bg-white shadow"
                style={{ zIndex: 1060, overflowY: "auto" }}
              >
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Filtros</h5>
                  <button
                    type="button"
                    className="btn btn-light"
                    aria-label="Cerrar filtros"
                    onClick={() => setShowFiltersMobile(false)}
                  >
                    &times;
                  </button>
                </div>
                <FiltersSidebar
                  categories={categories}
                  filters={filters}
                  handleCategory={handleCategory}
                  handleSubcategory={handleSubcategory}
                  openCategory={openCategory}
                  setOpenCategory={setOpenCategory}
                />
              </div>
              <div
                className="filters-offcanvas-backdrop d-lg-none position-fixed top-0 start-0 w-100 h-100"
                style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
                onClick={() => setShowFiltersMobile(false)}
              />
            </>
          )}

          {/* Main product grid */}
          <div className="col">
            <PromoBannerInline />
            <div className="category-mini-banner-list">
              {categories.map((cat) => (
                <CategoryMiniBanner
                  key={cat._id}
                  categoryName={cat.name}
                  imageUrl={cat.images?.[0]?.imgUrl || cat.image || cat.banner || cat.icon}
                  link="/catalogo"
                />
              ))}
            </div>
            {loading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "200px" }}
              >
                <div className="spinner-border text-primary" role="status">
                  <span className="ci-arrow-reload"></span>{" "}
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="card border-0 shadow">
                <div className="card-body text-center py-5">
                  <i className="cxi-cart display-3 text-muted mb-3"></i>
                  <h3 className="h4">Producto no encontrado</h3>
                  <p className="text-muted mb-4">
                    No se encontraron productos. Ajusta los filtros para
                    encontrar resultados.
                  </p>
                </div>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3">
                {products.map((prod) => {
                  const selectedSize = prod.value?.find(
                    (v) => v._id === selectedSizes[prod._id]
                  );
                  return (
                    <ProductCard
                      key={prod._id}
                      product={prod}
                      selectedSize={selectedSize}
                      onSizeChange={(sizeId) =>
                        handleSizeChange(prod._id, sizeId)
                      }
                      onAddToCart={handleAddToCart}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <CartShop />
      </section>
    </>
  );
};

export default CatalogComponent;
