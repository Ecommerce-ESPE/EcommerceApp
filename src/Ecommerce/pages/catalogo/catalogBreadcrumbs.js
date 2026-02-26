const normalizeToken = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const toSlug = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const tokenFromEntity = (entity, fallbackLabel = "") => {
  if (!entity) return "";
  if (typeof entity === "string") {
    const raw = entity.trim();
    return raw || toSlug(fallbackLabel);
  }
  return (
    String(entity.slug || entity.code || "").trim() ||
    toSlug(entity.name || fallbackLabel) ||
    String(entity._id || entity.id || "").trim() ||
    toSlug(entity.name || fallbackLabel)
  );
};

const labelFromEntity = (entity, fallback = "") => {
  if (!entity) return fallback;
  if (typeof entity === "string") return entity || fallback;
  return entity.name || entity.label || fallback;
};

const buildCatalogUrl = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.subcategory) params.set("subcategory", filters.subcategory);
  if (filters.brand) params.set("brand", filters.brand);
  return `/shop${params.toString() ? `?${params.toString()}` : ""}`;
};

export const resolveCategoryByToken = (categories, token) => {
  const needle = normalizeToken(token);
  if (!needle) return null;
  return (
    categories.find((cat) => normalizeToken(cat?._id) === needle) ||
    categories.find((cat) => normalizeToken(cat?.slug) === needle) ||
    categories.find((cat) => normalizeToken(cat?.name) === needle) ||
    null
  );
};

export const resolveSubcategoryByToken = (categories, token, categoryMatch) => {
  const needle = normalizeToken(token);
  if (!needle) return null;

  const subPool = categoryMatch?.subcategories?.length
    ? categoryMatch.subcategories
    : categories.flatMap((cat) => cat?.subcategories || []);

  return (
    subPool.find((sub) => normalizeToken(sub?._id) === needle) ||
    subPool.find((sub) => normalizeToken(sub?.slug) === needle) ||
    subPool.find((sub) => normalizeToken(sub?.name) === needle) ||
    null
  );
};

export const resolveBrandByToken = (brandsCatalog, token) => {
  const needle = normalizeToken(token);
  if (!needle) return null;
  return (
    brandsCatalog.find((brand) => normalizeToken(brand?.slug) === needle) ||
    brandsCatalog.find((brand) => normalizeToken(brand?.name) === needle) ||
    null
  );
};

export const buildCatalogCrumbs = ({ category, subcategory, brand }) => {
  const levels = [];
  if (category?.label && category?.token) levels.push({ ...category, type: "category" });
  if (subcategory?.label && subcategory?.token) levels.push({ ...subcategory, type: "subcategory" });
  if (brand?.label && brand?.token) levels.push({ ...brand, type: "brand" });
  if (levels.length === 0) return [];

  return levels.map((level, index) => {
    const isLast = index === levels.length - 1;
    const filters = {};
    for (let i = 0; i <= index; i += 1) {
      const current = levels[i];
      filters[current.type] = current.token;
    }
    return {
      key: `${level.type}-${level.token}`,
      label: level.label,
      to: isLast ? undefined : buildCatalogUrl(filters),
    };
  });
};

export const buildProductCrumbs = (product) => {
  if (!product) return [];

  const category = product?.category;
  const subcategory = product?.subcategory;
  const brand = product?.brand;
  const productLabel = product?.nameProduct || product?.name || product?._id || "Producto";

  const categoryLabel = labelFromEntity(category, "Categoria");
  const subcategoryLabel = labelFromEntity(subcategory, "Subcategoria");
  const brandLabel = labelFromEntity(brand, typeof brand === "string" ? brand : "Marca");

  const categoryToken = tokenFromEntity(category, categoryLabel);
  const subcategoryToken = tokenFromEntity(subcategory, subcategoryLabel);
  const brandToken = tokenFromEntity(brand, brandLabel);

  const baseLevels = [];
  if (categoryToken && categoryLabel) {
    baseLevels.push({ type: "category", token: categoryToken, label: categoryLabel });
  }
  if (subcategoryToken && subcategoryLabel) {
    baseLevels.push({ type: "subcategory", token: subcategoryToken, label: subcategoryLabel });
  }
  if (brandToken && brandLabel) {
    baseLevels.push({ type: "brand", token: brandToken, label: brandLabel });
  }

  const crumbs = baseLevels.map((level, index) => {
    const filters = {};
    for (let i = 0; i <= index; i += 1) {
      const current = baseLevels[i];
      filters[current.type] = current.token;
    }
    return {
      key: `${level.type}-${level.token}`,
      label: level.label,
      to: buildCatalogUrl(filters),
    };
  });

  crumbs.push({
    key: `product-${product?._id || productLabel}`,
    label: productLabel,
  });

  return crumbs;
};
