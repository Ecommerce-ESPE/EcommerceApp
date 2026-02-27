import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../Ecommerce/services/api";

const mapSuggestion = (item) => ({
  id: item?._id || item?.id || "",
  slug: item?.slug || "",
  name: item?.nameProduct || item?.name || "",
  image: item?.banner || item?.image || item?.images?.[0]?.imgUrl || "",
});
const pickItems = (payload) => {
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const SearchAutocomplete = ({ className = "", mobile = false }) => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const cacheRef = useRef(new Map());
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const hasQuery = query.trim().length > 0;
  const loading = status === "loading";

  const currentTerm = useMemo(() => query.trim(), [query]);
  const normalizedTerm = useMemo(() => currentTerm.toLowerCase(), [currentTerm]);

  const safeSuggestions = useMemo(
    () => suggestions.filter((item) => item?.name).slice(0, 8),
    [suggestions]
  );

  const toProductUrl = useCallback(
    (item) => `/producto/${encodeURIComponent(item?.id || item?.slug || "")}`,
    []
  );

  const goSearch = useCallback(
    (term) => {
      const value = String(term || "").trim();
      if (!value) return;
      navigate(`/buscar?q=${encodeURIComponent(value)}`);
      setOpen(false);
    },
    [navigate]
  );

  const goProduct = useCallback(
    (item) => {
      if (!item?.id && !item?.slug) return;
      navigate(toProductUrl(item));
      setOpen(false);
    },
    [navigate, toProductUrl]
  );

  useEffect(() => {
    const onClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("touchstart", onClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("touchstart", onClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!hasQuery) {
      setSuggestions([]);
      setOpen(false);
      setStatus("idle");
      setErrorMessage("");
      return;
    }

    if (cacheRef.current.has(normalizedTerm)) {
      const cachedSuggestions = cacheRef.current.get(normalizedTerm) || [];
      setSuggestions(cachedSuggestions);
      setStatus(cachedSuggestions.length ? "success" : "empty");
      setErrorMessage("");
      setOpen(true);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("loading");
      setErrorMessage("");
      try {
        const suggestResp = await fetch(
          `${API_BASE}/items/suggest?q=${encodeURIComponent(currentTerm)}&limit=8`,
          { signal: controller.signal }
        );

        let rawItems = [];
        if (suggestResp.ok) {
          const suggestData = await suggestResp.json();
          rawItems = pickItems(suggestData);
        }
        if (!suggestResp.ok || rawItems.length === 0) {
          const fallbackResp = await fetch(
            `${API_BASE}/items/filter?q=${encodeURIComponent(currentTerm)}&page=1&limit=8`,
            { signal: controller.signal }
          );
          const fallbackData = await fallbackResp.json();
          rawItems = pickItems(fallbackData);
        }

        const normalizedSuggestions = rawItems.map(mapSuggestion).filter((s) => s.name).slice(0, 8);
        cacheRef.current.set(normalizedTerm, normalizedSuggestions);
        setSuggestions(normalizedSuggestions);
        setStatus(normalizedSuggestions.length ? "success" : "empty");
        setOpen(true);
      } catch (error) {
        if (error?.name !== "AbortError") {
          setSuggestions([]);
          setStatus("error");
          setErrorMessage("No se pudo cargar sugerencias");
          setOpen(true);
        }
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [currentTerm, hasQuery, normalizedTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    goSearch(query);
  };

  const handleKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, safeSuggestions.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const highlightMatch = useCallback((text, term) => {
    const value = String(text || "");
    const needle = String(term || "").trim();
    if (!needle) return value;
    const lowerValue = value.toLowerCase();
    const lowerNeedle = needle.toLowerCase();
    const start = lowerValue.indexOf(lowerNeedle);
    if (start < 0) return value;
    const end = start + needle.length;
    return (
      <>
        {value.slice(0, start)}
        <span className="font-weight-bold">{value.slice(start, end)}</span>
        {value.slice(end)}
      </>
    );
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`position-relative ${className}`.trim()}
      style={{ zIndex: 1071 }}
    >
      <form onSubmit={handleSubmit}>
        <div className="input-group-overlay">
          <input
            className={`form-control ${
              mobile
                ? "prepended-form-control rounded-0 border-0"
                : "appended-form-control"
            }`}
            type="text"
            placeholder="Buscar productos..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
              setOpen(true);
            }}
            onFocus={() => {
              if (hasQuery) setOpen(true);
            }}
            onKeyDown={handleKeyDown}
          />
          {loading && (
            <div
              className="position-absolute"
              style={{
                right: mobile ? 8 : 42,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 4,
              }}
            >
              <span className="spinner-border spinner-border-sm text-primary" role="status" />
            </div>
          )}
          {!mobile && (
            <div className="input-group-append-overlay">
              <button type="submit" className="input-group-text border-0 bg-transparent">
                <i className="cxi-search lead align-middle"></i>
              </button>
            </div>
          )}
          {mobile && (
            <div className="input-group-prepend-overlay">
              <span className="input-group-text">
                <i className="cxi-search font-size-lg align-middle mt-n1"></i>
              </span>
            </div>
          )}
        </div>
      </form>

      {open && (
        <div
          className="dropdown-menu d-block w-100 mt-1 shadow-sm border-0"
          style={{ maxHeight: mobile ? 280 : 360, overflowY: "auto", zIndex: 1080 }}
        >
          {loading && <div className="dropdown-item text-muted">Buscando...</div>}
          {status === "error" && <div className="dropdown-item text-danger">{errorMessage}</div>}
          {status === "empty" && hasQuery && (
            <div className="dropdown-item text-muted">Sin coincidencias</div>
          )}
          {status === "success" &&
            safeSuggestions.map((item, index) => (
              <button
                key={`${item.id || item.name}-${index}`}
                type="button"
                className={`dropdown-item d-flex align-items-center ${
                  index === activeIndex ? "active" : ""
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goProduct(item)}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    width="28"
                    height="28"
                    className="rounded mr-2"
                  />
                ) : null}
                <span className="text-truncate">{highlightMatch(item.name, currentTerm)}</span>
              </button>
            ))}
          {!loading && hasQuery && (
            <button
              type="button"
              className="dropdown-item text-primary font-weight-bold"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => goSearch(currentTerm)}
            >
              Ver todos los resultados de "{currentTerm}"
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
