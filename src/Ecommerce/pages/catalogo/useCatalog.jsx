import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE } from "../../services/api";
import {
  normalizeBrandOption,
  normalizeTagOption,
  resolveBrandName,
  resolveTagNames,
  sanitizeProduct,
} from "../../utils/catalogDisplay";
import {
  buildCatalogCrumbs,
  resolveBrandByToken,
  resolveCategoryByToken,
  resolveSubcategoryByToken,
} from "./catalogBreadcrumbs.js";

const DEFAULT_SORT = "price_asc";
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

const toSlug = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeBrandValue = (brand) => {
  if (!brand) return "";
  if (typeof brand === "string") return brand.trim();
  if (typeof brand === "object") {
    return String(brand.slug || brand.name || brand.value || "").trim();
  }
  return "";
};

const parseSearchState = (search) => {
  const params = new URLSearchParams(search || "");

  return {
    categoryToken: params.get("category") || "",
    subcategoryToken: params.get("subcategory") || "",
    brandToken: params.get("brand") || "",
    tags: (params.get("tags") || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    spec: {
      key: params.get("specKey") || "",
      type: params.get("specType") || "",
      value: params.get("specValue") || "",
      group: params.get("specGroup") || "",
    },
    sort: params.get("sort") || DEFAULT_SORT,
    page: Math.max(Number(params.get("page") || DEFAULT_PAGE), 1),
    limit: Math.max(Number(params.get("limit") || DEFAULT_LIMIT), 1),
  };
};

const stringifySearch = (params) => params.toString();

export const useCatalog = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [brandsCatalog, setBrandsCatalog] = useState([]);
  const [tagsCatalog, setTagsCatalog] = useState([]);
  const [rawProducts, setRawProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterError, setFilterError] = useState("");

  const searchState = useMemo(() => parseSearchState(location.search), [location.search]);

  const selectedCategory = useMemo(
    () => resolveCategoryByToken(categories, searchState.categoryToken),
    [categories, searchState.categoryToken]
  );

  const selectedSubcategory = useMemo(
    () =>
      resolveSubcategoryByToken(
        categories,
        searchState.subcategoryToken,
        selectedCategory
      ),
    [categories, searchState.subcategoryToken, selectedCategory]
  );

  const selectedBrand = useMemo(
    () => resolveBrandByToken(brandsCatalog, searchState.brandToken),
    [brandsCatalog, searchState.brandToken]
  );

  const Listo = useMemo(
    () => ({
      categoryId: selectedCategory?._id || null,
      subcategoryId: selectedSubcategory?._id || null,
      brand: selectedBrand?.slug || searchState.brandToken || null,
      tags: searchState.tags,
      spec:
        searchState.spec.key || searchState.spec.type || searchState.spec.value || searchState.spec.group
          ? searchState.spec
          : null,
    }),
    [selectedCategory, selectedSubcategory, selectedBrand, searchState.brandToken, searchState.tags, searchState.spec]
  );

  const toolbarFilters = useMemo(
    () => ({
      sort: searchState.sort,
      page: searchState.page,
      limit: searchState.limit,
    }),
    [searchState.sort, searchState.page, searchState.limit]
  );

  const catalogCrumbs = useMemo(
    () =>
      buildCatalogCrumbs({
        category:
          searchState.categoryToken || selectedCategory
            ? {
                label: selectedCategory?.name || searchState.categoryToken,
                token:
                  selectedCategory?.slug ||
                  toSlug(selectedCategory?.name) ||
                  searchState.categoryToken,
              }
            : null,
        subcategory:
          searchState.subcategoryToken || selectedSubcategory
            ? {
                label: selectedSubcategory?.name || searchState.subcategoryToken,
                token:
                  selectedSubcategory?.slug ||
                  toSlug(selectedSubcategory?.name) ||
                  searchState.subcategoryToken,
              }
            : null,
        brand:
          searchState.brandToken || selectedBrand
            ? {
                label: selectedBrand?.name || searchState.brandToken,
                token: selectedBrand?.slug || searchState.brandToken,
              }
            : null,
      }),
    [searchState.categoryToken, searchState.subcategoryToken, searchState.brandToken, selectedCategory, selectedSubcategory, selectedBrand]
  );

  const products = useMemo(
    () =>
      rawProducts.map((item) => ({
        ...item,
        brandName: resolveBrandName(item?.brand, brandsCatalog),
        tagNames: resolveTagNames(item?.tags, tagsCatalog),
      })),
    [rawProducts, brandsCatalog, tagsCatalog]
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
      const parsedTags = rawTags
        .filter((tag) => tag?.active !== false)
        .map(normalizeTagOption)
        .filter(Boolean);
      setTagsCatalog(parsedTags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      setTagsCatalog([]);
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/brands`);
      if (response.ok) {
        const data = await response.json();
        const rawBrands = Array.isArray(data)
          ? data
          : data?.items || data?.brands || data?.data || [];
        const parsed = rawBrands
          .map(normalizeBrandOption)
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
            acc.push({ id: "", slug: value, name: value });
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

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchTags();
  }, [fetchCategories, fetchBrands, fetchTags]);

  // Fetch estable: solo por cambios reales de location.search
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams(location.search || "");

    if (!params.get("sort")) params.set("sort", DEFAULT_SORT);
    if (!params.get("page")) params.set("page", String(DEFAULT_PAGE));
    if (!params.get("limit")) params.set("limit", String(DEFAULT_LIMIT));

    const fetchData = async () => {
      setLoading(true);
      setFilterError("");
      try {
        const response = await fetch(`${API_BASE}/items/filter?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 400) {
            setFilterError("Especificacion invalida.");
          }
          setRawProducts([]);
          return;
        }

        const safeItems = (Array.isArray(data?.items) ? data.items : []).map((item) =>
          sanitizeProduct(item)
        );
        setRawProducts(safeItems);
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.error("Error fetching products:", error);
        setRawProducts([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [location.search]);

  const updateSearchParams = useCallback(
    (mutator) => {
      const params = new URLSearchParams(location.search || "");
      mutator(params);

      if (!params.get("sort")) params.set("sort", DEFAULT_SORT);
      if (!params.get("page")) params.set("page", String(DEFAULT_PAGE));
      if (!params.get("limit")) params.set("limit", String(DEFAULT_LIMIT));

      const next = stringifySearch(params);
      const current = stringifySearch(new URLSearchParams(location.search || ""));
      if (next !== current) {
        navigate(`/shop?${next}`);
      }
    },
    [location.search, navigate]
  );

  const handleCategory = useCallback(
    (catId) => {
      const category = categories.find((cat) => cat?._id === catId);
      const categoryToken =
        category?.slug || toSlug(category?.name) || category?._id || "";

      updateSearchParams((params) => {
        const current = params.get("category") || "";
        if (current === categoryToken) {
          params.delete("category");
          params.delete("subcategory");
        } else {
          params.set("category", categoryToken);
          params.delete("subcategory");
        }
        params.set("page", "1");
      });
    },
    [categories, updateSearchParams]
  );

  const handleSubcategory = useCallback(
    (subId) => {
      const subPool = selectedCategory?.subcategories?.length
        ? selectedCategory.subcategories
        : categories.flatMap((cat) => cat?.subcategories || []);
      const sub = subPool.find((entry) => entry?._id === subId);
      const subToken = sub?.slug || toSlug(sub?.name) || sub?._id || "";

      updateSearchParams((params) => {
        const current = params.get("subcategory") || "";
        if (current === subToken) {
          params.delete("subcategory");
        } else if (subToken) {
          params.set("subcategory", subToken);
        }
        params.set("page", "1");
      });
    },
    [categories, selectedCategory, updateSearchParams]
  );

  const handleBrand = useCallback(
    (brandSlug) => {
      updateSearchParams((params) => {
        const current = params.get("brand") || "";
        if (current === brandSlug) params.delete("brand");
        else params.set("brand", brandSlug);
        params.set("page", "1");
      });
    },
    [updateSearchParams]
  );

  const handleToggleTag = useCallback(
    (tagSlug) => {
      updateSearchParams((params) => {
        const currentTags = (params.get("tags") || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);

        const nextTags = currentTags.includes(tagSlug)
          ? currentTags.filter((tag) => tag !== tagSlug)
          : [...currentTags, tagSlug];

        if (nextTags.length > 0) params.set("tags", nextTags.join(","));
        else params.delete("tags");

        params.set("page", "1");
      });
    },
    [updateSearchParams]
  );

  const handleUpdateSpec = useCallback(
    (field, value) => {
      updateSearchParams((params) => {
        const currentSpec = {
          key: params.get("specKey") || "",
          type: params.get("specType") || "",
          value: params.get("specValue") || "",
          group: params.get("specGroup") || "",
        };

        const nextSpec = { ...currentSpec, [field]: value };
        const hasAny = Object.values(nextSpec).some((entry) => String(entry || "").trim());

        if (!hasAny) {
          params.delete("specKey");
          params.delete("specType");
          params.delete("specValue");
          params.delete("specGroup");
        } else {
          params.set("specKey", String(nextSpec.key || "").trim());
          params.set("specType", String(nextSpec.type || "").trim());
          params.set("specValue", String(nextSpec.value || "").trim());
          if (String(nextSpec.group || "").trim()) {
            params.set("specGroup", String(nextSpec.group || "").trim());
          } else {
            params.delete("specGroup");
          }
        }

        params.set("page", "1");
      });
    },
    [updateSearchParams]
  );

  const handleSortChange = useCallback(
    (value) => {
      updateSearchParams((params) => {
        params.set("sort", value || DEFAULT_SORT);
        params.set("page", "1");
      });
    },
    [updateSearchParams]
  );

  const handleLimitChange = useCallback(
    (value) => {
      const nextLimit = Number(value) || DEFAULT_LIMIT;
      updateSearchParams((params) => {
        params.set("limit", String(nextLimit));
        params.set("page", "1");
      });
    },
    [updateSearchParams]
  );

  const applyFilters = useCallback(() => {}, []);

  const clearFilters = useCallback(() => {
    updateSearchParams((params) => {
      params.delete("category");
      params.delete("subcategory");
      params.delete("brand");
      params.delete("tags");
      params.delete("specKey");
      params.delete("specType");
      params.delete("specValue");
      params.delete("specGroup");
      params.set("page", "1");
    });
  }, [updateSearchParams]);

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
