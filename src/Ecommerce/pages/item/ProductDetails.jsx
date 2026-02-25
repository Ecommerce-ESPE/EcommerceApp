import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { API_BASE } from "../../services/api";
import "./product-tabs.scoped.css";

const normalizeSpecs = (specs) => {
  if (!Array.isArray(specs)) return [];

  return specs
    .filter((spec) => spec && spec.key)
    .map((spec) => ({
      key: String(spec.key),
      type: spec.type || "text",
      value: spec.value,
      unit: spec.unit || null,
      group: spec.group || "General",
      order: Number.isFinite(spec.order) ? spec.order : 0,
    }))
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.key.localeCompare(b.key);
    });
};

const formatSpecValue = (spec) => {
  if (spec.type === "boolean") return spec.value ? "Si" : "No";

  if (spec.type === "number") {
    if (spec.value === null || spec.value === undefined || spec.value === "") return "-";
    return spec.unit ? `${spec.value} ${spec.unit}` : String(spec.value);
  }

  if (spec.type === "list_text") {
    if (!Array.isArray(spec.value) || spec.value.length === 0) return "-";
    return spec.value
      .filter((entry) => entry !== null && entry !== undefined && entry !== "")
      .map((entry) => String(entry));
  }

  if (spec.value === null || spec.value === undefined || spec.value === "") return "-";
  return String(spec.value);
};

const renderSpecValue = (spec) => {
  if (spec.type === "list_text") {
    const values = formatSpecValue(spec);
    if (!Array.isArray(values) || values.length === 0) {
      return <span className="pxTabs__specValue">-</span>;
    }

    return (
      <div className="pxTabs__listValue">
        {values.map((value, index) => (
          <span key={`${spec.key}-${index}`} className="pxTabs__listChip">
            {value}
          </span>
        ))}
      </div>
    );
  }

  return <span className="pxTabs__specValue">{formatSpecValue(spec)}</span>;
};

const ProductDetails = ({ product }) => {
  const [specTemplate, setSpecTemplate] = useState([]);
  const [specLoading, setSpecLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [openSpecGroups, setOpenSpecGroups] = useState({});

  const description = product?.description || "Sin descripcion disponible.";
  const richContent = typeof product?.content === "string" ? product.content.trim() : "";
  const sanitizedContent = useMemo(
    () =>
      richContent
        ? DOMPurify.sanitize(richContent, {
            USE_PROFILES: { html: true },
            ADD_TAGS: ["colgroup", "col"],
            ADD_ATTR: [
              "class",
              "style",
              "width",
              "rowspan",
              "colspan",
              "data-row",
              "data-cell",
              "data-row-id",
              "data-cell-id",
            ],
            ALLOW_DATA_ATTR: true,
          })
        : "",
    [richContent]
  );
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
  const categoryId =
    product?.category && typeof product.category === "object"
      ? product.category._id
      : "";
  const subcategoryId =
    product?.subcategory && typeof product.subcategory === "object"
      ? product.subcategory._id
      : "";

  useEffect(() => {
    let isMounted = true;

    const fetchSpecTemplate = async () => {
      if (!categoryId || !subcategoryId) {
        setSpecTemplate([]);
        return;
      }

      setSpecLoading(true);
      try {
        const response = await fetch(
          `${API_BASE}/category/${categoryId}/subcategory/${subcategoryId}/spec-template`
        );

        if (!response.ok) throw new Error("No se pudo obtener spec-template");

        const data = await response.json();
        const payload =
          data?.specTemplate ||
          data?.template ||
          data?.specs ||
          data?.items ||
          data?.data ||
          data;

        if (!isMounted) return;
        setSpecTemplate(normalizeSpecs(payload));
      } catch {
        if (isMounted) setSpecTemplate([]);
      } finally {
        if (isMounted) setSpecLoading(false);
      }
    };

    fetchSpecTemplate();

    return () => {
      isMounted = false;
    };
  }, [categoryId, subcategoryId]);

  const productSpecs = useMemo(() => normalizeSpecs(product?.specs), [product?.specs]);
  const effectiveSpecs = productSpecs.length > 0 ? productSpecs : specTemplate;
  const groupedSpecs = useMemo(() => {
    return effectiveSpecs.reduce((acc, spec) => {
      if (!acc[spec.group]) acc[spec.group] = [];
      acc[spec.group].push(spec);
      return acc;
    }, {});
  }, [effectiveSpecs]);
  const specGroups = useMemo(() => Object.entries(groupedSpecs), [groupedSpecs]);

  useEffect(() => {
    setOpenSpecGroups((prev) => {
      const next = {};
      specGroups.forEach(([groupName], index) => {
        next[groupName] = prev[groupName] ?? index === 0;
      });
      return next;
    });
  }, [specGroups]);

  const toggleSpecGroup = (groupName) => {
    setOpenSpecGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  return (
    <section className="pxTabs">
      <div className="pxTabs__container">
        <div className="pxTabs__panel">
          <div className="pxTabs__tabList" role="tablist" aria-label="Detalle de producto">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "description"}
              aria-controls="pxTabs-panel-description"
              id="pxTabs-tab-description"
              className={`pxTabs__tabButton ${
                activeTab === "description" ? "pxTabs__tabButton--active" : ""
              }`}
              onClick={() => setActiveTab("description")}
            >
              Descripcion
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "details"}
              aria-controls="pxTabs-panel-details"
              id="pxTabs-tab-details"
              className={`pxTabs__tabButton ${
                activeTab === "details" ? "pxTabs__tabButton--active" : ""
              }`}
              onClick={() => setActiveTab("details")}
            >
              Detalles
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "reviews"}
              aria-controls="pxTabs-panel-reviews"
              id="pxTabs-tab-reviews"
              className={`pxTabs__tabButton ${
                activeTab === "reviews" ? "pxTabs__tabButton--active" : ""
              }`}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews
            </button>
          </div>

          <div className="pxTabs__content">
            {activeTab === "description" && (
              <div
                id="pxTabs-panel-description"
                role="tabpanel"
                aria-labelledby="pxTabs-tab-description"
                className="pxTabs__pane"
              >
                <h3 className="pxTabs__title">Descripcion del producto</h3>
                {sanitizedContent ? (
                  <div
                    className="pxTabs__description productRichText"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                  />
                ) : (
                  <p className="pxTabs__description">{description}</p>
                )}
              </div>
            )}

            {activeTab === "details" && (
              <div
                id="pxTabs-panel-details"
                role="tabpanel"
                aria-labelledby="pxTabs-tab-details"
                className="pxTabs__pane"
              >
                <div className="pxTabs__summaryGrid">
                  <article className="pxTabs__summaryCard">
                    <span className="pxTabs__label">Marca</span>
                    {brandWebsite ? (
                      <a
                        className="pxTabs__value"
                        href={brandWebsite}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {brandName}
                      </a>
                    ) : (
                      <span className="pxTabs__value">{brandName}</span>
                    )}
                  </article>
                  <article className="pxTabs__summaryCard">
                    <span className="pxTabs__label">Categoria</span>
                    <span className="pxTabs__value">{category}</span>
                  </article>
                  <article className="pxTabs__summaryCard">
                    <span className="pxTabs__label">Subcategoria</span>
                    <span className="pxTabs__value">{subcategory}</span>
                  </article>
                  <article className="pxTabs__summaryCard">
                    <span className="pxTabs__label">SKU</span>
                    <code className="pxTabs__sku">{sku}</code>
                  </article>
                </div>

                <section className="pxTabs__block">
                  <h4 className="pxTabs__eyebrow">Variantes disponibles</h4>
                  {variants.length > 0 ? (
                    <div className="pxTabs__chips">
                      {variants.map((variant) => (
                        <span
                          key={variant._id}
                          className={`pxTabs__chip ${
                            variant.stock > 0 ? "" : "pxTabs__chip--muted"
                          }`}
                        >
                          {variant.size}
                          {variant.stock > 0 ? ` (${variant.stock})` : " (Agotado)"}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="pxTabs__muted">No hay variantes disponibles.</p>
                  )}
                </section>

                {specLoading && (
                  <p className="pxTabs__muted">Cargando especificaciones...</p>
                )}

                {!specLoading && specGroups.length > 0 && (
                  <div className="pxTabs__groups">
                    {specGroups.map(([groupName, specs]) => {
                      const isOpen = openSpecGroups[groupName];

                      return (
                        <section className="pxTabs__groupCard" key={groupName}>
                          <button
                            type="button"
                            className="pxTabs__groupToggle"
                            onClick={() => toggleSpecGroup(groupName)}
                            aria-expanded={isOpen}
                          >
                            <span className="pxTabs__eyebrow">{groupName}</span>
                            <span className="pxTabs__toggleIcon">{isOpen ? "−" : "+"}</span>
                          </button>

                          {isOpen && (
                            <ul className="pxTabs__specList">
                              {specs.map((spec) => (
                                <li
                                  key={`${groupName}-${spec.key}`}
                                  className="pxTabs__specRow"
                                >
                                  <span className="pxTabs__specKey">{spec.key}</span>
                                  {renderSpecValue(spec)}
                                </li>
                              ))}
                            </ul>
                          )}
                        </section>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div
                id="pxTabs-panel-reviews"
                role="tabpanel"
                aria-labelledby="pxTabs-tab-reviews"
                className="pxTabs__pane"
              >
                <h3 className="pxTabs__title">Reviews</h3>
                <div className="pxTabs__reviewHead">
                  <div className="star-rating">
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className={`sr-star cxi-star-filled ${
                          i < (product?.rating || 0) ? "active" : ""
                        }`}
                      ></i>
                    ))}
                  </div>
                  <span className="pxTabs__muted">
                    {product?.rating || 0}/5 basado en opiniones recientes.
                  </span>
                </div>
                <div className="pxTabs__reviewBox">
                  <p className="pxTabs__muted">
                    Aun no hay reviews. Se el primero en compartir tu experiencia.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
