import React from "react";

const ProductDetails = ({ product }) => {
  const description = product?.description || "Sin descripcion disponible.";
  const sku = product?.sku || product?._id || "-";
  const brand =
    product?.brand && typeof product.brand === "object" ? product.brand : {};
  const brandName =
    brand?.name || (typeof product?.brand === "string" ? product.brand : "Marca");
  const brandWebsite = brand?.website || "";
  const category =
    product?.category?.name || product?.category || "Sin categoria";
  const subcategory =
    product?.subcategory?.name || product?.subcategory || "Sin subcategoria";
  const variants = product?.value || [];

  return (
    <section className="container my-lg-2 py-2 py-md-4">
      <ul className="nav nav-tabs" role="tablist">
        <li className="nav-item">
          <a
            className="nav-link active"
            href="#product-description"
            data-toggle="tab"
            role="tab"
            aria-controls="product-description"
            aria-selected="true"
          >
            Descripcion
          </a>
        </li>
        <li className="nav-item">
          <a
            className="nav-link"
            href="#product-details"
            data-toggle="tab"
            role="tab"
            aria-controls="product-details"
            aria-selected="false"
          >
            Detalles
          </a>
        </li>
        <li className="nav-item">
          <a
            className="nav-link"
            href="#product-reviews"
            data-toggle="tab"
            role="tab"
            aria-controls="product-reviews"
            aria-selected="false"
          >
            Reviews
          </a>
        </li>
      </ul>

      <div className="tab-content pt-4">
        <div
          className="tab-pane fade show active"
          id="product-description"
          role="tabpanel"
        >
          <p className="mb-0">{description}</p>
        </div>

        <div className="tab-pane fade" id="product-details" role="tabpanel">
          <div className="row">
            <div className="col-lg-6">
              <ul className="list-unstyled mb-0">
                <li className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Marca</span>
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
                    <span>{brandName}</span>
                  )}
                </li>
                <li className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Categoria</span>
                  <span>{category}</span>
                </li>
                <li className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subcategoria</span>
                  <span>{subcategory}</span>
                </li>
                <li className="d-flex justify-content-between mb-2">
                  <span className="text-muted">SKU</span>
                  <span>{sku}</span>
                </li>
              </ul>
            </div>
            <div className="col-lg-6">
              <h4 className="h6">Variantes disponibles</h4>
              {variants.length > 0 ? (
                <div className="d-flex flex-wrap">
                  {variants.map((variant) => (
                    <span
                      key={variant._id}
                      className={`badge badge-${
                        variant.stock > 0 ? "light" : "secondary"
                      } mr-2 mb-2`}
                    >
                      {variant.size}
                      {variant.stock > 0 ? ` (${variant.stock})` : " (Agotado)"}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">
                  No hay variantes disponibles.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="tab-pane fade" id="product-reviews" role="tabpanel">
          <div className="d-flex align-items-center mb-3">
            <div className="star-rating mr-2">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={`sr-star cxi-star-filled ${
                    i < (product?.rating || 0) ? "active" : ""
                  }`}
                ></i>
              ))}
            </div>
            <span className="text-muted font-size-sm">
              {product?.rating || 0}/5 basado en opiniones recientes.
            </span>
          </div>
          <p className="text-muted mb-0">
            Aun no hay reviews. Se el primero en compartir tu experiencia.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
