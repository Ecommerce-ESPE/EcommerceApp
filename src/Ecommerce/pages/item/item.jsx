// src/components/ProductPage.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import ProductDetails from './ProductDetails';

import { API_BASE } from "../../services/api";

const ProductPage = ({ addToCart }) => {
  const { id } = useParams();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_BASE}/items/${id}`);
        setSelectedProduct(response.data.item); 
         setLoading(false);
      } catch {
        setError('Producto no encontrado');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="container py-5">Cargando producto...</div>;
  }

  if (error) {
    return <div className="container py-5 text-danger">{error}</div>;
  }

  return (
    <>
      {/* Título de página */}
      <section className="container d-md-flex align-items-center justify-content-between py-3 py-md-4 mb-3">
        <h1 className="mb-2 mb-md-0">{selectedProduct.nameProduct}</h1>
        <span className="text-muted">
          <strong>Art. No.</strong> {selectedProduct._id}
        </span>
      </section>

      {/* Producto principal */}
      <section className="container py-md-0 py- mb-2" >
        <div className="row" > 
          <div className="col-md-6 mb-md-0 mb-4">
            <ProductGallery product={selectedProduct} />
          </div>
          <div className="col-md-6 pl-xl-5">
            <ProductInfo product={selectedProduct} addToCart={addToCart} />
          </div>
        </div>
      </section>

      {/* Detalles */}
      <div className="py-5" style={{ backgroundColor: '#e5e8ed' }}>
        <ProductDetails product={selectedProduct} />
      </div>
    </>
  );
};

export default ProductPage;
