import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../../services/api';

export const useCatalog = (initialFilters) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/category`);
      const data = await response.json();
      setCategories(data.categorias || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);  // Inicia carga
    try {
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.subcategory) params.append('subcategory', filters.subcategory);
      params.append('sort', filters.sort);
      params.append('page', filters.page);
      params.append('limit', filters.limit);

      const response = await fetch(`${API_BASE}/items/filter?${params.toString()}`);
      const data = await response.json();
      setProducts(data.items || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false); // Termina carga
    }
  }, [filters]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategory = useCallback((catId) => {
    setFilters(f => ({ ...f, category: catId, subcategory: '', page: 1 }));
  }, []);

  const handleSubcategory = useCallback((subId) => {
    setFilters(f => ({ ...f, subcategory: subId, page: 1 }));
  }, []);

  const handleSortChange = useCallback((value) => {
    setFilters(f => ({ ...f, sort: value, page: 1 }));
  }, []);

  const handleLimitChange = useCallback((value) => {
    setFilters(f => ({ ...f, limit: Number(value), page: 1 }));
  }, []);

  return {
    categories,
    products,
    filters,
    loading,              // <-- Retorno loading aquí
    handleCategory,
    handleSubcategory,
    handleSortChange,
    handleLimitChange
  };
};
