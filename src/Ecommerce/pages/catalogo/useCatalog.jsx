import { useState, useEffect, useMemo, useCallback } from "react";
import { API_BASE } from "../../services/api";

const LISTO_INITIAL_STATE = {
  categoryId: null,
  subcategoryId: null,
  tags: [],
  spec: null,
};

const normalizeListValue = (value = "") =>
  String(value)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const validateSpec = (spec) => {
  if (!spec) return null;

  const key = String(spec.key || "").trim();
  const type = String(spec.type || "").trim();
  const value = String(spec.value || "").trim();

  if (!type || !key || !value) {
    return "Completa tipo, clave y valor de la especificacion.";
  }

  if (type === "number" && Number.isNaN(Number(value))) {
    return "Especificacion invalida: el valor numerico no es valido.";
  }

  if (type === "boolean" && value !== "true" && value !== "false") {
    return "Especificacion invalida: boolean solo acepta true o false.";
  }

  if ((type === "list_text" || type === "list_number") && normalizeListValue(value).length === 0) {
    return "Especificacion invalida: la lista debe contener al menos un elemento.";
  }

  if (type === "list_number") {
    const invalidNumber = normalizeListValue(value).some((entry) => Number.isNaN(Number(entry)));
    if (invalidNumber) {
      return "Especificacion invalida: list_number requiere solo numeros.";
    }
  }

  return null;
};

export const useCatalog = () => {
  const [categories, setCategories] = useState([]);
  const [tagsCatalog, setTagsCatalog] = useState([]);
  const [products, setProducts] = useState([]);
  const [Listo, setListo] = useState(LISTO_INITIAL_STATE);
  const [sort, setSort] = useState("price_asc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [loading, setLoading] = useState(false);
  const [filterError, setFilterError] = useState("");

  const toolbarFilters = useMemo(
    () => ({
      sort,
      page,
      limit,
    }),
    [sort, page, limit]
  );

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

  const fetchTags = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/tags`);
      const data = await response.json();
      const rawTags = Array.isArray(data) ? data : data?.items || data?.tags || [];
      setTagsCatalog(rawTags.filter((tag) => tag?.active !== false));
    } catch (error) {
      console.error("Error fetching tags:", error);
      setTagsCatalog([]);
    }
  }, []);

  const fetchProducts = useCallback(
    async ({
      listo = Listo,
      nextSort = sort,
      nextPage = page,
      nextLimit = limit,
      showSpecValidation = false,
    } = {}) => {
      const specError = validateSpec(listo.spec);
      if (specError) {
        if (showSpecValidation) setFilterError(specError);
        return false;
      }

      setFilterError("");
      setLoading(true);
      try {
        const params = new URLSearchParams();

        if (listo.categoryId) params.append("category", listo.categoryId);
        if (listo.subcategoryId) params.append("subcategory", listo.subcategoryId);
        if (Array.isArray(listo.tags) && listo.tags.length > 0) {
          params.append("tags", listo.tags.join(","));
        }

        if (listo.spec) {
          const { key, type, value, group } = listo.spec;
          params.append("specKey", String(key).trim());
          params.append("specType", String(type).trim());
          params.append("specValue", String(value).trim());
          if (group && String(group).trim()) {
            params.append("specGroup", String(group).trim());
          }
        }

        params.append("sort", nextSort);
        params.append("page", String(nextPage));
        params.append("limit", String(nextLimit));

        const response = await fetch(`${API_BASE}/items/filter?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 400) {
            setFilterError("Especificacion invalida.");
          }
          setProducts([]);
          return false;
        }

        setProducts(data.items || []);
        return true;
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [Listo, sort, page, limit]
  );

  useEffect(() => {
    fetchCategories();
    fetchTags();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCategories, fetchTags]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProducts({
        listo: Listo,
        nextSort: sort,
        nextPage: 1,
        nextLimit: limit,
        showSpecValidation: true,
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [Listo, sort, limit, fetchProducts]);

  const handleCategory = useCallback((catId) => {
    setListo((prev) => ({
      ...prev,
      categoryId: prev.categoryId === catId ? null : catId,
      subcategoryId: null,
    }));
  }, []);

  const handleSubcategory = useCallback((subId) => {
    setListo((prev) => ({
      ...prev,
      subcategoryId: prev.subcategoryId === subId ? null : subId,
    }));
  }, []);

  const handleToggleTag = useCallback((tagSlug) => {
    setListo((prev) => {
      const currentTags = prev.tags || [];
      const nextTags = currentTags.includes(tagSlug)
        ? currentTags.filter((slug) => slug !== tagSlug)
        : [...currentTags, tagSlug];
      return {
        ...prev,
        tags: nextTags,
      };
    });
  }, []);

  const handleUpdateSpec = useCallback((field, value) => {
    setListo((prev) => {
      const currentSpec = prev.spec || { key: "", type: "", value: "", group: "" };
      const nextSpec = { ...currentSpec, [field]: value };
      const hasAny = [nextSpec.key, nextSpec.type, nextSpec.value, nextSpec.group]
        .map((entry) => String(entry || "").trim())
        .some(Boolean);

      return {
        ...prev,
        spec: hasAny ? nextSpec : null,
      };
    });
  }, []);

  const handleSortChange = useCallback(
    async (value) => {
      setSort(value);
      setPage(1);
      await fetchProducts({
        listo: Listo,
        nextSort: value,
        nextPage: 1,
        nextLimit: limit,
      });
    },
    [Listo, limit, fetchProducts]
  );

  const handleLimitChange = useCallback(
    async (value) => {
      const nextLimit = Number(value);
      setLimit(nextLimit);
      setPage(1);
      await fetchProducts({
        listo: Listo,
        nextSort: sort,
        nextPage: 1,
        nextLimit,
      });
    },
    [Listo, sort, fetchProducts]
  );

  const applyFilters = useCallback(async () => {
    setPage(1);
    await fetchProducts({
      listo: Listo,
      nextSort: sort,
      nextPage: 1,
      nextLimit: limit,
      showSpecValidation: true,
    });
  }, [Listo, sort, limit, fetchProducts]);

  const clearFilters = useCallback(async () => {
    setListo(LISTO_INITIAL_STATE);
    setFilterError("");
    setPage(1);
    await fetchProducts({
      listo: LISTO_INITIAL_STATE,
      nextSort: sort,
      nextPage: 1,
      nextLimit: limit,
    });
  }, [sort, limit, fetchProducts]);

  return {
    categories,
    tagsCatalog,
    products,
    Listo,
    toolbarFilters,
    loading,
    filterError,
    handleCategory,
    handleSubcategory,
    handleToggleTag,
    handleUpdateSpec,
    handleSortChange,
    handleLimitChange,
    applyFilters,
    clearFilters,
  };
};

export default useCatalog;
