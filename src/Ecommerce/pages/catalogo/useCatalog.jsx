import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE } from "../../services/api";
import {
  buildCatalogCrumbs,
  resolveBrandByToken,
  resolveCategoryByToken,
  resolveSubcategoryByToken,
} from "./catalogBreadcrumbs.js";

const LISTO_INITIAL_STATE = {
  categoryId: null,
  subcategoryId: null,
  brand: null,
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

const parseSpecFromParams = (params) => {
  const specKey = params.get("specKey") || "";
  const specType = params.get("specType") || "";
  const specValue = params.get("specValue") || "";
  const specGroup = params.get("specGroup") || "";
  if (!specKey && !specType && !specValue && !specGroup) return null;
  return {
    key: specKey,
    type: specType,
    value: specValue,
    group: specGroup,
  };
};

const normalizeBrandValue = (brand) => {
  if (!brand) return "";
  if (typeof brand === "string") return brand.trim();
  if (typeof brand === "object") {
    return String(brand.slug || brand.name || brand.value || "").trim();
  }
  return "";
};

const sameSpec = (a, b) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return (
    String(a.key || "") === String(b.key || "") &&
    String(a.type || "") === String(b.type || "") &&
    String(a.value || "") === String(b.value || "") &&
    String(a.group || "") === String(b.group || "")
  );
};

const sameListo = (a, b) => {
  if (!a || !b) return false;
  const aTags = Array.isArray(a.tags) ? a.tags : [];
  const bTags = Array.isArray(b.tags) ? b.tags : [];
  return (
    String(a.categoryId || "") === String(b.categoryId || "") &&
    String(a.subcategoryId || "") === String(b.subcategoryId || "") &&
    String(a.brand || "") === String(b.brand || "") &&
    aTags.length === bTags.length &&
    aTags.every((tag, idx) => String(tag) === String(bTags[idx])) &&
    sameSpec(a.spec, b.spec)
  );
};

const resolveFromSearch = (search, categories, brandsCatalog) => {
  const params = new URLSearchParams(search || "");

  const categoryRaw = params.get("category") || "";
  const subcategoryRaw = params.get("subcategory") || "";
  const brandRaw = params.get("brand") || "";

  const categoryMatch = resolveCategoryByToken(categories, categoryRaw);
  const subcategoryMatch = resolveSubcategoryByToken(categories, subcategoryRaw, categoryMatch);
  const brandMatch = resolveBrandByToken(brandsCatalog, brandRaw);

  const tagsRaw = (params.get("tags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const sort = params.get("sort") || "price_asc";
  const page = Math.max(Number(params.get("page") || 1), 1);
  const limit = Math.max(Number(params.get("limit") || 12), 1);

  const listo = {
    categoryId: categoryMatch?._id || categoryRaw || null,
    subcategoryId: subcategoryMatch?._id || subcategoryRaw || null,
    brand: brandMatch?.slug || brandRaw || null,
    tags: tagsRaw,
    spec: parseSpecFromParams(params),
  };

  const context = {
    category:
      categoryMatch || categoryRaw
        ? {
            label: categoryMatch?.name || categoryRaw,
            token: categoryMatch?.slug || categoryMatch?._id || categoryRaw,
          }
        : null,
    subcategory:
      subcategoryMatch || subcategoryRaw
        ? {
            label: subcategoryMatch?.name || subcategoryRaw,
            token: subcategoryMatch?.slug || subcategoryMatch?._id || subcategoryRaw,
          }
        : null,
    brand:
      brandMatch || brandRaw
        ? {
            label: brandMatch?.name || brandRaw,
            token: brandMatch?.slug || brandRaw,
          }
        : null,
  };

  return {
    listo,
    sort,
    page,
    limit,
    context,
  };
};

const tokenOrSlug = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildSearchFromState = ({ listo, sort, page, limit, categories }) => {
  const params = new URLSearchParams();

  const categoryMatch = categories.find((cat) => cat?._id === listo?.categoryId);
  const categoryToken =
    categoryMatch?.slug ||
    tokenOrSlug(categoryMatch?.name) ||
    listo?.categoryId;
  if (categoryToken) params.append("category", categoryToken);

  let subcategoryToken = "";
  if (listo?.subcategoryId) {
    const subPool = categoryMatch?.subcategories?.length
      ? categoryMatch.subcategories
      : categories.flatMap((cat) => cat?.subcategories || []);
    const subMatch = subPool.find((sub) => sub?._id === listo.subcategoryId);
    subcategoryToken =
      subMatch?.slug ||
      tokenOrSlug(subMatch?.name) ||
      listo.subcategoryId;
  }
  if (subcategoryToken) params.append("subcategory", subcategoryToken);

  if (listo?.brand) params.append("brand", listo.brand);
  if (Array.isArray(listo?.tags) && listo.tags.length > 0) {
    params.append("tags", listo.tags.join(","));
  }

  if (listo?.spec) {
    const { key, type, value, group } = listo.spec;
    if (key) params.append("specKey", String(key).trim());
    if (type) params.append("specType", String(type).trim());
    if (value) params.append("specValue", String(value).trim());
    if (group) params.append("specGroup", String(group).trim());
  }

  params.append("sort", sort || "price_asc");
  params.append("page", String(page || 1));
  params.append("limit", String(limit || 12));

  return params.toString();
};

export const useCatalog = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [brandsCatalog, setBrandsCatalog] = useState([]);
  const [tagsCatalog, setTagsCatalog] = useState([]);
  const [products, setProducts] = useState([]);
  const [Listo, setListo] = useState(LISTO_INITIAL_STATE);
  const [sort, setSort] = useState("price_asc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [loading, setLoading] = useState(false);
  const [filterError, setFilterError] = useState("");
  const [queryHydrated, setQueryHydrated] = useState(false);
  const [breadcrumbContext, setBreadcrumbContext] = useState({
    category: null,
    subcategory: null,
    brand: null,
  });

  const toolbarFilters = useMemo(
    () => ({
      sort,
      page,
      limit,
    }),
    [sort, page, limit]
  );

  const catalogCrumbs = useMemo(
    () => buildCatalogCrumbs(breadcrumbContext),
    [breadcrumbContext]
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

  const fetchBrands = useCallback(async () => {
    const toBrandOption = (raw) => {
      if (!raw) return null;
      if (typeof raw === "string") {
        const normalized = raw.trim();
        if (!normalized) return null;
        return { slug: normalized, name: normalized };
      }

      const slug = String(raw.slug || raw.code || raw.name || "").trim();
      const name = String(raw.name || raw.label || raw.slug || "").trim();
      if (!slug && !name) return null;
      return {
        slug: slug || name,
        name: name || slug,
      };
    };

    try {
      const response = await fetch(`${API_BASE}/brands`);
      if (response.ok) {
        const data = await response.json();
        const rawBrands = Array.isArray(data)
          ? data
          : data?.items || data?.brands || data?.data || [];
        const parsed = rawBrands
          .map(toBrandOption)
          .filter(Boolean)
          .reduce((acc, entry) => {
            if (!acc.some((it) => it.slug.toLowerCase() === entry.slug.toLowerCase())) {
              acc.push(entry);
            }
            return acc;
          }, [])
          .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
        setBrandsCatalog(parsed);
        return;
      }
    } catch {
      // fallback below
    }

    try {
      const response = await fetch(`${API_BASE}/items/filter?page=1&limit=100`);
      const data = await response.json();
      const items = Array.isArray(data?.items) ? data.items : [];
      const parsed = items
        .map((item) => normalizeBrandValue(item?.brand))
        .filter(Boolean)
        .reduce((acc, value) => {
          if (!acc.some((it) => it.slug.toLowerCase() === value.toLowerCase())) {
            acc.push({ slug: value, name: value });
          }
          return acc;
        }, [])
        .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
      setBrandsCatalog(parsed);
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrandsCatalog([]);
    }
  }, []);

  const fetchProducts = useCallback(async ({ listo, nextSort, nextPage, nextLimit }) => {
    const specError = validateSpec(listo?.spec);
    if (specError) {
      setFilterError(specError);
      return false;
    }

    setFilterError("");
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (listo?.categoryId) params.append("category", listo.categoryId);
      if (listo?.subcategoryId) params.append("subcategory", listo.subcategoryId);
      if (listo?.brand) params.append("brand", listo.brand);
      if (Array.isArray(listo?.tags) && listo.tags.length > 0) {
        params.append("tags", listo.tags.join(","));
      }

      if (listo?.spec) {
        const { key, type, value, group } = listo.spec;
        params.append("specKey", String(key).trim());
        params.append("specType", String(type).trim());
        params.append("specValue", String(value).trim());
        if (group && String(group).trim()) {
          params.append("specGroup", String(group).trim());
        }
      }

      params.append("sort", nextSort || "price_asc");
      params.append("page", String(nextPage || 1));
      params.append("limit", String(nextLimit || 12));

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
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchTags();
  }, [fetchCategories, fetchBrands, fetchTags]);

  useEffect(() => {
    const parsed = resolveFromSearch(location.search, categories, brandsCatalog);

    setBreadcrumbContext(parsed.context);

    setListo((prev) => (sameListo(prev, parsed.listo) ? prev : parsed.listo));
    setSort((prev) => (prev === parsed.sort ? prev : parsed.sort));
    setPage((prev) => (prev === parsed.page ? prev : parsed.page));
    setLimit((prev) => (prev === parsed.limit ? prev : parsed.limit));

    fetchProducts({
      listo: parsed.listo,
      nextSort: parsed.sort,
      nextPage: parsed.page,
      nextLimit: parsed.limit,
    });
    setQueryHydrated(true);
  }, [location.search, categories, brandsCatalog, fetchProducts]);

  const handleCategory = useCallback((catId) => {
    setListo((prev) => ({
      ...prev,
      categoryId: prev.categoryId === catId ? null : catId,
      subcategoryId: null,
    }));
    setPage(1);
  }, []);

  const handleSubcategory = useCallback((subId) => {
    setListo((prev) => ({
      ...prev,
      subcategoryId: prev.subcategoryId === subId ? null : subId,
    }));
    setPage(1);
  }, []);

  const handleBrand = useCallback((brandSlug) => {
    setListo((prev) => ({
      ...prev,
      brand: prev.brand === brandSlug ? null : brandSlug,
    }));
    setPage(1);
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
    setPage(1);
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
    setPage(1);
  }, []);

  const handleSortChange = useCallback(
    (value) => {
      setSort(value);
      setPage(1);
    },
    []
  );

  const handleLimitChange = useCallback(
    (value) => {
      const nextLimit = Number(value);
      setLimit(nextLimit);
      setPage(1);
    },
    []
  );

  // Sincroniza filtros -> URL. La URL es fuente de verdad para fetch y estado.
  useEffect(() => {
    if (!queryHydrated) return;
    const nextSearch = buildSearchFromState({
      listo: Listo,
      sort,
      page,
      limit,
      categories,
    });
    const currentSearch = new URLSearchParams(location.search || "").toString();
    if (nextSearch !== currentSearch) {
      navigate(`/shop?${nextSearch}`);
    }
  }, [queryHydrated, Listo, sort, page, limit, categories, location.search, navigate]);

  const applyFilters = useCallback(() => {}, []);

  const clearFilters = useCallback(() => {
    setFilterError("");
    setListo(LISTO_INITIAL_STATE);
    setPage(1);
  }, []);

  return {
    categories,
    brandsCatalog,
    tagsCatalog,
    products,
    Listo,
    toolbarFilters,
    loading,
    filterError,
    catalogCrumbs,
    handleCategory,
    handleSubcategory,
    handleBrand,
    handleToggleTag,
    handleUpdateSpec,
    handleSortChange,
    handleLimitChange,
    applyFilters,
    clearFilters,
  };
};

export default useCatalog;
