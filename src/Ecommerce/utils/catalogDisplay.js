const normalizeText = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const normalizeBrandOption = (raw) => {
  if (!raw) return null;
  if (typeof raw === "string") {
    const text = raw.trim();
    if (!text) return null;
    return { id: "", slug: text, name: text };
  }

  const id = String(raw._id || raw.id || "").trim();
  const slug = String(raw.slug || raw.code || raw.name || "").trim();
  const name = String(raw.name || raw.label || raw.slug || "").trim();
  if (!id && !slug && !name) return null;

  return {
    id,
    slug: slug || name || id,
    name: name || slug || id,
  };
};

export const normalizeTagOption = (raw) => {
  if (!raw) return null;
  if (typeof raw === "string") {
    const text = raw.trim();
    if (!text) return null;
    return { id: "", slug: text, name: text };
  }

  const id = String(raw._id || raw.id || "").trim();
  const slug = String(raw.slug || raw.code || raw.name || "").trim();
  const name = String(raw.name || raw.label || raw.slug || "").trim();
  if (!id && !slug && !name) return null;

  return {
    id,
    slug: slug || name || id,
    name: name || slug || id,
  };
};

export const sanitizeProduct = (product) => {
  if (!product || typeof product !== "object") return product;
  const { createdBy: _createdBy, ...safeProduct } = product;
  return safeProduct;
};

const buildLookup = (entries) => {
  const map = new Map();
  entries.forEach((entry) => {
    if (!entry) return;
    const candidates = [entry.id, entry.slug, entry.name].filter(Boolean);
    candidates.forEach((candidate) => {
      map.set(normalizeText(candidate), entry.name || candidate);
    });
  });
  return map;
};

export const resolveBrandName = (brandValue, brandEntries = []) => {
  if (!brandValue) return "";
  if (typeof brandValue === "object") {
    return String(brandValue.name || brandValue.label || brandValue.slug || "").trim();
  }
  const lookup = buildLookup(brandEntries);
  const key = normalizeText(brandValue);
  return lookup.get(key) || String(brandValue || "").trim();
};

export const resolveTagNames = (tags = [], tagEntries = []) => {
  if (!Array.isArray(tags) || tags.length === 0) return [];
  const lookup = buildLookup(tagEntries);

  return tags
    .map((tag) => {
      if (typeof tag === "object") {
        const objectName = String(tag.name || tag.label || tag.slug || "").trim();
        if (objectName) return objectName;
        const objectId = String(tag._id || tag.id || "").trim();
        if (!objectId) return "";
        return lookup.get(normalizeText(objectId)) || objectId;
      }
      const text = String(tag || "").trim();
      if (!text) return "";
      return lookup.get(normalizeText(text)) || text;
    })
    .filter(Boolean);
};
