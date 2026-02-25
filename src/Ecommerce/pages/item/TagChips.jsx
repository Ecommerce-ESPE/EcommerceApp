import { useMemo } from "react";
import "./TagChips.css";

const normalizeTag = (tag) => {
  if (typeof tag === "string") {
    const value = tag.trim();
    return value ? { label: value, slug: value.toLowerCase() } : null;
  }

  if (!tag || typeof tag !== "object") return null;
  if (tag.active === false) return null;

  const rawLabel = (tag.name || tag.slug || "").trim();
  if (!rawLabel) return null;

  return {
    label: rawLabel,
    slug: (tag.slug || rawLabel).trim().toLowerCase(),
  };
};

const toDisplayLabel = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "";

const TagChips = ({ tags }) => {
  const normalizedTags = useMemo(() => {
    if (!Array.isArray(tags)) return [];

    return tags
      .map(normalizeTag)
      .filter(Boolean)
      .filter((tag, index, list) => list.findIndex((t) => t.slug === tag.slug) === index);
  }, [tags]);

  if (!normalizedTags.length) return null;

  return (
    <div className="product-tag-chips mb-3" aria-label="Tags del producto">
      {normalizedTags.map((tag) => (
        <span
          key={tag.slug}
          className="product-tag-chip"
          aria-label={`Tag: ${toDisplayLabel(tag.label)}`}
          title={toDisplayLabel(tag.label)}
        >
          {toDisplayLabel(tag.label)}
        </span>
      ))}
    </div>
  );
};

export default TagChips;
