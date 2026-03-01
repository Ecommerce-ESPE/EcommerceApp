// src/components/ProductPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useMemo } from "react";

import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductDetails from "./ProductDetails";
import CatalogBreadcrumbs from "../catalogo/CatalogBreadcrumbs.jsx";
import { buildProductCrumbs } from "../catalogo/catalogBreadcrumbs";

import { API_BASE } from "../../services/api";
import SEOProduct from "../../seo/SEOProduct";
import { getProductPricingSummary } from "../../utils/productPricing";
const ProductPage = ({ addToCart }) => {
  const { id } = useParams();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const crumbs = useMemo(
    () => buildProductCrumbs(selectedProduct),
    [selectedProduct]
  );

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_BASE}/items/${id}`);
        setSelectedProduct(response.data.item);
        setLoading(false);
      } catch {
        setError("Producto no encontrado");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <section className="container py-5">
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="bg-secondary rounded" style={{ height: "420px" }}></div>
            <div className="d-flex mt-3">
              <div className="bg-secondary rounded mr-2" style={{ width: 64, height: 64 }}></div>
              <div className="bg-secondary rounded mr-2" style={{ width: 64, height: 64 }}></div>
              <div className="bg-secondary rounded" style={{ width: 64, height: 64 }}></div>
            </div>
          </div>
          <div className="col-md-6 pl-xl-5">
            <div className="bg-secondary rounded mb-3" style={{ height: 24, width: "45%" }}></div>
            <div className="bg-secondary rounded mb-3" style={{ height: 36, width: "60%" }}></div>
            <div className="bg-secondary rounded mb-4" style={{ height: 18, width: "35%" }}></div>
            <div className="bg-secondary rounded mb-3" style={{ height: 48, width: "100%" }}></div>
            <div className="bg-secondary rounded mb-3" style={{ height: 48, width: "100%" }}></div>
            <div className="bg-secondary rounded" style={{ height: 48, width: "100%" }}></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return <div className="container py-5 text-danger">{error}</div>;
  }

  const seoPricing = getProductPricingSummary(selectedProduct);

  return (
    <>
      <SEOProduct
        product={{
          name: selectedProduct.nameProduct,
          slug: selectedProduct.slug || selectedProduct._id,
          description: selectedProduct.description,
          images: selectedProduct.banner,
          sku: selectedProduct.sku,
          brand: selectedProduct.brand || "N/A",
          currency: "USD",
          price: seoPricing.display || 0,
          stock:  selectedProduct.value.reduce((acc, v) => acc + (v.stock || 0), 0),
        }}
      />

      <CatalogBreadcrumbs crumbs={crumbs} />

      {/* Título de página */}
      <section className="container d-md-flex align-items-center justify-content-between py-3 py-md-4 mb-3">
        <h1 className="mb-2 mb-md-0">{selectedProduct.nameProduct}</h1>
        <span className="text-muted">
          <strong>Art. No.</strong> {selectedProduct.sku || selectedProduct._id}
        </span>
      </section>

      {/* Producto principal */}
      <section className="container py-md-0 py- mb-2">
        <div className="row">
          <div className="col-md-6 mb-md-0 mb-4">
            <ProductGallery product={selectedProduct} />
          </div>
          <div className="col-md-6 pl-xl-5">
            <ProductInfo product={selectedProduct} addToCart={addToCart} />
          </div>
        </div>
      </section>

      {/* Detalles */}
      <div className="py-5" style={{ backgroundColor: "#e5e8ed" }}>
        <ProductDetails product={selectedProduct} />
      </div>
    </>
  );
};

export default ProductPage;
